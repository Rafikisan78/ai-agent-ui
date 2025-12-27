# Guide - Génération Vidéo Asynchrone

## 🎯 Concept

La génération vidéo prend 30-60 secondes, ce qui est trop long pour une réponse HTTP synchrone. La solution : **architecture asynchrone en 2 workflows**.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              WORKFLOW 1 : Main (Synchrone)                  │
│                                                             │
│  User → /video prompt                                       │
│    ↓                                                        │
│  Detect Type → "video-generation"                          │
│    ↓                                                        │
│  Immediate Response:                                        │
│  "🎬 Vidéo en cours... Task ID: xyz123"                    │
│    ↓                                                        │
│  Trigger Workflow 2 (arrière-plan)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ HTTP Request vers Workflow 2
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          WORKFLOW 2 : Background Video Generator            │
│                                                             │
│  Webhook BG receives {taskId, prompt}                      │
│    ↓                                                        │
│  POST Replicate → Start video generation                   │
│    ↓                                                        │
│  Wait 10s                                                   │
│    ↓                                                        │
│  GET Replicate Status                                       │
│    ↓                                                        │
│  Is Ready? ──No──> Wait 5s → Retry Status                  │
│    │                    ↑_______|                           │
│    Yes                                                      │
│    ↓                                                        │
│  Save to Supabase {taskId, videoUrl, status}               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Prérequis

1. **Deux workflows N8N**
2. **Table Supabase** pour stocker les vidéos
3. **Credentials** : Replicate + Supabase

---

## 🚀 Installation

### Étape 1 : Créer la table Supabase

Dans Supabase SQL Editor :

```sql
CREATE TABLE video_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT UNIQUE NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Index pour recherche rapide
CREATE INDEX idx_task_id ON video_tasks(task_id);
CREATE INDEX idx_status ON video_tasks(status);
```

### Étape 2 : Importer Workflow 1 (Main)

1. Dans N8N : Menu → Import
2. Fichier : `n8n-async-video-workflow.json`
3. Configurez credentials :
   - Anthropic (Claude)
   - OpenAI (DALL-E)
4. **Activez** le workflow
5. Notez l'URL du webhook : `https://votre-n8n.com/webhook-test/ai-agent-fiable`

### Étape 3 : Importer Workflow 2 (Background)

1. Dans N8N : Menu → Import
2. Fichier : `n8n-background-video-generator.json`
3. Configurez credentials :
   - Replicate (Header Auth avec `Token VOTRE_TOKEN_REPLICATE_ICI...`)
   - Supabase (URL + Anon Key)
4. **Activez** le workflow
5. Notez l'URL du webhook BG : `https://votre-n8n.com/webhook-test/video-bg-process`

### Étape 4 : Connecter les deux workflows

Dans **Workflow 1**, modifiez le nœud "Trigger BG Workflow" :

```javascript
{
  "url": "https://votre-n8n.com/webhook-test/video-bg-process",
  "method": "POST",
  "body": {
    "taskId": "{{ $json.taskId }}",
    "prompt": "{{ $json.prompt }}"
  }
}
```

---

## 🧪 Test

### Test 1 : Demande de vidéo

```bash
cd n8n-trigger-ui
node test-webhook.js
```

Avec payload :
```javascript
{
  message: "/video un chat qui court dans un jardin",
  timestamp: new Date().toISOString()
}
```

**Réponse attendue (immédiate, <1s) :**
```json
{
  "success": true,
  "type": "info",
  "content": {
    "message": "🎬 Génération vidéo en cours...",
    "taskId": "video_1703265432_abc123",
    "prompt": "un chat qui court dans un jardin",
    "estimatedTime": "30-60 secondes",
    "instructions": "Vérifiez l'historique dans quelques instants..."
  },
  "metadata": {
    "taskId": "video_1703265432_abc123",
    "status": "processing"
  }
}
```

### Test 2 : Vérifier le statut (après 30-60s)

Créez un nouveau endpoint dans le frontend ou utilisez Supabase directement :

```sql
SELECT * FROM video_tasks WHERE task_id = 'video_1703265432_abc123';
```

**Résultat attendu :**
```
task_id    | video_1703265432_abc123
prompt     | un chat qui court dans un jardin
video_url  | https://replicate.delivery/pbxt/...
status     | completed
completed_at | 2025-12-23 20:30:45
```

---

## 🔄 Intégration Frontend

### Modifier `src/services/supabase.js`

Ajoutez une fonction pour récupérer les vidéos :

```javascript
export async function getVideoByTaskId(taskId) {
  const { data, error } = await supabase
    .from('video_tasks')
    .select('*')
    .eq('task_id', taskId)
    .single()

  if (error) throw error
  return data
}

export async function getPendingVideos() {
  const { data, error } = await supabase
    .from('video_tasks')
    .select('*')
    .eq('status', 'processing')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### Modifier `MultimodalDisplay.jsx`

Ajoutez un polling pour les vidéos en cours :

```javascript
useEffect(() => {
  if (response?.metadata?.taskId && response?.metadata?.status === 'processing') {
    const interval = setInterval(async () => {
      try {
        const video = await getVideoByTaskId(response.metadata.taskId)
        if (video.status === 'completed') {
          // Mettre à jour la réponse avec la vidéo
          setResponse({
            success: true,
            type: 'video',
            content: {
              url: video.video_url,
              description: video.prompt
            }
          })
          clearInterval(interval)
        }
      } catch (err) {
        console.error('Erreur polling vidéo:', err)
      }
    }, 5000) // Vérifier toutes les 5 secondes

    return () => clearInterval(interval)
  }
}, [response])
```

---

## 💡 Améliorations Possibles

### 1. Notifications en temps réel (Supabase Realtime)

```javascript
// Dans App.jsx
useEffect(() => {
  const subscription = supabase
    .channel('video_tasks')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'video_tasks'
    }, (payload) => {
      if (payload.new.status === 'completed') {
        // Afficher notification
        setResponse({
          type: 'video',
          content: { url: payload.new.video_url }
        })
      }
    })
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

### 2. Commande `/status` pour vérifier l'avancement

Dans le workflow, ajoutez une détection pour `/status <taskId>` :

```javascript
if (message.startsWith('/status ')) {
  const taskId = message.substring(8).trim()
  // Requête Supabase pour récupérer le statut
  // Retourner le statut + URL si completed
}
```

### 3. Limiter le nombre de tentatives (retry)

Dans Workflow 2, ajoutez un compteur :

```javascript
// Nœud "Check Status"
const retryCount = $node['Wait 5s Retry'].pairedItem?.retryCount || 0

if (retryCount > 10) {
  // Échec après 10 tentatives (50 secondes)
  return {
    json: {
      error: 'Timeout - vidéo non générée après 50s',
      status: 'failed'
    }
  }
}

$node['Wait 5s Retry'].json.retryCount = retryCount + 1
```

---

## 📊 Coûts et Performances

| Aspect | Valeur |
|--------|--------|
| **Temps réponse initiale** | <1 seconde |
| **Temps génération vidéo** | 30-60 secondes |
| **Coût Replicate** | ~$0.01-0.02 par vidéo |
| **Coût Supabase** | Gratuit (inclus) |
| **Max vidéos simultanées** | Illimité (async) |

---

## 🐛 Dépannage

### La vidéo reste en "processing"

1. Vérifiez les logs du Workflow 2 dans N8N
2. Vérifiez que les credentials Replicate sont corrects
3. Augmentez le timeout du nœud "Wait 10s" à 15s
4. Vérifiez la table Supabase :
   ```sql
   SELECT * FROM video_tasks WHERE status = 'processing' AND created_at < NOW() - INTERVAL '5 minutes';
   ```

### Erreur "Invalid version" de Replicate

→ La version du modèle a changé. Mettez à jour dans le nœud "Replicate Start"
→ Trouvez une version valide sur https://replicate.com/anotherjesse/zeroscope-v2-xl

### La table Supabase n'existe pas

→ Créez-la avec le SQL de l'Étape 1
→ Vérifiez les permissions (RLS)

---

## ✅ Avantages de cette Architecture

✅ **Réponse instantanée** : L'utilisateur n'attend pas 30-60 secondes
✅ **Scalable** : Peut gérer des centaines de vidéos en parallèle
✅ **Fiable** : Si une génération échoue, pas d'impact sur l'interface
✅ **Traçable** : Toutes les tâches sont dans Supabase
✅ **Compatible mobile** : Pas de timeout HTTP

---

**Version** : 1.0 Async
**Dernière mise à jour** : 2025-12-23

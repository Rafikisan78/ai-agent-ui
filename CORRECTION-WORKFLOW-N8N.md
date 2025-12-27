# Correction du Workflow N8N - Mise à jour Supabase après génération vidéo

## Problème identifié

Replicate génère la vidéo avec succès, mais N8N ne met PAS à jour Supabase avec l'URL de la vidéo terminée. Résultat: l'interface web continue de faire du polling jusqu'au timeout de 10 minutes.

## Solution

Votre workflow N8N doit avoir ces étapes dans cet ordre:

### 1. Webhook (déclencheur)
- Reçoit le prompt de l'utilisateur
- URL: `https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable`

### 2. Détection du type de prompt
- **Si `/video` détecté** → Continuer vers génération vidéo
- Sinon → Autres types (texte, image, audio)

### 3. Créer la prédiction Replicate
- **Node**: HTTP Request ou Replicate node
- **Méthode**: POST
- **URL**: `https://api.replicate.com/v1/predictions`
- **Headers**:
  - `Authorization: Token VOTRE_TOKEN_REPLICATE_ICI`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "version": "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
  "input": {
    "prompt": "{{ $json.message }}",
    "num_frames": 24,
    "num_inference_steps": 50
  }
}
```
- **Récupérer**: `id` de la réponse (c'est le task_id)

### 4. ⚠️ CRITIQUE: Insérer dans Supabase IMMÉDIATEMENT
- **Node**: Supabase Insert
- **Table**: `video_tasks`
- **Données**:
```json
{
  "task_id": "{{ $json.id }}",
  "prompt": "{{ $('Webhook').item.json.message }}",
  "status": "processing",
  "video_url": null,
  "created_at": "{{ new Date().toISOString() }}"
}
```

### 5. Retourner la réponse à l'interface WEB
- **Node**: Respond to Webhook
- **Réponse**:
```json
{
  "success": true,
  "type": "video",
  "content": {
    "message": "Vidéo en cours de génération..."
  },
  "metadata": {
    "taskId": "{{ $json.id }}",
    "status": "processing",
    "inputType": "video-generation",
    "model": "replicate"
  }
}
```

### 6. ⚠️ NOUVELLE BRANCHE: Polling Replicate (asynchrone)
**IMPORTANT**: Cette branche s'exécute en PARALLÈLE, après avoir répondu au webhook

- **Node**: Wait (30 secondes)
- **Node**: Loop / Do Until
  - Condition: status !== 'succeeded' AND status !== 'failed'
  - Max iterations: 40 (= 20 minutes max)

#### 6.1 Dans la boucle: Vérifier le statut
- **Node**: HTTP Request
- **Méthode**: GET
- **URL**: `https://api.replicate.com/v1/predictions/{{ $('Créer Prédiction').item.json.id }}`
- **Headers**: `Authorization: Token VOTRE_TOKEN_REPLICATE_ICI`

#### 6.2 Condition: Si succeeded
- **Node**: IF
- **Condition**: `{{ $json.status === 'succeeded' }}`

#### 6.3 ⚠️ CRITIQUE: Mettre à jour Supabase avec l'URL
- **Node**: Supabase Update
- **Table**: `video_tasks`
- **Filter**: `task_id.eq.{{ $('Créer Prédiction').item.json.id }}`
- **Données**:
```json
{
  "status": "completed",
  "video_url": "{{ $json.output[0] || $json.output }}",
  "completed_at": "{{ new Date().toISOString() }}"
}
```

#### 6.4 Si failed
- Mettre à jour Supabase avec status='failed'

#### 6.5 Si processing/starting
- **Node**: Wait (30 secondes)
- Retour au début de la boucle

## Architecture visuelle du workflow

```
┌──────────────┐
│   Webhook    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Détection /video │
└──────┬───────────┘
       │
       ▼
┌─────────────────────┐
│ Créer Prédiction    │  ← Récupère task_id
│ Replicate           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ ⚠️ INSERT Supabase  │  ← IMPORTANT: status='processing'
│ (task_id, prompt)   │
└──────┬──────────────┘
       │
       ├──────────────────────────┐
       │                          │
       ▼                          ▼
┌──────────────┐         ┌────────────────┐
│ Respond to   │         │ Wait 30s       │
│ Webhook      │         └────────┬───────┘
└──────────────┘                  │
                                  ▼
                         ┌────────────────┐
                         │ Loop: Check    │
                         │ Replicate      │
                         └────────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │succeeded │  │processing│  │ failed   │
              └────┬─────┘  └────┬─────┘  └────┬─────┘
                   │             │             │
                   ▼             ▼             ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐
            │⚠️ UPDATE │   │Wait 30s  │   │UPDATE    │
            │Supabase  │   │Loop back │   │Supabase  │
            │completed │   └──────────┘   │failed    │
            └──────────┘                  └──────────┘
```

## Points critiques

1. ✅ **INSERT Supabase** doit se faire AVANT de répondre au webhook
2. ✅ La boucle de polling Replicate doit se faire en ASYNCHRONE (après réponse webhook)
3. ✅ La mise à jour Supabase doit se faire dans la boucle de polling
4. ✅ Le polling doit continuer jusqu'à succeeded/failed (max 40 itérations)

## Test du script de détection

Exécutez ce script pour détecter et corriger les vidéos bloquées:

```bash
node test-detect-corrected.js
```

Ce script:
- Trouve toutes les vidéos en "processing" dans Supabase
- Vérifie leur statut réel sur Replicate
- Met à jour Supabase si la vidéo est terminée
- C'est un correctif temporaire en attendant de fixer N8N

## Configuration Supabase

Assurez-vous que la table `video_tasks` existe:

```sql
CREATE TABLE IF NOT EXISTS video_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT UNIQUE NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_video_tasks_task_id ON video_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_video_tasks_status ON video_tasks(status);
```

## Credentials N8N

- **Supabase URL**: `https://qrbtxbwhbjvytsfsazlg.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y`
- **Replicate Token**: `VOTRE_TOKEN_REPLICATE_ICI`

## Vérification

Une fois le workflow corrigé:

1. Testez avec: `node test-webhook.js`
2. Vérifiez Supabase: doit montrer status='processing'
3. Attendez 2-3 minutes
4. Vérifiez Supabase: doit montrer status='completed' avec video_url
5. L'interface web doit afficher la vidéo automatiquement

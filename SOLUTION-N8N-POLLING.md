# Solution complète pour le polling Replicate dans N8N

## Problème identifié

Replicate passe par plusieurs états:
- `starting` → `processing` → `succeeded`

Votre workflow N8N ne fait **qu'un seul check** et manque les transitions d'état.

## Solution: Workflow avec polling automatique

### Architecture du workflow

```
1. Webhook (reçoit /video)
   ↓
2. Créer Prédiction Replicate
   ↓
3. INSERT Supabase (status='processing')
   ↓
4. Respond to Webhook (renvoie taskId à l'interface)
   ↓
5. Code Node: Polling Loop (ASYNCHRONE - 40 iterations max)
   ↓
6. UPDATE Supabase quand succeeded
```

### Node 1: Webhook
- **Path**: `ai-agent-fiable`
- **Method**: POST
- **Response Mode**: Using 'Respond to Webhook' Node

### Node 2: IF - Détecter /video
- **Condition**: `{{ $json.body.message }}` contains `/video`

### Node 3: HTTP Request - Créer Prédiction Replicate
- **Method**: POST
- **URL**: `https://api.replicate.com/v1/predictions`
- **Headers**:
  - `Authorization`: `Token VOTRE_TOKEN_REPLICATE_ICI`
  - `Content-Type`: `application/json`
- **Body** (JSON):
```json
{
  "version": "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
  "input": {
    "prompt": "={{ $('Webhook').item.json.body.message.replace('/video', '').trim() }}",
    "num_frames": 24,
    "num_inference_steps": 50
  }
}
```
- **Récupérer**: Le champ `id` dans la réponse (c'est le task_id)

### Node 4: Supabase - INSERT
- **Operation**: Insert
- **Table**: `video_tasks`
- **Columns**:
  - `task_id`: `={{ $json.id }}`
  - `prompt`: `={{ $('Webhook').item.json.body.message }}`
  - `status`: `processing` (texte fixe)
  - `video_url`: `null` ou vide

### Node 5: Respond to Webhook
- **Response Body** (JSON):
```json
{
  "success": true,
  "type": "video",
  "content": {
    "message": "Vidéo en cours de génération..."
  },
  "metadata": {
    "taskId": "={{ $('HTTP Request').item.json.id }}",
    "status": "processing",
    "inputType": "video-generation",
    "model": "replicate"
  }
}
```

### Node 6: Code Node - Polling Replicate (CRITIQUE!)

**IMPORTANT**: Ce node s'exécute en PARALLÈLE après avoir répondu au webhook.

**Code JavaScript**:
```javascript
const REPLICATE_TOKEN = 'VOTRE_TOKEN_REPLICATE_ICI';
const SUPABASE_URL = 'https://qrbtxbwhbjvytsfsazlg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y';

const predictionId = $input.item.json.id;
const prompt = $('Webhook').item.json.body.message;

// Fonction pour vérifier le statut Replicate
async function checkReplicate() {
  const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
    headers: {
      'Authorization': `Token ${REPLICATE_TOKEN}`
    }
  });
  return await response.json();
}

// Fonction pour mettre à jour Supabase
async function updateSupabase(status, videoUrl = null) {
  const body = {
    status: status,
    completed_at: new Date().toISOString()
  };

  if (videoUrl) {
    body.video_url = videoUrl;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/video_tasks?task_id=eq.${predictionId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  });

  return await response.json();
}

// Polling loop - max 40 iterations = 20 minutes
let iteration = 0;
const maxIterations = 40;

while (iteration < maxIterations) {
  console.log(`🔄 Iteration ${iteration + 1}/${maxIterations}`);

  // Vérifier le statut sur Replicate
  const status = await checkReplicate();
  console.log(`📊 Statut Replicate: ${status.status}`);

  if (status.status === 'succeeded') {
    console.log('✅ Vidéo terminée!');
    const videoUrl = Array.isArray(status.output) ? status.output[0] : status.output;
    console.log(`🔗 URL: ${videoUrl}`);

    // Mettre à jour Supabase
    await updateSupabase('completed', videoUrl);
    console.log('✅ Supabase mis à jour');

    return [{ json: { success: true, videoUrl, taskId: predictionId } }];
  }

  if (status.status === 'failed') {
    console.log('❌ Échec de la génération');
    await updateSupabase('failed');
    return [{ json: { success: false, error: status.error, taskId: predictionId } }];
  }

  // Si starting ou processing, attendre 30 secondes
  console.log(`⏳ Statut: ${status.status} - Attente 30s...`);
  await new Promise(resolve => setTimeout(resolve, 30000));

  iteration++;
}

// Timeout après 40 iterations
console.log('⏰ Timeout atteint');
await updateSupabase('timeout');
return [{ json: { success: false, error: 'Timeout', taskId: predictionId } }];
```

## Configuration Supabase dans N8N

Si vous utilisez le node Supabase au lieu du Code, configurez:

1. **Credentials** → Supabase API
   - **Host**: `qrbtxbwhbjvytsfsazlg.supabase.co`
   - **Service Role Secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y`

## Alternative: Utiliser un workflow séparé

Si le Code node ne fonctionne pas, créez 2 workflows:

### Workflow 1: Création (synchrone)
1. Webhook
2. Créer Prédiction Replicate
3. INSERT Supabase
4. Respond to Webhook
5. **Trigger Workflow 2** (passer le task_id)

### Workflow 2: Polling (asynchrone)
1. Webhook (reçoit task_id)
2. Loop Node avec conditions:
   - Check Replicate status toutes les 30s
   - Max 40 iterations
   - UPDATE Supabase quand succeeded/failed

## Test

1. Importez le workflow
2. Activez-le
3. Testez avec: `node test-webhook.js` (modifiez le message en `/video un chat qui joue`)
4. Vérifiez les logs N8N
5. Après 1-2 minutes, vérifiez Supabase

## Points critiques

✅ **DO**:
- Faire un polling avec boucle (30s entre chaque check)
- Vérifier les statuts: starting, processing, succeeded, failed
- Mettre à jour Supabase avec video_url quand succeeded
- Logger chaque étape pour debug

❌ **DON'T**:
- Ne faire qu'un seul check (vous manquerez succeeded)
- Oublier de mettre à jour Supabase
- Avoir un timeout trop court (20 min minimum)

## Schéma visuel

```
Interface Web                N8N Workflow              Replicate          Supabase
     │                            │                        │                  │
     │──/video un chat───────────>│                        │                  │
     │                            │                        │                  │
     │                            │──POST /predictions────>│                  │
     │                            │<───{id: "abc123"}──────│                  │
     │                            │                        │                  │
     │                            │────INSERT (abc123, processing)────────────>│
     │                            │                        │                  │
     │<──{taskId: abc123}─────────│                        │                  │
     │                            │                        │                  │
     │                            │──┐                     │                  │
     │                            │  │ Boucle 40x          │                  │
     │    (polling Supabase)      │  │ GET /predictions    │                  │
     │──GET video_tasks───────────┼──│─────────────────────>│                  │
     │                            │  │                     │                  │
     │                            │  │                 starting                │
     │<──status: processing───────│  │                     │                  │
     │                            │  │ Wait 30s            │                  │
     │                            │  │                     │                  │
     │──GET video_tasks───────────┼──│─────────────────────>│                  │
     │                            │  │                 processing              │
     │<──status: processing───────│  │                     │                  │
     │                            │  │ Wait 30s            │                  │
     │                            │  │                     │                  │
     │──GET video_tasks───────────┼──│─────────────────────>│                  │
     │                            │  │                 succeeded!              │
     │                            │  │                     │                  │
     │                            │  │───UPDATE (abc123, completed, url)──────>│
     │                            │<─┘                     │                  │
     │                            │                        │                  │
     │──GET video_tasks──────────────────────────────────────────────────────>│
     │<──{status: completed, video_url}────────────────────────────────────────│
     │                            │                        │                  │
     │ AFFICHE LA VIDEO! 🎬       │                        │                  │
```

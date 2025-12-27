# Fix: Erreur Supabase dans N8N

## Problème

L'erreur `Cannot read properties of undefined (reading 'validateSignature')` signifie que le node Supabase dans N8N n'a pas les credentials correctement configurés.

## Solution Simple: Utiliser HTTP Request

Au lieu du node "Supabase", utilisez le node **"HTTP Request"** avec l'API REST de Supabase.

### Configuration des credentials Supabase

- **URL**: `https://qrbtxbwhbjvytsfsazlg.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y`

### Workflow Principal Corrigé

#### Node: INSERT Supabase (HTTP Request)

**Type**: HTTP Request
**Method**: POST
**URL**: `https://qrbtxbwhbjvytsfsazlg.supabase.co/rest/v1/video_tasks`

**Headers**:
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y

Content-Type: application/json

Prefer: return=representation
```

**Body** (JSON):
```json
{
  "task_id": "={{ $('Créer Prédiction Replicate').item.json.id }}",
  "prompt": "={{ $('Webhook').item.json.body.message }}",
  "status": "processing",
  "video_url": null
}
```

### Workflow Video Watcher Corrigé

#### Node: GET Vidéos en Processing (HTTP Request)

**Type**: HTTP Request
**Method**: GET
**URL**: `https://qrbtxbwhbjvytsfsazlg.supabase.co/rest/v1/video_tasks?status=eq.processing&select=*`

**Headers**:
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y
```

#### Node: UPDATE Completed (HTTP Request)

**Type**: HTTP Request
**Method**: PATCH
**URL**: `https://qrbtxbwhbjvytsfsazlg.supabase.co/rest/v1/video_tasks?task_id=eq.={{ $('Split Into Items').item.json.task_id }}`

**Headers**:
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y

Content-Type: application/json

Prefer: return=representation
```

**Body** (JSON):
```json
{
  "status": "completed",
  "video_url": "={{ $json.output[0] || $json.output }}",
  "completed_at": "={{ new Date().toISOString() }}"
}
```

## Modification dans N8N

### Si vous avez déjà importé les workflows:

1. **Ouvrez le workflow "Main"**
2. **Double-cliquez sur le node "INSERT Supabase"**
3. **Changez le type** de "Supabase" à **"HTTP Request"**
4. **Configurez comme ci-dessus**

### Ou réimportez les workflows corrigés:

Les workflows JSON fournis (`n8n-workflow-main-simple.json` et `n8n-workflow-video-watcher.json`) utilisent déjà HTTP Request, pas le node Supabase.

Si vous voyez l'erreur, c'est que vous utilisez un ancien workflow avec le node Supabase.

## Test de connexion Supabase

Pour tester que Supabase fonctionne:

```bash
curl -X GET \
  'https://qrbtxbwhbjvytsfsazlg.supabase.co/rest/v1/video_tasks?select=*&limit=1' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y'
```

Devrait retourner `[]` (tableau vide) si la table est vide, ou les vidéos si elles existent.

## Résumé

❌ **Ne pas utiliser**: Node "Supabase" dans N8N
✅ **Utiliser**: Node "HTTP Request" avec l'API REST Supabase

Tous les workflows JSON fournis utilisent déjà HTTP Request, donc si vous les importez, ça devrait fonctionner sans cette erreur.

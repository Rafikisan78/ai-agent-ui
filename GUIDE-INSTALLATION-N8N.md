# Guide d'installation - Workflow N8N Video Watcher

## Solution recommandée: Video Watcher (Schedule Trigger)

Cette solution garantit un polling régulier toutes les 30 secondes, sans dépendre des limitations des boucles N8N.

## Étape 1: Importer le workflow

1. Connectez-vous à N8N: `https://n8n.srv766650.hstgr.cloud`

2. Cliquez sur **"+ Add workflow"** ou **"Import from file"**

3. Importez le fichier: **`n8n-workflow-video-watcher.json`**

4. Le workflow s'appelle: **"Video Status Watcher - Polling Replicate"**

## Étape 2: Vérifier la configuration

### Node 1: Schedule Trigger (30s)
- ✅ Configuré pour tourner toutes les **30 secondes**
- Pas de modification nécessaire

### Node 2: GET Vidéos en Processing
- ✅ URL: `https://qrbtxbwhbjvytsfsazlg.supabase.co/rest/v1/video_tasks?status=eq.processing&select=*`
- ✅ Headers:
  - `apikey`: Votre clé Supabase
  - `Authorization`: Bearer + votre clé
- Pas de modification nécessaire

### Node 3: Split Into Items
- Sépare chaque vidéo en processing pour les traiter une par une
- Pas de modification nécessaire

### Node 4: Check Replicate Status
- ✅ GET `https://api.replicate.com/v1/predictions/{{ $json.task_id }}`
- ✅ Header Authorization avec votre token Replicate
- Pas de modification nécessaire

### Node 5: IF Succeeded
- Vérifie si `status === "succeeded"`

### Node 6: UPDATE Completed
- ✅ PATCH vers Supabase
- ✅ Body: `{ status: "completed", video_url: "...", completed_at: "..." }`

### Node 7: IF Failed
- Vérifie si `status === "failed"`

### Node 8: UPDATE Failed
- ✅ PATCH vers Supabase
- ✅ Body: `{ status: "failed", completed_at: "..." }`

## Étape 3: Activer le workflow

1. Cliquez sur le toggle **"Inactive"** → **"Active"** en haut à droite

2. Le workflow commence immédiatement à tourner toutes les 30 secondes

3. Vérifiez dans **"Executions"** que le workflow s'exécute bien

## Étape 4: Modifier votre workflow principal

Votre workflow actuel doit:

1. ✅ Recevoir le webhook `/video`
2. ✅ Créer la prédiction Replicate
3. ✅ **INSERT dans Supabase** (status='processing')
4. ✅ Répondre au webhook avec le taskId
5. ❌ **SUPPRIMER** toute logique de polling (le Video Watcher s'en charge)

## Comment ça fonctionne

```
Timeline:

T+0s    : User envoie /video
          ↓
T+1s    : N8N crée la prédiction Replicate (id: abc123)
          ↓
T+2s    : N8N INSERT Supabase (task_id: abc123, status: processing)
          ↓
T+3s    : N8N répond au webhook {taskId: abc123}
          ↓
T+5s    : Interface commence le polling Supabase
          ↓
T+30s   : Video Watcher s'exécute (check toutes les vidéos en processing)
          ├─ GET Supabase → trouve abc123
          ├─ GET Replicate /predictions/abc123 → status: "starting"
          └─ Rien à faire, attendre 30s
          ↓
T+60s   : Video Watcher s'exécute à nouveau
          ├─ GET Replicate /predictions/abc123 → status: "processing"
          └─ Rien à faire, attendre 30s
          ↓
T+90s   : Video Watcher s'exécute à nouveau
          ├─ GET Replicate /predictions/abc123 → status: "processing"
          └─ Rien à faire, attendre 30s
          ↓
T+120s  : Video Watcher s'exécute à nouveau
          ├─ GET Replicate /predictions/abc123 → status: "succeeded"!
          ├─ Récupère video_url
          └─ PATCH Supabase (status: completed, video_url: ...)
          ↓
T+125s  : Interface poll Supabase
          └─ Trouve status: completed + video_url
          ↓
T+126s  : AFFICHE LA VIDÉO! 🎬
```

## Avantages de cette approche

✅ **Fiable**: Le polling tourne toutes les 30s, garanti
✅ **Pas de timeout**: Pas de limite de 10 minutes
✅ **Multiple vidéos**: Gère plusieurs vidéos en parallèle
✅ **Simple**: Pas de boucles complexes
✅ **Debuggable**: Chaque exécution visible dans N8N

## Test

1. **Tester depuis l'interface web**:
   ```
   Prompt: /video un chat qui joue
   ```

2. **Vérifier N8N**:
   - Allez dans "Executions"
   - Vous devriez voir le Video Watcher s'exécuter toutes les 30s

3. **Vérifier Supabase**:
   ```bash
   node test-debug.js
   ```
   Devrait montrer la vidéo en "processing"

4. **Attendre 2-3 minutes**:
   Le Video Watcher va détecter quand Replicate termine et mettre à jour Supabase

5. **L'interface affiche la vidéo automatiquement**!

## Troubleshooting

### Le Video Watcher ne trouve pas les vidéos

- Vérifiez que la table `video_tasks` existe dans Supabase
- Vérifiez que le INSERT se fait bien dans le workflow principal
- Testez l'URL Supabase dans un navigateur

### Le statut Replicate reste à "starting"

- C'est normal au début (15-30s)
- Replicate passe par: starting → processing → succeeded
- Le Video Watcher détectera le changement au prochain cycle (30s)

### La vidéo ne s'affiche jamais

1. Vérifiez les logs N8N du Video Watcher
2. Testez manuellement l'API Replicate:
   ```bash
   node find-replicate-version.js
   ```
3. Vérifiez que Supabase a été mis à jour:
   ```bash
   node test-debug.js
   ```

## Alternative: Code Node avec boucle while

Si vous préférez une boucle dans le workflow principal:

```javascript
// Attendre 30 secondes de manière BLOQUANTE
await new Promise(resolve => setTimeout(resolve, 30000));
```

Le `await` est CRITIQUE - sans lui, le code continue immédiatement sans attendre.

## Prochaines étapes

1. ✅ Importer `n8n-workflow-video-watcher.json`
2. ✅ Activer le workflow
3. ✅ Modifier votre workflow principal pour faire l'INSERT Supabase
4. ✅ Tester avec `node test-webhook.js`
5. ✅ Vérifier que la vidéo s'affiche après 2-3 minutes

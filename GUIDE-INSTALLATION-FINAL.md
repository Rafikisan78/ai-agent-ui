# Guide d'Installation FINAL - Workflows N8N

## Fichiers à importer

1. **workflow-1-main-final.json** - Workflow principal (création vidéo)
2. **workflow-2-watcher-final.json** - Workflow de surveillance (polling)

## Installation (5 minutes)

### Étape 1: Connexion N8N

1. Ouvrez: https://n8n.srv766650.hstgr.cloud
2. Connectez-vous

### Étape 2: Supprimer les anciens workflows (si existants)

Si vous avez des workflows existants qui ne fonctionnent pas:

1. Allez dans **Workflows** (menu gauche)
2. Cliquez sur les workflows problématiques
3. Cliquez sur **⋮** (trois points) → **Delete**

### Étape 3: Importer le Workflow Principal

1. Cliquez sur **"+"** (en haut à gauche)
2. **"Import from file"**
3. Sélectionnez: **`workflow-1-main-final.json`**
4. Cliquez **"Import"**
5. Le workflow s'ouvre automatiquement
6. **⚠️ IMPORTANT**: Cliquez sur le toggle en haut à droite pour **ACTIVER** le workflow (doit être vert)

### Étape 4: Importer le Video Watcher

1. Cliquez sur **"+"** (en haut à gauche)
2. **"Import from file"**
3. Sélectionnez: **`workflow-2-watcher-final.json`**
4. Cliquez **"Import"**
5. **⚠️ IMPORTANT**: Cliquez sur le toggle pour **ACTIVER** le workflow (doit être vert)

### Étape 5: Vérifier que tout fonctionne

#### Vérifier le Workflow Principal

1. Ouvrez le workflow **"AI Agent - Main (FINAL)"**
2. Vous devriez voir 5 nodes:
   - Webhook
   - IF /video
   - Créer Prédiction Replicate
   - INSERT Supabase
   - Respond to Webhook
3. Vérifiez que le toggle en haut est **VERT** (actif)

#### Vérifier le Video Watcher

1. Ouvrez le workflow **"Video Watcher - Polling (FINAL)"**
2. Vous devriez voir 8 nodes:
   - Schedule Trigger (30s)
   - GET Vidéos Processing
   - Split Into Items
   - Check Replicate
   - IF Succeeded
   - UPDATE Completed
   - IF Failed
   - UPDATE Failed
3. Vérifiez que le toggle est **VERT** (actif)

#### Vérifier les exécutions

1. Allez dans **"Executions"** (menu gauche)
2. Vous devriez voir le Video Watcher s'exécuter automatiquement toutes les 30 secondes
3. Status: **Success** (même s'il ne trouve pas de vidéos)

## Détails des Workflows

### Workflow 1: Main

**Rôle**: Recevoir le prompt, créer la vidéo dans Replicate, sauvegarder dans Supabase, répondre

**Flux**:
```
Webhook (/video) → IF /video → Créer Replicate → INSERT Supabase → Respond
```

**URL du webhook**:
```
https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable
```

### Workflow 2: Video Watcher

**Rôle**: Surveiller les vidéos en cours et mettre à jour Supabase quand terminées

**Flux**:
```
Schedule (30s) → GET Processing → Pour chaque vidéo → Check Replicate
                                                    ↓
                                        Si succeeded → UPDATE Completed
                                        Si failed → UPDATE Failed
```

## Configuration incluse

### Replicate
- ✅ Token: `VOTRE_TOKEN_REPLICATE_ICI`
- ✅ Modèle: `zeroscope-v2-xl`
- ✅ Version: `9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351`

### Supabase
- ✅ URL: `https://qrbtxbwhbjvytsfsazlg.supabase.co`
- ✅ Anon Key: (déjà configuré dans les headers)
- ✅ Table: `video_tasks`

### Tous les nodes utilisent HTTP Request
- ✅ Pas de credentials à configurer
- ✅ Pas de problème de connexion
- ✅ Fonctionne immédiatement après import

## Test

### Test 1: Depuis l'interface web

L'interface est sur: **http://localhost:3003**

1. Ouvrez dans votre navigateur
2. Entrez: `/video un chat qui joue avec une balle`
3. Cliquez **Envoyer**
4. Observez le timer: 0:05, 0:10, 0:15...
5. Attendez 2-3 minutes → La vidéo s'affiche! 🎬

### Test 2: Vérifier Supabase pendant le test

Dans un autre terminal:
```bash
node test-debug.js
```

**Pendant la génération:**
```
1️⃣ Vérification des vidéos en cours...
   1 vidéo(s) en processing

   1. abc123-def456...
      Prompt: /video un chat qui joue avec une balle
```

**Après 2-3 minutes:**
```
2️⃣ Dernières vidéos complétées...
   1 vidéo(s) complétées

   1. abc123-def456...
      URL: https://replicate.delivery/...mp4
      Terminée: 24/12/2025 03:05:00
```

### Test 3: Vérifier les logs N8N

1. Dans N8N, allez dans **"Executions"**
2. Filtrez par **"AI Agent - Main (FINAL)"**
   - Devrait montrer 1 exécution après votre test
   - Status: **Success**
3. Filtrez par **"Video Watcher - Polling (FINAL)"**
   - Devrait montrer des exécutions toutes les 30s
   - Status: **Success**

## Timeline attendue

```
T+0s     → User envoie "/video un chat"
T+1s     → Webhook reçu
T+2s     → Prédiction Replicate créée (id: abc123)
T+3s     → INSERT Supabase (status: processing)
T+4s     → Respond to Webhook {taskId: abc123}
T+5s     → Interface commence polling

T+30s    → Watcher #1: Replicate = "starting"
T+60s    → Watcher #2: Replicate = "processing"
T+90s    → Watcher #3: Replicate = "processing"
T+120s   → Watcher #4: Replicate = "succeeded" → UPDATE Supabase!

T+125s   → Interface détecte la vidéo → AFFICHE! 🎬
```

## Troubleshooting

### Le webhook renvoie 404

❌ Le workflow Main n'est pas actif

✅ Solution: Activez le workflow (toggle vert)

### La vidéo reste en "processing" indéfiniment

❌ Le Video Watcher n'est pas actif

✅ Solution:
1. Vérifiez que le workflow est actif
2. Vérifiez les Executions → doit s'exécuter toutes les 30s

### Erreur "Cannot establish connection"

❌ Vous utilisez un ancien workflow avec le node Supabase

✅ Solution: Supprimez l'ancien workflow et importez les nouveaux

### Erreur JSON.parse

❌ La table `video_tasks` n'existe pas dans Supabase

✅ Solution: Exécutez le SQL dans `create-table-supabase.sql`

## Checklist finale

Avant de tester:

- [ ] Table `video_tasks` créée dans Supabase
- [ ] Workflow "AI Agent - Main (FINAL)" importé et **ACTIF**
- [ ] Workflow "Video Watcher - Polling (FINAL)" importé et **ACTIF**
- [ ] Interface web lancée (`npm run dev`)
- [ ] Le Video Watcher s'exécute toutes les 30s (vérifier dans Executions)

Test:

- [ ] Prompt envoyé: `/video un chat qui joue`
- [ ] Timer augmente: 0:05, 0:10, 0:15...
- [ ] `node test-debug.js` montre 1 vidéo en processing
- [ ] Après 2-3 minutes: vidéo s'affiche! 🎬

## Support

Si problème:
1. Vérifiez les Executions dans N8N
2. Exécutez `node test-debug.js`
3. Vérifiez la console du navigateur (F12)

Tout devrait fonctionner parfaitement maintenant! 🚀

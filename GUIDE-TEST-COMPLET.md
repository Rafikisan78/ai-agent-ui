# Guide de Test Complet - Solution Video Polling

## Vue d'ensemble de la solution

Vous avez maintenant **2 workflows N8N** qui travaillent ensemble:

### Workflow 1: Main (synchrone)
- Reçoit le webhook `/video`
- Crée la prédiction Replicate
- INSERT dans Supabase (status='processing')
- Répond immédiatement au webhook
- **NE FAIT PAS de polling** ← Important!

### Workflow 2: Video Watcher (asynchrone)
- Tourne automatiquement toutes les 30 secondes
- Cherche les vidéos en "processing" dans Supabase
- Check le statut sur Replicate
- UPDATE Supabase quand "succeeded"

## Étape 1: Importer les 2 workflows dans N8N

1. Connectez-vous à N8N: `https://n8n.srv766650.hstgr.cloud`

2. **Importer le workflow principal**:
   - Cliquez sur **"+"** → **"Import from file"**
   - Sélectionnez `n8n-workflow-main-simple.json`
   - Le workflow s'appelle: **"AI Agent - Main Workflow (Simplifié)"**
   - ✅ **Activez-le** (toggle en haut à droite)

3. **Importer le Video Watcher**:
   - Cliquez sur **"+"** → **"Import from file"**
   - Sélectionnez `n8n-workflow-video-watcher.json`
   - Le workflow s'appelle: **"Video Status Watcher - Polling Replicate"**
   - ✅ **Activez-le** (toggle en haut à droite)

## Étape 2: Vérifier la table Supabase

1. Connectez-vous à Supabase: `https://app.supabase.com`

2. Allez dans **SQL Editor**

3. Exécutez ce script pour créer/vérifier la table:

```sql
-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS video_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT UNIQUE NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_video_tasks_task_id ON video_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_video_tasks_status ON video_tasks(status);

-- Vérifier
SELECT * FROM video_tasks ORDER BY created_at DESC LIMIT 5;
```

## Étape 3: Test manuel

### 3.1 Tester depuis l'interface web

1. Démarrez l'interface web:
   ```bash
   cd "c:\Users\elias\OneDrive\Documents\Nouveau dossier\n8n-trigger-ui"
   npm run dev
   ```

2. Ouvrez `http://localhost:5173`

3. Entrez le prompt:
   ```
   /video un chat qui joue avec une balle
   ```

4. Cliquez sur **Envoyer**

### 3.2 Observer ce qui se passe

**Dans l'interface web:**
- ✅ Message "Vidéo en cours de génération..."
- ✅ Timer qui s'affiche (0:05, 0:10, 0:15...)
- ✅ Indicateur "🎬 Génération vidéo..."

**Dans N8N (onglet Executions):**
- ✅ Workflow "Main" s'est exécuté une fois
- ✅ Workflow "Video Watcher" s'exécute toutes les 30s

**Dans Supabase (Table Editor → video_tasks):**
- ✅ Nouvelle ligne avec status='processing'
- ✅ task_id rempli
- ✅ prompt rempli

### 3.3 Attendre la génération

**Après ~30 secondes:**
- Video Watcher check #1: Replicate status = "starting"
- Rien à faire, attendre 30s

**Après ~60 secondes:**
- Video Watcher check #2: Replicate status = "processing"
- Rien à faire, attendre 30s

**Après ~90 secondes:**
- Video Watcher check #3: Replicate status = "processing"
- Rien à faire, attendre 30s

**Après ~120 secondes (2 minutes):**
- Video Watcher check #4: Replicate status = "succeeded" 🎉
- UPDATE Supabase: status='completed', video_url='...'

**Dans l'interface web:**
- ✅ La vidéo s'affiche automatiquement!
- ✅ Le player vidéo apparaît

## Étape 4: Vérifier avec les scripts

### 4.1 Debug rapide

```bash
node test-debug.js
```

**Résultat attendu:**
```
🐛 Debug rapide du système

1️⃣ Vérification des vidéos en cours...
   1 vidéo(s) en processing

   1. abc123def456...
      Prompt: /video un chat qui joue avec une balle
      Depuis: 24/01/2025 12:34:56

2️⃣ Dernières vidéos complétées...
   0 vidéo(s) complétées (3 dernières)

3️⃣ Statistiques globales...
   Total: 1 vidéos
   En cours: 1
   Complétées: 0

✅ Debug terminé
```

**Après 2-3 minutes, re-exécutez:**

```bash
node test-debug.js
```

**Résultat attendu:**
```
1️⃣ Vérification des vidéos en cours...
   0 vidéo(s) en processing

2️⃣ Dernières vidéos complétées...
   1 vidéo(s) complétées (3 dernières)

   1. abc123def456...
      Prompt: /video un chat qui joue avec une balle
      URL: https://replicate.delivery/...mp4
      Terminée: 24/01/2025 12:37:23

3️⃣ Statistiques globales...
   Total: 1 vidéos
   En cours: 0
   Complétées: 1 ✅
```

### 4.2 Détecter et corriger les vidéos bloquées

Si une vidéo reste bloquée en "processing":

```bash
node test-detect-corrected.js
```

Ce script va:
- Trouver toutes les vidéos en "processing"
- Vérifier leur statut réel sur Replicate
- Mettre à jour Supabase si Replicate a terminé

## Étape 5: Troubleshooting

### Problème: La vidéo reste en "processing" indéfiniment

**Diagnostic:**

1. Vérifiez que le Video Watcher tourne:
   ```
   N8N → Workflows → Video Status Watcher → Toggle doit être "Active"
   ```

2. Vérifiez les logs du Video Watcher:
   ```
   N8N → Executions → Filtrer par "Video Status Watcher"
   ```

3. Regardez s'il trouve des vidéos:
   ```
   Click sur la dernière exécution → Node "GET Vidéos en Processing"
   Doit montrer votre vidéo
   ```

4. Vérifiez le statut Replicate:
   ```bash
   node test-detect-corrected.js
   ```

**Solutions:**

- Si le Watcher ne tourne pas → Activez-le
- Si le Watcher ne trouve pas la vidéo → Vérifiez Supabase
- Si Replicate est en "succeeded" mais Supabase pas mis à jour → Problème dans le node UPDATE

### Problème: L'INSERT Supabase échoue

**Diagnostic:**

1. Vérifiez les logs N8N du workflow Main:
   ```
   N8N → Executions → "AI Agent - Main Workflow"
   → Click sur l'exécution → Node "INSERT Supabase"
   ```

2. Vérifiez que la table existe:
   ```sql
   SELECT * FROM video_tasks LIMIT 1;
   ```

**Solutions:**

- Si la table n'existe pas → Exécutez le CREATE TABLE
- Si erreur de permissions → Vérifiez les credentials Supabase

### Problème: Replicate reste à "starting" trop longtemps

**C'est normal!** Replicate peut prendre:
- 15-30s pour passer de "starting" → "processing"
- 60-120s pour générer la vidéo (processing → succeeded)
- Total: **2-3 minutes** en moyenne

Le Video Watcher va continuer à checker toutes les 30s automatiquement.

## Étape 6: Logs utiles

### Voir toutes les exécutions du Video Watcher

```
N8N → Executions → Filtrer par "Video Status Watcher"
```

Vous devriez voir une exécution toutes les 30 secondes.

### Voir les vidéos en cours dans Supabase

```sql
SELECT task_id, prompt, status, created_at
FROM video_tasks
WHERE status = 'processing'
ORDER BY created_at DESC;
```

### Voir les logs dans l'interface web

Ouvrez la console du navigateur (F12):
```
🎬 Démarrage du polling vidéo pour taskId: abc123...
🔄 Polling Supabase... (toutes les 5s)
✅ Vidéo prête! https://replicate.delivery/...mp4
```

## Timeline attendue (exemple complet)

```
T+0s     → User clique "Envoyer" avec "/video un chat"
T+1s     → Webhook N8N reçu
T+2s     → Prédiction Replicate créée (id: abc123)
T+3s     → INSERT Supabase (task_id: abc123, status: processing)
T+4s     → Respond to Webhook {taskId: abc123}
T+5s     → Interface commence polling Supabase (toutes les 5s)
           Interface affiche "Traitement en cours... 0:05"

T+30s    → Video Watcher #1
           ├─ GET Supabase → trouve abc123
           ├─ GET Replicate → status: "starting"
           └─ Rien à faire
           Interface affiche "Traitement en cours... 0:30"

T+60s    → Video Watcher #2
           ├─ GET Replicate → status: "processing"
           └─ Rien à faire
           Interface affiche "Traitement en cours... 1:00"

T+90s    → Video Watcher #3
           ├─ GET Replicate → status: "processing"
           └─ Rien à faire
           Interface affiche "Traitement en cours... 1:30"

T+120s   → Video Watcher #4
           ├─ GET Replicate → status: "succeeded" 🎉
           ├─ video_url: https://replicate.delivery/...mp4
           └─ PATCH Supabase (status: completed, video_url: ...)

T+125s   → Interface poll Supabase
           ├─ Trouve status: completed + video_url
           ├─ Arrête le polling
           └─ AFFICHE LA VIDÉO! 🎬
```

## Checklist finale

Avant de tester:

- [ ] Table `video_tasks` existe dans Supabase
- [ ] Workflow "Main" importé et **ACTIF**
- [ ] Workflow "Video Watcher" importé et **ACTIF**
- [ ] Interface web lancée (`npm run dev`)
- [ ] Console navigateur ouverte (F12) pour voir les logs

Pendant le test:

- [ ] Prompt envoyé: `/video un chat qui joue`
- [ ] Interface affiche "Génération en cours"
- [ ] Timer augmente: 0:05, 0:10, 0:15...
- [ ] Supabase montre status='processing'
- [ ] Video Watcher s'exécute toutes les 30s

Après 2-3 minutes:

- [ ] Supabase montre status='completed'
- [ ] Supabase a video_url rempli
- [ ] Interface affiche la vidéo
- [ ] Player vidéo fonctionne

## Félicitations! 🎉

Si tout fonctionne, vous avez maintenant:
- ✅ Un système de génération vidéo asynchrone
- ✅ Un polling automatique fiable
- ✅ Une interface qui affiche les vidéos automatiquement
- ✅ Un timeout de 10 minutes (au lieu de 2)
- ✅ Un timer en temps réel

## Prochaines améliorations possibles

1. **Notifications**: Ajouter une notification quand la vidéo est prête
2. **Queue**: Gérer plusieurs vidéos en parallèle
3. **Retry**: Retenter automatiquement si échec
4. **Cache**: Sauvegarder les vidéos localement
5. **Preview**: Afficher un aperçu pendant la génération

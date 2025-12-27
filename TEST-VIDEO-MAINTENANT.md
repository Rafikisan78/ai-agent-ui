# Test Vidéo - À faire MAINTENANT

## État actuel

✅ **Interface web**: Prête avec polling 10 minutes + timer
✅ **Scripts de test**: Créés (test-debug.js, test-detect-corrected.js)
✅ **Workflows N8N**: Créés (à importer)
✅ **Base Supabase**: Vide (0 vidéos) - Normal!

❌ **Webhook N8N**: Pas encore activé (erreur 404)

## Test Rapide (5 minutes)

### Option A: Tester depuis l'interface web (RECOMMANDÉ)

1. **Démarrer l'interface**:
   ```bash
   npm run dev
   ```

2. **Ouvrir dans le navigateur**:
   - URL: `http://localhost:5173`
   - Ouvrir la console (F12)

3. **IMPORTANT: Vérifier que N8N est configuré**:
   - Le webhook doit être actif dans N8N
   - Si erreur 404: importez d'abord les workflows N8N

4. **Envoyer un prompt vidéo**:
   ```
   /video un chat qui joue avec une balle
   ```

5. **Observer**:
   - ✅ Timer qui s'affiche: 0:05, 0:10, 0:15...
   - ✅ Message "Génération vidéo en cours"
   - ✅ Dans la console: logs de polling

6. **Attendre 2-3 minutes**:
   - La vidéo devrait s'afficher automatiquement
   - Si timeout après 10 min: problème dans N8N

### Option B: Importer d'abord les workflows N8N

**Si le test Option A échoue avec erreur 404**, suivez ces étapes:

1. **Connexion N8N**:
   - Ouvrez: `https://n8n.srv766650.hstgr.cloud`
   - Connectez-vous

2. **Importer le workflow principal**:
   - Cliquez sur **"+"** (en haut à gauche)
   - **"Import from file"**
   - Sélectionnez: `n8n-workflow-main-simple.json`
   - Cliquez sur **"Import"**
   - ⚠️ **ACTIVEZ le workflow** (toggle "Inactive" → "Active")

3. **Importer le Video Watcher**:
   - Cliquez sur **"+"**
   - **"Import from file"**
   - Sélectionnez: `n8n-workflow-video-watcher.json`
   - Cliquez sur **"Import"**
   - ⚠️ **ACTIVEZ le workflow** (toggle "Inactive" → "Active")

4. **Vérifier que ça tourne**:
   - Allez dans **"Executions"** (menu gauche)
   - Vous devriez voir le "Video Watcher" s'exécuter toutes les 30s

5. **Retour à l'Option A**: Retestez depuis l'interface web

### Option C: Créer la table Supabase manuellement

**Si les workflows N8N échouent sur l'INSERT Supabase**:

1. **Connexion Supabase**:
   - Ouvrez: `https://app.supabase.com`
   - Sélectionnez votre projet

2. **SQL Editor**:
   - Menu gauche → **SQL Editor**
   - **"New query"**

3. **Copier/coller ce SQL**:
   ```sql
   -- Créer la table video_tasks
   CREATE TABLE IF NOT EXISTS video_tasks (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     task_id TEXT UNIQUE NOT NULL,
     prompt TEXT NOT NULL,
     video_url TEXT,
     status TEXT DEFAULT 'processing',
     created_at TIMESTAMP DEFAULT NOW(),
     completed_at TIMESTAMP
   );

   -- Index pour performance
   CREATE INDEX IF NOT EXISTS idx_video_tasks_task_id ON video_tasks(task_id);
   CREATE INDEX IF NOT EXISTS idx_video_tasks_status ON video_tasks(status);

   -- Vérifier
   SELECT * FROM video_tasks;
   ```

4. **Exécuter** (bouton "Run" ou F5)

5. **Vérifier**:
   - Devrait afficher une table vide
   - Si erreur: la table existe déjà (OK!)

## Que surveiller pendant le test

### Dans l'interface web (Console F12)

Logs attendus:
```
🎬 Démarrage du polling vidéo pour taskId: abc123...
⏳ Polling Supabase toutes les 5s...
⏳ Polling Supabase toutes les 5s...
✅ Vidéo prête! https://replicate.delivery/...mp4
```

Timer affiché:
```
🎬 Génération vidéo... (0:05)
🎬 Génération vidéo... (0:10)
🎬 Génération vidéo... (0:15)
...
🎬 Génération vidéo... (2:30)
✅ Vidéo affichée!
```

### Dans N8N (Executions)

Workflow "Main":
```
✅ Webhook reçu
✅ Prédiction Replicate créée
✅ INSERT Supabase OK
✅ Respond to Webhook
```

Workflow "Video Watcher" (toutes les 30s):
```
1er cycle (30s):  GET Supabase → 1 vidéo → Check Replicate → starting → Rien
2e cycle (60s):   GET Supabase → 1 vidéo → Check Replicate → processing → Rien
3e cycle (90s):   GET Supabase → 1 vidéo → Check Replicate → processing → Rien
4e cycle (120s):  GET Supabase → 1 vidéo → Check Replicate → succeeded → UPDATE! ✅
```

### Dans Supabase (Table Editor)

Avant la vidéo:
```
task_id         | prompt               | status      | video_url | created_at
abc123...       | /video un chat...    | processing  | null      | 2025-01-24 12:00:00
```

Après 2-3 minutes:
```
task_id         | prompt               | status      | video_url                    | completed_at
abc123...       | /video un chat...    | completed   | https://replicate.deliv...   | 2025-01-24 12:02:30
```

## Erreurs possibles

### Erreur 1: "Webhook not registered" (404)

**Cause**: Les workflows N8N ne sont pas importés/activés

**Solution**:
1. Importez `n8n-workflow-main-simple.json`
2. Importez `n8n-workflow-video-watcher.json`
3. **ACTIVEZ les deux workflows**

### Erreur 2: "Timeout 10 min"

**Cause**: Le Video Watcher ne tourne pas OU ne met pas à jour Supabase

**Solution**:
1. Vérifiez que le Video Watcher est **ACTIF**
2. Vérifiez les logs du Video Watcher dans N8N
3. Exécutez `node test-detect-corrected.js` pour corriger manuellement

### Erreur 3: "Table video_tasks does not exist"

**Cause**: La table Supabase n'existe pas

**Solution**:
1. Suivez l'Option C ci-dessus
2. Créez la table avec le SQL fourni

### Erreur 4: Vidéo ne s'affiche jamais

**Diagnostic**:
```bash
node test-debug.js
```

Si status = 'processing' après 5 minutes:
```bash
node test-detect-corrected.js
```

Ce script va vérifier Replicate et corriger Supabase si besoin.

## Timeline attendue (TEST RÉUSSI)

```
T+0s     → Clic "Envoyer" dans l'interface
T+1s     → Requête au webhook N8N
T+2s     → N8N crée la prédiction Replicate
T+3s     → N8N INSERT dans Supabase (status: processing)
T+4s     → N8N répond au webhook avec taskId
T+5s     → Interface commence le polling Supabase
           Affiche: "🎬 Génération vidéo... (0:05)"

T+30s    → Video Watcher #1: Replicate status = "starting"
           Affiche: "🎬 Génération vidéo... (0:30)"

T+60s    → Video Watcher #2: Replicate status = "processing"
           Affiche: "🎬 Génération vidéo... (1:00)"

T+90s    → Video Watcher #3: Replicate status = "processing"
           Affiche: "🎬 Génération vidéo... (1:30)"

T+120s   → Video Watcher #4: Replicate status = "succeeded" 🎉
           UPDATE Supabase (status: completed, video_url: ...)
           Affiche: "🎬 Génération vidéo... (2:00)"

T+125s   → Interface poll Supabase
           Trouve status='completed' + video_url
           🎬 AFFICHE LA VIDÉO! 🎉
```

## Commandes utiles

```bash
# Démarrer l'interface
npm run dev

# Vérifier l'état Supabase
node test-debug.js

# Corriger les vidéos bloquées
node test-detect-corrected.js

# Build l'interface
npm run build
```

## Checklist avant de tester

- [ ] Node.js installé
- [ ] npm install exécuté
- [ ] Fichier .env avec les credentials Supabase
- [ ] N8N accessible à `https://n8n.srv766650.hstgr.cloud`
- [ ] Workflows N8N importés ET **ACTIFS**
- [ ] Table `video_tasks` créée dans Supabase

## Prêt à tester?

1. ✅ Ouvrez l'interface: `npm run dev`
2. ✅ Naviguez vers: `http://localhost:5173`
3. ✅ Entrez: `/video un chat qui joue`
4. ✅ Cliquez "Envoyer"
5. ✅ Attendez 2-3 minutes
6. ✅ La vidéo s'affiche! 🎬

Bonne chance! 🚀

# Fix: JSON.parse: unexpected end of data

## Erreur

```
JSON.parse: unexpected end of data at line 1 column 1 of the JSON data
```

Cette erreur signifie que Supabase renvoie une réponse vide au lieu de JSON.

## Causes possibles

1. ❌ La table `video_tasks` n'existe pas
2. ❌ Les politiques RLS (Row Level Security) bloquent l'accès
3. ❌ Les credentials Supabase sont incorrects

## Solution: Créer la table dans Supabase

### Étape 1: Connexion à Supabase

1. Ouvrez: https://app.supabase.com
2. Connectez-vous avec votre compte
3. Sélectionnez votre projet (celui avec l'URL `qrbtxbwhbjvytsfsazlg.supabase.co`)

### Étape 2: Ouvrir le SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New query** (en haut à droite)

### Étape 3: Copier/Coller le SQL

Copiez le contenu du fichier `create-table-supabase.sql` et collez-le dans l'éditeur SQL.

Ou copiez directement ce code:

```sql
-- Supprimer la table si elle existe (pour repartir à zéro)
DROP TABLE IF EXISTS video_tasks CASCADE;

-- Créer la table
CREATE TABLE video_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT UNIQUE NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Index pour performance
CREATE INDEX idx_video_tasks_task_id ON video_tasks(task_id);
CREATE INDEX idx_video_tasks_status ON video_tasks(status);

-- Activer Row Level Security
ALTER TABLE video_tasks ENABLE ROW LEVEL SECURITY;

-- Permettre lecture publique
CREATE POLICY "Permettre lecture publique"
ON video_tasks FOR SELECT
USING (true);

-- Permettre insertion publique
CREATE POLICY "Permettre insertion publique"
ON video_tasks FOR INSERT
WITH CHECK (true);

-- Permettre mise à jour publique
CREATE POLICY "Permettre mise à jour publique"
ON video_tasks FOR UPDATE
USING (true);

-- Vérifier
SELECT * FROM video_tasks;
```

### Étape 4: Exécuter le SQL

1. Cliquez sur **Run** (ou appuyez sur F5)
2. Vous devriez voir un message de succès
3. La dernière requête (`SELECT * FROM video_tasks;`) devrait retourner une table vide

### Étape 5: Vérifier dans Table Editor

1. Dans le menu de gauche, cliquez sur **Table Editor**
2. Vous devriez voir la table `video_tasks` dans la liste
3. Cliquez dessus → Table vide (0 rows)

## Test après création de la table

### Test 1: Vérifier avec le script debug

```bash
node test-debug.js
```

**Résultat attendu:**
```
🐛 Debug rapide du système

1️⃣ Vérification des vidéos en cours...
   0 vidéo(s) en processing

2️⃣ Dernières vidéos complétées...
   0 vidéo(s) complétées (3 dernières)

3️⃣ Statistiques globales...
   Total: 0 vidéos
   En cours: 0
   Complétées: 0

✅ Debug terminé
```

Si vous voyez ça → **La table est créée correctement!** ✅

### Test 2: Tester l'insertion manuelle

Dans Supabase SQL Editor:

```sql
-- Insérer une vidéo de test
INSERT INTO video_tasks (task_id, prompt, status)
VALUES ('test-123', '/video test', 'processing');

-- Vérifier
SELECT * FROM video_tasks;
```

Devrait afficher 1 ligne.

### Test 3: Re-tester le script debug

```bash
node test-debug.js
```

Devrait maintenant afficher:
```
1️⃣ Vérification des vidéos en cours...
   1 vidéo(s) en processing

   1. test-123
      Prompt: /video test
      Depuis: ...
```

### Test 4: Nettoyer le test

```sql
DELETE FROM video_tasks WHERE task_id = 'test-123';
```

## Si l'erreur persiste

### Vérifier les credentials

Dans le fichier `.env`:

```env
VITE_SUPABASE_URL=https://qrbtxbwhbjvytsfsazlg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y
```

### Vérifier les politiques RLS

Dans Supabase:
1. Table Editor → `video_tasks`
2. Onglet **"Policies"** (à côté de "Definition")
3. Vous devriez voir 3 politiques:
   - "Permettre lecture publique" (SELECT)
   - "Permettre insertion publique" (INSERT)
   - "Permettre mise à jour publique" (UPDATE)

Si elles n'existent pas, ré-exécutez le SQL ci-dessus.

## Recap

1. ✅ Créer la table `video_tasks` dans Supabase
2. ✅ Activer RLS avec politiques publiques
3. ✅ Tester avec `node test-debug.js`
4. ✅ L'erreur JSON.parse devrait disparaître

Une fois la table créée, vous pourrez tester le workflow N8N complet!

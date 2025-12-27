-- Script SQL pour créer la table video_tasks dans Supabase
-- Copiez et exécutez ce script dans Supabase SQL Editor

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

-- Index pour recherche rapide par task_id
CREATE INDEX idx_video_tasks_task_id ON video_tasks(task_id);

-- Index pour recherche par statut
CREATE INDEX idx_video_tasks_status ON video_tasks(status);

-- Activer Row Level Security (RLS)
ALTER TABLE video_tasks ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (pour l'app et N8N)
CREATE POLICY "Permettre lecture publique"
ON video_tasks FOR SELECT
USING (true);

-- Politique pour permettre l'insertion publique (pour N8N)
CREATE POLICY "Permettre insertion publique"
ON video_tasks FOR INSERT
WITH CHECK (true);

-- Politique pour permettre la mise à jour publique (pour N8N)
CREATE POLICY "Permettre mise à jour publique"
ON video_tasks FOR UPDATE
USING (true);

-- Vérifier que la table est créée
SELECT
  'Table créée avec succès!' as message,
  COUNT(*) as nombre_lignes
FROM video_tasks;

-- Afficher la structure de la table
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'video_tasks'
ORDER BY ordinal_position;

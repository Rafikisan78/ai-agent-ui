-- Script SQL pour créer la table video_tasks dans Supabase
-- Copiez et exécutez ce script dans Supabase SQL Editor

-- Créer la table
CREATE TABLE IF NOT EXISTS video_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT UNIQUE NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Index pour recherche rapide par task_id
CREATE INDEX IF NOT EXISTS idx_video_tasks_task_id ON video_tasks(task_id);

-- Index pour recherche par statut
CREATE INDEX IF NOT EXISTS idx_video_tasks_status ON video_tasks(status);

-- Activer Row Level Security (RLS)
ALTER TABLE video_tasks ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (pour l'app)
CREATE POLICY IF NOT EXISTS "Permettre lecture publique"
ON video_tasks FOR SELECT
USING (true);

-- Politique pour permettre l'insertion publique (pour N8N)
CREATE POLICY IF NOT EXISTS "Permettre insertion publique"
ON video_tasks FOR INSERT
WITH CHECK (true);

-- Politique pour permettre la mise à jour publique (pour N8N)
CREATE POLICY IF NOT EXISTS "Permettre mise à jour publique"
ON video_tasks FOR UPDATE
USING (true);

-- Vérifier que la table est créée
SELECT * FROM video_tasks LIMIT 1;

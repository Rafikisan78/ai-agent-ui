-- Table pour l'authentification (un seul utilisateur autorisé)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  is_first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Index sur l'email pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);

-- Activer RLS (Row Level Security)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (pour vérifier si l'email existe)
CREATE POLICY "Permettre lecture publique" ON app_users
  FOR SELECT
  USING (true);

-- Politique pour permettre l'insertion publique (pour la première connexion)
CREATE POLICY "Permettre insertion publique" ON app_users
  FOR INSERT
  WITH CHECK (true);

-- Politique pour permettre la mise à jour publique (pour changer le mot de passe)
CREATE POLICY "Permettre mise à jour publique" ON app_users
  FOR UPDATE
  USING (true);

-- Insérer l'utilisateur autorisé (sans mot de passe initialement)
INSERT INTO app_users (email, is_first_login)
VALUES ('rafikisan78@gmail.com', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Vérification
SELECT * FROM app_users;

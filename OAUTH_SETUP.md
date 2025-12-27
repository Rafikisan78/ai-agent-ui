# Configuration OAuth pour l'Application

Ce guide vous explique comment configurer l'authentification OAuth (Google et GitHub) pour votre application déployée sur Coolify.

## Table des matières
1. [Configuration Supabase](#configuration-supabase)
2. [Configuration Google OAuth](#configuration-google-oauth)
3. [Configuration GitHub OAuth](#configuration-github-oauth)
4. [Configuration Coolify](#configuration-coolify)
5. [Test de la configuration](#test-de-la-configuration)

---

## Configuration Supabase

### 1. Accéder au Dashboard Supabase

Connectez-vous à [https://supabase.com](https://supabase.com) et sélectionnez votre projet.

### 2. Configurer les URLs de redirection

1. Allez dans **Authentication** → **URL Configuration**
2. Ajoutez vos URLs autorisées dans **Redirect URLs** :
   ```
   http://localhost:5173
   https://votre-domaine.com
   ```
   Remplacez `votre-domaine.com` par l'URL de votre application sur Coolify.

3. Ajoutez également ces URLs dans **Site URL** :
   ```
   https://votre-domaine.com
   ```

---

## Configuration Google OAuth

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API **Google+ API**

### 2. Créer des identifiants OAuth 2.0

1. Allez dans **APIs & Services** → **Credentials**
2. Cliquez sur **Create Credentials** → **OAuth client ID**
3. Choisissez **Web application**
4. Configurez :
   - **Name**: N8N Multimodal App
   - **Authorized JavaScript origins**:
     ```
     https://votre-domaine.com
     http://localhost:5173
     ```
   - **Authorized redirect URIs**:
     ```
     https://VOTRE_PROJET_REF.supabase.co/auth/v1/callback
     http://localhost:5173
     ```
     Remplacez `VOTRE_PROJET_REF` par votre référence de projet Supabase (trouvée dans Settings → API)

5. Cliquez sur **Create** et notez :
   - **Client ID**
   - **Client Secret**

### 3. Configurer Google dans Supabase

1. Dans le dashboard Supabase, allez dans **Authentication** → **Providers**
2. Trouvez **Google** et activez-le
3. Entrez :
   - **Client ID**: (copiez depuis Google Cloud Console)
   - **Client Secret**: (copiez depuis Google Cloud Console)
4. Cliquez sur **Save**

---

## Configuration GitHub OAuth

### 1. Créer une OAuth App sur GitHub

1. Allez sur [GitHub Settings](https://github.com/settings/developers)
2. Cliquez sur **OAuth Apps** → **New OAuth App**
3. Remplissez les champs :
   - **Application name**: N8N Multimodal App
   - **Homepage URL**: `https://votre-domaine.com`
   - **Authorization callback URL**:
     ```
     https://VOTRE_PROJET_REF.supabase.co/auth/v1/callback
     ```
     Remplacez `VOTRE_PROJET_REF` par votre référence de projet Supabase

4. Cliquez sur **Register application**
5. Notez :
   - **Client ID**
   - Cliquez sur **Generate a new client secret** et notez le **Client Secret**

### 2. Configurer GitHub dans Supabase

1. Dans le dashboard Supabase, allez dans **Authentication** → **Providers**
2. Trouvez **GitHub** et activez-le
3. Entrez :
   - **Client ID**: (copiez depuis GitHub)
   - **Client Secret**: (copiez depuis GitHub)
4. Cliquez sur **Save**

---

## Configuration Coolify

### 1. Variables d'environnement

Dans Coolify, ajoutez les variables d'environnement suivantes pour votre application :

```env
VITE_N8N_WEBHOOK_URL=https://n8n.srv766650.hstgr.cloud/webhook-test/votre-webhook-id
VITE_SUPABASE_URL=https://VOTRE_PROJET_REF.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-supabase
```

### 2. Rebuild de l'application

Après avoir ajouté les variables d'environnement :
1. Redéployez votre application dans Coolify
2. Attendez que le build se termine

---

## Test de la configuration

### 1. Tester en local (avant déploiement)

1. Copiez `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Remplissez vos credentials dans `.env`

3. Lancez l'application :
   ```bash
   npm run dev
   ```

4. Ouvrez `http://localhost:5173` et testez :
   - Connexion avec Google
   - Connexion avec GitHub
   - Connexion avec email/mot de passe (legacy)

### 2. Tester en production

1. Ouvrez votre application sur Coolify : `https://votre-domaine.com`
2. Cliquez sur **Google** ou **GitHub**
3. Autorisez l'application
4. Vous devriez être redirigé et connecté automatiquement

---

## Troubleshooting

### Erreur "Redirect URL mismatch"
- Vérifiez que les redirect URLs sont identiques dans :
  - Supabase (Authentication → URL Configuration)
  - Google Cloud Console (Authorized redirect URIs)
  - GitHub OAuth App (Authorization callback URL)

### L'utilisateur n'est pas connecté après redirection
- Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont correctement configurés
- Vérifiez les logs de la console navigateur (F12)
- Vérifiez que votre domaine Coolify utilise HTTPS

### OAuth fonctionne en local mais pas en production
- Vérifiez que vous avez ajouté l'URL de production dans :
  - Supabase Redirect URLs
  - Google Authorized redirect URIs
  - GitHub Authorization callback URL

---

## Sécurité

- Ne commitez JAMAIS vos fichiers `.env` dans Git
- Gardez vos Client Secrets confidentiels
- Activez l'authentification multi-facteurs sur Google Cloud et GitHub
- Utilisez HTTPS en production (Coolify le fait automatiquement)

---

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de Supabase (Dashboard → Logs)
2. Vérifiez les logs de votre application Coolify
3. Consultez la documentation Supabase : https://supabase.com/docs/guides/auth

Bon déploiement ! 🚀

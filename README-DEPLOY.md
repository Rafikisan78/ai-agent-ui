# 🚀 Guide de Déploiement sur Coolify

Ce guide explique comment déployer votre interface AI Agent Multimodal sur Coolify avec votre propre nom de domaine.

## 📋 Prérequis

- Un compte Coolify configuré
- Un nom de domaine (ex: `ai-agent.votredomaine.com`)
- Les fichiers de votre projet :
  - `index.html` (interface de production)
  - `test-workflow.html` (interface de test)
  - `Dockerfile`
  - `docker-compose.yml`

## 🔧 Étape 1: Préparer votre Repository Git

1. **Créer un repository Git** (GitHub, GitLab, ou Gitea):
   ```bash
   cd n8n-trigger-ui
   git init
   git add .
   git commit -m "Initial commit: AI Agent Multimodal UI"
   ```

2. **Pousser vers votre repository**:
   ```bash
   git remote add origin https://github.com/VOTRE_USERNAME/ai-agent-ui.git
   git push -u origin main
   ```

## 🌐 Étape 2: Configurer votre Domaine

### Option A: Sous-domaine
1. Connectez-vous à votre hébergeur de domaine (ex: Cloudflare, OVH, etc.)
2. Ajoutez un enregistrement DNS de type **A** :
   - **Nom**: `ai-agent` (pour ai-agent.votredomaine.com)
   - **Type**: A
   - **Valeur**: L'adresse IP de votre serveur Coolify
   - **TTL**: 300 (ou automatique)

### Option B: Domaine principal
1. Créez un enregistrement **A** :
   - **Nom**: `@` ou laissez vide
   - **Type**: A
   - **Valeur**: IP de votre serveur Coolify

## 🎯 Étape 3: Déployer sur Coolify

### 1. Connectez-vous à Coolify
```
https://votre-serveur-coolify.com
```

### 2. Créer un nouveau projet

1. Cliquez sur **"+ New Project"**
2. Donnez-lui un nom : `AI Agent Multimodal`

### 3. Ajouter une nouvelle application

1. Dans votre projet, cliquez sur **"+ New Resource"**
2. Sélectionnez **"Application"**
3. Choisissez **"Docker Compose"** ou **"Dockerfile"**

### 4. Configurer l'application

#### Configuration Git:
- **Repository URL**: `https://github.com/VOTRE_USERNAME/ai-agent-ui.git`
- **Branch**: `main`
- **Build Pack**: `Dockerfile`

#### Configuration de Déploiement:
- **Build Command**: (laisser vide, le Dockerfile s'en charge)
- **Port**: `80`
- **Base Directory**: `/` (racine du projet)

### 5. Configurer le Domaine

1. Dans l'onglet **"Domains"** de votre application
2. Ajoutez votre domaine :
   ```
   ai-agent.votredomaine.com
   ```
3. Activez **"Generate SSL Certificate"** pour HTTPS automatique

### 6. Variables d'environnement (optionnel)

Si vous voulez paramétrer l'URL du webhook:

1. Allez dans **"Environment Variables"**
2. Ajoutez:
   ```
   WEBHOOK_URL=https://n8n.srv766650.hstgr.cloud/webhook/ai-agent-fiable
   ```

### 7. Déployer

1. Cliquez sur **"Deploy"** en haut à droite
2. Attendez que le build se termine (1-3 minutes)
3. Vérifiez les logs pour vous assurer qu'il n'y a pas d'erreurs

## ✅ Étape 4: Vérification

1. **Accédez à votre site**:
   ```
   https://ai-agent.votredomaine.com
   ```

2. **Test de fonctionnalité**:
   - Page de production: `https://ai-agent.votredomaine.com`
   - Page de test: `https://ai-agent.votredomaine.com/test.html`

3. **Testez les fonctionnalités**:
   - Génération de texte
   - Génération d'image
   - Génération de vidéo avec polling automatique

## 🔄 Mises à Jour Automatiques

Coolify peut être configuré pour déployer automatiquement lors de nouveaux commits:

1. Dans votre application Coolify, allez dans **"Git"**
2. Activez **"Auto Deploy"**
3. Configurez le webhook (optionnel):
   - Copiez l'URL du webhook Coolify
   - Ajoutez-la dans les settings de votre repository GitHub

Maintenant, chaque fois que vous pushez du code, Coolify déploiera automatiquement!

## 🔧 Commandes Utiles

### Redéployer manuellement:
```bash
# Dans Coolify, cliquez simplement sur "Redeploy"
```

### Voir les logs en temps réel:
```bash
# Dans Coolify, onglet "Logs"
```

### Accéder au container:
```bash
docker exec -it <container-id> sh
```

## 🎨 Personnalisation

### Changer le titre ou les couleurs:

Éditez `index.html`:
```html
<h1>🤖 Votre Titre Personnalisé</h1>
```

### Modifier l'URL du webhook:

Éditez `index.html` ligne ~400:
```javascript
const WEBHOOK_URL = 'https://votre-n8n.com/webhook/votre-webhook';
```

## 🆘 Dépannage

### Problème: Site inaccessible
- Vérifiez que le DNS est bien configuré (peut prendre jusqu'à 24h)
- Vérifiez que le port 80 est bien exposé dans Coolify

### Problème: SSL/HTTPS ne fonctionne pas
- Vérifiez que "Generate SSL Certificate" est activé
- Attendez quelques minutes pour que Let's Encrypt génère le certificat
- Vérifiez que votre domaine pointe bien vers le serveur

### Problème: Webhook ne fonctionne pas
- Vérifiez que l'URL du webhook est correcte dans `index.html`
- Testez le webhook directement avec Postman ou curl
- Vérifiez les logs N8N pour voir si la requête arrive

### Problème: Vidéo ne charge pas
- Vérifiez la console du navigateur (F12)
- Vérifiez que le polling fonctionne (regardez les logs)
- Testez avec l'interface de test: `https://votredomaine.com/test.html`

## 📝 Structure des Fichiers

```
n8n-trigger-ui/
├── index.html              # Interface de production (page principale)
├── test-workflow.html      # Interface de test (debugging)
├── Dockerfile              # Configuration Docker
├── docker-compose.yml      # Configuration Docker Compose
└── README-DEPLOY.md        # Ce guide
```

## 🔐 Sécurité

Pour un environnement de production:

1. **Ajoutez une authentification** (basique ou OAuth)
2. **Limitez les requêtes** avec un rate limiter
3. **Ajoutez CORS** si nécessaire dans votre workflow N8N
4. **Utilisez HTTPS** (automatique avec Coolify)

## 📞 Support

Si vous rencontrez des problèmes:
- Vérifiez les logs Coolify
- Vérifiez les logs de votre container
- Testez localement avec `docker-compose up`

## 🎉 C'est Terminé!

Votre interface AI Agent est maintenant déployée et accessible sur votre domaine personnalisé!

**URLs importantes:**
- Production: `https://votredomaine.com`
- Tests: `https://votredomaine.com/test.html`
- N8N Webhook: `https://n8n.srv766650.hstgr.cloud/webhook/ai-agent-fiable`

# 🚀 Guide de Démarrage Rapide

## ✅ L'application est prête !

Le serveur de développement tourne actuellement sur:
- **Local**: http://localhost:3000
- **Réseau**: http://192.168.125.19:3000

---

## 📖 Comment utiliser l'application

### Étape 1: Ouvrir l'interface
Ouvrez votre navigateur sur: **http://localhost:3000**

Vous verrez:
- 🎨 Une interface moderne avec un thème sombre
- 📝 Un champ de texte pour saisir votre message
- 🔘 Un bouton "Envoyer"

### Étape 2: Activer le webhook N8N

⚠️ **IMPORTANT**: Le webhook N8N est en **mode test**. Pour l'utiliser:

1. Allez sur: https://n8n.srv766650.hstgr.cloud
2. Connectez-vous à N8N
3. Ouvrez votre workflow
4. Cliquez sur **"Execute Workflow"** ou **"Test Workflow"**
5. Le webhook est maintenant actif pour **1 seul appel**

### Étape 3: Envoyer un message

1. Tapez votre message dans le champ de texte
2. Cliquez sur **"Envoyer"** (ou appuyez sur **Ctrl+Enter**)
3. Observez:
   - ⏳ Le spinner de chargement apparaît
   - ✅ La réponse N8N s'affiche en JSON formaté
   - ❌ Ou un message d'erreur si le webhook est inactif

---

## 🎯 Exemple de Flux Complet

```
1. Vous: Tapez "Bonjour N8N!" dans le champ
2. Clic: Bouton "Envoyer"
3. App: Envoie { "message": "Bonjour N8N!", "timestamp": "..." }
4. N8N: Exécute le workflow
5. N8N: Retourne une réponse
6. App: Affiche la réponse formatée
```

---

## 🧪 Page de Test

Une page de test est disponible pour vérifier le bon fonctionnement:

**Ouvrir**: `test-app.html` dans votre navigateur

Cette page permet de:
- ✅ Tester la connexion au serveur
- ✅ Tester le webhook N8N directement
- ✅ Effectuer un test complet du workflow
- 🔗 Ouvrir l'application principale

---

## 🔧 Commandes Utiles

### Démarrer le serveur
```bash
cd n8n-trigger-ui
npm run dev
```

### Arrêter le serveur
Appuyez sur `Ctrl+C` dans le terminal

### Rebuild après modifications
Le serveur Vite recharge automatiquement ! 🔥
Pas besoin de redémarrer.

### Build pour la production
```bash
npm run build
```

### Tester avec Docker
```bash
docker-compose up -d
```

---

## 📱 Fonctionnalités

### Saisie de Message
- ✍️ Textarea auto-redimensionnable
- ⌨️ Raccourci clavier: **Ctrl+Enter**
- 🚫 Désactivé pendant l'envoi
- 💡 Placeholder: "Entrez votre message..."

### Affichage de la Réponse
- 📭 État vide avec icône d'attente
- ⏳ Loader animé pendant le traitement
- ✅ JSON formaté en cas de succès
- ❌ Message d'erreur stylisé en cas d'échec

### Design
- 🌙 Thème sombre élégant
- 📱 Responsive (mobile & desktop)
- 🎨 Tailwind CSS
- ⚡ Transitions fluides

---

## ❓ FAQ

### L'application ne charge pas ?
**Vérifiez**:
1. Le serveur est-il démarré ? (`npm run dev`)
2. Le port 3000 est-il libre ?
3. Ouvrez http://localhost:3000 dans le navigateur

### Erreur "webhook is not registered" ?
**C'est normal !** Le webhook N8N est en mode test.
**Solution**: Activez le workflow dans N8N avant d'envoyer.

### Erreur CORS ?
**Cause**: N8N bloque les requêtes cross-origin
**Solution**: Configurez les headers CORS dans votre workflow N8N

### Comment changer l'URL du webhook ?
Modifiez le fichier `.env`:
```env
VITE_N8N_WEBHOOK_URL=https://votre-nouvelle-url
```
Puis redémarrez le serveur.

---

## 📊 Structure du Projet

```
n8n-trigger-ui/
├── src/
│   ├── components/
│   │   ├── PromptInput.jsx      # Composant de saisie
│   │   └── ResponseDisplay.jsx  # Affichage réponse
│   ├── services/
│   │   └── n8n.js               # API N8N
│   ├── App.jsx                  # Composant principal
│   ├── main.jsx                 # Point d'entrée
│   └── index.css                # Styles Tailwind
├── .env                         # Variables d'environnement
├── package.json                 # Dépendances
└── README.md                    # Documentation
```

---

## 🎓 Pour Aller Plus Loin

### Modifier l'Interface
Éditez les fichiers dans `src/components/`:
- **PromptInput.jsx**: Champ de saisie
- **ResponseDisplay.jsx**: Affichage réponse
- **App.jsx**: Layout général

### Personnaliser le Style
Éditez `tailwind.config.js` pour:
- Changer les couleurs
- Modifier les espacements
- Ajouter des thèmes

### Ajouter des Fonctionnalités
Créez de nouveaux composants dans `src/components/`

---

## 📞 Support

Des questions ? Consultez:
- [README.md](README.md) - Documentation complète
- [TESTS.md](TESTS.md) - Rapport de tests détaillé

---

**Bon développement ! 🚀**

# Guide: Démarrage Automatique du Workflow N8N à la Connexion

## Vue d'ensemble

L'application initialise automatiquement la connexion avec N8N lorsqu'un utilisateur se connecte. Cela permet de:

1. ✅ Vérifier que N8N est accessible
2. ✅ Notifier N8N de la session utilisateur
3. ✅ Afficher un indicateur visuel de connexion (point vert/orange)
4. ✅ Préparer l'environnement pour les requêtes multimodales

---

## Fonctionnement Actuel

### 1. À la connexion de l'utilisateur

Lorsque l'utilisateur se connecte avec succès:

```javascript
// App.jsx
useEffect(() => {
  if (user) {
    // 1. Charger l'historique
    loadHistory()

    // 2. Vérifier que N8N est accessible
    const isAccessible = await pingN8N()

    // 3. Notifier N8N de la connexion
    await notifyUserLogin(user.email)

    // 4. Afficher l'indicateur de statut
    setN8nConnected(true) // Point vert
  }
}, [user])
```

### 2. Indicateur visuel

Dans le header, l'utilisateur voit:
- 🟢 **Point vert clignotant** + "N8N connecté" → Workflow accessible
- 🟠 **Point orange** + "N8N déconnecté" → Workflow inaccessible

---

## Configuration N8N (Optionnelle)

### Option 1: Workflow de Notification (Simple)

Si vous voulez recevoir des notifications de connexion dans N8N:

1. **Créer un nouveau workflow dans N8N**
2. **Ajouter un nœud "Webhook"**
   - Method: POST
   - Path: `/webhook/user-session`
3. **Traiter la notification** (optionnel)
   - Ajouter des nœuds pour logger, envoyer un email, etc.
4. **Activer le workflow**

### Option 2: Utiliser le Workflow Existant

Votre workflow principal (`ai-agent-fiable`) gère déjà les requêtes. Aucune configuration supplémentaire n'est nécessaire!

L'application envoie simplement un ping au webhook existant pour vérifier qu'il est actif:

```javascript
// Le webhook principal répond à tous les événements
POST https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable
```

**Body envoyé lors du ping:**
```json
{
  "action": "ping",
  "timestamp": "2025-12-24T12:00:00.000Z"
}
```

**Body envoyé lors de la connexion:**
```json
{
  "event": "user_login",
  "email": "rafikisan78@gmail.com",
  "timestamp": "2025-12-24T12:00:00.000Z",
  "action": "initialize_session"
}
```

---

## Fichiers Modifiés

### 1. [src/services/n8n-workflow.js](src/services/n8n-workflow.js) (NOUVEAU)

Service pour gérer les interactions avec N8N:

```javascript
// Vérifier que N8N est accessible
export async function pingN8N()

// Notifier N8N qu'un utilisateur s'est connecté
export async function notifyUserLogin(userEmail)

// Démarrer un workflow spécifique (via API)
export async function startWorkflow(workflowId)

// Vérifier le statut d'un workflow
export async function checkWorkflowStatus(workflowId)
```

### 2. [src/App.jsx](src/App.jsx) (MODIFIÉ)

Ajout de l'initialisation N8N:

- Nouveau state: `n8nConnected`
- Nouveau useEffect pour initialiser N8N à la connexion
- Indicateur visuel dans le header

---

## Variables d'Environnement (Optionnelles)

Si vous voulez utiliser l'API N8N pour contrôler les workflows:

### Ajouter dans `.env`

```env
# URL de base N8N (déjà défini)
VITE_N8N_WEBHOOK_URL=https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable

# Nouveau: URL de base pour l'API N8N (optionnel)
VITE_N8N_BASE_URL=https://n8n.srv766650.hstgr.cloud

# Nouveau: Clé API N8N (optionnel)
VITE_N8N_API_KEY=votre_cle_api_n8n
```

### Comment obtenir la clé API N8N

1. Ouvrez votre instance N8N: https://n8n.srv766650.hstgr.cloud
2. Allez dans **Settings** (⚙️) → **API**
3. Cliquez sur **Create API Key**
4. Copiez la clé et ajoutez-la dans `.env`

**⚠️ Note**: La clé API est **optionnelle**. L'application fonctionne parfaitement sans elle en utilisant les webhooks.

---

## Test de la Connexion

### 1. Vérifier dans la console du navigateur

Après connexion, ouvrez la console (F12):

```
🔄 Initialisation de la connexion N8N...
✅ N8N est accessible
✅ N8N notifié de la connexion utilisateur
✅ Session N8N initialisée
```

### 2. Vérifier l'indicateur visuel

Dans le header de l'application:
- Vous devriez voir: **🟢 N8N connecté**

### 3. En cas de problème

Si vous voyez **🟠 N8N déconnecté**:

1. **Vérifiez que le workflow N8N est actif**
   - Ouvrez N8N: https://n8n.srv766650.hstgr.cloud
   - Cherchez le workflow "AI Agent - Main (FINAL)"
   - Vérifiez qu'il est **actif** (toggle vert)

2. **Testez le webhook manuellement**
   ```bash
   curl -X POST https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable \
     -H "Content-Type: application/json" \
     -d '{"action":"ping"}'
   ```

3. **Vérifiez la console du navigateur** pour les erreurs

---

## Fonctionnalités Futures (Améliorations Possibles)

### 1. Auto-activation du Workflow

Si vous configurez la clé API N8N, l'application pourrait automatiquement:
- Détecter si le workflow est inactif
- L'activer automatiquement à la connexion

```javascript
// Déjà implémenté dans n8n-workflow.js
await startWorkflow('workflow-id')
```

### 2. Reconnexion Automatique

Ajouter un polling pour vérifier périodiquement la connexion N8N:

```javascript
// Vérifier toutes les 30 secondes
setInterval(async () => {
  const isAccessible = await pingN8N()
  setN8nConnected(isAccessible)
}, 30000)
```

### 3. Notification de Déconnexion

Notifier N8N quand l'utilisateur se déconnecte:

```javascript
// À implémenter dans handleLogout()
await notifyUserLogout(user.email)
```

---

## Résumé des Événements

| Événement | Action | N8N Notifié? | Indicateur |
|-----------|--------|--------------|------------|
| **Connexion utilisateur** | Ping + notification | Oui | 🟢 Connecté |
| **N8N inaccessible** | Rien | Non | 🟠 Déconnecté |
| **Envoi d'un prompt** | Requête au workflow | Oui | - |
| **Déconnexion** | Nettoyage session | Non (pour l'instant) | - |

---

## Troubleshooting

### Problème: "N8N déconnecté" en permanence

**Causes possibles:**
1. Le workflow N8N n'est pas actif
2. L'URL du webhook est incorrecte
3. N8N n'est pas accessible (serveur down)

**Solutions:**
1. Vérifier le statut du workflow dans N8N
2. Vérifier la variable `VITE_N8N_WEBHOOK_URL` dans `.env`
3. Tester le webhook manuellement avec curl

### Problème: La notification ne s'affiche pas

**Cause:** Le workflow ne traite pas l'événement `user_login`

**Solution:** Aucune action requise - le ping suffit pour vérifier la connexion. La notification est optionnelle.

---

## Conclusion

✅ **Configuration actuelle** - Fonctionne sans configuration supplémentaire!

L'application:
1. Vérifie automatiquement que N8N est accessible à la connexion
2. Affiche un indicateur visuel de statut
3. Envoie une notification optionnelle à N8N

Aucune modification de vos workflows N8N n'est nécessaire. Tout fonctionne "out of the box"! 🎉

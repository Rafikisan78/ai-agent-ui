# Guide Complet de l'API N8N

## Vue d'ensemble

L'API N8N vous permet de contrôler entièrement votre instance N8N de manière programmatique, sans passer par l'interface web.

---

## 🔑 Authentification

Toutes les requêtes nécessitent un header avec votre API key:

```javascript
headers: {
  'X-N8N-API-KEY': 'votre_cle_api'
}
```

---

## 📋 Gestion des Workflows

### 1. Lister tous les workflows

**Endpoint**: `GET /api/v1/workflows`

```javascript
const response = await fetch('https://n8n.srv766650.hstgr.cloud/api/v1/workflows', {
  headers: { 'X-N8N-API-KEY': apiKey }
});

const workflows = await response.json();
// Retourne: [{ id, name, active, nodes, connections, ... }]
```

**Utilité**:
- Voir tous vos workflows
- Trouver l'ID d'un workflow spécifique
- Vérifier quels workflows sont actifs

---

### 2. Récupérer un workflow spécifique

**Endpoint**: `GET /api/v1/workflows/{id}`

```javascript
const response = await fetch(
  `https://n8n.srv766650.hstgr.cloud/api/v1/workflows/SYKtWT1uWl7GlsKq`,
  { headers: { 'X-N8N-API-KEY': apiKey } }
);

const workflow = await response.json();
```

**Retourne**:
```json
{
  "id": "SYKtWT1uWl7GlsKq",
  "name": "AI Agent Multimodal",
  "active": true,
  "nodes": [...],
  "connections": {...},
  "settings": {...},
  "staticData": null,
  "createdAt": "2025-12-23T...",
  "updatedAt": "2025-12-24T..."
}
```

**Utilité**:
- Inspecter la configuration d'un workflow
- Vérifier son statut (actif/inactif)
- Voir tous les nœuds et connexions

---

### 3. Créer un nouveau workflow

**Endpoint**: `POST /api/v1/workflows`

```javascript
const newWorkflow = {
  name: "Mon Nouveau Workflow",
  nodes: [
    {
      type: "n8n-nodes-base.webhook",
      name: "Webhook",
      parameters: { path: "mon-webhook" },
      position: [250, 300]
    }
  ],
  connections: {},
  active: false
};

const response = await fetch('https://n8n.srv766650.hstgr.cloud/api/v1/workflows', {
  method: 'POST',
  headers: {
    'X-N8N-API-KEY': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newWorkflow)
});
```

**Utilité**:
- Créer des workflows par code
- Dupliquer des workflows
- Automatiser la création de workflows

---

### 4. Mettre à jour un workflow

**Endpoint**: `PUT /api/v1/workflows/{id}`

```javascript
// D'abord récupérer le workflow
const workflow = await getWorkflow(id);

// Modifier ce que vous voulez
workflow.name = "Nouveau nom";
workflow.nodes.push(newNode);

// Sauvegarder
const response = await fetch(
  `https://n8n.srv766650.hstgr.cloud/api/v1/workflows/${id}`,
  {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workflow)
  }
);
```

**Utilité**:
- Modifier des workflows par code
- Ajouter/supprimer des nœuds
- Changer des paramètres

---

### 5. Supprimer un workflow

**Endpoint**: `DELETE /api/v1/workflows/{id}`

```javascript
const response = await fetch(
  `https://n8n.srv766650.hstgr.cloud/api/v1/workflows/${id}`,
  {
    method: 'DELETE',
    headers: { 'X-N8N-API-KEY': apiKey }
  }
);
```

**Utilité**:
- Nettoyer les workflows obsolètes
- Automatiser la gestion des workflows

---

### 6. ✅ Activer un workflow

**Endpoint**: `POST /api/v1/workflows/{id}/activate`

```javascript
const response = await fetch(
  `https://n8n.srv766650.hstgr.cloud/api/v1/workflows/${id}/activate`,
  {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': apiKey }
  }
);
```

**Utilité**:
- Démarrer un workflow programmatiquement
- Auto-activation au démarrage de l'app
- Activation conditionnelle

---

### 7. ❌ Désactiver un workflow

**Endpoint**: `POST /api/v1/workflows/{id}/deactivate`

```javascript
const response = await fetch(
  `https://n8n.srv766650.hstgr.cloud/api/v1/workflows/${id}/deactivate`,
  {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': apiKey }
  }
);
```

**Utilité**:
- Arrêter un workflow temporairement
- Maintenance programmée
- Gestion conditionnelle

---

## 🚀 Exécution de Workflows

### 8. Exécuter un workflow manuellement

**Endpoint**: `POST /api/v1/workflows/{id}/execute`

```javascript
const response = await fetch(
  `https://n8n.srv766650.hstgr.cloud/api/v1/workflows/${id}/execute`,
  {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // Données d'entrée optionnelles
      input: { message: "Test" }
    })
  }
);

const execution = await response.json();
```

**Utilité**:
- Tester un workflow
- Déclencher une exécution sans webhook
- Exécutions planifiées

---

## 📊 Historique d'Exécution

### 9. Lister les exécutions

**Endpoint**: `GET /api/v1/executions`

```javascript
const response = await fetch(
  'https://n8n.srv766650.hstgr.cloud/api/v1/executions?limit=10',
  { headers: { 'X-N8N-API-KEY': apiKey } }
);

const executions = await response.json();
```

**Paramètres disponibles**:
- `limit`: Nombre de résultats (défaut: 20)
- `workflowId`: Filtrer par workflow
- `status`: Filtrer par statut (success, error, running)

**Utilité**:
- Voir l'historique d'exécution
- Détecter les erreurs
- Analyser les performances

---

### 10. Récupérer une exécution spécifique

**Endpoint**: `GET /api/v1/executions/{id}`

```javascript
const response = await fetch(
  `https://n8n.srv766650.hstgr.cloud/api/v1/executions/${executionId}`,
  { headers: { 'X-N8N-API-KEY': apiKey } }
);

const execution = await response.json();
```

**Retourne**:
```json
{
  "id": "123",
  "workflowId": "SYKtWT1uWl7GlsKq",
  "mode": "webhook",
  "finished": true,
  "startedAt": "2025-12-24T10:00:00Z",
  "stoppedAt": "2025-12-24T10:00:05Z",
  "status": "success",
  "data": {
    "resultData": {
      "runData": {...}
    }
  }
}
```

**Utilité**:
- Débugger une exécution
- Voir les données de sortie
- Analyser les erreurs

---

### 11. Supprimer des exécutions

**Endpoint**: `DELETE /api/v1/executions/{id}`

```javascript
const response = await fetch(
  `https://n8n.srv766650.hstgr.cloud/api/v1/executions/${executionId}`,
  {
    method: 'DELETE',
    headers: { 'X-N8N-API-KEY': apiKey }
  }
);
```

**Utilité**:
- Nettoyer l'historique
- Libérer de l'espace
- Supprimer des exécutions sensibles

---

## 🔗 Credentials (Identifiants)

### 12. Lister les credentials

**Endpoint**: `GET /api/v1/credentials`

```javascript
const response = await fetch(
  'https://n8n.srv766650.hstgr.cloud/api/v1/credentials',
  { headers: { 'X-N8N-API-KEY': apiKey } }
);

const credentials = await response.json();
```

**Utilité**:
- Voir toutes les connexions configurées
- Trouver l'ID d'un credential

---

### 13. Créer un credential

**Endpoint**: `POST /api/v1/credentials`

```javascript
const newCredential = {
  name: "Mon API Key",
  type: "httpBasicAuth",
  data: {
    user: "username",
    password: "password"
  }
};

const response = await fetch(
  'https://n8n.srv766650.hstgr.cloud/api/v1/credentials',
  {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newCredential)
  }
);
```

**Utilité**:
- Créer des connexions par code
- Automatiser la configuration

---

## 🏷️ Tags

### 14. Gérer les tags

**Endpoints**:
- `GET /api/v1/tags` - Lister tous les tags
- `POST /api/v1/tags` - Créer un tag
- `PUT /api/v1/tags/{id}` - Modifier un tag
- `DELETE /api/v1/tags/{id}` - Supprimer un tag

**Utilité**:
- Organiser les workflows
- Filtrer par catégorie

---

## 📁 Gestion de l'Instance

### 15. Informations sur l'instance

**Endpoint**: `GET /api/v1/owner`

```javascript
const response = await fetch(
  'https://n8n.srv766650.hstgr.cloud/api/v1/owner',
  { headers: { 'X-N8N-API-KEY': apiKey } }
);

const info = await response.json();
```

**Utilité**:
- Vérifier la configuration
- Voir les informations de l'instance

---

## 💡 Cas d'Usage Pratiques

### Auto-activation de workflow au démarrage de l'app

```javascript
async function ensureWorkflowIsActive() {
  const workflow = await getWorkflow('SYKtWT1uWl7GlsKq');

  if (!workflow.active) {
    await activateWorkflow('SYKtWT1uWl7GlsKq');
    console.log('✅ Workflow activé');
  } else {
    console.log('ℹ️ Workflow déjà actif');
  }
}
```

### Monitoring des erreurs

```javascript
async function checkForErrors() {
  const executions = await fetch(
    'https://n8n.srv766650.hstgr.cloud/api/v1/executions?status=error&limit=5',
    { headers: { 'X-N8N-API-KEY': apiKey } }
  );

  const errors = await executions.json();

  if (errors.length > 0) {
    console.error(`⚠️ ${errors.length} exécutions en erreur`);
    // Envoyer une notification, etc.
  }
}
```

### Créer un workflow par code

```javascript
async function createImageGenerationWorkflow() {
  const workflow = {
    name: "Générateur d'Images V2",
    nodes: [
      {
        type: "n8n-nodes-base.webhook",
        name: "Webhook",
        parameters: { path: "generate-image-v2" },
        position: [250, 300]
      },
      {
        type: "n8n-nodes-base.httpRequest",
        name: "Call DALL-E",
        parameters: {
          url: "https://api.openai.com/v1/images/generations",
          method: "POST"
        },
        position: [450, 300]
      }
    ],
    connections: {
      "Webhook": {
        "main": [[{ "node": "Call DALL-E", "type": "main", "index": 0 }]]
      }
    },
    active: false
  };

  const response = await createWorkflow(workflow);
  return response;
}
```

---

## ⚠️ Limites et Bonnes Pratiques

### Limites

1. **Rate Limiting**: N8N peut limiter le nombre de requêtes API par minute
2. **Timeout**: Les exécutions longues peuvent timeout
3. **Taille des données**: Limites sur la taille des payloads

### Bonnes Pratiques

1. **Gérer les erreurs**: Toujours utiliser try/catch
2. **Vérifier les statuts**: Tester `response.ok` avant de parser
3. **Pagination**: Utiliser `limit` et `offset` pour les grandes listes
4. **Cache**: Mettre en cache les données qui changent rarement
5. **Sécurité**: Ne jamais exposer l'API key côté client en production

---

## 🔒 Sécurité

### ⚠️ Important pour votre application

Actuellement, votre API key est dans le fichier `.env` côté client:

```env
VITE_N8N_API_KEY=eyJhbG...
```

**Risque**: L'API key est visible dans le bundle JavaScript compilé.

**Pour une application monoutilisateur** (comme la vôtre): ✅ Acceptable

**Pour une application multi-utilisateurs**: ❌ Risqué

### Solution pour production multi-utilisateurs

1. **Créer un backend** (Node.js, Python, etc.)
2. **Stocker l'API key côté serveur**
3. **Le frontend appelle le backend**, pas N8N directement

Exemple:
```
Frontend → Backend (Node.js) → N8N API
```

---

## 📚 Documentation Officielle

Pour plus de détails: https://docs.n8n.io/api/

---

## 🎯 Résumé des Endpoints Principaux

| Action | Méthode | Endpoint |
|--------|---------|----------|
| Lister workflows | GET | `/api/v1/workflows` |
| Récupérer workflow | GET | `/api/v1/workflows/{id}` |
| Créer workflow | POST | `/api/v1/workflows` |
| Modifier workflow | PUT | `/api/v1/workflows/{id}` |
| Supprimer workflow | DELETE | `/api/v1/workflows/{id}` |
| **Activer workflow** | POST | `/api/v1/workflows/{id}/activate` |
| **Désactiver workflow** | POST | `/api/v1/workflows/{id}/deactivate` |
| Exécuter workflow | POST | `/api/v1/workflows/{id}/execute` |
| Lister exécutions | GET | `/api/v1/executions` |
| Récupérer exécution | GET | `/api/v1/executions/{id}` |
| Lister credentials | GET | `/api/v1/credentials` |

---

## 💡 Idées d'Amélioration pour Votre App

1. **Dashboard de monitoring**
   - Afficher les dernières exécutions
   - Graphiques de succès/erreurs
   - Temps d'exécution moyen

2. **Logs en temps réel**
   - Polling des exécutions récentes
   - Afficher les erreurs dans l'UI

3. **Gestion multi-workflows**
   - Switcher entre différents workflows
   - Activer/désactiver depuis l'UI

4. **Statistiques**
   - Nombre de prompts par jour
   - Temps de réponse moyen
   - Taux de succès

5. **Backup/Export**
   - Exporter la configuration du workflow
   - Sauvegarder l'historique

# 📥 Instructions pour Importer le Workflow N8N avec Replicate

## 🎯 Ce Workflow Inclut

✅ Gestion complète des erreurs Replicate
✅ Logs de débogage automatiques
✅ Gestion du rate limit (crédits insuffisants)
✅ Format de réponse correct pour test-workflow.html
✅ Header `Prefer: wait` pour réponse synchrone
✅ Timeout de 30 secondes
✅ Continue on fail activé

## 📋 Étapes d'Importation

### 1. Ouvrir N8N

Allez sur: https://n8n.srv766650.hstgr.cloud

### 2. Importer le Workflow

1. Cliquez sur **"+ Add workflow"** (en haut à droite)
2. Cliquez sur le menu **"..."** (trois points)
3. Sélectionnez **"Import from file"**
4. Sélectionnez le fichier: `n8n-workflow-replicate-with-error-handling.json`
5. Cliquez sur **"Import"**

### 3. Configurer les Credentials Replicate

Le workflow nécessite votre clé API Replicate:

1. Cliquez sur le nœud **"Replicate API"**
2. Dans **"Credentials"**, cliquez sur **"Create New"**
3. Sélectionnez **"Header Auth"**
4. Configuration:
   ```
   Name: Replicate API Token
   Header Name: Authorization
   Header Value: Bearer VOTRE_CLE_REPLICATE_ICI
   ```
   (Remplacez `VOTRE_CLE_REPLICATE_ICI` par votre vraie clé, ex: `VOTRE_TOKEN_REPLICATE_ICI...`)
5. Cliquez sur **"Save"**

### 4. Vérifier le Webhook Path

1. Cliquez sur le nœud **"Webhook"**
2. Vérifiez que le **Path** est: `ai-agent-fiable`
3. L'URL complète sera: `https://n8n.srv766650.hstgr.cloud/webhook/ai-agent-fiable`

### 5. Activer le Workflow

1. En haut à droite, basculez le switch sur **"Active"**
2. Le workflow est maintenant en ligne!

## 🧪 Tester le Workflow

### Option 1: Test Rapide dans N8N

1. Cliquez sur le nœud **"Webhook"**
2. Cliquez sur **"Listen for test event"**
3. Dans un autre terminal, exécutez:
   ```bash
   node n8n-trigger-ui/test-n8n-replicate.js
   ```
4. Vérifiez la réponse dans N8N

### Option 2: Test avec curl

```bash
curl -X POST https://n8n.srv766650.hstgr.cloud/webhook/ai-agent-fiable \
  -H "Content-Type: application/json" \
  -d '{"message": "\\image un chat astronaute", "type": "text"}'
```

### Option 3: Test avec l'Application Web

```bash
start n8n-trigger-ui/test-workflow.html
```

Cliquez sur **"▶️ Tester"** dans la section Image.

## 📊 Vérifier les Logs

Pour voir les logs de débogage:

1. Allez sur: https://n8n.srv766650.hstgr.cloud/executions
2. Cliquez sur la dernière exécution
3. Cliquez sur le nœud **"Log Replicate Response"**
4. Vérifiez les logs dans la console:
   ```
   🎨 REPLICATE RESPONSE: {...}
   📊 Status: succeeded
   🖼️  Output: ["https://replicate.delivery/..."]
   ```

## ⚠️ Gestion du Rate Limit

Si vous voyez l'erreur **"Request was throttled"**:

### Réponse retournée au frontend:
```json
[
  {
    "type": "image",
    "content": "Erreur lors de la génération. Rate limit atteint ou crédits insuffisants.",
    "image_url": null,
    "metadata": {
      "status": "failed",
      "error": "Request was throttled...",
      "message": "Ajoutez des crédits sur https://replicate.com/account/billing ou attendez 15 secondes"
    },
    "success": false
  }
]
```

### Solutions:
1. **Ajoutez des crédits**: https://replicate.com/account/billing
2. **Attendez 15 secondes** entre chaque test
3. Le workflow gérera automatiquement l'erreur et retournera un message clair

## 🔧 Structure du Workflow

```
1. Webhook Trigger
   ↓
2. IF Image (détecte \image)
   ↓
3. Extract Prompt (extrait le texte)
   ↓
4. Replicate API (génère l'image)
   ↓
5. Log Replicate Response (logs de débogage)
   ↓
6. Check Success (vérifie le statut)
   ├─ TRUE → Format Success Response
   └─ FALSE → Format Error Response
   ↓
7. Merge (combine les réponses)
   ↓
8. Wrap in Array (format array pour le frontend)
   ↓
9. Respond to Webhook
```

## ✅ Checklist Post-Importation

- [ ] Workflow importé dans N8N
- [ ] Credentials Replicate configurées
- [ ] Webhook path = `ai-agent-fiable`
- [ ] Workflow activé
- [ ] Test avec curl → Succès
- [ ] Logs visibles dans Executions
- [ ] Crédits Replicate > $5 (recommandé)

## 🆘 En Cas de Problème

### Erreur 401 (Unauthorized)
→ Vérifiez la clé API Replicate dans les Credentials

### Erreur 429 (Rate Limit)
→ Ajoutez des crédits ou attendez 15 secondes

### Réponse vide
→ Vérifiez les logs dans Executions → Cliquez sur l'exécution → Vérifiez chaque nœud

### Timeout
→ Augmentez le timeout dans le nœud "Replicate API" (Options → Timeout → 60000)

---

Une fois le workflow importé et testé, passez au fichier test-workflow.html pour vérifier l'intégration complète!

# ⚙️ Configuration du Nœud HTTP Request avec Retry Automatique

## 🎯 Solution Simple: Utiliser les Options de Retry dans le Nœud HTTP

Au lieu d'ajouter des nœuds complexes, vous pouvez configurer le **nœud HTTP Request** pour gérer automatiquement les erreurs de rate limit.

## 📋 Configuration Étape par Étape

### 1. Ouvrir le Nœud "Replicate API" (HTTP Request)

Dans votre workflow N8N, cliquez sur le nœud qui appelle Replicate.

### 2. Configuration de Base

**Method:** POST
**URL:** `https://api.replicate.com/v1/predictions`

**Authentication:**
- Type: `Generic Credential Type`
- Generic Auth Type: `Header Auth`
- Credential: Votre credential Replicate (avec `Authorization: Bearer VOTRE_TOKEN_REPLICATE_ICI...`)

**Headers:**
Cliquez sur "Add Header":
```
Name: Prefer
Value: wait
```

Cliquez sur "Add Header":
```
Name: Content-Type
Value: application/json
```

**Body:**
```json
{
  "version": "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
  "input": {
    "prompt": "={{ $json.prompt }}",
    "num_inference_steps": 4,
    "guidance_scale": 0
  }
}
```

### 3. Options Avancées - RETRY AUTOMATIQUE ✨

Cliquez sur **"Add Option"** et configurez:

#### Option 1: **Batching** ❌ (Ne pas utiliser)

#### Option 2: **Ignore SSL Issues** ❌ (Ne pas utiliser)

#### Option 3: **Pagination** ❌ (Ne pas utiliser)

#### Option 4: **Proxy** ❌ (Ne pas utiliser)

#### Option 5: **Redirect**
- **Follow Redirect:** ON ✅

#### Option 6: **Response** ⭐ IMPORTANT
- **Never Error:** ON ✅ (Continue même en cas d'erreur HTTP)
- **Response Format:** JSON

#### Option 7: **Retry on Fail** ⭐⭐⭐ ESSENTIEL
Cliquez sur **"Add Option"** → **"Retry On Fail"**

Configuration:
```
☑ Retry On Fail: ON

Max Tries: 3
  (Nombre total de tentatives, incluant la première)

Wait Between Tries (ms): 15000
  (15 secondes d'attente entre chaque tentative)

☑ Wait Progressive: ON
  (Double le temps d'attente à chaque tentative: 15s, 30s, 45s)
```

#### Option 8: **Timeout**
```
Timeout (ms): 60000
  (60 secondes max par requête)
```

### 4. Options du Nœud (En haut à droite)

Cliquez sur l'icône ⚙️ du nœud:

```
☑ Continue On Fail: ON
  (Le workflow continue même si toutes les tentatives échouent)

☑ Always Output Data: ON
  (Retourne les données même en cas d'erreur)
```

## 📊 Comportement avec ces Options

### Scénario 1: Succès Immédiat
```
Tentative 1 → Status 200 → ✅ Succès
Temps total: ~3 secondes
```

### Scénario 2: Rate Limit puis Succès
```
Tentative 1 → Status 429 (Rate Limit) → Attente 15s
Tentative 2 → Status 200 → ✅ Succès
Temps total: ~18 secondes
```

### Scénario 3: Rate Limit Persistant
```
Tentative 1 → Status 429 → Attente 15s
Tentative 2 → Status 429 → Attente 30s
Tentative 3 → Status 429 → ❌ Échec (mais continue avec Continue On Fail)
Temps total: ~48 secondes
```

## 🎯 Configuration Complète Résumée

### Nœud HTTP Request "Replicate API"

```yaml
Method: POST
URL: https://api.replicate.com/v1/predictions
Authentication: Header Auth (Replicate credentials)

Headers:
  - Prefer: wait
  - Content-Type: application/json

Body:
  version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637"
  input:
    prompt: "={{ $json.prompt }}"
    num_inference_steps: 4
    guidance_scale: 0

Options:
  ☑ Redirect → Follow Redirect: ON
  ☑ Response → Never Error: ON
  ☑ Response → Response Format: JSON
  ☑ Retry On Fail:
      Max Tries: 3
      Wait Between Tries: 15000 ms
      Wait Progressive: ON
  ☑ Timeout: 60000 ms

Node Settings:
  ☑ Continue On Fail: ON
  ☑ Always Output Data: ON
```

## ✅ Avantages de cette Approche

✅ **Simple:** Pas besoin de nœuds supplémentaires
✅ **Automatique:** Gère les retries sans code
✅ **Progressif:** Temps d'attente qui augmente (15s, 30s, 45s)
✅ **Robuste:** Continue même après échec total
✅ **Logs:** N8N enregistre chaque tentative

## 🧪 Test après Configuration

Après avoir configuré ces options:

1. **Sauvegardez** le workflow
2. **Activez** le workflow
3. **Attendez 20 secondes** (pour reset le rate limit)
4. **Exécutez:**
   ```bash
   node n8n-trigger-ui/test-n8n-replicate.js
   ```

## 📊 Vérifier les Retries dans N8N

1. Allez sur: https://n8n.srv766650.hstgr.cloud/executions
2. Cliquez sur l'exécution
3. Cliquez sur le nœud "Replicate API"
4. Vous verrez dans les logs:
   ```
   Attempt 1/3: Failed (429)
   Waiting 15000ms...
   Attempt 2/3: Success (200)
   ```

## 🔍 Exemple de Configuration JSON (à copier/coller)

Si vous éditez le workflow en JSON, ajoutez ceci dans le nœud HTTP Request:

```json
{
  "parameters": {
    "url": "https://api.replicate.com/v1/predictions",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Prefer",
          "value": "wait"
        }
      ]
    },
    "sendBody": true,
    "contentType": "json",
    "bodyParameters": {
      "parameters": []
    },
    "jsonBody": "={{ {\n  \"version\": \"5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637\",\n  \"input\": {\n    \"prompt\": $json.prompt,\n    \"num_inference_steps\": 4,\n    \"guidance_scale\": 0\n  }\n} }}",
    "options": {
      "redirect": {
        "redirect": {
          "followRedirects": true
        }
      },
      "response": {
        "response": {
          "neverError": true,
          "responseFormat": "json"
        }
      },
      "retry": {
        "retry": {
          "maxTries": 3,
          "waitBetweenTries": 15000,
          "waitProgressive": true
        }
      },
      "timeout": 60000
    }
  },
  "name": "Replicate API",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "alwaysOutputData": true,
  "continueOnFail": true
}
```

---

Cette configuration est **beaucoup plus simple** que d'ajouter des nœuds Wait et Loop. N8N gère tout automatiquement! 🎉

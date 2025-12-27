# 🔧 Correction du Rate Limit Replicate dans N8N

## ❌ Erreur Actuelle
```
Request was throttled. Your rate limit for creating predictions is reduced
to 6 requests per minute with a burst of 1 requests while you have less
than $5.0 in credit.
```

## ✅ Solution 1: Ajouter des Crédits (RECOMMANDÉ)

1. **Allez sur:** https://replicate.com/account/billing
2. **Ajoutez $5-$10** de crédits
3. **Avantages:**
   - Limite de taux normale (beaucoup plus élevée)
   - Pas d'attente entre les requêtes
   - Workflow plus rapide

**Coût estimé:**
- FLUX.1-schnell: ~$0.003 par image
- Avec $5, vous pouvez générer ~1,600 images

## ✅ Solution 2: Gérer l'Erreur dans N8N

### Étape 1: Ajouter un Nœud "Error Trigger"

1. Dans votre workflow, ajoutez un **nœud "Error Trigger"**
2. Connectez-le au nœud Replicate
3. Configuration:
   ```
   Trigger on: Error in previous node
   Continue on Fail: true
   ```

### Étape 2: Ajouter un Nœud "Switch" pour Détecter le Rate Limit

Après le nœud Replicate, ajoutez un **nœud "Switch"**:

**Condition 1: Succès**
```javascript
{{ $json.status === "succeeded" }}
```

**Condition 2: Rate Limit**
```javascript
{{ $json.error && $json.error.includes("throttled") }}
```

**Condition 3: Erreur Générique**
```javascript
true  // Par défaut
```

### Étape 3: Gérer le Rate Limit

Pour la **Route 2 (Rate Limit)**, ajoutez:

**Nœud Wait:**
```
Wait Time: 15 seconds
```

**Puis Nœud HTTP Request pour réessayer:**
```
Method: POST
URL: https://api.replicate.com/v1/predictions
Headers:
  Authorization: Bearer {{ $env.REPLICATE_API_KEY }}
  Content-Type: application/json
Body:
  {
    "version": "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
    "input": {
      "prompt": "{{ $json.prompt }}",
      "num_inference_steps": 4
    }
  }
```

### Étape 4: Retourner une Réponse d'Attente

Si le rate limit persiste, retournez une réponse temporaire:

**Nœud "Respond to Webhook":**
```json
[
  {
    "type": "image",
    "content": "Génération en cours... Rate limit atteint. Réessayez dans 15 secondes.",
    "image_url": null,
    "metadata": {
      "status": "throttled",
      "retryAfter": 15
    },
    "success": false
  }
]
```

## ✅ Solution 3: Configuration Simple (Pour Tester)

### Workflow N8N Minimal avec Gestion d'Erreur

1. **Nœud Webhook Trigger**
   - Webhook Path: `/webhook/ai-agent-fiable`

2. **Nœud "If" - Détecter \image**
   ```javascript
   {{ $json.message.startsWith("\\image") }}
   ```

3. **Nœud "Set" - Extraire le Prompt**
   ```javascript
   {
     "prompt": "{{ $json.message.replace('\\image ', '') }}"
   }
   ```

4. **Nœud "HTTP Request" - Replicate avec Error Handling**
   ```
   Method: POST
   URL: https://api.replicate.com/v1/predictions

   Headers:
     Authorization: Bearer {{ $env.REPLICATE_API_KEY }}
     Content-Type: application/json
     Prefer: wait

   Body:
     {
       "version": "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
       "input": {
         "prompt": "{{ $json.prompt }}",
         "num_inference_steps": 4,
         "guidance_scale": 0
       }
     }

   Options:
     ☑ Continue on Fail
     ☑ Always Output Data
     Timeout: 30000
   ```

5. **Nœud "If" - Vérifier le Succès**
   ```javascript
   {{ $json.status === "succeeded" && $json.output }}
   ```

6. **Route TRUE - Nœud "Set" - Format Succès**
   ```javascript
   {
     "type": "image",
     "content": "Image générée avec succès",
     "image_url": "{{ $json.output[0] }}",
     "metadata": {
       "predictionId": "{{ $json.id }}",
       "model": "{{ $json.model }}",
       "status": "{{ $json.status }}",
       "metrics": "{{ $json.metrics }}"
     },
     "success": true
   }
   ```

7. **Route FALSE - Nœud "Set" - Format Erreur**
   ```javascript
   {
     "type": "image",
     "content": "{{ $json.error || 'Erreur lors de la génération' }}",
     "image_url": null,
     "metadata": {
       "status": "{{ $json.status || 'failed' }}",
       "error": "{{ $json.error }}"
     },
     "success": false
   }
   ```

8. **Nœud "Merge" - Combiner les Deux Routes**

9. **Nœud "Respond to Webhook"**
   ```
   Response Mode: Using 'Respond to Webhook' Node
   Response Data: All Entries
   ```

## 🎯 Checklist

- [ ] Ajouter des crédits sur Replicate (recommandé)
- [ ] Ajouter "Continue on Fail" au nœud Replicate
- [ ] Ajouter une gestion d'erreur pour le rate limit
- [ ] Tester avec un délai de 15 secondes entre les tests
- [ ] Vérifier les logs dans N8N Executions

## 🧪 Test Simple

Attendez **20 secondes**, puis exécutez:

```bash
node n8n-trigger-ui/test-n8n-replicate.js
```

Si l'erreur persiste, ajoutez des crédits sur Replicate.

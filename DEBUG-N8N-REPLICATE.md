# 🔍 Guide de Débogage - Workflow N8N avec Replicate

## ❌ Problème Identifié
Le webhook retourne une **réponse vide** au lieu du JSON attendu.

## 🎯 Étapes de Débogage

### 1. Vérifier les Exécutions N8N

1. Allez sur: https://n8n.srv766650.hstgr.cloud/executions
2. Trouvez l'exécution la plus récente (celle du test)
3. Vérifiez le **statut** de l'exécution:
   - ✅ Success (vert) = Le workflow s'est terminé
   - ❌ Error (rouge) = Le workflow a échoué
   - ⏳ Running (bleu) = Le workflow est encore en cours

### 2. Analyser le Nœud Replicate

Cliquez sur l'exécution, puis sur le **nœud Replicate**:

**Vérifiez:**
- **Input Data**: Les données envoyées à Replicate
  ```json
  {
    "prompt": "un chat astronaute",
    "num_inference_steps": 4,
    ...
  }
  ```

- **Output Data**: La réponse de Replicate
  - Doit contenir: `status`, `output`, `id`
  - Si `status: "processing"` → Le workflow attend le résultat
  - Si `status: "succeeded"` → L'image est prête
  - Si `status: "failed"` → Erreur Replicate

**Erreurs possibles:**
- ❌ "Invalid API token" → Vérifier la clé API Replicate
- ❌ "Insufficient credits" → Ajouter des crédits
- ❌ "Model version not found" → Vérifier la version du modèle

### 3. Vérifier le Nœud Response/Webhook Response

Le dernier nœud (Response ou Webhook Response) doit retourner les données au format:

```json
[
  {
    "type": "image",
    "content": "Image générée avec succès",
    "image_url": "https://replicate.delivery/...",
    "metadata": {
      "predictionId": "abc123",
      "model": "flux-schnell",
      "status": "succeeded"
    },
    "success": true
  }
]
```

**Si le nœud Response est vide:**
- Le workflow n'a pas de données à retourner
- Un nœud précédent a échoué sans gérer l'erreur
- Le workflow s'est arrêté prématurément

### 4. Ajouter des Logs de Débogage

Ajoutez un **nœud Code** après chaque étape importante:

**Après le nœud Replicate:**
```javascript
// Log 1: Après Replicate
console.log("🎨 REPLICATE OUTPUT:", JSON.stringify($input.all(), null, 2));

// Vérifier le statut
const replicateData = $input.all()[0].json;
console.log("📊 Replicate Status:", replicateData.status);
console.log("🖼️  Image URL:", replicateData.output?.[0]);

return $input.all();
```

**Avant le nœud Response:**
```javascript
// Log 2: Avant Response
console.log("📤 SENDING RESPONSE:", JSON.stringify($input.all(), null, 2));

const responseData = $input.all()[0].json;
console.log("✅ Type:", responseData.type);
console.log("✅ Image URL:", responseData.image_url);

return $input.all();
```

### 5. Problèmes Courants et Solutions

#### Problème 1: Réponse Vide
**Cause:** Le workflow ne retourne rien au webhook

**Solution:**
1. Vérifiez que le dernier nœud est **"Respond to Webhook"** ou **"Webhook Response"**
2. Assurez-vous qu'il reçoit des données (input data non vide)
3. Vérifiez que le format de réponse est JSON

#### Problème 2: Timeout Replicate
**Cause:** Le modèle prend trop de temps (>30 secondes)

**Solution:**
1. Utilisez `"Prefer": "wait"` dans les headers Replicate
2. Ou ajoutez un système de polling avec un nœud Wait

#### Problème 3: Format de Réponse Incorrect
**Cause:** Le mapping des données est incorrect

**Solution:**
Ajoutez un nœud **Set** avant le Response pour normaliser:

```javascript
{
  "type": "image",
  "content": "{{ $json.output ? 'Image générée avec succès' : 'Erreur' }}",
  "image_url": "{{ $json.output[0] }}",
  "metadata": {
    "predictionId": "{{ $json.id }}",
    "model": "{{ $json.model }}",
    "status": "{{ $json.status }}"
  },
  "success": "{{ $json.status === 'succeeded' }}"
}
```

### 6. Checklist de Vérification

- [ ] Le webhook reçoit bien la requête (visible dans Executions)
- [ ] Le nœud de détection `\image` fonctionne
- [ ] Le nœud Replicate reçoit le bon prompt
- [ ] La clé API Replicate est valide
- [ ] Le nœud Replicate retourne un output
- [ ] Le mapping vers le format de réponse est correct
- [ ] Le nœud Response retourne le JSON au webhook

## 🔧 Actions Immédiates

1. **Ouvrez l'URL:** https://n8n.srv766650.hstgr.cloud/executions
2. **Trouvez la dernière exécution** (il y a ~1 minute)
3. **Cliquez dessus** pour voir les détails
4. **Partagez-moi:**
   - Le statut de l'exécution (Success/Error/Running)
   - Le contenu du nœud Replicate (Input et Output)
   - Le contenu du dernier nœud (Response)
   - Les erreurs affichées (si présentes)

## 📸 Captures d'Écran Utiles

Prenez des captures d'écran de:
1. Vue d'ensemble de l'exécution
2. Input/Output du nœud Replicate
3. Input/Output du nœud Response
4. Logs/erreurs affichés

Avec ces informations, je pourrai vous aider à corriger le workflow!

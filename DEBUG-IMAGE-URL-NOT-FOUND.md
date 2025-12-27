# 🔍 Débogage: "URL d'image non trouvée"

## ❌ Erreur Actuelle

```json
{
  "success": false,
  "type": "error",
  "content": {
    "message": "Erreur lors de la génération de l'image",
    "error": "URL d'image non trouvée"
  }
}
```

## 🎯 Étapes de Débogage

### 1. Ouvrir la Dernière Exécution N8N

1. Allez sur: https://n8n.srv766650.hstgr.cloud/executions
2. Cliquez sur l'exécution la plus récente (il y a ~1 minute)
3. Vous verrez tous les nœuds du workflow

### 2. Vérifier le Nœud "Replicate API" (HTTP Request)

Cliquez sur le nœud **"Replicate API"** ou **"HTTP Request"** qui appelle Replicate.

#### ✅ Si le nœud a réussi (vert)

**Vérifiez l'Output:**

Il devrait ressembler à ceci:
```json
{
  "id": "abc123-def456",
  "model": "black-forest-labs/flux-schnell",
  "version": "c846a699...",
  "input": {
    "prompt": "un chat astronaute"
  },
  "status": "succeeded",
  "output": [
    "https://replicate.delivery/pbxt/abc123/out-0.webp"
  ],
  "metrics": {
    "predict_time": 2.5
  }
}
```

**Points clés à vérifier:**
- `status`: Doit être `"succeeded"`
- `output`: Doit être un **tableau** avec au moins une URL
- `output[0]`: C'est l'URL de l'image

#### ❌ Si le nœud a échoué (rouge)

**Vérifiez l'erreur:**

Erreurs possibles:
- **401 Unauthorized** → Clé API Replicate invalide
- **429 Too Many Requests** → Rate limit (pas assez de crédits)
- **422 Validation Error** → Body JSON incorrect
- **Timeout** → Le modèle a pris trop de temps

### 3. Vérifier le Nœud qui Formate la Réponse

Après le nœud Replicate, vous avez probablement un nœud qui formate la réponse (nœud "Set", "Code", ou "Function").

**Ce nœud génère l'erreur "URL d'image non trouvée".**

#### Scénario A: Vous utilisez un nœud "Set"

Vérifiez la formule pour `image_url`:

**Incorrect:**
```
={{ $json.image_url }}  ❌ (n'existe pas dans la réponse Replicate)
```

**Correct:**
```
={{ $json.output[0] }}  ✅ (premier élément du tableau output)
```

#### Scénario B: Vous utilisez un nœud "Code"

Cherchez dans votre code quelque chose comme:

```javascript
// ❌ Code qui génère l'erreur
if (!data.image_url) {
  return {
    error: "URL d'image non trouvée"
  };
}
```

**Correction:**

```javascript
// ✅ Vérifier le bon champ
const imageUrl = data.output && data.output[0];

if (!imageUrl) {
  return {
    error: "URL d'image non trouvée dans output[0]",
    debug: JSON.stringify(data)
  };
}
```

### 4. Structure de Réponse de Replicate

**Ce que Replicate retourne:**
```json
{
  "status": "succeeded",
  "output": ["https://..."]    ← L'image est ICI
}
```

**Ce que votre code cherche probablement:**
```json
{
  "image_url": "https://..."    ← Ça n'existe PAS!
}
```

## 🔧 Solutions

### Solution 1: Ajouter un Nœud de Log

Avant le nœud qui génère l'erreur, ajoutez un **nœud Code** pour voir ce que vous recevez:

```javascript
console.log("🔍 DEBUG - Réponse Replicate complète:");
console.log(JSON.stringify($input.all(), null, 2));

const data = $input.all()[0].json;

console.log("🔍 DEBUG - Status:", data.status);
console.log("🔍 DEBUG - Output:", data.output);
console.log("🔍 DEBUG - Output[0]:", data.output?.[0]);

return $input.all();
```

### Solution 2: Corriger le Mapping

Dans le nœud qui formate la réponse finale, utilisez:

**Nœud Set:**
```json
{
  "type": "image",
  "success": true,
  "image_url": "={{ $json.output[0] }}",
  "content": "Image générée avec succès"
}
```

**Nœud Code:**
```javascript
const replicateData = $input.all()[0].json;

// Log pour débogage
console.log("🎨 Replicate Data:", JSON.stringify(replicateData, null, 2));

// Extraire l'URL correctement
const imageUrl = replicateData.output && replicateData.output[0];

if (replicateData.status === 'succeeded' && imageUrl) {
  return [{
    json: {
      type: "image",
      success: true,
      image_url: imageUrl,
      content: "Image générée avec succès",
      metadata: {
        predictionId: replicateData.id,
        status: replicateData.status
      }
    }
  }];
} else {
  return [{
    json: {
      type: "error",
      success: false,
      content: {
        message: "Erreur lors de la génération de l'image",
        error: replicateData.error || "Status: " + replicateData.status,
        debug: {
          status: replicateData.status,
          hasOutput: !!replicateData.output,
          outputLength: replicateData.output?.length
        }
      }
    }
  }];
}
```

### Solution 3: Vérifier le Header "Prefer: wait"

Si Replicate retourne `status: "processing"` au lieu de `"succeeded"`, cela signifie que le header `Prefer: wait` ne fonctionne pas.

**Vérifiez dans le nœud HTTP Request:**
- Headers → `Prefer: wait` doit être présent
- Options → Timeout doit être assez grand (60000ms)

## 📊 Checklist de Débogage

Dans N8N Executions, vérifiez:

- [ ] Le nœud Replicate a un statut vert (success)
- [ ] Le nœud Replicate a un Output avec des données
- [ ] `$json.status` = `"succeeded"`
- [ ] `$json.output` est un tableau non vide
- [ ] `$json.output[0]` contient une URL (commence par `https://`)
- [ ] Le nœud suivant reçoit bien ces données
- [ ] Le mapping utilise `$json.output[0]` et non `$json.image_url`

## 🎯 Action Immédiate

1. **Ouvrez:** https://n8n.srv766650.hstgr.cloud/executions
2. **Cliquez** sur la dernière exécution
3. **Regardez** le nœud Replicate → Output
4. **Copiez** ici la valeur de `status` et `output`

Avec ces informations, je pourrai vous dire exactement où est le problème!

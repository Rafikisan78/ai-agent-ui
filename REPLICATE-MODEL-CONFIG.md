# 🎨 Configuration des Modèles Replicate

## Votre Configuration Actuelle

```json
{
  "version": "da77662951d9f78d431074a6316212ce0495368aef25663e8130833596806793",
  "input": {
    "prompt": "Une image magnifique générée via n8n"
  }
}
```

## 🔍 Identifier Votre Modèle

La version `da776629...` correspond probablement à **Stable Diffusion XL** ou un autre modèle.

Pour vérifier, allez sur:
https://replicate.com/account/predictions

Et trouvez la prédiction récente pour voir le nom du modèle.

## 📋 Configurations Recommandées par Modèle

### Option 1: FLUX.1-schnell (Recommandé - Ultra Rapide)

**Version:** `5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637`

**Configuration N8N:**
```json
{
  "version": "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
  "input": {
    "prompt": "={{ $json.prompt }}",
    "num_inference_steps": 4,
    "guidance_scale": 0,
    "num_outputs": 1,
    "aspect_ratio": "1:1",
    "output_format": "webp",
    "output_quality": 80
  }
}
```

**Avantages:**
- ⚡ Ultra rapide (~2-3 secondes)
- 💰 Très économique (~$0.003/image)
- 🎨 Excellente qualité

### Option 2: Stable Diffusion XL 1.0

**Version:** `39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b`

**Configuration N8N:**
```json
{
  "version": "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  "input": {
    "prompt": "={{ $json.prompt }}",
    "negative_prompt": "ugly, blurry, low quality",
    "width": 1024,
    "height": 1024,
    "num_inference_steps": 25,
    "guidance_scale": 7.5,
    "num_outputs": 1,
    "scheduler": "DPMSolverMultistep"
  }
}
```

**Avantages:**
- 🎨 Très bonne qualité
- 💰 Économique (~$0.0015/image)
- ⚙️ Nombreux paramètres réglables

### Option 3: FLUX.1-dev (Haute Qualité)

**Version:** `2f1a9d0cbf87ea5e93f0db278d285ac497a2c5e19b33e24c6e6d4b4dc4d9e8e8`

**Configuration N8N:**
```json
{
  "version": "2f1a9d0cbf87ea5e93f0db278d285ac497a2c5e19b33e24c6e6d4b4dc4d9e8e8",
  "input": {
    "prompt": "={{ $json.prompt }}",
    "num_inference_steps": 28,
    "guidance_scale": 3.5,
    "num_outputs": 1,
    "aspect_ratio": "1:1",
    "output_format": "webp",
    "output_quality": 90
  }
}
```

**Avantages:**
- 🎨 Qualité exceptionnelle
- 🔧 Contrôle précis
- 💰 Plus cher (~$0.025/image)

## 🎯 Configuration Recommandée pour Votre Workflow

Je vous recommande **FLUX.1-schnell** car:
1. Ultra rapide (évite les timeouts)
2. Excellente qualité
3. Très économique
4. Parfait pour un webhook en temps réel

### Configuration Complète du Nœud HTTP Request

**URL:** `https://api.replicate.com/v1/predictions`

**Headers:**
```
Prefer: wait
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "version": "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
  "input": {
    "prompt": "={{ $json.prompt }}",
    "num_inference_steps": 4,
    "guidance_scale": 0,
    "num_outputs": 1
  }
}
```

**Options:**
- ☑ Retry On Fail: 3 tentatives, 15000ms, progressif
- ☑ Response → Never Error: ON
- ☑ Timeout: 60000ms
- ☑ Continue On Fail: ON
- ☑ Always Output Data: ON

## 🧪 Tester la Configuration

### Test 1: Vérifier la Version du Modèle

```bash
curl -X POST https://api.replicate.com/v1/predictions \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -H "Content-Type: application/json" \
  -H "Prefer: wait" \
  -d '{
    "version": "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
    "input": {
      "prompt": "un chat astronaute",
      "num_inference_steps": 4,
      "guidance_scale": 0
    }
  }'
```

### Test 2: Via N8N

1. Sauvegardez le workflow avec la nouvelle configuration
2. Activez le workflow
3. Attendez 20 secondes (reset rate limit)
4. Exécutez:
   ```bash
   node n8n-trigger-ui/test-n8n-replicate.js
   ```

## 📊 Comparaison des Modèles

| Modèle | Vitesse | Qualité | Prix | Recommandation |
|--------|---------|---------|------|----------------|
| FLUX.1-schnell | ⚡⚡⚡ Ultra rapide (2-3s) | 🎨🎨🎨 Excellente | 💰 $0.003 | ⭐ Recommandé |
| Stable Diffusion XL | ⚡⚡ Rapide (5-8s) | 🎨🎨 Très bonne | 💰 $0.0015 | ✅ Bon choix |
| FLUX.1-dev | ⚡ Moyen (10-15s) | 🎨🎨🎨🎨 Exceptionnelle | 💰💰 $0.025 | 🎯 Si qualité max |

## 🔧 Debugging: Trouver la Version Actuelle

Si vous voulez savoir quel modèle correspond à votre version `da776629...`:

```bash
curl https://api.replicate.com/v1/models \
  -H "Authorization: Bearer VOTRE_CLE_API"
```

Ou cherchez directement sur:
https://replicate.com/collections/text-to-image

Et comparez les versions.

## ✅ Action Immédiate

Remplacez votre configuration actuelle par FLUX.1-schnell:

**Dans le nœud HTTP Request → Body:**
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

Sauvegardez, testez, et dites-moi le résultat!

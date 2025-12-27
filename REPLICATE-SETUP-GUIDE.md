# Guide de Configuration - Replicate Video (Option B)

## 📋 Prérequis

1. **Compte Replicate** : https://replicate.com
2. **Clé API Replicate** : Obtenir sur https://replicate.com/account/api-tokens
3. **Crédits Replicate** : ~$0.01-0.03 par vidéo (très abordable)

---

## 🚀 Installation du Workflow V4 (DALL-E + Replicate)

### Étape 1 : Importer le Workflow

1. Ouvrez votre instance N8N
2. Cliquez sur **☰** (menu) → **Import from File**
3. Sélectionnez le fichier **`n8n-multimodal-workflow-v4-dalle-replicate.json`**
4. Le workflow sera importé avec tous les nœuds

---

### Étape 2 : Configurer les Credentials Replicate

#### A. Créer le Credential dans N8N

1. Dans N8N, allez dans **Settings** (⚙️) → **Credentials**
2. Cliquez sur **"Add Credential"**
3. Cherchez et sélectionnez **"Header Auth"**
4. Configurez comme suit :
   - **Name**: `Replicate API`
   - **Header Name**: `Authorization`
   - **Header Value**: `Token VOTRE_CLE_API_REPLICATE`
     - ⚠️ Remplacez `VOTRE_CLE_API_REPLICATE` par votre vraie clé
     - ⚠️ Gardez le mot `Token` avant la clé (ex: `Token VOTRE_TOKEN_REPLICATE_ICI...`)
5. Cliquez **"Save"**

#### B. Assigner le Credential aux Nœuds

1. **Nœud "Replicate Video Start"** :
   - Cliquez sur le nœud
   - Dans "Credential to connect with"
   - Sélectionnez votre credential "Replicate API"
   - Cliquez "Save"

2. **Nœud "Replicate Video Status"** :
   - Faites de même
   - Sélectionnez "Replicate API"
   - Cliquez "Save"

---

### Étape 3 : Configurer OpenAI (si pas déjà fait)

1. Cliquez sur le nœud **"DALL-E Request"**
2. Ajoutez vos credentials OpenAI (comme dans la V3)
3. Cliquez "Save"

---

### Étape 4 : Configurer Anthropic (si pas déjà fait)

1. Cliquez sur le nœud **"Claude Model"**
2. Ajoutez vos credentials Anthropic
3. Cliquez "Save"

---

### Étape 5 : Activer le Workflow

1. Cliquez sur le bouton **"Active"** en haut à droite
2. Le workflow devient actif avec l'URL : `https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable`

---

## 🎬 Architecture du Workflow V4

### Flux de Traitement

```
Webhook (entrée)
    ↓
Validate & Normalize Input (validation)
    ↓
Is Valid? (vérification)
    ↓
Detect Input Type (détection commande)
    ↓
Router (routage selon type)
    ├─→ [TEXT] → AI Agent (Claude) → Format Response
    ├─→ [IMAGE] → DALL-E Request → Format DALL-E Response → Format Response
    ├─→ [VIDEO] → Replicate Video Start → Wait 8s → Replicate Video Status → Format Video Response → Format Response
    └─→ [FILE] → File Analysis (placeholder) → Format Response
    ↓
Send Response (webhook sortie)
```

### Nouveaux Nœuds Vidéo

#### 1. **Replicate Video Start** (HTTP Request)
- **Rôle** : Démarre la génération vidéo
- **API** : `POST https://api.replicate.com/v1/predictions`
- **Model** : Stable Video Diffusion
- **Body** :
  ```json
  {
    "version": "3f0457e4619daac51203dedb472816fd4af51f3149867e8e4e01e55e74f3b04e",
    "input": {
      "prompt": "{{ $json.prompt }}",
      "num_frames": 25,
      "fps": 7
    }
  }
  ```
- **Sortie** : Un objet avec `id`, `urls.get`, `status`

#### 2. **Wait 8 Seconds** (Wait)
- **Rôle** : Attendre que Replicate génère la vidéo
- **Durée** : 8 secondes (les vidéos prennent 8-15 secondes)

#### 3. **Replicate Video Status** (HTTP Request)
- **Rôle** : Vérifier si la vidéo est prête
- **API** : `GET {{ $json.urls.get }}`
- **Sortie** :
  - `status: "succeeded"` → Vidéo prête
  - `status: "processing"` → Encore en cours
  - `output: "https://..."` → URL de la vidéo

#### 4. **Format Video Response** (Code)
- **Rôle** : Formater la réponse au format multimodal
- **Logique** :
  ```javascript
  if (status === 'succeeded' && videoUrl) {
    return {
      success: true,
      type: 'video',
      content: { url: videoUrl, description: prompt }
    }
  } else {
    return {
      success: false,
      type: 'info',
      content: { message: 'Vidéo en cours de génération...' }
    }
  }
  ```

---

## 🧪 Tester la Génération Vidéo

### Test 1 : Via l'Interface Web

1. Ouvrez http://localhost:3003/
2. Dans le champ de message, tapez :
   ```
   /video un chat qui court dans un jardin ensoleillé
   ```
3. Cliquez "Envoyer"
4. **Attendez 10-15 secondes** (la vidéo se génère)
5. La vidéo s'affichera automatiquement dans un lecteur vidéo

### Test 2 : Via Node.js

Modifiez `test-webhook.js` :

```javascript
const payload = {
    message: "/video une voiture rouge qui roule sur une route",
    timestamp: new Date().toISOString()
};
```

Exécutez :
```bash
cd n8n-trigger-ui
node test-webhook.js
```

### Format de Réponse Attendu

```json
{
  "success": true,
  "type": "video",
  "content": {
    "url": "https://replicate.delivery/pbxt/...",
    "description": "une voiture rouge qui roule sur une route",
    "duration": 3.5
  },
  "metadata": {
    "inputType": "video-generation",
    "command": "video",
    "originalMessage": "/video une voiture rouge...",
    "model": "stable-video-diffusion",
    "provider": "replicate"
  },
  "timestamp": "2025-12-22T22:30:00.000Z"
}
```

---

## 🎯 Commandes Disponibles

| Commande | Description | Exemple |
|----------|-------------|---------|
| **Texte normal** | Conversation AI Agent (Claude) | `Explique-moi la photosynthèse` |
| **`/image [description]`** | Génération d'image DALL-E | `/image un dragon bleu volant` |
| **`/video [description]`** | Génération vidéo Replicate | `/video un chat qui joue` |
| **Upload fichier** | Analyse de fichier (à configurer) | *(cliquer sur upload)* |

---

## ⚙️ Configuration Avancée

### Ajuster la Durée de la Vidéo

Dans le nœud **"Replicate Video Start"**, modifiez le JSON Body :

```json
{
  "input": {
    "prompt": "{{ $json.prompt }}",
    "num_frames": 40,    // Plus de frames = vidéo plus longue
    "fps": 7
  }
}
```

- **25 frames** à 7 fps = ~3.5 secondes (défaut)
- **40 frames** à 7 fps = ~5.7 secondes
- **14 frames** à 7 fps = ~2 secondes

### Ajuster le Temps d'Attente

Si vos vidéos prennent plus de 8 secondes :

1. Cliquez sur le nœud **"Wait 8 Seconds"**
2. Changez `Amount: 8` à `Amount: 12` ou `15`
3. Cliquez "Save"

### Retry Logic (Optionnel)

Pour réessayer si la vidéo n'est pas prête après 8 secondes, vous pouvez ajouter :

1. Un nœud **"If"** après "Replicate Video Status"
2. Condition : `{{ $json.status }} === 'processing'`
3. Si `true` → Reconnecter à "Wait 8 Seconds" (boucle)
4. Si `false` → Continuer à "Format Video Response"

---

## 💰 Coûts Replicate

| Modèle | Coût par vidéo | Durée | Qualité |
|--------|---------------|-------|---------|
| Stable Video Diffusion | ~$0.01-0.02 | ~3-5 sec | Bonne |
| AnimateDiff | ~$0.02-0.03 | ~2-4 sec | Très bonne |
| Zeroscope | ~$0.01 | ~3 sec | Moyenne |

**Estimation** : 100 vidéos ≈ $1-2 USD

---

## 🔧 Dépannage

### Erreur : "Invalid token"
→ Vérifiez que votre clé API commence par `Token ` (avec espace)
→ Format correct : `Token VOTRE_TOKEN_REPLICATE_ICI...`

### Erreur : "Model not found"
→ La version du modèle a peut-être changé
→ Vérifiez sur https://replicate.com/stability-ai/stable-video-diffusion

### Vidéo pas prête après 8 secondes
→ Augmentez le temps d'attente à 12-15 secondes
→ Ou ajoutez une boucle de retry

### Vidéo générée mais pas affichée
→ Vérifiez que le type est bien `"video"` dans la réponse
→ Vérifiez que `content.url` contient une URL valide
→ Vérifiez les logs du nœud "Format Video Response"

### Pas de vidéo du tout
→ Vérifiez que le workflow est activé
→ Vérifiez que vos credentials Replicate sont corrects
→ Vérifiez que vous avez des crédits Replicate

---

## 📝 Notes Importantes

1. **URLs temporaires** : Les URLs de vidéo Replicate expirent après quelques heures
2. **Durée limitée** : Maximum ~5-7 secondes par vidéo avec ce modèle
3. **Qualité** : Bonne qualité pour prototypage, moins pro que Runway
4. **Délai** : Comptez 10-20 secondes de génération
5. **Stockage** : Pour conserver les vidéos, ajoutez un nœud de téléchargement vers S3/Cloudinary

---

## ✅ Checklist de Configuration

- [ ] Compte Replicate créé
- [ ] Clé API Replicate obtenue
- [ ] Workflow V4 importé dans N8N
- [ ] Credential "Replicate API" créé (Header Auth)
- [ ] Credential assigné aux nœuds Replicate
- [ ] Credentials OpenAI configurés (DALL-E)
- [ ] Credentials Anthropic configurés (Claude)
- [ ] Workflow activé
- [ ] Test `/video` réussi
- [ ] Vidéo affichée dans l'interface web

---

Vous êtes maintenant prêt à générer des vidéos ! 🎬

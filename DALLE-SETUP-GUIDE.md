# Guide de Configuration DALL-E dans N8N

## 📋 Prérequis

1. Compte OpenAI avec accès à l'API DALL-E 3
2. Clé API OpenAI (obtenir sur https://platform.openai.com/api-keys)
3. Crédits OpenAI sur votre compte (DALL-E 3 coûte ~$0.04-$0.12 par image)

## 🚀 Installation du Nouveau Workflow

### Étape 1 : Importer le Workflow

1. Ouvrez votre instance N8N
2. Cliquez sur **☰** (menu) → **Import from File**
3. Sélectionnez le fichier `n8n-multimodal-workflow-v3-with-dalle.json`
4. Le workflow sera importé avec tous les nœuds

### Étape 2 : Configurer les Credentials OpenAI

1. Cliquez sur le nœud **"DALL-E Request"** (nœud HTTP Request)
2. Dans la section **"Credential to connect with"**:
   - Cliquez sur **"Create New Credential"**
   - Sélectionnez **"OpenAI API"**
   - Entrez votre clé API OpenAI
   - Donnez-lui un nom (ex: "OpenAI API")
   - Cliquez **"Save"**

### Étape 3 : Configurer les Credentials Anthropic (si pas déjà fait)

1. Cliquez sur le nœud **"Claude Model"**
2. Ajoutez vos credentials Anthropic comme précédemment

### Étape 4 : Activer le Workflow

1. Cliquez sur le bouton **"Active"** en haut à droite
2. Le workflow devient actif

## 🎨 Architecture du Workflow Amélioré

### Changements Principaux

**Ancien workflow (v2) :**
```
Router → Image Generation (Placeholder Code) → Format Response
```

**Nouveau workflow (v3) :**
```
Router → DALL-E Request (HTTP) → Format DALL-E Response → Format Response
```

### Nouveaux Nœuds

1. **DALL-E Request** (HTTP Request)
   - URL: `https://api.openai.com/v1/images/generations`
   - Méthode: POST
   - Body:
     ```json
     {
       "model": "dall-e-3",
       "prompt": "={{ $json.prompt }}",
       "n": 1,
       "size": "1024x1024",
       "quality": "standard"
     }
     ```

2. **Format DALL-E Response** (Code)
   - Extrait l'URL de l'image depuis la réponse OpenAI
   - Formate au format multimodal standard
   - Gère les erreurs de génération

## 🧪 Tester la Génération d'Images

### Test via l'Interface Web

1. Ouvrez http://localhost:3003/
2. Dans le champ de message, tapez:
   ```
   /image un personnage de manga tel que Naruto entrain de manger des ramens
   ```
3. Cliquez "Envoyer"

### Test via Node.js

Modifiez `test-webhook.js` :

```javascript
const payload = {
    message: "/image un chat astronaute dans l'espace",
    timestamp: new Date().toISOString()
};
```

Puis exécutez :
```bash
cd n8n-trigger-ui
node test-webhook.js
```

### Format de Réponse Attendu

```json
{
  "success": true,
  "type": "image",
  "content": {
    "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
    "description": "A manga character like Naruto eating ramen...",
    "originalPrompt": "un personnage de manga tel que Naruto..."
  },
  "metadata": {
    "inputType": "image-generation",
    "command": "image",
    "originalMessage": "/image un personnage...",
    "model": "dall-e-3"
  },
  "timestamp": "2025-12-22T22:15:00.000Z"
}
```

## 💡 Options de Configuration DALL-E

Vous pouvez modifier le nœud **DALL-E Request** pour ajuster :

### Qualité d'Image

Dans le body parameters, modifiez `quality` :
- `"standard"` (par défaut) - Moins cher, plus rapide
- `"hd"` - Meilleure qualité, plus cher (~$0.08-$0.12 par image)

### Taille d'Image

Modifiez `size` :
- `"1024x1024"` (carré, par défaut)
- `"1792x1024"` (paysage)
- `"1024x1792"` (portrait)

### Style (DALL-E 3 uniquement)

Ajoutez un nouveau paramètre dans le body :
```json
{
  "name": "style",
  "value": "vivid"  // ou "natural"
}
```

## 🔧 Dépannage

### Erreur : "Insufficient credits"
→ Ajoutez des crédits sur votre compte OpenAI

### Erreur : "Invalid API key"
→ Vérifiez que votre clé API est correcte dans les credentials

### Erreur : "Content policy violation"
→ DALL-E a refusé votre prompt (contenu inapproprié)
→ Reformulez votre demande

### Pas d'image générée
→ Vérifiez les logs du nœud "DALL-E Request"
→ Vérifiez que le workflow est activé

### Image générée mais pas affichée
→ Vérifiez que le nœud "Format DALL-E Response" extrait correctement l'URL
→ Vérifiez les logs du nœud "Format Response"

## 💰 Coûts

DALL-E 3 (recommandé) :
- Standard 1024x1024: ~$0.04 par image
- Standard 1024x1792 ou 1792x1024: ~$0.08 par image
- HD 1024x1024: ~$0.08 par image
- HD 1024x1792 ou 1792x1024: ~$0.12 par image

DALL-E 2 (alternative moins chère) :
- 1024x1024: ~$0.02 par image
- 512x512: ~$0.018 par image
- 256x256: ~$0.016 par image

Pour utiliser DALL-E 2, changez `"model": "dall-e-2"` dans le nœud DALL-E Request.

## 🎯 Commandes Disponibles Maintenant

- **Texte normal** → AI Agent (Claude)
- **`/image [description]`** → DALL-E 3 ✅ (ACTIVÉ)
- **`/search [requête]`** → Placeholder (à configurer)
- **Upload fichier** → Placeholder (à configurer)

## 🔄 Prochaines Étapes

Pour activer les autres fonctionnalités :

1. **Web Search** : Ajoutez Serper API ou Google Custom Search
2. **File Analysis** : Ajoutez GPT-4 Vision ou Claude Vision
3. **Conversation History** : Configurez Supabase dans l'interface web

## 📝 Notes Importantes

- Les URLs d'images DALL-E expirent après 1 heure
- Si vous voulez conserver les images, ajoutez un nœud pour les télécharger et les stocker (AWS S3, Cloudinary, etc.)
- DALL-E 3 génère des prompts améliorés automatiquement (`revised_prompt`)
- Le workflow gère automatiquement les erreurs et les formate correctement

# Guide de Configuration du Workflow N8N Multimodal

## 📦 Import du Workflow

1. Ouvrez votre instance N8N
2. Cliquez sur le menu hamburger (☰) → **Import from File**
3. Sélectionnez le fichier `n8n-multimodal-workflow.json`
4. Le workflow sera importé avec tous les nœuds configurés

## ⚙️ Configuration Requise

### 1. Nœud Webhook
- ✅ Déjà configuré
- Path : `ai-agent-fiable`
- Method : POST
- Response Mode : **Using 'Respond to Webhook' Node**

### 2. Nœud Anthropic Chat Model
**Action requise** : Ajoutez vos credentials Anthropic
1. Cliquez sur le nœud "Anthropic Chat Model"
2. Dans "Credential to connect with", créez une nouvelle credential
3. Ajoutez votre clé API Anthropic (Claude)

### 3. Activation des Fonctionnalités Optionnelles

#### 🎨 Génération d'Images (remplacer le placeholder)

Remplacez le nœud **"Image Generation (Placeholder)"** par :

**Option A : DALL-E (OpenAI)**
```
Nœud : HTTP Request
Method : POST
URL : https://api.openai.com/v1/images/generations
Headers :
  - Authorization: Bearer YOUR_OPENAI_KEY
  - Content-Type: application/json
Body (JSON) :
{
  "model": "dall-e-3",
  "prompt": "={{ $json.prompt }}",
  "n": 1,
  "size": "1024x1024"
}

Puis ajoutez un nœud Code pour formater :
{
  json: {
    imageUrl: $json.data[0].url,
    description: $json.data[0].revised_prompt,
    inputType: 'image-generation'
  }
}
```

**Option B : Stable Diffusion**
```
Utilisez l'API Stability AI ou Replicate
```

#### 📁 Analyse de Fichiers (remplacer le placeholder)

Remplacez **"File Analysis (Placeholder)"** par :

**GPT-4 Vision ou Claude Vision**
```
Nœud : HTTP Request (OpenAI Vision)
Method : POST
URL : https://api.openai.com/v1/chat/completions
Body :
{
  "model": "gpt-4-vision-preview",
  "messages": [{
    "role": "user",
    "content": [
      {
        "type": "text",
        "text": "Analyse cette image et décris ce que tu vois en détail."
      },
      {
        "type": "image_url",
        "image_url": {
          "url": "={{ $json.file }}"
        }
      }
    ]
  }]
}
```

#### 🔍 Recherche Web (remplacer le placeholder)

Remplacez **"Web Search (Placeholder)"** par :

**Option A : Serper API**
```
Nœud : HTTP Request
Method : POST
URL : https://google.serper.dev/search
Headers :
  - X-API-KEY: YOUR_SERPER_KEY
  - Content-Type: application/json
Body :
{
  "q": "={{ $json.prompt }}"
}

Format response :
{
  json: {
    content: $json.organic.map(r => `${r.title}: ${r.snippet}`).join('\\n'),
    inputType: 'web-search'
  }
}
```

**Option B : Google Custom Search**
```
URL : https://www.googleapis.com/customsearch/v1
Params :
  - key: YOUR_GOOGLE_API_KEY
  - cx: YOUR_SEARCH_ENGINE_ID
  - q: {{ $json.prompt }}
```

## 🗄️ Configuration Supabase (Optionnelle)

Pour sauvegarder l'historique, ajoutez avant "Success Response" :

```
Nœud : Supabase
Operation : Insert
Table : conversations
Columns :
  - user_message : {{ $('Detect Input Type').item.json.originalMessage }}
  - assistant_response : {{ $json }}
  - response_type : {{ $json.type }}
  - metadata : {{ $json.metadata }}
```

## 🚀 Activation du Workflow

1. Connectez toutes les credentials nécessaires
2. Cliquez sur le bouton **"Active"** en haut à droite
3. Le workflow devient actif et le webhook est enregistré

## 🧪 Test du Workflow

### Test avec l'interface web
Accédez à http://localhost:3003/ et testez :

1. **Message texte simple** : "Bonjour, comment vas-tu ?"
2. **Commande image** : "/image un chat mignon dans l'espace"
3. **Commande recherche** : "/search actualités IA 2024"
4. **Upload fichier** : Utilisez le bouton d'upload

### Test avec le script Node.js
```bash
node test-webhook.js
```

## 📊 Types de Réponses Supportés

Le workflow renvoie toujours ce format :

```json
{
  "success": true/false,
  "type": "text" | "image" | "video" | "audio" | "info" | "error",
  "content": "string ou object selon le type",
  "metadata": {
    "inputType": "...",
    "originalMessage": "...",
    "model": "..."
  },
  "timestamp": "ISO 8601"
}
```

## 🎯 Commandes Disponibles

- **Texte normal** : Question/conversation standard → AI Agent
- **/image [prompt]** : Génération d'image
- **/search [query]** : Recherche web
- **/video [prompt]** : Génération vidéo (à configurer)
- **Upload fichier** : Analyse automatique

## 🔧 Dépannage

### Erreur : "Webhook not registered"
→ Assurez-vous que le workflow est **activé** (bouton Active)

### Erreur : "MISSING_MESSAGE"
→ Vérifiez que le payload contient `body.message`

### Erreur : "Unused Respond to Webhook node"
→ Dans le Webhook node, changez "Respond" à "Using 'Respond to Webhook' Node"

### Pas de réponse
→ Vérifiez que le nœud "Anthropic Chat Model" a des credentials valides

## 📝 Notes

- Les placeholders (Image, File, Search) renvoient des messages informatifs
- Configurez-les selon vos besoins et budgets API
- Le workflow est optimisé pour fiabilité et gestion d'erreurs
- Tous les types d'erreurs sont capturés et formatés correctement

## 🔄 Mises à Jour Futures

Pour ajouter de nouveaux types :
1. Ajoutez une route dans le Switch node
2. Créez le nœud de traitement
3. Connectez au Merge
4. Le formatage multimodal est automatique

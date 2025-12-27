# 🏗️ Architecture de l'Application Multimodale N8N

## 📊 Vue d'Ensemble

L'application est composée de **3 couches principales** :

1. **Frontend** : Interface web React
2. **Workflow Engine** : N8N pour l'orchestration
3. **Services externes** : APIs IA + Base de données

---

## 🎨 Schéma d'Architecture Complet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UTILISATEUR (Navigateur)                          │
│                            http://localhost:3003                            │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND - React Application                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  App.jsx (Composant Principal)                                      │   │
│  │  - Gestion état global (response, error, isLoading, history)        │   │
│  │  - Orchestration des composants                                     │   │
│  │  - Connexion Services (N8N + Supabase)                              │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│  ┌───────────────────────────┴─────────────────────────────────────────┐   │
│  │  COMPOSANTS UI                                                       │   │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌────────────────────┐  │   │
│  │  │ PromptInput    │  │ MultimodalDisplay│  │ VoiceInput         │  │   │
│  │  │ - Champ texte  │  │ - Affichage      │  │ - Microphone       │  │   │
│  │  │ - Bouton envoi │  │   réponses       │  │ - Speech           │  │   │
│  │  │ - Voix         │  │ - Image/Video/   │  │   Recognition      │  │   │
│  │  │ - Upload       │  │   Audio/Texte    │  │ - Transcription    │  │   │
│  │  └────────────────┘  └──────────────────┘  └────────────────────┘  │   │
│  │  ┌────────────────┐  ┌──────────────────┐                          │   │
│  │  │ FileUpload     │  │ History Sidebar  │                          │   │
│  │  │ - Drag & Drop  │  │ - Conversations  │                          │   │
│  │  │ - Preview      │  │ - Supabase data  │                          │   │
│  │  └────────────────┘  └──────────────────┘                          │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                │                                            │
│  ┌─────────────────────────────┴───────────────────────────────────────┐   │
│  │  SERVICES LAYER                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ n8n.js      │  │ supabase.js │  │ speech.js   │                 │   │
│  │  │ - API calls │  │ - DB calls  │  │ - TTS/STT   │                 │   │
│  │  │ - Payload   │  │ - History   │  │ - Web API   │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────┬─────────────────────────────────────┬───────────────────────┘
                │                                     │
                │ HTTP POST                           │ REST API
                │ (message)                           │ (conversations)
                ▼                                     ▼
┌───────────────────────────────────────┐  ┌──────────────────────────────┐
│     N8N WORKFLOW ENGINE               │  │   SUPABASE                   │
│  (n8n.srv766650.hstgr.cloud)          │  │  (nivbykzatzugwslnodqi...)   │
│                                       │  │                              │
│  Webhook: /ai-agent-fiable            │  │  Table: conversations        │
│     ↓                                 │  │  ┌────────────────────────┐  │
│  Validate Input                       │  │  │ id (uuid)              │  │
│     ↓                                 │  │  │ user_message (text)    │  │
│  Detect Type                          │  │  │ assistant_response     │  │
│     ↓                                 │  │  │   (jsonb)              │  │
│  Router ─────┬─────┬─────┬────        │  │  │ response_type (text)   │  │
│     TEXT     IMAGE VIDEO FILE         │  │  │ metadata (jsonb)       │  │
│       ↓       ↓      ↓     ↓          │  │  │ created_at (timestamp) │  │
│    Claude  DALL-E Replicate Vision    │  │  └────────────────────────┘  │
│       ↓       ↓      ↓     ↓          │  │                              │
│  Format Response                      │  │  Auth: Anon Key              │
│       ↓                               │  │  Access: Public Read/Write   │
│  Send Response                        │  └──────────────────────────────┘
└───────┬───────────────────────────────┘
        │
        │ JSON Response
        ▼
┌───────────────────────────────────────────────────────────────────────┐
│                     SERVICES EXTERNES (APIs IA)                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  Anthropic       │  │  OpenAI          │  │  Replicate       │   │
│  │  Claude Sonnet   │  │  DALL-E 3        │  │  Stable Video    │   │
│  │  4.5             │  │                  │  │  Diffusion       │   │
│  │                  │  │  API Key         │  │                  │   │
│  │  API Key         │  │  - Image Gen     │  │  API Token       │   │
│  │  - Text Gen      │  │  - 1024x1024     │  │  - Video Gen     │   │
│  │  - Conversation  │  │  - $0.04/img     │  │  - ~3.5 sec      │   │
│  │  - AI Agent      │  │                  │  │  - $0.01-0.02    │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données Détaillé

### 1️⃣ Message Texte Normal

```
User tape: "Quelle est la capitale de la France ?"
    ↓
PromptInput.jsx → handleSubmit()
    ↓
App.jsx → triggerWorkflow(message)
    ↓
n8n.js → fetch(N8N_WEBHOOK_URL, {message: "Quelle est..."})
    ↓
N8N Webhook reçoit → Validate → Detect Type → Router
    ↓ (type: "text")
AI Agent (Claude) → "La capitale de la France est Paris."
    ↓
Format Response → {success: true, type: "text", content: "Paris..."}
    ↓
Send Response → Retour au frontend
    ↓
App.jsx → setResponse(responseData)
    ↓
MultimodalDisplay.jsx → Affiche le texte
    ↓
supabase.js → saveConversation() (historique)
```

---

### 2️⃣ Génération d'Image

```
User tape: "/image un chat dans l'espace"
    ↓
PromptInput.jsx → handleSubmit()
    ↓
App.jsx → triggerWorkflow("/image un chat dans l'espace")
    ↓
N8N Webhook → Validate → Detect Type
    ↓
Detect Type extrait: {inputType: "image-generation", prompt: "un chat dans l'espace"}
    ↓
Router → Sortie "image"
    ↓
DALL-E Request → POST api.openai.com/v1/images/generations
    ↓ (10-20 secondes)
OpenAI génère l'image → URL: "https://oaidalleapi..."
    ↓
Format DALL-E Response → {type: "image", content: {url: "...", description: "..."}}
    ↓
Format Response → JSON standardisé
    ↓
Send Response → Retour au frontend
    ↓
App.jsx → setResponse({type: "image", content: {url: "..."}})
    ↓
MultimodalDisplay.jsx détecte type "image"
    ↓
Affiche <img src={content.url} />
    ↓
supabase.js → saveConversation() avec responseType="image"
```

---

### 3️⃣ Génération de Vidéo

```
User tape: "/video un chat qui court"
    ↓
PromptInput.jsx → handleSubmit()
    ↓
App.jsx → triggerWorkflow("/video un chat qui court")
    ↓
N8N Webhook → Validate → Detect Type
    ↓
Detect Type extrait: {inputType: "video-generation", prompt: "un chat qui court"}
    ↓
Router → Sortie "video"
    ↓
Replicate Video Start → POST api.replicate.com/v1/predictions
    ↓
Replicate retourne: {id: "abc123", urls: {get: "..."}, status: "starting"}
    ↓
Wait 8 Seconds → Pause de 8 secondes
    ↓
Replicate Video Status → GET api.replicate.com/v1/predictions/abc123
    ↓ (vidéo générée)
Replicate retourne: {status: "succeeded", output: "https://replicate.delivery/..."}
    ↓
Format Video Response → {type: "video", content: {url: "...", description: "..."}}
    ↓
Format Response → JSON standardisé
    ↓
Send Response → Retour au frontend
    ↓
App.jsx → setResponse({type: "video", content: {url: "..."}})
    ↓
MultimodalDisplay.jsx détecte type "video"
    ↓
Affiche <video controls><source src={content.url} /></video>
    ↓
supabase.js → saveConversation() avec responseType="video"
```

---

### 4️⃣ Entrée Vocale

```
User clique sur microphone 🎤
    ↓
VoiceInput.jsx → createSpeechRecognition()
    ↓
Web Speech API → Écoute microphone
    ↓ (utilisateur parle)
Speech Recognition → Transcription: "Génère une image de chat"
    ↓
VoiceInput.jsx → onTranscript("Génère une image de chat")
    ↓
PromptInput.jsx → setMessage("Génère une image de chat")
    ↓
User clique "Envoyer" → handleSubmit()
    ↓
[Suite identique au flux normal]
```

---

### 5️⃣ Historique des Conversations

```
App.jsx (au démarrage) → useEffect()
    ↓
loadHistory() → getConversationHistory(20)
    ↓
supabase.js → SELECT * FROM conversations ORDER BY created_at DESC LIMIT 20
    ↓
Supabase retourne: [{id: 1, user_message: "...", assistant_response: {...}}, ...]
    ↓
App.jsx → setHistory(data)
    ↓
Affichage dans History Sidebar
    ↓
User clique sur une conversation
    ↓
onClick={() => setResponse(item.assistant_response)}
    ↓
MultimodalDisplay.jsx → Affiche la conversation passée
```

---

## 📁 Structure des Fichiers

```
n8n-trigger-ui/
│
├── public/                          # Fichiers statiques
│
├── src/
│   ├── components/                  # Composants React
│   │   ├── PromptInput.jsx         # Zone de saisie + boutons
│   │   ├── MultimodalDisplay.jsx   # Affichage des réponses
│   │   ├── VoiceInput.jsx          # Bouton microphone
│   │   ├── FileUpload.jsx          # Upload de fichiers
│   │   └── ...
│   │
│   ├── services/                    # Couche de services
│   │   ├── n8n.js                  # Communication avec N8N
│   │   ├── supabase.js             # Base de données
│   │   └── speech.js               # Synthèse vocale
│   │
│   ├── App.jsx                      # Composant racine
│   ├── main.jsx                     # Point d'entrée
│   └── index.css                    # Styles globaux (Tailwind)
│
├── .env                             # Variables d'environnement
│   ├── VITE_SUPABASE_URL
│   ├── VITE_SUPABASE_ANON_KEY
│   └── VITE_N8N_WEBHOOK_URL
│
├── n8n-multimodal-workflow-v4-dalle-replicate.json  # Workflow N8N
├── ARCHITECTURE.md                  # Ce document
├── DALLE-SETUP-GUIDE.md            # Guide DALL-E
├── REPLICATE-SETUP-GUIDE.md        # Guide Replicate
└── package.json                     # Dépendances npm
```

---

## 🔌 Points d'Intégration

### Frontend → N8N

**Fichier** : `src/services/n8n.js`

```javascript
export async function triggerWorkflow(message, fileData = null) {
  const payload = {
    message: message.trim(),
    timestamp: new Date().toISOString()
  }

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  return await response.json()
}
```

**Format envoyé** :
```json
{
  "message": "/image un chat",
  "timestamp": "2025-12-22T22:30:00.000Z"
}
```

**Format reçu** :
```json
[{
  "success": true,
  "type": "image",
  "content": {
    "url": "https://...",
    "description": "..."
  },
  "metadata": {...}
}]
```

---

### Frontend → Supabase

**Fichier** : `src/services/supabase.js`

```javascript
export async function saveConversation(conversation) {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{
      user_message: conversation.userMessage,
      assistant_response: conversation.assistantResponse,
      response_type: conversation.responseType,
      metadata: conversation.metadata,
      created_at: new Date().toISOString()
    }])
}
```

**Structure de la table** :
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_message TEXT NOT NULL,
  assistant_response JSONB NOT NULL,
  response_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### N8N → Services IA

#### Claude (Anthropic)
```
POST https://api.anthropic.com/v1/messages
Headers:
  - x-api-key: YOUR_KEY
  - anthropic-version: 2023-06-01
Body:
  {
    "model": "claude-sonnet-4-5-20250929",
    "messages": [{"role": "user", "content": "..."}]
  }
```

#### DALL-E (OpenAI)
```
POST https://api.openai.com/v1/images/generations
Headers:
  - Authorization: Bearer YOUR_KEY
Body:
  {
    "model": "dall-e-3",
    "prompt": "...",
    "n": 1,
    "size": "1024x1024"
  }
```

#### Replicate
```
POST https://api.replicate.com/v1/predictions
Headers:
  - Authorization: Token YOUR_KEY
Body:
  {
    "version": "3f0457e4619daac51203dedb...",
    "input": {"prompt": "...", "num_frames": 25, "fps": 7}
  }
```

---

## 🎯 Types de Données

### Response Object (Format Standard)

```typescript
interface Response {
  success: boolean
  type: 'text' | 'image' | 'video' | 'audio' | 'error' | 'info'
  content: string | MediaContent | ErrorContent
  metadata?: {
    inputType: string
    command: string
    originalMessage: string
    model?: string
    timestamp: string
  }
  timestamp: string
}

interface MediaContent {
  url: string
  description: string
  duration?: number          // Pour vidéo/audio
  originalPrompt?: string    // Pour génération
}

interface ErrorContent {
  message: string
  errorCode?: string
}
```

---

## 🚀 Technologies Utilisées

### Frontend
- **React 18** : Framework UI
- **Vite** : Build tool ultra-rapide
- **Tailwind CSS** : Styles utility-first
- **Web Speech API** : Reconnaissance vocale native

### Backend / Workflow
- **N8N** : Workflow automation (self-hosted)
- **Supabase** : Base de données PostgreSQL + Auth

### Services IA
- **Anthropic Claude Sonnet 4.5** : Conversation AI
- **OpenAI DALL-E 3** : Génération d'images
- **Replicate Stable Video Diffusion** : Génération vidéo

---

## 🔐 Sécurité

### Variables d'Environnement (.env)
```env
VITE_SUPABASE_URL=https://nivbykzatzugwslnodqi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_1zpj...
VITE_N8N_WEBHOOK_URL=https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable
```

### Credentials N8N
- **Anthropic API** : Stocké dans N8N credentials
- **OpenAI API** : Stocké dans N8N credentials
- **Replicate Token** : Stocké dans N8N credentials (Header Auth)

### Supabase Security
- **Anon Key** : Accès public en lecture/écriture
- **RLS (Row Level Security)** : À configurer pour production
- **Auth** : Optionnel pour utilisateur anonyme

---

## ⚡ Performance

### Temps de Réponse Typiques

| Type | Temps moyen | Coût |
|------|------------|------|
| **Texte (Claude)** | 2-5 secondes | ~$0.003 par message |
| **Image (DALL-E)** | 10-20 secondes | ~$0.04 par image |
| **Vidéo (Replicate)** | 10-20 secondes | ~$0.01-0.02 par vidéo |

### Optimisations Possibles
1. **Cache** : Mettre en cache les réponses identiques
2. **CDN** : Héberger les médias sur CDN (Cloudinary, AWS S3)
3. **Websockets** : Pour notifications temps réel
4. **Queue** : Gérer les requêtes vidéo en file d'attente

---

## 📊 Monitoring & Logs

### N8N
- **Executions** : Voir tous les workflows exécutés
- **Logs** : Inspecter chaque nœud
- **Metrics** : Temps d'exécution, taux d'erreur

### Supabase
- **Table Editor** : Voir les conversations sauvegardées
- **SQL Editor** : Requêtes personnalisées
- **Logs** : API calls, erreurs

### Frontend (Browser DevTools)
- **Console** : Erreurs JavaScript
- **Network** : Appels API, temps de chargement
- **React DevTools** : État des composants

---

## 🔄 Évolution Future

### Fonctionnalités à Ajouter
1. ✅ Texte (Claude) - **FAIT**
2. ✅ Image (DALL-E) - **FAIT**
3. ✅ Vidéo (Replicate) - **FAIT**
4. ⬜ Analyse de fichiers (GPT-4 Vision, Claude Vision)
5. ⬜ Recherche web (Serper API, Google Custom Search)
6. ⬜ Génération audio (ElevenLabs, OpenAI TTS)
7. ⬜ Authentification utilisateur (Supabase Auth)
8. ⬜ Partage de conversations (URLs publiques)
9. ⬜ Export de conversations (PDF, Markdown)
10. ⬜ Multi-langues (i18n)

---

## 📚 Ressources

### Documentation
- React : https://react.dev
- N8N : https://docs.n8n.io
- Supabase : https://supabase.com/docs
- Anthropic : https://docs.anthropic.com
- OpenAI : https://platform.openai.com/docs
- Replicate : https://replicate.com/docs

### Support
- Issues GitHub : (à définir)
- Discord : (à définir)
- Email : (à définir)

---

**Version** : 4.0 (DALL-E + Replicate)
**Dernière mise à jour** : 2025-12-22

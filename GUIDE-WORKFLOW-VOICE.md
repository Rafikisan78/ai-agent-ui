# Guide: Compléter le Workflow Voice-Text-Video dans N8N

## ✅ Workflow de Base Créé

- **ID**: `EM3TcglVa2ngfwRF`
- **URL**: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF
- **Webhook**: `https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video`

---

## 🔧 Étapes pour Compléter le Workflow

### Étape 1: Ouvrir le Workflow

1. Allez sur: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF
2. Vous verrez 3 nœuds de base:
   - Webhook
   - Analyze Request
   - Respond to Webhook

---

### Étape 2: Ajouter le Switch pour Router

1. **Supprimer** la connexion entre "Analyze Request" et "Respond to Webhook"
2. **Ajouter** un nœud **"Switch"** après "Analyze Request"
3. **Configurer** le Switch:
   - Cliquer sur le nœud Switch
   - Mode: "Rules"
   - Ajouter 4 conditions:

     **Condition 1 - Voice**:
     - Type: String
     - Value 1: `={{ $json.requestType }}`
     - Operation: equals
     - Value 2: `voice`

     **Condition 2 - Text**:
     - Type: String
     - Value 1: `={{ $json.requestType }}`
     - Operation: equals
     - Value 2: `text`

     **Condition 3 - Image**:
     - Type: String
     - Value 1: `={{ $json.requestType }}`
     - Operation: equals
     - Value 2: `image`

     **Condition 4 - Video**:
     - Type: String
     - Value 1: `={{ $json.requestType }}`
     - Operation: equals
     - Value 2: `video`

---

### Étape 3: Branche VOICE - Transcription Audio

#### 3.1 Ajouter "Function" pour préparer l'audio

1. **Connecter** la sortie 0 du Switch (voice)
2. **Ajouter** un nœud **"Function"**
3. **Nommer**: "Prepare Audio"
4. **Code**:
```javascript
// Conversion base64 vers buffer pour Whisper
const data = $input.first().json;
console.log('🎤 Audio reçu, taille:', data.audio_data?.length || 0);

if (!data.audio_data) {
  throw new Error('Aucune donnée audio');
}

// Décoder le base64
const audioBuffer = Buffer.from(data.audio_data, 'base64');
console.log('📊 Buffer créé:', audioBuffer.length, 'bytes');

return {
  json: {
    audioBuffer: audioBuffer.toString('base64'),
    format: data.format || 'webm'
  },
  binary: {
    data: {
      data: audioBuffer,
      mimeType: 'audio/webm',
      fileName: 'voice.webm'
    }
  }
};
```

#### 3.2 Ajouter "OpenAI" pour Whisper

1. **Ajouter** un nœud **"OpenAI"**
2. **Nommer**: "Whisper Transcription"
3. **Configurer**:
   - Resource: "Audio"
   - Operation: "Transcribe"
   - Binary Property: `data`
   - Language: `fr` (ou laissez vide pour auto-détection)
   - Model: `whisper-1`
4. **Credentials**: Sélectionner "OpenAI Account" (existant)

#### 3.3 Ajouter "Function" pour extraire le texte

1. **Ajouter** un nœud **"Function"**
2. **Nommer**: "Extract Transcription"
3. **Code**:
```javascript
const data = $input.first().json;
const transcription = data.text || '';

console.log('✅ Transcription:', transcription);

return {
  json: {
    message: transcription,
    source: 'voice',
    timestamp: new Date().toISOString()
  }
};
```

---

### Étape 4: Branche TEXT - Traitement Direct

1. **Connecter** la sortie 1 du Switch (text)
2. **Ajouter** un nœud **"Function"**
3. **Nommer**: "Process Text"
4. **Code**:
```javascript
const data = $input.first().json;
console.log('💬 Texte:', data.message);

return {
  json: {
    message: data.message,
    source: 'text',
    timestamp: new Date().toISOString()
  }
};
```

---

### Étape 5: Merger Voice & Text

1. **Ajouter** un nœud **"Merge"**
2. **Nommer**: "Merge Voice & Text"
3. **Configurer**:
   - Mode: "Combine"
   - Combine By: "Merge By Position"
4. **Connecter**:
   - Input 1: "Extract Transcription"
   - Input 2: "Process Text"

---

### Étape 6: Analyser le Type de Demande

1. **Ajouter** un nœud **"Function"** après le Merge
2. **Nommer**: "Detect Image/Video"
3. **Code**:
```javascript
const data = $input.first().json;
const message = data.message || '';

const isImage = message.toLowerCase().includes('/image');
const isVideo = message.toLowerCase().includes('/video');

let prompt = message;
if (isImage) prompt = message.replace('/image', '').trim();
if (isVideo) prompt = message.replace('/video', '').trim();

console.log('🔍 Type:', isImage ? 'image' : isVideo ? 'video' : 'text');
console.log('📝 Prompt:', prompt);

return {
  json: {
    prompt: prompt,
    type: isImage ? 'image' : isVideo ? 'video' : 'text',
    source: data.source,
    originalMessage: message
  }
};
```

---

### Étape 7: Router Final (Text/Image/Video)

1. **Ajouter** un nœud **"Switch"**
2. **Nommer**: "Route Content Type"
3. **Configurer** 3 conditions:
   - Condition 1: `{{ $json.type }}` equals `text`
   - Condition 2: `{{ $json.type }}` equals `image`
   - Condition 3: `{{ $json.type }}` equals `video`

---

### Étape 8: Branche IMAGE - DALL-E

1. **Connecter** la sortie 1 du Router (image)
2. **Ajouter** un nœud **"OpenAI"**
3. **Nommer**: "DALL-E Generate"
4. **Configurer**:
   - Resource: "Image"
   - Operation: "Generate"
   - Prompt: `={{ $json.prompt }}`
   - Size: "1024x1024"
   - Number of Images: 1
5. **Credentials**: "OpenAI Account"

#### 8.1 Formater la réponse image

1. **Ajouter** un nœud **"Function"**
2. **Nommer**: "Format Image Response"
3. **Code**:
```javascript
const data = $input.first().json;
const imageUrl = data.data?.[0]?.url;

console.log('🖼️ Image:', imageUrl);

return {
  json: {
    type: 'image',
    response: 'Image générée avec succès',
    image_url: imageUrl,
    prompt: $('Detect Image/Video').item.json.prompt,
    source: $('Detect Image/Video').item.json.source
  }
};
```

---

### Étape 9: Branche TEXT - ChatGPT

1. **Connecter** la sortie 0 du Router (text)
2. **Ajouter** un nœud **"OpenAI"**
3. **Nommer**: "ChatGPT"
4. **Configurer**:
   - Resource: "Chat"
   - Model: "gpt-4" ou "gpt-3.5-turbo"
   - Messages: User Message
   - Text: `={{ $json.prompt }}`
5. **Credentials**: "OpenAI Account"

#### 9.1 Formater la réponse texte

1. **Ajouter** un nœud **"Function"**
2. **Nommer**: "Format Text Response"
3. **Code**:
```javascript
const data = $input.first().json;
const response = data.choices?.[0]?.message?.content || data.text;

console.log('💬 Réponse:', response);

return {
  json: {
    type: 'text',
    response: response,
    prompt: $('Detect Image/Video').item.json.prompt,
    source: $('Detect Image/Video').item.json.source
  }
};
```

---

### Étape 10: Branche VIDEO - Replicate

1. **Connecter** la sortie 2 du Router (video)
2. **Ajouter** un nœud **"HTTP Request"**
3. **Nommer**: "Replicate Video"
4. **Configurer**:
   - Method: POST
   - URL: `https://api.replicate.com/v1/predictions`
   - Authentication: Predefined Credential Type
   - Credential Type: Replicate API
   - Send Headers: ON
     - Name: `Content-Type`, Value: `application/json`
   - Send Body: ON
     - Content Type: JSON
     - Body:
     ```json
     {
       "version": "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
       "input": {
         "prompt": "={{ $json.prompt }}"
       }
     }
     ```
5. **Credentials**: "Replicate API" (existant)

#### 10.1 Formater la réponse vidéo

1. **Ajouter** un nœud **"Function"**
2. **Nommer**: "Format Video Response"
3. **Code**:
```javascript
const data = $input.first().json;

console.log('🎬 Vidéo task:', data.id);

return {
  json: {
    type: 'video',
    response: 'Vidéo en cours de génération',
    task_id: data.id,
    status: 'processing',
    prompt: $('Detect Image/Video').item.json.prompt,
    source: $('Detect Image/Video').item.json.source
  }
};
```

---

### Étape 11: Merger Toutes les Réponses

1. **Ajouter** un nœud **"Merge"**
2. **Nommer**: "Merge All Responses"
3. **Connecter**:
   - Input 0: "Format Text Response"
   - Input 1: "Format Image Response"
   - Input 2: "Format Video Response"

---

### Étape 12: Connecter au Webhook Response

1. **Connecter** "Merge All Responses" à "Respond to Webhook"

---

### Étape 13: Activer le Workflow

1. Cliquer sur le **toggle** en haut à droite
2. Le workflow devient **actif** (vert)

---

## 📊 Architecture Finale

```
Webhook
  ↓
Analyze Request
  ↓
Switch (voice/text/image/video)
  ├─ [0] Voice → Prepare Audio → Whisper → Extract → Merge
  ├─ [1] Text → Process Text ────────────────────────↑
  ├─ [2] Image → (traité plus tard)
  └─ [3] Video → (traité plus tard)
              ↓
        Merge Voice & Text
              ↓
        Detect Image/Video
              ↓
        Route Content Type
         ├─ [0] Text → ChatGPT → Format Text → Merge All
         ├─ [1] Image → DALL-E → Format Image ────────↑
         └─ [2] Video → Replicate → Format Video ─────↑
                     ↓
              Merge All Responses
                     ↓
              Respond to Webhook
```

---

## ✅ Checklist Finale

- [ ] Tous les nœuds sont ajoutés
- [ ] Toutes les connexions sont faites
- [ ] Les credentials OpenAI sont configurés
- [ ] Les credentials Replicate sont configurés
- [ ] Le workflow est activé (toggle vert)
- [ ] Test avec curl:

```bash
curl -X POST https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour", "type": "text"}'
```

---

## 🔧 Troubleshooting

### Erreur: "Missing credentials"
→ Vérifiez que vos credentials OpenAI et Replicate sont bien configurés dans N8N

### Erreur: "Audio transcription failed"
→ Vérifiez que le format audio est correct (webm, mp3, wav acceptés)

### Le workflow ne répond pas
→ Vérifiez qu'il est bien actif (toggle vert)
→ Regardez les logs d'exécution dans N8N (onglet "Executions")

---

## 🎯 Prochaine Étape

Une fois le workflow complété et actif, passez à la mise à jour de l'application web pour ajouter le bouton microphone!

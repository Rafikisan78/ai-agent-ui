# 🎬 Guide: Utiliser les Paramètres Vidéo dans N8N

## 📊 Paramètres Envoyés par l'Application Web

L'application web envoie maintenant ces paramètres au webhook:

```json
{
  "message": "\\video un papillon",
  "type": "text",
  "videoParams": {
    "duration": 5,
    "aspectRatio": "16:9",
    "fps": 24
  }
}
```

## 🔧 Configuration N8N

### Étape 1: Extraire les Paramètres Vidéo

Dans votre workflow N8N, après le nœud **"Detect Input Type"**, ajoutez un nœud **"Set"** ou **"Code"** pour extraire les paramètres:

#### Option A: Nœud "Set"

**Name:** Extract Video Params

**Keep Only Set:** false

**Values:**
```
prompt: {{ $json.prompt }}
duration: {{ $json.videoParams.duration || 5 }}
aspectRatio: {{ $json.videoParams.aspectRatio || "16:9" }}
fps: {{ $json.videoParams.fps || 24 }}
```

#### Option B: Nœud "Code"

```javascript
const input = $input.all()[0].json;

return [{
  json: {
    prompt: input.prompt,
    duration: input.videoParams?.duration || 5,
    aspectRatio: input.videoParams?.aspectRatio || "16:9",
    fps: input.videoParams?.fps || 24,
    originalData: input
  }
}];
```

### Étape 2: Utiliser les Paramètres dans Replicate

Dans votre nœud **HTTP Request** vers Replicate (pour la génération vidéo):

**URL:**
```
https://api.replicate.com/v1/models/minimax/video-01/predictions
```

**Body JSON:**
```json
{
  "input": {
    "prompt": "={{ $json.prompt }}",
    "duration": "={{ $json.duration }}s",
    "aspect_ratio": "={{ $json.aspectRatio }}",
    "fps": "={{ $json.fps }}"
  }
}
```

### Étape 3: Modèles Replicate Compatibles

#### Modèle 1: Minimax Video-01 (Recommandé)

**URL:** `minimax/video-01`

**Paramètres supportés:**
```json
{
  "prompt": "un papillon qui vole",
  "duration": "5s",
  "aspect_ratio": "16:9",
  "fps": 24
}
```

**Durées disponibles:** 3s, 5s, 10s

#### Modèle 2: Luma AI Dream Machine

**URL:** `lumalabs/dream-machine`

**Paramètres supportés:**
```json
{
  "prompt": "un papillon qui vole",
  "duration": 5,
  "aspect_ratio": "16:9"
}
```

**Durées disponibles:** 5s

#### Modèle 3: Haiper Video

**URL:** `haiper-ai/video-01`

**Paramètres supportés:**
```json
{
  "prompt": "un papillon qui vole",
  "duration": "3",
  "resolution": "1280x720"
}
```

## 🎯 Exemple Complet de Workflow N8N

```
1. Webhook Trigger
   ↓ (reçoit: message, type, videoParams)
2. Detect Input Type
   ↓ (détecte \video)
3. Extract Video Params (Code)
   ↓ (extrait: prompt, duration, aspectRatio, fps)
4. HTTP Request → Replicate
   ↓ (génère la vidéo avec les paramètres)
5. Format Response
   ↓ (retourne: video_url, task_id, status)
6. Respond to Webhook
```

## 📋 Code Complet pour le Nœud Replicate

**Nœud HTTP Request:**

**Method:** POST

**URL:**
```
https://api.replicate.com/v1/models/minimax/video-01/predictions
```

**Headers:**
```
Authorization: Bearer {{ $env.REPLICATE_API_KEY }}
Content-Type: application/json
Prefer: wait
```

**Body:**
```json
{
  "input": {
    "prompt": "={{ $json.prompt }}",
    "duration": "={{ $json.duration }}s",
    "aspect_ratio": "={{ $json.aspectRatio }}",
    "fps": "={{ $json.fps }}"
  }
}
```

## 🎨 Valeurs par Défaut Recommandées

Si les paramètres ne sont pas fournis, utilisez:

```javascript
const videoParams = {
  duration: input.videoParams?.duration || 5,
  aspectRatio: input.videoParams?.aspectRatio || "16:9",
  fps: input.videoParams?.fps || 24
};
```

## 📊 Correspondance Format → Résolution

L'application web permet de choisir le format. Dans N8N, convertissez en résolution:

```javascript
const aspectRatioToResolution = {
  "16:9": "1280x720",
  "9:16": "720x1280",
  "1:1": "1024x1024"
};

const resolution = aspectRatioToResolution[aspectRatio] || "1280x720";
```

## 🧪 Tester

1. Ouvrez l'application web: `test-workflow.html`
2. Section "🎬 Test Video"
3. Choisissez:
   - Durée: 5 secondes
   - Format: 16:9
   - FPS: 24
4. Entrez un prompt: "un papillon qui vole"
5. Cliquez "▶️ Tester"

Le webhook recevra:
```json
{
  "message": "\\video un papillon qui vole",
  "videoParams": {
    "duration": 5,
    "aspectRatio": "16:9",
    "fps": 24
  }
}
```

---

✅ Maintenant vos vidéos sont personnalisables depuis l'interface web!

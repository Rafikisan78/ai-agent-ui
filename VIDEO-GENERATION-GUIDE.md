# Guide de Configuration - Génération Vidéo

## 🎬 Option 1 : Runway ML Gen-3 (Recommandé)

### Prérequis
1. Compte Runway ML : https://runwayml.com
2. Clé API Runway (obtenir sur https://app.runwayml.com/api-keys)
3. Crédits Runway (~$0.05 par seconde de vidéo)

### Configuration dans N8N

#### Étape 1 : Ajouter le nœud HTTP Request pour Runway

Dans votre workflow N8N, remplacez le nœud **"Web Search"** (placeholder) par :

**Nœud : HTTP Request - Runway Video Generation**

```
Nom : Runway Video Generation
Method : POST
URL : https://api.runwayml.com/v1/image_to_video

Authentication : Generic Credential Type
  → Header Auth
  → Name: Authorization
  → Value: Bearer YOUR_RUNWAY_API_KEY

Headers :
  - Content-Type: application/json

Body (JSON) :
{
  "model": "gen3a_turbo",
  "prompt_text": "{{ $json.prompt }}",
  "duration": 5,
  "ratio": "16:9"
}
```

#### Étape 2 : Ajouter le nœud de vérification du statut

Runway génère les vidéos de manière asynchrone. Il faut vérifier le statut :

**Nœud : Code - Check Video Status**

```javascript
// Extraire l'ID de la tâche
const input = $input.item.json;
const taskId = input.id;

if (!taskId) {
  return {
    json: {
      success: false,
      type: 'error',
      content: {
        message: 'Erreur lors de la génération vidéo',
        error: 'Task ID non trouvé'
      }
    }
  };
}

// Retourner l'ID pour la prochaine étape
return {
  json: {
    taskId: taskId,
    status: input.status || 'PENDING',
    prompt: $('Detect Input Type').item.json.prompt
  }
};
```

#### Étape 3 : Ajouter une boucle de vérification (Wait + HTTP Request)

**Nœud : Wait**
- Amount: 3
- Unit: Seconds

**Nœud : HTTP Request - Get Video Status**
```
Method : GET
URL : https://api.runwayml.com/v1/tasks/{{ $json.taskId }}

Authentication : Header Auth
  → Authorization: Bearer YOUR_RUNWAY_API_KEY
```

#### Étape 4 : Formater la réponse vidéo

**Nœud : Code - Format Video Response**

```javascript
const input = $input.item.json;
const previousData = $('Detect Input Type').item.json;

// Extraire l'URL de la vidéo
const videoUrl = input.output?.[0] || null;
const status = input.status;

if (status !== 'SUCCEEDED' || !videoUrl) {
  return {
    json: {
      success: false,
      type: 'error',
      content: {
        message: 'La vidéo n\'est pas encore prête ou a échoué',
        status: status,
        error: input.error || 'Veuillez réessayer'
      }
    }
  };
}

return {
  json: {
    success: true,
    type: 'video',
    content: {
      url: videoUrl,
      description: previousData.prompt,
      duration: input.duration || 5
    },
    metadata: {
      inputType: previousData.inputType,
      command: previousData.command,
      originalMessage: previousData.originalMessage,
      model: 'runway-gen3'
    },
    timestamp: new Date().toISOString()
  }
};
```

---

## 🎬 Option 2 : Replicate (Plus simple)

### Configuration

Replicate offre plusieurs modèles de génération vidéo. Voici comment utiliser **Stable Video Diffusion** :

**Nœud : HTTP Request - Replicate Video**

```
Method : POST
URL : https://api.replicate.com/v1/predictions

Authentication : Header Auth
  → Authorization: Token YOUR_REPLICATE_API_KEY

Body (JSON) :
{
  "version": "3f0457e4619daac51203dedb472816fd4af51f3149867e8e4e01e55e74f3b04e",
  "input": {
    "prompt": "{{ $json.prompt }}",
    "num_frames": 25,
    "fps": 7
  }
}
```

**Nœud : Wait** (5 secondes)

**Nœud : HTTP Request - Get Replicate Status**
```
Method : GET
URL : {{ $json.urls.get }}

Headers :
  - Authorization: Token YOUR_REPLICATE_API_KEY
```

**Nœud : Code - Format Replicate Response**

```javascript
const input = $input.item.json;
const previousData = $('Detect Input Type').item.json;

if (input.status !== 'succeeded' || !input.output) {
  return {
    json: {
      success: false,
      type: 'error',
      content: {
        message: 'Génération vidéo en cours ou échouée',
        status: input.status
      }
    }
  };
}

return {
  json: {
    success: true,
    type: 'video',
    content: {
      url: input.output,
      description: previousData.prompt
    },
    metadata: {
      inputType: previousData.inputType,
      model: 'stable-video-diffusion'
    },
    timestamp: new Date().toISOString()
  }
};
```

---

## 🎬 Option 3 : Stability AI Video

### Configuration

**Nœud : HTTP Request - Stability Video**

```
Method : POST
URL : https://api.stability.ai/v2alpha/generation/image-to-video

Headers :
  - Authorization: Bearer YOUR_STABILITY_API_KEY
  - Content-Type: application/json

Body (JSON) :
{
  "prompt": "{{ $json.prompt }}",
  "cfg_scale": 2.5,
  "motion_bucket_id": 40,
  "seed": 0
}
```

---

## 🔄 Intégration dans le Workflow Actuel

Pour activer la génération vidéo dans votre workflow existant, vous devez :

1. **Modifier le Router** : Changer la condition pour `/video` de "web-search" à "video-generation"

2. **Remplacer le placeholder** du nœud "Web Search" par l'un des nœuds ci-dessus

3. **Connecter au Format Response**

---

## 💰 Coûts Comparatifs

| Service | Coût approximatif | Qualité | Vitesse |
|---------|------------------|---------|---------|
| Runway Gen-3 | ~$0.05/sec | Excellente | Rapide (10-30s) |
| Replicate | ~$0.01-0.03/video | Bonne | Moyen (30-60s) |
| Stability AI | ~$0.04/video | Très bonne | Rapide (15-40s) |

---

## 🧪 Test de la Génération Vidéo

Une fois configuré, testez avec :

```
/video un chat qui court dans un jardin ensoleillé
```

L'interface web affichera automatiquement le lecteur vidéo grâce au composant `MultimodalDisplay` qui détecte le type `"video"`.

---

## ⚠️ Notes Importantes

1. **Génération asynchrone** : La plupart des APIs génèrent les vidéos en arrière-plan (10-60 secondes)
2. **Polling** : Vous devez vérifier périodiquement le statut de la génération
3. **Durée limitée** : La plupart des services génèrent 3-5 secondes de vidéo maximum
4. **Stockage** : Les URLs expireront - envisagez de télécharger et stocker les vidéos sur votre propre serveur

---

## 🛠️ Workflow Complet Recommandé

Je vais créer un workflow N8N complet avec DALL-E (images) + Runway (vidéos) intégrés.

Voulez-vous que je génère ce workflow complet ?

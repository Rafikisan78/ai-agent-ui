# 🔧 Fix: Detect Content Type - Prompt Vide

**Problème**: Le nœud "Detect Content Type" crée un `prompt` vide

**Output actuel**:
```json
{
  "originalMessage": "",
  "prompt": "",
  "type": "text",
  "source": "voice"
}
```

---

## 🎯 Cause Probable

Le nœud cherche le message dans un mauvais champ. Il cherche probablement:
- `data.originalMessage` qui n'existe pas
- Au lieu de `data.message` ou `data.text`

---

## 🔧 Solution: Corriger le Code

### Ouvrir le Nœud

1. Workflow: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF
2. Cliquer sur **"Detect Content Type"**

### Code Actuel (Probablement)

Le code cherche probablement:
```javascript
const message = data.originalMessage || '';  // ← Ce champ n'existe pas!
```

### Code Corrigé

Remplacer par:
```javascript
// [LOG] Detection du type de contenu
console.log('='.repeat(60));
console.log('[DETECT CONTENT] Debut');

const data = $input.first().json;

console.log('[DETECT CONTENT] Data recue:', JSON.stringify(data, null, 2).substring(0, 300));

// Extraire le message en cherchant dans plusieurs champs possibles
const message = data.message || data.text || data.content || data.transcription || '';

console.log('[DETECT CONTENT] Message extrait:', message.substring(0, 100));

// Detecter le type de contenu
let contentType = 'text';
let finalPrompt = message;

if (message.startsWith('/image ')) {
  contentType = 'image';
  finalPrompt = message.substring(7).trim();
  console.log('[DETECT CONTENT] Type image detecte, prompt:', finalPrompt);
} else if (message.startsWith('/video ')) {
  contentType = 'video';
  finalPrompt = message.substring(7).trim();
  console.log('[DETECT CONTENT] Type video detecte, prompt:', finalPrompt);
} else {
  console.log('[DETECT CONTENT] Type texte (defaut)');
}

console.log('[DETECT CONTENT] Type final:', contentType);
console.log('[DETECT CONTENT] Prompt final:', finalPrompt.substring(0, 100));
console.log('='.repeat(60));

return {
  json: {
    type: contentType,
    prompt: finalPrompt,
    originalMessage: message,
    source: data.source || 'text'
  }
};
```

### Points Clés du Fix

1. **Cherche dans plusieurs champs**: `data.message || data.text || data.content || data.transcription`
2. **Log détaillé**: Affiche les données reçues pour debug
3. **Détection image/video**: Regarde si le message commence par `/image` ou `/video`
4. **Retourne le prompt non-vide**: Utilise le message trouvé

---

## 🧪 Test

Après avoir remplacé le code:

1. **Save**
2. Relancer le test
3. Vérifier dans l'exécution que "Detect Content Type" affiche maintenant:
   ```json
   {
     "type": "text",
     "prompt": "Bonjour, dis-moi une blague",
     "originalMessage": "Bonjour, dis-moi une blague",
     "source": "text"
   }
   ```

---

**Dernière mise à jour**: 25/12/2025 00:12

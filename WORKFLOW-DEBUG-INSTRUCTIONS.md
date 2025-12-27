# Instructions de Débogage - Workflow N8N

## Problème actuel

Le workflow route toujours `/video` vers la branche TEXT au lieu de VIDEO.

## Hypothèse

Le nœud "Detect Type" ne reçoit peut-être pas le champ `message` correctement depuis "Validate Input".

## Solution : Ajouter du logging temporaire

### Étape 1 : Modifier le nœud "Detect Type"

Dans votre workflow N8N actif, modifiez le code JavaScript du nœud "Detect Type" :

**REMPLACEZ** le code actuel par celui-ci :

```javascript
const input = $input.item.json;
const message = input.message || '';

// LOGGING pour déboguer
console.log('=== DEBUG Detect Type ===');
console.log('Input reçu:', JSON.stringify(input, null, 2));
console.log('Message extrait:', message);
console.log('Type de message:', typeof message);
console.log('========================');

let inputType = 'text';
let command = null;
let prompt = message;

// Vérifier les patterns
if (message.toLowerCase().startsWith('/image ')) {
  inputType = 'image-generation';
  command = 'image';
  prompt = message.substring(7).trim();
  console.log('DÉTECTÉ: IMAGE');
} else if (message.toLowerCase().startsWith('/img ')) {
  inputType = 'image-generation';
  command = 'image';
  prompt = message.substring(5).trim();
  console.log('DÉTECTÉ: IMAGE (raccourci)');
} else if (message.toLowerCase().startsWith('/video ')) {
  inputType = 'video-generation';
  command = 'video';
  prompt = message.substring(7).trim();
  console.log('DÉTECTÉ: VIDEO');
} else if (message.toLowerCase().startsWith('/vid ')) {
  inputType = 'video-generation';
  command = 'video';
  prompt = message.substring(5).trim();
  console.log('DÉTECTÉ: VIDEO (raccourci)');
} else {
  console.log('DÉTECTÉ: TEXT (par défaut)');
}

console.log('inputType final:', inputType);

return {
  json: {
    message: input.message,
    timestamp: input.timestamp,
    inputType: inputType,
    command: command,
    prompt: prompt,
    originalMessage: message
  }
};
```

### Étape 2 : Sauvegarder et tester

1. Cliquez sur **"Save"** dans le nœud
2. Cliquez sur **"Save"** pour le workflow
3. Assurez-vous que le workflow est **ACTIF**

### Étape 3 : Lancer le test

Depuis votre terminal :
```bash
cd n8n-trigger-ui
node test-webhook.js
```

### Étape 4 : Consulter les logs

Dans N8N :
1. Allez dans **"Executions"** (menu de gauche)
2. Cliquez sur la dernière exécution
3. Cliquez sur le nœud **"Detect Type"**
4. Regardez la console/logs

**Vous devriez voir** :
```
=== DEBUG Detect Type ===
Input reçu: { message: "/video un chat...", timestamp: "...", ... }
Message extrait: /video un chat qui court dans un jardin
Type de message: string
DÉTECTÉ: VIDEO
inputType final: video-generation
========================
```

### Étape 5 : Analyser

**Si vous voyez** :
- ✅ `DÉTECTÉ: VIDEO` → Le problème est ailleurs (Router ou connexions)
- ❌ `DÉTECTÉ: TEXT` → Le message n'est pas extrait correctement
- ❌ `Message extrait: ""` → Le champ `message` est vide ou undefined
- ❌ `Message extrait: { ... }` → Le message est un objet, pas une string

---

## Cas possible : Le message est un objet

Si le log montre :
```
Message extrait: { body: { message: "..." } }
```

Alors modifiez le code comme ceci :
```javascript
const input = $input.item.json;
let message = input.message || '';

// Si message est un objet, extraire la vraie valeur
if (typeof message === 'object' && message.body) {
  message = message.body.message || '';
} else if (typeof message === 'object' && message.message) {
  message = message.message || '';
}

// Convertir en string si nécessaire
message = String(message);

// Reste du code...
```

---

**Faites le test et partagez-moi ce que vous voyez dans les logs !**

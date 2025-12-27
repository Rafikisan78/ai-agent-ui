// Detection du type de contenu - Traite tous les items
console.log('='.repeat(60));
console.log('[DETECT CONTENT] Debut');

const items = $input.all();

console.log('[DETECT CONTENT] Nombre d items:', items.length);

// Prendre le premier item qui a un message non-vide
let data = null;
for (const item of items) {
  const msg = item.json.message || item.json.text || item.json.content || '';
  if (msg && msg.trim() !== '') {
    data = item.json;
    console.log('[DETECT CONTENT] Item avec message trouve');
    break;
  }
}

// Si aucun item avec message, prendre le dernier
if (!data && items.length > 0) {
  data = items[items.length - 1].json;
  console.log('[DETECT CONTENT] Aucun message trouve, utilise dernier item');
}

if (!data) {
  console.error('[DETECT CONTENT] Aucune donnee recue');
  throw new Error('Aucune donnee recue par Detect Content Type');
}

console.log('[DETECT CONTENT] Data selectionnee:', JSON.stringify(data, null, 2).substring(0, 300));

// Extraire le message
const message = data.message || data.text || data.content || data.transcription || '';

console.log('[DETECT CONTENT] Message extrait:', message.substring(0, 100));

// Detecter le type
let contentType = 'text';
let finalPrompt = message;

if (message.startsWith('/image ')) {
  contentType = 'image';
  finalPrompt = message.substring(7).trim();
  console.log('[DETECT CONTENT] Type image detecte');
} else if (message.startsWith('/video ')) {
  contentType = 'video';
  finalPrompt = message.substring(7).trim();
  console.log('[DETECT CONTENT] Type video detecte');
} else {
  console.log('[DETECT CONTENT] Type texte');
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

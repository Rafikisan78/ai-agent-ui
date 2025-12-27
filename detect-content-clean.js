// Detection du type de contenu
console.log('='.repeat(60));
console.log('[DETECT CONTENT] Debut');

const data = $input.first().json;

console.log('[DETECT CONTENT] Data recue:', JSON.stringify(data, null, 2).substring(0, 300));

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

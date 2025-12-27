// Détection intelligente du type d'entrée
const input = $input.item.json;
const message = input.message || '';

// Variables de sortie
let inputType = 'text';
let command = null;
let prompt = message;

// Détection des commandes
const imagePatterns = ['/image ', '/img ', '/gen '];
const searchPatterns = ['/search ', '/find ', '/cherche '];
const videoPatterns = ['/video ', '/vid '];
const audioPatterns = ['/audio ', '/voice ', '/voix '];

// Détection image
for (const pattern of imagePatterns) {
  if (message.toLowerCase().startsWith(pattern)) {
    inputType = 'image-generation';
    command = 'image';
    prompt = message.substring(pattern.length).trim();
    break;
  }
}

// Détection recherche
if (inputType === 'text') {
  for (const pattern of searchPatterns) {
    if (message.toLowerCase().startsWith(pattern)) {
      inputType = 'web-search';
      command = 'search';
      prompt = message.substring(pattern.length).trim();
      break;
    }
  }
}

// Détection vidéo
if (inputType === 'text') {
  for (const pattern of videoPatterns) {
    if (message.toLowerCase().startsWith(pattern)) {
      inputType = 'video-generation';
      command = 'video';
      prompt = message.substring(pattern.length).trim();
      break;
    }
  }
}

// Détection audio/voix
if (inputType === 'text') {
  for (const pattern of audioPatterns) {
    if (message.toLowerCase().startsWith(pattern)) {
      inputType = 'audio-input';
      command = 'audio';
      prompt = message.substring(pattern.length).trim();
      break;
    }
  }
}

// Détection audio via données audio brutes
if (input.audio_data || input.audioData) {
  inputType = 'audio-input';
  command = 'audio';
  prompt = prompt || 'transcription audio';
}

// Détection de fichier
if (input.file) {
  inputType = 'file-analysis';
  command = 'analyze';
}

return {
  json: {
    ...input,
    inputType: inputType,
    command: command,
    prompt: prompt,
    originalMessage: message,
    hasFile: !!input.file,
    fileType: input.file?.type || null,
    fileName: input.file?.name || null,
    hasAudio: !!(input.audio_data || input.audioData),
    audioFormat: input.format || null
  }
};

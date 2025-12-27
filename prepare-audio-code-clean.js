// [LOG] Preparation audio
console.log('='.repeat(60));
console.log('🎤 [PREPARE AUDIO] Debut');

const data = $input.first().json;

// NOUVEAU: Verifier le type de requete AVANT tout traitement
console.log('[PREPARE AUDIO] Request Type:', data.requestType);
console.log('[PREPARE AUDIO] Has audio_data:', !!(data.audio_data || data.audioData));

// Si ce n'est PAS une requete vocale, passer directement les donnees
if (data.requestType !== 'voice' && data.requestType !== 'audio') {
  console.log('[PREPARE AUDIO] Requete non-vocale detectee, skip audio processing');
  console.log('[PREPARE AUDIO] Type detecte:', data.requestType);
  console.log('='.repeat(60));

  // Retourner les donnees telles quelles sans traitement audio
  return { json: data };
}

// Si c'est une requete vocale mais sans donnees audio, erreur
const audioData = data.audio_data || data.audioData;

if (!audioData) {
  console.error('[PREPARE AUDIO] Requete vocale sans donnees audio!');
  console.error('[PREPARE AUDIO] Request Type:', data.requestType);
  console.error('[PREPARE AUDIO] Data keys:', Object.keys(data).join(', '));
  console.log('='.repeat(60));
  throw new Error('Requete vocale recue mais aucune donnee audio fournie');
}

// Traitement audio normal
console.log('[PREPARE AUDIO] Taille audio base64:', audioData.length);
console.log('[PREPARE AUDIO] Format:', data.format || 'webm');

// Decoder base64 en buffer
const audioBuffer = Buffer.from(audioData, 'base64');
console.log('[PREPARE AUDIO] Buffer cree:', audioBuffer.length, 'bytes');

console.log('[PREPARE AUDIO] Audio pret pour Whisper');
console.log('='.repeat(60));

return {
  json: {
    format: data.format || 'webm',
    originalRequestType: data.requestType
  },
  binary: {
    data: {
      data: audioBuffer,
      mimeType: 'audio/webm',
      fileName: 'audio.webm'
    }
  }
};

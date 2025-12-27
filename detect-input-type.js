// ============================================
// DETECT INPUT TYPE - N8N Code Node
// ============================================
// Détecte automatiquement le type d'input et extrait les informations pertinentes
// Supporte: text, image, video, audio, web-search, file-analysis

const input = $input.item.json;
const message = input.message || '';
const messageLower = message.toLowerCase();

// Logs d'entrée
console.log('=====================================');
console.log('🔍 DETECT INPUT TYPE - START');
console.log('=====================================');
console.log('📥 Input reçu:', JSON.stringify(input, null, 2));
console.log('💬 Message:', message);
console.log('📊 Type de message:', typeof message);

// Variables de sortie
let inputType = 'text';
let command = null;
let prompt = message;
let cleanPrompt = message;
let detectionLog = [];

// ============================================
// 1. DÉTECTION AUDIO/VOIX (Priorité haute)
// ============================================
console.log('\n🎤 Test AUDIO...');
const audioPatterns = ['\\audio', '\\voice', '\\voix', '/audio ', '/voice ', '/voix '];

// Vérifier si audio_data est présent
if (input.audio_data || input.audioData) {
  inputType = 'audio-input';
  command = 'audio';
  cleanPrompt = prompt || 'transcription audio';
  detectionLog.push('✅ Audio data détecté (audio_data ou audioData présent)');
  console.log('✅ Audio détecté: audio_data présent');
  console.log('   Format:', input.format);
} else {
  // Vérifier les patterns audio dans le message
  for (const pattern of audioPatterns) {
    if (messageLower.startsWith(pattern.toLowerCase())) {
      inputType = 'audio-input';
      command = 'audio';
      cleanPrompt = message.substring(pattern.length).trim();
      detectionLog.push(`✅ Audio détecté via pattern: "${pattern}"`);
      console.log(`✅ Audio détecté: pattern "${pattern}"`);
      console.log('   Prompt nettoyé:', cleanPrompt);
      break;
    }
  }
  if (inputType === 'text') {
    console.log('⏭️  Pas d\'audio détecté');
  }
}

// ============================================
// 2. DÉTECTION IMAGE (Si pas audio)
// ============================================
if (inputType === 'text') {
  console.log('\n🖼️  Test IMAGE...');
  const imagePatterns = ['\\image', '\\img', '\\gen', '/image ', '/img ', '/gen '];

  for (const pattern of imagePatterns) {
    if (messageLower.startsWith(pattern.toLowerCase())) {
      inputType = 'image-generation';
      command = 'image';
      cleanPrompt = message.substring(pattern.length).trim();
      detectionLog.push(`✅ Image détectée via pattern: "${pattern}"`);
      console.log(`✅ Image détectée: pattern "${pattern}"`);
      console.log('   Prompt nettoyé:', cleanPrompt);
      break;
    }
  }
  if (inputType === 'text') {
    console.log('⏭️  Pas d\'image détectée');
  }
}

// ============================================
// 3. DÉTECTION VIDEO (Si pas audio ni image)
// ============================================
if (inputType === 'text') {
  console.log('\n🎬 Test VIDEO...');
  const videoPatterns = ['\\video', '\\vid', '/video ', '/vid '];

  for (const pattern of videoPatterns) {
    if (messageLower.startsWith(pattern.toLowerCase())) {
      inputType = 'video-generation';
      command = 'video';
      cleanPrompt = message.substring(pattern.length).trim();
      detectionLog.push(`✅ Vidéo détectée via pattern: "${pattern}"`);
      console.log(`✅ Vidéo détectée: pattern "${pattern}"`);
      console.log('   Prompt nettoyé:', cleanPrompt);
      break;
    }
  }
  if (inputType === 'text') {
    console.log('⏭️  Pas de vidéo détectée');
  }
}

// ============================================
// 4. DÉTECTION RECHERCHE WEB
// ============================================
if (inputType === 'text') {
  console.log('\n🔍 Test RECHERCHE WEB...');
  const searchPatterns = ['\\search', '\\find', '\\cherche', '/search ', '/find ', '/cherche '];

  for (const pattern of searchPatterns) {
    if (messageLower.startsWith(pattern.toLowerCase())) {
      inputType = 'web-search';
      command = 'search';
      cleanPrompt = message.substring(pattern.length).trim();
      detectionLog.push(`✅ Recherche web détectée via pattern: "${pattern}"`);
      console.log(`✅ Recherche détectée: pattern "${pattern}"`);
      console.log('   Query:', cleanPrompt);
      break;
    }
  }
  if (inputType === 'text') {
    console.log('⏭️  Pas de recherche détectée');
  }
}

// ============================================
// 5. DÉTECTION FICHIER
// ============================================
console.log('\n📎 Test FICHIER...');
if (input.file) {
  inputType = 'file-analysis';
  command = 'analyze';
  cleanPrompt = message || 'Analyse du fichier';
  detectionLog.push(`✅ Fichier détecté: ${input.file.name}`);
  console.log('✅ Fichier détecté:', input.file.name);
  console.log('   Type:', input.file.type);
} else {
  console.log('⏭️  Pas de fichier détecté');
}

// Par défaut: texte simple
if (inputType === 'text') {
  detectionLog.push('✅ Type par défaut: texte simple');
  console.log('\n📝 Type final: TEXTE SIMPLE');
}

// ============================================
// RETOURNER LES DONNÉES ENRICHIES
// ============================================
const result = {
  json: {
    // Données originales
    ...input,

    // Données de détection
    inputType: inputType,
    command: command,
    prompt: cleanPrompt,
    originalMessage: message,

    // Métadonnées
    hasFile: !!input.file,
    fileType: input.file?.type || null,
    fileName: input.file?.name || null,
    hasAudio: !!(input.audio_data || input.audioData),
    audioFormat: input.format || null,

    // Logs de détection
    detectionLog: detectionLog,

    // Timestamp
    detectedAt: new Date().toISOString()
  }
};

// Logs de sortie
console.log('\n=====================================');
console.log('✅ DETECT INPUT TYPE - RÉSULTAT');
console.log('=====================================');
console.log('🎯 Type détecté:', inputType);
console.log('⚡ Commande:', command);
console.log('📝 Prompt nettoyé:', cleanPrompt);
console.log('📋 Log de détection:');
detectionLog.forEach(log => console.log('   ' + log));
console.log('\n📤 Output complet:', JSON.stringify(result.json, null, 2));
console.log('=====================================\n');

return result;

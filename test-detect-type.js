// Test du code Detect Type localement

function testDetectType(message) {
  let inputType = 'text';
  let command = null;
  let prompt = message;

  const imagePatterns = ['/image ', '/img '];
  const videoPatterns = ['/video ', '/vid '];

  for (const pattern of imagePatterns) {
    if (message.toLowerCase().startsWith(pattern)) {
      inputType = 'image-generation';
      command = 'image';
      prompt = message.substring(pattern.length).trim();
      break;
    }
  }

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

  return {
    inputType,
    command,
    prompt,
    originalMessage: message
  };
}

// Tests
console.log('Test 1 - Texte normal:');
console.log(testDetectType('Quelle est la capitale de la France ?'));
console.log('');

console.log('Test 2 - Image:');
console.log(testDetectType('/image un chat mignon'));
console.log('');

console.log('Test 3 - Vidéo:');
console.log(testDetectType('/video un chat qui court dans un jardin'));
console.log('');

console.log('Test 4 - Vidéo sans espace:');
console.log(testDetectType('/videoun chat'));
console.log('');

console.log('Test 5 - Vidéo majuscules:');
console.log(testDetectType('/VIDEO un chat'));

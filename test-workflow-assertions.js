// Tests avec assertions pour vérifier le workflow N8N
const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video';

// Compteurs de tests
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Fonction d'assertion
function assert(condition, testName, expected, actual) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${testName}`);
    return true;
  } else {
    failedTests++;
    console.log(`❌ FAIL: ${testName}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
    return false;
  }
}

// Test 1: Texte Simple
async function testTextSimple() {
  console.log('\n' + '═'.repeat(70));
  console.log('TEST 1: Texte Simple - "Bonjour"');
  console.log('═'.repeat(70));

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bonjour',
        type: 'text'
      })
    });

    // Test: Status code
    assert(
      response.status === 200,
      'Status code = 200',
      '200',
      response.status
    );

    // Test: Response non vide
    const text = await response.text();
    assert(
      text.length > 0,
      'Response body non vide',
      '> 0 chars',
      `${text.length} chars`
    );

    if (text.length === 0) {
      console.log('⚠️  SKIP: Tests suivants (body vide)');
      return false;
    }

    // Test: JSON valide
    let data;
    try {
      data = JSON.parse(text);
      assert(true, 'JSON valide', 'valid JSON', 'valid JSON');
    } catch (e) {
      assert(false, 'JSON valide', 'valid JSON', `Parse error: ${e.message}`);
      console.log('   Raw response:', text.substring(0, 200));
      return false;
    }

    // Test: Champ "type" présent
    assert(
      data.hasOwnProperty('type'),
      'Champ "type" présent',
      'exists',
      data.type ? 'exists' : 'missing'
    );

    // Test: Type = "text"
    assert(
      data.type === 'text',
      'Type = "text"',
      '"text"',
      `"${data.type}"`
    );

    // Test: Champ "prompt" présent
    assert(
      data.hasOwnProperty('prompt'),
      'Champ "prompt" présent',
      'exists',
      data.prompt !== undefined ? 'exists' : 'missing'
    );

    // Test: Prompt = "Bonjour"
    assert(
      data.prompt === 'Bonjour',
      'Prompt = "Bonjour"',
      '"Bonjour"',
      `"${data.prompt}"`
    );

    // Test: Champ "response" présent
    assert(
      data.hasOwnProperty('response'),
      'Champ "response" présent',
      'exists',
      data.response !== undefined ? 'exists' : 'missing'
    );

    // Test: Response non vide
    assert(
      data.response && data.response.length > 0,
      'Response non vide',
      '> 0 chars',
      data.response ? `${data.response.length} chars` : 'empty/null'
    );

    // Test: Champ "source" présent
    assert(
      data.hasOwnProperty('source'),
      'Champ "source" présent',
      'exists',
      data.source !== undefined ? 'exists' : 'missing'
    );

    console.log('\n📄 Response complète:');
    console.log(JSON.stringify(data, null, 2));

    return true;

  } catch (error) {
    assert(false, 'Requête réussie', 'no error', error.message);
    return false;
  }
}

// Test 2: Détection Image
async function testImageDetection() {
  console.log('\n' + '═'.repeat(70));
  console.log('TEST 2: Détection Image - "/image un chat astronaute"');
  console.log('═'.repeat(70));

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '/image un chat astronaute',
        type: 'text'
      })
    });

    assert(response.status === 200, 'Status code = 200', '200', response.status);

    const text = await response.text();
    assert(text.length > 0, 'Response body non vide', '> 0 chars', `${text.length} chars`);

    if (text.length === 0) {
      console.log('⚠️  SKIP: Tests suivants (body vide)');
      return false;
    }

    let data;
    try {
      data = JSON.parse(text);
      assert(true, 'JSON valide', 'valid JSON', 'valid JSON');
    } catch (e) {
      assert(false, 'JSON valide', 'valid JSON', `Parse error: ${e.message}`);
      return false;
    }

    // Test: Type = "image"
    assert(
      data.type === 'image',
      'Type = "image"',
      '"image"',
      `"${data.type}"`
    );

    // Test: Prompt sans "/image"
    assert(
      data.prompt === 'un chat astronaute',
      'Prompt sans préfixe "/image"',
      '"un chat astronaute"',
      `"${data.prompt}"`
    );

    // Test: Champ "image_url" OU "response" présent
    const hasImageUrl = data.hasOwnProperty('image_url') && data.image_url;
    const hasResponse = data.hasOwnProperty('response') && data.response;
    assert(
      hasImageUrl || hasResponse,
      'Champ "image_url" ou "response" présent',
      'exists',
      hasImageUrl ? 'image_url exists' : (hasResponse ? 'response exists' : 'both missing')
    );

    console.log('\n📄 Response complète:');
    console.log(JSON.stringify(data, null, 2));

    return true;

  } catch (error) {
    assert(false, 'Requête réussie', 'no error', error.message);
    return false;
  }
}

// Test 3: Détection Video
async function testVideoDetection() {
  console.log('\n' + '═'.repeat(70));
  console.log('TEST 3: Détection Video - "/video un papillon"');
  console.log('═'.repeat(70));

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '/video un papillon',
        type: 'text'
      })
    });

    assert(response.status === 200, 'Status code = 200', '200', response.status);

    const text = await response.text();
    assert(text.length > 0, 'Response body non vide', '> 0 chars', `${text.length} chars`);

    if (text.length === 0) {
      console.log('⚠️  SKIP: Tests suivants (body vide)');
      return false;
    }

    let data;
    try {
      data = JSON.parse(text);
      assert(true, 'JSON valide', 'valid JSON', 'valid JSON');
    } catch (e) {
      assert(false, 'JSON valide', 'valid JSON', `Parse error: ${e.message}`);
      return false;
    }

    // Test: Type = "video"
    assert(
      data.type === 'video',
      'Type = "video"',
      '"video"',
      `"${data.type}"`
    );

    // Test: Prompt sans "/video"
    assert(
      data.prompt === 'un papillon',
      'Prompt sans préfixe "/video"',
      '"un papillon"',
      `"${data.prompt}"`
    );

    // Test: Champ "task_id" OU "video_url" OU "response" présent
    const hasTaskId = data.hasOwnProperty('task_id') && data.task_id;
    const hasVideoUrl = data.hasOwnProperty('video_url') && data.video_url;
    const hasResponse = data.hasOwnProperty('response') && data.response;
    assert(
      hasTaskId || hasVideoUrl || hasResponse,
      'Champ "task_id" ou "video_url" ou "response" présent',
      'exists',
      hasTaskId ? 'task_id exists' : (hasVideoUrl ? 'video_url exists' : (hasResponse ? 'response exists' : 'all missing'))
    );

    console.log('\n📄 Response complète:');
    console.log(JSON.stringify(data, null, 2));

    return true;

  } catch (error) {
    assert(false, 'Requête réussie', 'no error', error.message);
    return false;
  }
}

// Test 4: Audio/Voix
async function testVoiceInput() {
  console.log('\n' + '═'.repeat(70));
  console.log('TEST 4: Input Voix - Audio base64');
  console.log('═'.repeat(70));

  try {
    // Audio WAV minimal valide
    const minimalAudio = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQAAAAA=';

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_data: minimalAudio,
        type: 'voice',
        format: 'wav'
      })
    });

    assert(response.status === 200, 'Status code = 200', '200', response.status);

    const text = await response.text();
    assert(text.length > 0, 'Response body non vide', '> 0 chars', `${text.length} chars`);

    if (text.length === 0) {
      console.log('⚠️  SKIP: Tests suivants (body vide)');
      console.log('ℹ️  Note: Whisper API peut ne pas être configuré');
      return false;
    }

    let data;
    try {
      data = JSON.parse(text);
      assert(true, 'JSON valide', 'valid JSON', 'valid JSON');
    } catch (e) {
      assert(false, 'JSON valide', 'valid JSON', `Parse error: ${e.message}`);
      return false;
    }

    // Test: Champ "source" = "voice"
    assert(
      data.source === 'voice',
      'Source = "voice"',
      '"voice"',
      `"${data.source}"`
    );

    // Test: Champ "response" présent (transcription + réponse)
    assert(
      data.hasOwnProperty('response'),
      'Champ "response" présent',
      'exists',
      data.response !== undefined ? 'exists' : 'missing'
    );

    console.log('\n📄 Response complète:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\nℹ️  Note: Si OpenAI Whisper n\'est pas configuré, ce test peut échouer');

    return true;

  } catch (error) {
    assert(false, 'Requête réussie', 'no error', error.message);
    console.log('ℹ️  Note: Échec normal si Whisper API non configuré');
    return false;
  }
}

// Fonction principale
async function runAllTests() {
  console.log('═'.repeat(70));
  console.log('🧪 SUITE DE TESTS: Workflow N8N Voice-Text-Video');
  console.log('═'.repeat(70));
  console.log('Webhook URL:', WEBHOOK_URL);
  console.log('Date:', new Date().toLocaleString('fr-FR'));
  console.log('═'.repeat(70));

  // Exécuter tous les tests
  await testTextSimple();
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testImageDetection();
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testVideoDetection();
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testVoiceInput();

  // Résumé final
  console.log('\n' + '═'.repeat(70));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('═'.repeat(70));
  console.log(`Total: ${totalTests} tests`);
  console.log(`✅ Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`❌ Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
  console.log('═'.repeat(70));

  if (failedTests === 0) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS!');
  } else if (passedTests > failedTests) {
    console.log('⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
  } else {
    console.log('❌ LA MAJORITÉ DES TESTS ONT ÉCHOUÉ');
  }

  console.log('\n💡 PROCHAINES ÉTAPES:');
  if (failedTests > 0) {
    console.log('1. Vérifier les exécutions N8N: https://n8n.srv766650.hstgr.cloud/executions');
    console.log('2. Consulter FIX-MERGE-ALL-RESPONSES.md pour les solutions');
    console.log('3. Vérifier la configuration des nœuds Merge en mode "Append"');
  } else {
    console.log('✅ Workflow fonctionnel!');
    console.log('📝 Configurer DALL-E et Replicate pour activer image/video');
  }

  console.log('═'.repeat(70));

  // Exit code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Lancer les tests
runAllTests();

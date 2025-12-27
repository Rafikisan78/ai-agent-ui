// Test simple: 1 texte + 1 voix

const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video';

async function testSimple() {
  console.log('═'.repeat(70));
  console.log('🧪 TEST SIMPLE: TEXTE + VOIX');
  console.log('═'.repeat(70));
  console.log('');

  // Test 1: Texte
  console.log('1️⃣  TEST TEXTE: "Bonjour"\n');

  try {
    const response1 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bonjour',
        type: 'text'
      })
    });

    console.log(`   Status: ${response1.status} ${response1.statusText}`);

    const text1 = await response1.text();
    console.log(`   Longueur reponse: ${text1.length} caracteres`);

    if (text1) {
      try {
        const data1 = JSON.parse(text1);
        console.log('   ✅ JSON valide');
        console.log('   Type:', data1.type);
        console.log('   Source:', data1.source);
        if (data1.response) {
          console.log('   Response:', data1.response.substring(0, 150));
        }
        if (data1.prompt) {
          console.log('   Prompt:', data1.prompt);
        }
        console.log('');
        console.log('   JSON complet:');
        console.log('   ' + JSON.stringify(data1, null, 2).split('\n').join('\n   '));
      } catch (e) {
        console.log('   ⚠️  Non-JSON:', text1.substring(0, 200));
      }
    } else {
      console.log('   ❌ Reponse vide');
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');
  console.log('-'.repeat(70));
  console.log('');

  // Attendre 2 secondes entre les tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Voix (audio simulé)
  console.log('2️⃣  TEST VOIX: Audio simulé\n');

  try {
    // Audio base64 minimal (header WAV valide)
    const minimalAudio = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQAAAAA=';

    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_data: minimalAudio,
        type: 'voice',
        format: 'wav'
      })
    });

    console.log(`   Status: ${response2.status} ${response2.statusText}`);

    const text2 = await response2.text();
    console.log(`   Longueur reponse: ${text2.length} caracteres`);

    if (text2) {
      try {
        const data2 = JSON.parse(text2);
        console.log('   ✅ JSON valide');
        console.log('   Type:', data2.type);
        console.log('   Source:', data2.source);
        if (data2.response) {
          console.log('   Response:', data2.response.substring(0, 150));
        }
        console.log('');
        console.log('   JSON complet:');
        console.log('   ' + JSON.stringify(data2, null, 2).split('\n').join('\n   '));
      } catch (e) {
        console.log('   ⚠️  Non-JSON:', text2.substring(0, 200));
      }
    } else {
      console.log('   ❌ Reponse vide');
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('📊 VERIFIER DANS N8N');
  console.log('═'.repeat(70));
  console.log('');
  console.log('URL: https://n8n.srv766650.hstgr.cloud/executions');
  console.log('');
  console.log('Pour chaque execution:');
  console.log('');
  console.log('TEST TEXTE:');
  console.log('  ✅ Analyze Request → requestType: "text"');
  console.log('  ✅ Route Voice or Text → Output 1');
  console.log('  ✅ Process Text Input → message: "Bonjour"');
  console.log('  ✅ Merge Voice and Text → message presente');
  console.log('  ✅ Detect Content Type → type: "text", prompt: "Bonjour"');
  console.log('  ✅ Route Content Type → Output 0 (text)');
  console.log('  ✅ AI Agent → Appel API');
  console.log('  ✅ Format Text Response → Formatte la reponse');
  console.log('  ✅ Merge All Responses → 1 item');
  console.log('  ✅ Respond to Webhook → Retourne JSON');
  console.log('');
  console.log('TEST VOIX:');
  console.log('  ✅ Analyze Request → requestType: "voice"');
  console.log('  ✅ Route Voice or Text → Output 0');
  console.log('  ✅ Prepare Audio for Whisper → Buffer audio');
  console.log('  ? Whisper Transcription → Depend du credential OpenAI');
  console.log('  ? Extract Transcription → Depend de Whisper');
  console.log('  ✅ Merge Voice and Text → message transcrit');
  console.log('  ... suite du workflow');
  console.log('');
  console.log('═'.repeat(70));
}

testSimple();

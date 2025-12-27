// Test spécifique du routing voice/text

const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video';

async function testVoiceTextRouting() {
  console.log('═'.repeat(70));
  console.log('🧪 TEST ROUTING VOICE / TEXT');
  console.log('═'.repeat(70));
  console.log('');

  // Test 1: Requête TEXTE (doit aller vers Process Text Input)
  console.log('1️⃣  TEST: Requête TEXTE (type: "text")');
  console.log('   Attendu: Route vers "Process Text Input" (Output 1)\n');

  try {
    const response1 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bonjour, ceci est un test texte',
        type: 'text'
      })
    });

    console.log(`   Status: ${response1.status} ${response1.statusText}`);

    const text1 = await response1.text();
    if (text1) {
      try {
        const data1 = JSON.parse(text1);
        console.log('   ✅ Réponse JSON:');
        console.log('      Type:', data1.type);
        console.log('      Source:', data1.source);
        if (data1.response) {
          console.log('      Response:', data1.response.substring(0, 100) + '...');
        }
      } catch (e) {
        console.log('   ⚠️  Réponse (non-JSON):', text1.substring(0, 200));
      }
    } else {
      console.log('   ❌ Réponse vide');
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');

  // Test 2: Requête AUDIO (doit aller vers Prepare Audio for Whisper)
  console.log('2️⃣  TEST: Requête AUDIO (type: "voice")');
  console.log('   Attendu: Route vers "Prepare Audio for Whisper" (Output 0)\n');

  try {
    // Audio base64 minimal (header WAV)
    const minimalAudio = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQAAAAA=';

    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_data: minimalAudio,
        type: 'voice',
        format: 'webm'
      })
    });

    console.log(`   Status: ${response2.status} ${response2.statusText}`);

    const text2 = await response2.text();
    if (text2) {
      try {
        const data2 = JSON.parse(text2);
        console.log('   ✅ Réponse JSON:');
        console.log('      Type:', data2.type);
        console.log('      Source:', data2.source);
        if (data2.response) {
          console.log('      Response:', data2.response.substring(0, 100) + '...');
        }
      } catch (e) {
        console.log('   ⚠️  Réponse (non-JSON):', text2.substring(0, 200));
      }
    } else {
      console.log('   ❌ Réponse vide');
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');

  // Test 3: Sans type (fallback)
  console.log('3️⃣  TEST: Sans type spécifié (fallback)');
  console.log('   Attendu: Devrait aller vers le fallback\n');

  try {
    const response3 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Message sans type'
      })
    });

    console.log(`   Status: ${response3.status} ${response3.statusText}`);

    const text3 = await response3.text();
    if (text3) {
      try {
        const data3 = JSON.parse(text3);
        console.log('   ✅ Réponse JSON:');
        console.log('      Type:', data3.type);
        console.log('      Source:', data3.source);
      } catch (e) {
        console.log('   ⚠️  Réponse (non-JSON):', text3.substring(0, 200));
      }
    } else {
      console.log('   ❌ Réponse vide');
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('📊 INSTRUCTIONS POUR VÉRIFIER DANS N8N');
  console.log('═'.repeat(70));
  console.log('');
  console.log('1. Ouvrir: https://n8n.srv766650.hstgr.cloud/executions');
  console.log('2. Regarder les 3 dernières exécutions');
  console.log('3. Pour chaque exécution, vérifier:');
  console.log('');
  console.log('   📋 Nœud "Analyze Request":');
  console.log('      - Output doit contenir "requestType"');
  console.log('      - Test 1: requestType = "text"');
  console.log('      - Test 2: requestType = "voice"');
  console.log('      - Test 3: requestType = "text" (fallback)');
  console.log('');
  console.log('   🔀 Nœud "Route Voice or Text" (Switch):');
  console.log('      - Test 1 (text): Doit prendre Output 1 → "Process Text Input"');
  console.log('      - Test 2 (voice): Doit prendre Output 0 → "Prepare Audio"');
  console.log('      - Test 3 (fallback): Doit prendre le output par défaut');
  console.log('');
  console.log('   ✅ Si le routing fonctionne:');
  console.log('      - Requête texte → Process Text Input exécuté (vert)');
  console.log('      - Requête audio → Prepare Audio exécuté (vert)');
  console.log('');
  console.log('   ❌ Si le routing ne fonctionne pas:');
  console.log('      - Toutes les requêtes vont vers le même nœud');
  console.log('      - OU erreur "Output X is not allowed"');
  console.log('');
  console.log('═'.repeat(70));
}

testVoiceTextRouting();

// Test de l'envoi audio au webhook N8N
const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook-test/c1bc7a73-0892-45c3-8ccf-5c1e0dfc7f00';

async function testVoiceWebhook() {
  console.log('🎤 Test Audio Webhook\n');

  const minimalAudio = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQAAAAA=';

  const payload = {
    message: '\\audio',
    audio_data: minimalAudio,
    type: 'voice',
    format: 'wav'
  };

  console.log('📤 Envoi de la requête...');
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('\n📊 Status:', response.status);
    console.log('Status Text:', response.statusText);

    const text = await response.text();
    console.log('\n📥 Réponse brute:', text);

    if (text) {
      try {
        const data = JSON.parse(text);
        console.log('\n✅ Réponse JSON:');
        console.log(JSON.stringify(data, null, 2));

        // Vérifications
        console.log('\n🔍 Vérifications:');
        console.log('  - Type:', data.type || data[0]?.type);
        console.log('  - Content/Response:', data.content || data.response || data[0]?.content || data[0]?.response);
        console.log('  - Input Type:', data.inputType || data[0]?.inputType);
      } catch (e) {
        console.log('⚠️  La réponse n\'est pas du JSON valide');
      }
    } else {
      console.log('⚠️  Réponse vide');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testVoiceWebhook();

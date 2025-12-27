// Test simple du webhook N8N
const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/ai-agent-fiable';

async function testWebhook() {
  console.log('🚀 Test du webhook...');
  console.log('URL:', WEBHOOK_URL);

  try {
    // Test 1: Texte simple
    console.log('\n📝 Test 1: Message texte');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '\\text capitale de Haiti',
        type: 'text'
      })
    });

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response brute:', text);

    try {
      const json = JSON.parse(text);
      console.log('Response JSON:', JSON.stringify(json, null, 2));

      // Vérifications
      console.log('\n✅ Vérifications:');
      console.log('- Type:', json.type);
      console.log('- Prompt:', json.prompt);
      console.log('- Response:', json.response?.substring(0, 100) + '...');
      console.log('- Image URL:', json.image_url || 'N/A');
      console.log('- Video URL:', json.video_url || 'N/A');

    } catch (e) {
      console.error('❌ Erreur parsing JSON:', e.message);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testWebhook();

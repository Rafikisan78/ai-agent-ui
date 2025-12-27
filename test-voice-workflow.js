// Test rapide du workflow voice

const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video';

async function testVoiceWorkflow() {
  console.log('🧪 Test du workflow voice...\n');

  // Test 1: Texte simple
  console.log('📝 Test 1: Message texte simple');
  try {
    const response1 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bonjour',
        type: 'text',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`Status: ${response1.status} ${response1.statusText}`);

    if (response1.ok) {
      const data = await response1.json();
      console.log('✅ Réponse:', JSON.stringify(data, null, 2));
    } else {
      const error = await response1.text();
      console.error('❌ Erreur:', error);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Audio simulé (petit base64)
  console.log('🎤 Test 2: Audio simulé');
  const fakeAudioBase64 = 'R0lGODlhAQABAAAAACw='; // Fake base64

  try {
    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'voice',
        audio_data: fakeAudioBase64,
        format: 'webm',
        duration: 3,
        timestamp: new Date().toISOString()
      })
    });

    console.log(`Status: ${response2.status} ${response2.statusText}`);

    if (response2.ok) {
      const data = await response2.json();
      console.log('✅ Réponse:', JSON.stringify(data, null, 2));
    } else {
      const error = await response2.text();
      console.error('❌ Erreur:', error);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('📊 Résumé:');
  console.log('Si vous voyez des status 200 ou 201 ci-dessus, le workflow fonctionne!');
  console.log('Si vous voyez 404: Le workflow n\'est pas actif');
  console.log('Si vous voyez 500: Erreur dans le workflow (vérifier les nœuds)');
  console.log('\nProchaine étape: Compléter le workflow dans N8N selon GUIDE-WORKFLOW-VOICE.md');
}

testVoiceWorkflow();

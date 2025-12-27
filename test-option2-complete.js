// Test complet de l'Option 2

const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video';

async function testOption2() {
  console.log('🧪 Test de l\'Option 2 complète...\n');
  console.log('═'.repeat(70));

  // Test 1: Texte simple
  console.log('\n📝 TEST 1: Requête texte simple\n');

  try {
    const response1 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bonjour, comment ça va?',
        type: 'text',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`Status: ${response1.status} ${response1.statusText}`);

    if (response1.ok) {
      const data = await response1.json();
      console.log('\n✅ Réponse reçue:');
      console.log('Type:', data.type);
      console.log('Response:', data.response ? data.response.substring(0, 200) : 'N/A');
      console.log('Source:', data.source);
    } else {
      const error = await response1.text();
      console.error('❌ Erreur:', error);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  console.log('\n' + '═'.repeat(70));

  // Test 2: Audio simulé
  console.log('\n🎤 TEST 2: Requête audio (simulée avec petit base64)\n');

  try {
    const fakeAudio = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='; // Mini WAV

    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'voice',
        audio_data: fakeAudio,
        format: 'wav',
        duration: 1,
        timestamp: new Date().toISOString()
      })
    });

    console.log(`Status: ${response2.status} ${response2.statusText}`);

    if (response2.ok) {
      const data = await response2.json();
      console.log('\n✅ Réponse reçue:');
      console.log('Type:', data.type);
      console.log('Response:', data.response ? data.response.substring(0, 200) : 'N/A');
      console.log('Source:', data.source);

      console.log('\n⚠️ Note: Whisper peut échouer avec un audio factice');
      console.log('   Pour un test réel, utilisez l\'application web');
    } else {
      const error = await response2.text();
      console.error('❌ Erreur:', error);
      console.log('\n💡 Si erreur Whisper: Normal avec audio factice');
      console.log('   Testez avec un vrai enregistrement dans l\'app');
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 Résultats:');
  console.log('  - Si Test 1 réussit → ChatGPT fonctionne ✅');
  console.log('  - Si Test 2 échoue → Normal (audio factice)');
  console.log('  - Pour tests complets → Utiliser l\'application web');

  console.log('\n📋 Logs détaillés disponibles dans N8N:');
  console.log('  https://n8n.srv766650.hstgr.cloud/executions');
  console.log('  Chaque nœud affiche des logs [NOM_NOEUD] pour débugger');

  console.log('\n🎯 Prochaines étapes:');
  console.log('  1. Vérifier credentials OpenAI et Replicate dans N8N');
  console.log('  2. Tester dans l\'app: http://localhost:3001');
  console.log('  3. Mode 🎤 Audio → Parler → Voir ChatGPT');
  console.log('  4. Essayer "/image un chat" pour DALL-E');
  console.log('  5. Essayer "/video un papillon" pour Replicate');
}

testOption2();

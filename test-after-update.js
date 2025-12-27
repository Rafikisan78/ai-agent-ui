// Test après mise à jour - avec retry

const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWithRetry() {
  console.log('🧪 Test du webhook voice avec retry...\n');

  for (let i = 1; i <= 3; i++) {
    console.log(`Tentative ${i}/3...`);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test vocal',
          type: 'text',
          timestamp: new Date().toISOString()
        })
      });

      console.log(`Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log('\n✅ SUCCESS! Réponse reçue:\n');
        console.log('═'.repeat(70));
        console.log(data.response);
        console.log('═'.repeat(70));

        console.log('\n🎉 Le workflow fonctionne!');
        console.log('\n📋 Prochaines étapes:');
        console.log('1. Ouvrir: http://localhost:3001');
        console.log('2. Sélectionner mode "🎤 Audio"');
        console.log('3. Cliquer sur micro, parler, puis stop');
        console.log('4. Voir la réponse de test');
        console.log('\n📚 Pour workflow complet: GUIDE-WORKFLOW-VOICE.md');
        return;
      }

      if (i < 3) {
        console.log(`⏳ Attente 5 secondes avant retry...\n`);
        await sleep(5000);
      }
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
      if (i < 3) {
        await sleep(5000);
      }
    }
  }

  console.log('\n❌ Le webhook ne répond toujours pas après 3 tentatives');
  console.log('\n💡 Solutions:');
  console.log('1. Aller sur: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF');
  console.log('2. Vérifier que le workflow est actif (toggle vert)');
  console.log('3. Cliquer sur "Save" pour forcer la réinitialisation');
  console.log('4. Réessayer ce test');
}

testWithRetry();

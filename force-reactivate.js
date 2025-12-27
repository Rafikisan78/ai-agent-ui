// Forcer la réactivation du workflow pour enregistrer le webhook

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'EM3TcglVa2ngfwRF';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function forceReactivate() {
  console.log('🔄 Forcer la réactivation du workflow...\n');

  try {
    // 1. Désactiver
    console.log('1️⃣ Désactivation du workflow...');
    const deactivateResponse = await fetch(
      `${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}/deactivate`,
      {
        method: 'POST',
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      }
    );

    if (deactivateResponse.ok) {
      console.log('✅ Workflow désactivé');
    } else {
      console.log('⚠️ Erreur désactivation:', deactivateResponse.status);
    }

    // 2. Attendre 3 secondes
    console.log('⏳ Attente 3 secondes...');
    await sleep(3000);

    // 3. Réactiver
    console.log('\n2️⃣ Réactivation du workflow...');
    const activateResponse = await fetch(
      `${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}/activate`,
      {
        method: 'POST',
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      }
    );

    if (activateResponse.ok) {
      console.log('✅ Workflow réactivé');
    } else {
      console.log('❌ Erreur activation:', activateResponse.status);
      const error = await activateResponse.text();
      console.log(error);
      return;
    }

    // 4. Attendre 5 secondes
    console.log('⏳ Attente 5 secondes pour l\'initialisation du webhook...');
    await sleep(5000);

    // 5. Tester
    console.log('\n3️⃣ Test du webhook...\n');

    const testResponse = await fetch(
      'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test après réactivation',
          type: 'text',
          timestamp: new Date().toISOString()
        })
      }
    );

    console.log(`Status: ${testResponse.status} ${testResponse.statusText}`);

    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('\n✅ SUCCESS! Le webhook fonctionne!\n');
      console.log('═'.repeat(70));
      console.log(data.response);
      console.log('═'.repeat(70));

      console.log('\n🎉 Option 1 terminée avec succès!');
      console.log('\n📋 Prochaines étapes:');
      console.log('1. Tester dans l\'application: http://localhost:3001');
      console.log('2. Mode 🎤 Audio → Parler → Voir la réponse');
      console.log('3. Pour Option 2 complète: GUIDE-WORKFLOW-VOICE.md');
    } else {
      const error = await testResponse.text();
      console.log('\n❌ Webhook encore inaccessible');
      console.log('Erreur:', error);
      console.log('\n💡 Solution manuelle:');
      console.log('1. Ouvrir: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF');
      console.log('2. Toggle OFF (désactiver)');
      console.log('3. Cliquer "Save"');
      console.log('4. Toggle ON (activer)');
      console.log('5. Cliquer "Save" encore');
      console.log('6. Réessayer: node test-after-update.js');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

forceReactivate();

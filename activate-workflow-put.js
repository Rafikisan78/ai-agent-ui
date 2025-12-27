// Activer le workflow avec PUT au lieu de PATCH

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'SYKtWT1uWl7GlsKq';

async function activateWorkflow() {
  console.log('🚀 Activation du workflow avec PUT...\n');

  try {
    // 1. Récupérer le workflow complet
    console.log('📥 Récupération du workflow...');
    const getResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });

    if (!getResponse.ok) {
      console.error(`❌ Erreur lors de la récupération: ${getResponse.status}`);
      return;
    }

    const workflow = await getResponse.json();
    console.log(`✅ Workflow récupéré: "${workflow.name}"`);
    console.log(`📊 Statut actuel: ${workflow.active ? 'Actif' : 'Inactif'}`);

    // 2. Modifier le statut à active: true
    workflow.active = true;

    // 3. Envoyer avec PUT
    console.log('\n🔧 Activation avec PUT...');
    const putResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    });

    console.log(`📡 Réponse: ${putResponse.status} ${putResponse.statusText}`);

    if (putResponse.ok) {
      const result = await putResponse.json();
      console.log(`\n✅ WORKFLOW ACTIVÉ AVEC SUCCÈS!`);
      console.log(`📊 Nouveau statut: ${result.active ? '🟢 ACTIF' : '🔴 INACTIF'}`);

      // 4. Vérifier le webhook
      console.log('\n🧪 Test du webhook...');
      const webhookUrl = 'https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable';

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'ping',
          timestamp: new Date().toISOString()
        })
      });

      console.log(`Webhook: ${webhookResponse.status} ${webhookResponse.statusText}`);

      if (webhookResponse.ok) {
        console.log('✅ Webhook accessible!');
        console.log('\n🎉 Tout est prêt! Reconnectez-vous sur l\'application.');
      } else {
        console.error('⚠️ Webhook encore inaccessible. Attendez quelques secondes...');
      }
    } else {
      const error = await putResponse.text();
      console.error(`❌ Échec de l'activation:`);
      console.error(error);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

activateWorkflow();

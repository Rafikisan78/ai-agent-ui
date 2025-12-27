// Activer le workflow avec uniquement les champs requis

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'SYKtWT1uWl7GlsKq';

async function activateWorkflow() {
  console.log('🚀 Activation du workflow (tentative 3)...\n');

  try {
    // Essayer avec POST sur l'endpoint /activate
    console.log('🔧 Essai 1: POST sur /activate...');
    let response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📡 Réponse: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log('✅ Workflow activé avec POST!');
      await testWebhook();
      return;
    }

    if (response.status === 405) {
      // Essayer avec PUT minimal
      console.log('\n🔧 Essai 2: PUT avec données minimales...');

      const getResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      });

      const workflow = await getResponse.json();

      // Ne garder que les champs essentiels
      const minimalWorkflow = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        active: true,
        settings: workflow.settings || {},
        staticData: workflow.staticData || null
      };

      response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(minimalWorkflow)
      });

      console.log(`📡 Réponse: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log('✅ Workflow activé avec PUT!');
        await testWebhook();
        return;
      }

      const error = await response.text();
      console.error('❌ Erreur:', error);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  console.log('\n⚠️ L\'activation automatique a échoué.');
  console.log('\n📋 SOLUTION MANUELLE:');
  console.log('1. Ouvrez: https://n8n.srv766650.hstgr.cloud/workflow/SYKtWT1uWl7GlsKq');
  console.log('2. Cliquez sur le toggle en haut à droite pour activer');
  console.log('3. Reconnectez-vous sur l\'application');
}

async function testWebhook() {
  console.log('\n🧪 Test du webhook...');
  const webhookUrl = 'https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable';

  const webhookResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'ping', timestamp: new Date().toISOString() })
  });

  console.log(`Webhook: ${webhookResponse.status} ${webhookResponse.statusText}`);

  if (webhookResponse.ok) {
    console.log('✅ Webhook accessible!');
    console.log('\n🎉 TOUT EST PRÊT! Reconnectez-vous sur l\'application.');
  } else {
    console.log('⚠️ Attendez 5 secondes que le webhook s\'initialise...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const retryResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ping' })
    });

    if (retryResponse.ok) {
      console.log('✅ Webhook accessible après retry!');
      console.log('\n🎉 TOUT EST PRÊT! Reconnectez-vous sur l\'application.');
    } else {
      console.log('❌ Webhook toujours inaccessible');
    }
  }
}

activateWorkflow();

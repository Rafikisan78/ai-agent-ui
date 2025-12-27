// Test pour vérifier le statut du workflow principal

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'SYKtWT1uWl7GlsKq';

async function checkWorkflow() {
  console.log('🔍 Vérification du workflow principal...\n');

  try {
    // 1. Récupérer les infos du workflow
    console.log(`📋 Workflow ID: ${WORKFLOW_ID}`);
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });

    if (!response.ok) {
      console.error(`❌ Erreur ${response.status}: ${response.statusText}`);
      return;
    }

    const workflow = await response.json();

    console.log(`\n✅ Workflow trouvé: "${workflow.name}"`);
    console.log(`📊 Statut: ${workflow.active ? '🟢 ACTIF' : '🔴 INACTIF'}`);
    console.log(`📅 Créé: ${new Date(workflow.createdAt).toLocaleDateString('fr-FR')}`);
    console.log(`🔧 Nœuds: ${workflow.nodes?.length || 0}`);

    // 2. Chercher le webhook
    const webhooks = workflow.nodes?.filter(node => node.type === 'n8n-nodes-base.webhook') || [];
    console.log(`\n🔗 Webhooks trouvés: ${webhooks.length}`);

    if (webhooks.length > 0) {
      webhooks.forEach((webhook, index) => {
        const path = webhook.parameters?.path || 'N/A';
        const method = webhook.parameters?.httpMethod || 'POST';
        console.log(`   ${index + 1}. ${method} /${path}`);
      });
    }

    // 3. Vérifier si on peut activer le workflow
    if (!workflow.active) {
      console.log('\n⚠️ Le workflow est INACTIF');
      console.log('\n🔧 Tentative d\'activation...');

      const activateResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
        method: 'PATCH',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: true })
      });

      if (activateResponse.ok) {
        console.log('✅ Workflow activé avec succès!');
      } else {
        console.error(`❌ Échec de l'activation: ${activateResponse.status} ${activateResponse.statusText}`);
        const error = await activateResponse.text();
        console.error('Détails:', error);
      }
    } else {
      console.log('\n✅ Le workflow est déjà actif');
    }

    // 4. Test du webhook
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

    console.log(`Webhook response: ${webhookResponse.status} ${webhookResponse.statusText}`);

    if (webhookResponse.ok) {
      console.log('✅ Webhook accessible!');
    } else {
      console.error('❌ Webhook inaccessible');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkWorkflow();

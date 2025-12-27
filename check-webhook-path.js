// Vérifier le path exact du webhook dans le workflow activé

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'SYKtWT1uWl7GlsKq';

async function checkWebhookPath() {
  console.log('🔍 Vérification du path du webhook...\n');

  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    const workflow = await response.json();

    console.log(`📊 Workflow: "${workflow.name}"`);
    console.log(`🟢 Actif: ${workflow.active ? 'OUI' : 'NON'}`);
    console.log(`\n🔗 Recherche des webhooks...\n`);

    const webhooks = workflow.nodes?.filter(node => node.type === 'n8n-nodes-base.webhook') || [];

    if (webhooks.length === 0) {
      console.error('❌ Aucun webhook trouvé dans ce workflow!');
      return;
    }

    webhooks.forEach((webhook, index) => {
      const path = webhook.parameters?.path || 'N/A';
      const method = webhook.parameters?.httpMethod || 'POST';
      const webhookUrl = `${N8N_BASE_URL}/webhook/${path}`;
      const testUrl = `${N8N_BASE_URL}/webhook-test/${path}`;

      console.log(`Webhook ${index + 1}:`);
      console.log(`  Path: ${path}`);
      console.log(`  Method: ${method}`);
      console.log(`  URL Production: ${webhookUrl}`);
      console.log(`  URL Test: ${testUrl}`);
      console.log('');
    });

    // Tester les URLs
    console.log('🧪 Test des URLs...\n');

    for (const webhook of webhooks) {
      const path = webhook.parameters?.path || '';
      const productionUrl = `${N8N_BASE_URL}/webhook/${path}`;
      const testUrl = `${N8N_BASE_URL}/webhook-test/${path}`;

      // Test production
      try {
        const prodResponse = await fetch(productionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ping' })
        });
        console.log(`✅ Production (${path}): ${prodResponse.status} ${prodResponse.statusText}`);

        if (prodResponse.ok) {
          console.log(`\n🎯 URL CORRECTE À UTILISER:`);
          console.log(`   ${productionUrl}`);
        }
      } catch (e) {
        console.log(`❌ Production (${path}): ${e.message}`);
      }

      // Test test
      try {
        const testResponse = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ping' })
        });
        console.log(`✅ Test (${path}): ${testResponse.status} ${testResponse.statusText}`);

        if (testResponse.ok) {
          console.log(`\n🎯 URL CORRECTE À UTILISER:`);
          console.log(`   ${testUrl}`);
        }
      } catch (e) {
        console.log(`❌ Test (${path}): ${e.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkWebhookPath();

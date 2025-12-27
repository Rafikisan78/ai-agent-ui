// Vérifier les détails du workflow

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'EM3TcglVa2ngfwRF';

async function checkWorkflow() {
  console.log('🔍 Vérification du workflow...\n');

  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    if (!response.ok) {
      console.error('❌ Erreur:', response.status);
      return;
    }

    const workflow = await response.json();

    console.log('📊 Informations du Workflow:');
    console.log('═'.repeat(60));
    console.log(`Nom: ${workflow.name}`);
    console.log(`ID: ${workflow.id}`);
    console.log(`Actif: ${workflow.active ? '🟢 OUI' : '🔴 NON'}`);
    console.log(`Nœuds: ${workflow.nodes.length}`);
    console.log(`Dernière mise à jour: ${new Date(workflow.updatedAt).toLocaleString('fr-FR')}`);
    console.log('═'.repeat(60));

    console.log('\n📋 Détails des Nœuds:\n');

    workflow.nodes.forEach((node, index) => {
      console.log(`${index + 1}. ${node.name} (${node.type})`);

      // Pour le webhook, afficher les détails
      if (node.type === 'n8n-nodes-base.webhook') {
        console.log(`   📍 Path: ${node.parameters.path || 'N/A'}`);
        console.log(`   📍 Method: ${node.parameters.httpMethod || 'POST'}`);
        console.log(`   📍 Response Mode: ${node.parameters.responseMode || 'N/A'}`);

        const webhookUrl = `${N8N_BASE_URL}/webhook/${node.parameters.path}`;
        const testUrl = `${N8N_BASE_URL}/webhook-test/${node.parameters.path}`;

        console.log(`   🔗 Production URL: ${webhookUrl}`);
        console.log(`   🔗 Test URL: ${testUrl}`);
      }

      // Pour le function, afficher le début du code
      if (node.type === 'n8n-nodes-base.function') {
        const code = node.parameters.functionCode || '';
        const firstLine = code.split('\n')[0];
        console.log(`   📝 Premier ligne: ${firstLine}`);
      }

      console.log('');
    });

    console.log('\n🔗 URLs à Tester:\n');

    const webhookNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
    if (webhookNode) {
      const path = webhookNode.parameters.path;
      console.log(`Production: https://n8n.srv766650.hstgr.cloud/webhook/${path}`);
      console.log(`Test: https://n8n.srv766650.hstgr.cloud/webhook-test/${path}`);
    }

    console.log('\n⚠️ Actions Requises:\n');

    if (!workflow.active) {
      console.log('❌ Le workflow est INACTIF');
      console.log('   → Activez-le dans l\'interface N8N (toggle)');
    } else {
      console.log('✅ Le workflow est actif');
    }

    console.log('\n💡 Pour que le webhook fonctionne:');
    console.log('1. Ouvrir: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF');
    console.log('2. Cliquer sur "Save" (même si déjà sauvegardé)');
    console.log('3. Le toggle doit être VERT (actif)');
    console.log('4. Réessayer le test');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkWorkflow();

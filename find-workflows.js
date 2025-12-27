// Script pour lister tous les workflows N8N et trouver le bon

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';

async function findWorkflows() {
  console.log('🔍 Recherche de tous les workflows N8N\n');

  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });

    if (!response.ok) {
      console.error(`❌ Erreur ${response.status}: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    const workflows = data.data || data;

    console.log(`📊 ${workflows.length} workflow(s) trouvé(s):\n`);

    workflows.forEach((workflow, index) => {
      console.log(`${index + 1}. ${workflow.name || 'Sans nom'}`);
      console.log(`   ID: ${workflow.id}`);
      console.log(`   Actif: ${workflow.active ? '✅ Oui' : '❌ Non'}`);
      console.log(`   Créé: ${new Date(workflow.createdAt).toLocaleDateString('fr-FR')}`);
      console.log(`   Noeuds: ${workflow.nodes?.length || 0}`);

      // Chercher les webhooks
      const webhooks = workflow.nodes?.filter(node => node.type === 'n8n-nodes-base.webhook') || [];
      if (webhooks.length > 0) {
        webhooks.forEach(webhook => {
          const path = webhook.parameters?.path || 'N/A';
          console.log(`   🔗 Webhook: ${path}`);
        });
      }

      console.log('');
    });

    // Trouver le workflow avec le bon webhook
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 Recherche du workflow avec le webhook "/webhook-test/ai-agent-fiable"...\n');

    const targetWorkflow = workflows.find(wf => {
      const webhooks = wf.nodes?.filter(node => node.type === 'n8n-nodes-base.webhook') || [];
      return webhooks.some(wh => {
        const path = wh.parameters?.path || '';
        return path.includes('ai-agent-fiable') || path.includes('webhook-test');
      });
    });

    if (targetWorkflow) {
      console.log('✅ Workflow trouvé!');
      console.log(`   Nom: ${targetWorkflow.name}`);
      console.log(`   ID: ${targetWorkflow.id}`);
      console.log(`   Actif: ${targetWorkflow.active ? 'Oui' : 'Non'}`);
      console.log('\n📝 Action requise:');
      console.log(`   Mettez à jour .env avec: VITE_N8N_WORKFLOW_ID=${targetWorkflow.id}`);
    } else {
      console.log('❌ Aucun workflow trouvé avec ce webhook');
      console.log('\n💡 Suggestions:');
      console.log('   1. Vérifiez que le workflow existe dans N8N');
      console.log('   2. Vérifiez que le path du webhook est correct');
      console.log('   3. Activez le workflow manuellement dans N8N');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

findWorkflows();

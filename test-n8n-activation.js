// Script de test pour l'activation du workflow N8N

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const N8N_WORKFLOW_ID = 'Ud7XshnIobx6Dd2U';
const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable';

async function testN8NConnection() {
  console.log('🧪 Test de connexion N8N\n');
  console.log('Configuration:');
  console.log(`  - Base URL: ${N8N_BASE_URL}`);
  console.log(`  - Workflow ID: ${N8N_WORKFLOW_ID}`);
  console.log(`  - API Key: ${N8N_API_KEY.substring(0, 20)}...`);
  console.log('');

  // Test 1: Ping du webhook
  console.log('1️⃣ Test du webhook...');
  try {
    const pingResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'ping',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`   Status: ${pingResponse.status} ${pingResponse.statusText}`);
    if (pingResponse.ok) {
      console.log('   ✅ Webhook accessible\n');
    } else {
      console.log('   ❌ Webhook non accessible\n');
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  // Test 2: Récupération des informations du workflow
  console.log('2️⃣ Récupération des informations du workflow...');
  try {
    const getResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${N8N_WORKFLOW_ID}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });

    console.log(`   Status: ${getResponse.status} ${getResponse.statusText}`);

    if (getResponse.ok) {
      const workflow = await getResponse.json();
      console.log('   ✅ Workflow trouvé!');
      console.log(`   Nom: ${workflow.name || 'N/A'}`);
      console.log(`   Actif: ${workflow.active ? 'Oui' : 'Non'}`);
      console.log(`   Noeuds: ${workflow.nodes?.length || 0}`);
      console.log('');
    } else if (getResponse.status === 401) {
      console.log('   ❌ API key invalide ou expirée\n');
    } else if (getResponse.status === 404) {
      console.log('   ❌ Workflow introuvable\n');
    } else {
      const errorText = await getResponse.text();
      console.log(`   ❌ Erreur: ${errorText}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  // Test 3: Activation du workflow
  console.log('3️⃣ Tentative d\'activation du workflow...');
  try {
    const activateResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${N8N_WORKFLOW_ID}/activate`, {
      method: 'PATCH',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ active: true })
    });

    console.log(`   Status: ${activateResponse.status} ${activateResponse.statusText}`);

    if (activateResponse.ok) {
      const result = await activateResponse.json();
      console.log('   ✅ Workflow activé!');
      console.log(`   Actif: ${result.active ? 'Oui' : 'Non'}`);
      console.log('');
    } else if (activateResponse.status === 401) {
      console.log('   ❌ API key invalide ou expirée\n');
    } else if (activateResponse.status === 404) {
      console.log('   ❌ Workflow introuvable\n');
    } else if (activateResponse.status === 400) {
      const errorText = await activateResponse.text();
      console.log(`   ⚠️ Workflow déjà actif ou erreur: ${errorText}\n`);
    } else {
      const errorText = await activateResponse.text();
      console.log(`   ❌ Erreur ${activateResponse.status}: ${errorText}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  // Test 4: Vérification finale du statut
  console.log('4️⃣ Vérification finale du statut...');
  try {
    const finalCheckResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${N8N_WORKFLOW_ID}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });

    if (finalCheckResponse.ok) {
      const workflow = await finalCheckResponse.json();
      console.log(`   ${workflow.active ? '✅' : '❌'} Workflow ${workflow.active ? 'ACTIF' : 'INACTIF'}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Résumé:');
  console.log('  1. Vérifiez que le workflow est actif dans N8N');
  console.log('  2. Si API key invalide, générez une nouvelle clé');
  console.log('  3. Si workflow introuvable, vérifiez l\'ID du workflow');
}

testN8NConnection();

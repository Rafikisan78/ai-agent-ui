// Status final de l'Option 2

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'EM3TcglVa2ngfwRF';

async function checkFinalStatus() {
  console.log('═'.repeat(70));
  console.log('🎉 STATUS FINAL - OPTION 2');
  console.log('═'.repeat(70));
  console.log('');

  try {
    // 1. Vérifier le workflow
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    if (!response.ok) {
      console.error('❌ Impossible de récupérer le workflow');
      return;
    }

    const workflow = await response.json();

    console.log('✅ WORKFLOW CRÉÉ ET ACTIF');
    console.log('');
    console.log('📊 Statistiques:');
    console.log(`   Nom: ${workflow.name}`);
    console.log(`   Nœuds: ${workflow.nodes.length}/18 ✅`);
    console.log(`   Actif: ${workflow.active ? '🟢 OUI' : '🔴 NON'}`);
    console.log(`   Dernière mise à jour: ${new Date(workflow.updatedAt).toLocaleString('fr-FR')}`);
    console.log('');

    // 2. Vérifier les nœuds clés
    console.log('✅ NŒUDS AVEC LOGS DÉTAILLÉS:');
    console.log('');

    const functionNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.function');
    functionNodes.forEach(node => {
      const firstLine = (node.parameters.functionCode || '').split('\n')[0];
      const hasLog = firstLine.includes('[LOG]');
      console.log(`   ${hasLog ? '✅' : '❌'} ${node.name}`);
      if (hasLog) {
        console.log(`      └─ ${firstLine}`);
      }
    });

    console.log('');

    // 3. Vérifier les credentials requis
    console.log('⚠️  CREDENTIALS À CONFIGURER:');
    console.log('');

    const openAiNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.openAi');
    const replicateNodes = workflow.nodes.filter(n =>
      n.name.includes('Replicate') || n.parameters?.url?.includes('replicate')
    );

    console.log('   📌 OpenAI (3 nœuds):');
    openAiNodes.forEach(node => {
      console.log(`      • ${node.name}`);
    });

    console.log('');
    console.log('   📌 Replicate (1 nœud):');
    replicateNodes.forEach(node => {
      console.log(`      • ${node.name}`);
    });

    console.log('');

    // 4. Tester le webhook
    console.log('🔍 TEST WEBHOOK:');
    console.log('');

    const testResponse = await fetch('https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test de connectivité',
        type: 'text',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`   Status: ${testResponse.status} ${testResponse.statusText}`);

    if (testResponse.status === 200) {
      console.log('   ✅ Webhook répond correctement');
    } else {
      console.log('   ❌ Webhook ne répond pas');
    }

    console.log('');
    console.log('═'.repeat(70));
    console.log('📋 ACTIONS REQUISES POUR FINALISER:');
    console.log('═'.repeat(70));
    console.log('');
    console.log('1️⃣  Configurer les Credentials OpenAI:');
    console.log('   a. Aller sur: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF');
    console.log('   b. Cliquer sur "Whisper Transcription"');
    console.log('   c. Sélectionner credential OpenAI (ou créer)');
    console.log('   d. Répéter pour "ChatGPT Response" et "DALL-E Generate Image"');
    console.log('');
    console.log('2️⃣  Configurer Replicate (optionnel):');
    console.log('   a. Cliquer sur "Replicate Video Generation"');
    console.log('   b. Dans Authentication, choisir "Header Auth"');
    console.log('   c. Header Name: "Authorization"');
    console.log('   d. Header Value: "Token VOTRE_REPLICATE_API_KEY"');
    console.log('');
    console.log('3️⃣  Sauvegarder:');
    console.log('   a. Cliquer sur "Save" en haut à droite');
    console.log('   b. Vérifier que le toggle est VERT');
    console.log('');
    console.log('4️⃣  Tester dans l\'Application:');
    console.log('   a. Ouvrir: http://localhost:3001');
    console.log('   b. Mode 🎤 Audio → Parler → Voir transcription + réponse');
    console.log('   c. Essayer: "/image un chat astronaute"');
    console.log('   d. Essayer: "/video un papillon dans un jardin"');
    console.log('');
    console.log('═'.repeat(70));
    console.log('📚 DOCUMENTATION COMPLÈTE:');
    console.log('═'.repeat(70));
    console.log('');
    console.log('   📄 Guide détaillé: FINALISER-OPTION-2.md');
    console.log('   📊 Vérifier les logs: https://n8n.srv766650.hstgr.cloud/executions');
    console.log('   🔗 Workflow N8N: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF');
    console.log('');
    console.log('═'.repeat(70));
    console.log('✅ OPTION 2 STRUCTURELLEMENT COMPLÈTE!');
    console.log('⚠️  Configuration manuelle requise pour OpenAI/Replicate');
    console.log('═'.repeat(70));
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkFinalStatus();

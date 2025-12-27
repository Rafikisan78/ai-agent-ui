// Mettre à jour le workflow pour l'Option 1 (test rapide)

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'EM3TcglVa2ngfwRF';

async function updateWorkflowForTesting() {
  console.log('🔧 Mise à jour du workflow pour test rapide...\n');

  try {
    // 1. Récupérer le workflow actuel
    console.log('📥 Récupération du workflow...');
    const getResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    if (!getResponse.ok) {
      console.error('❌ Erreur:', getResponse.status);
      return;
    }

    const workflow = await getResponse.json();
    console.log(`✅ Workflow récupéré: "${workflow.name}"`);
    console.log(`📊 Nœuds actuels: ${workflow.nodes.length}`);

    // 2. Modifier le nœud "Analyze Request"
    const analyzeNode = workflow.nodes.find(n => n.name === 'Analyze Request');

    if (!analyzeNode) {
      console.error('❌ Nœud "Analyze Request" introuvable');
      return;
    }

    console.log('\n🔧 Modification du nœud "Analyze Request"...');

    // Nouveau code simplifié pour test
    analyzeNode.parameters.functionCode = `// Test rapide - Option 1
const body = $input.first().json.body || $input.first().json;

console.log('📥 Requête reçue:', JSON.stringify(body, null, 2));

// Extraire les données
const isVoice = body.type === 'voice' || body.audio_data;
const message = body.message || '';
const audioDataSize = body.audio_data ? body.audio_data.length : 0;

console.log('🔍 Type détecté:', {
  isVoice,
  hasMessage: !!message,
  audioSize: audioDataSize
});

// Créer une réponse de test
let testResponse = '';

if (isVoice) {
  testResponse = \`✅ Test vocal réussi!

📊 Données reçues:
- Type: Voice/Audio
- Taille audio: \${audioDataSize} caractères (base64)
- Format: \${body.format || 'webm'}
- Durée: \${body.duration || 'N/A'} secondes

🎤 Le workflow vocal fonctionne!

Prochaine étape: Ajouter Whisper pour transcription réelle.
Voir GUIDE-WORKFLOW-VOICE.md\`;
} else if (message) {
  testResponse = \`✅ Test texte réussi!

📊 Données reçues:
- Type: Text
- Message: "\${message}"
- Timestamp: \${body.timestamp || new Date().toISOString()}

💬 Le workflow texte fonctionne!

Prochaine étape: Ajouter ChatGPT/DALL-E/Replicate.
Voir GUIDE-WORKFLOW-VOICE.md\`;
} else {
  testResponse = \`✅ Webhook actif!

📊 Données brutes reçues:
\${JSON.stringify(body, null, 2)}

✨ Le workflow répond correctement!\`;
}

return {
  json: {
    type: 'text',
    response: testResponse,
    source: isVoice ? 'voice' : 'text',
    timestamp: new Date().toISOString(),
    requestData: {
      isVoice,
      messageLength: message.length,
      audioDataSize
    }
  }
};`;

    console.log('✅ Code du nœud modifié');

    // 3. Nettoyer le workflow (retirer les propriétés read-only)
    const cleanWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
      staticData: workflow.staticData || null
    };

    // 3. Sauvegarder le workflow
    console.log('\n💾 Sauvegarde du workflow...');

    const updateResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanWorkflow)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('❌ Erreur lors de la sauvegarde:', updateResponse.status);
      console.error(error);
      return;
    }

    const updated = await updateResponse.json();
    console.log('✅ Workflow mis à jour avec succès!');
    console.log(`📊 Statut: ${updated.active ? '🟢 Actif' : '🔴 Inactif'}`);

    // 4. S'assurer que le workflow est actif
    if (!updated.active) {
      console.log('\n🔧 Activation du workflow...');
      const activateResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}/activate`, {
        method: 'POST',
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      });

      if (activateResponse.ok) {
        console.log('✅ Workflow activé!');
      }
    }

    // 5. Tester le webhook
    console.log('\n🧪 Test du webhook...\n');

    const testResponse = await fetch('https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test depuis le script',
        type: 'text',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`Webhook status: ${testResponse.status} ${testResponse.statusText}`);

    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('\n✅ RÉPONSE DU WORKFLOW:');
      console.log('═'.repeat(60));
      console.log(testData.response);
      console.log('═'.repeat(60));

      console.log('\n🎉 SUCCESS! Le workflow fonctionne!');
      console.log('\n📋 Prochaines étapes:');
      console.log('1. Ouvrir l\'application: http://localhost:3001');
      console.log('2. Sélectionner mode "🎤 Audio"');
      console.log('3. Cliquer sur le micro et parler');
      console.log('4. Vous devriez voir la réponse de test ci-dessus');
      console.log('\n📚 Pour le workflow complet avec Whisper:');
      console.log('   Voir GUIDE-WORKFLOW-VOICE.md');
    } else {
      const error = await testResponse.text();
      console.error('\n❌ Erreur webhook:', error);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateWorkflowForTesting();

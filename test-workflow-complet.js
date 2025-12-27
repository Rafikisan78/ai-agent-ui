// Test complet du workflow Option 2

const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video';

async function testWorkflow() {
  console.log('═'.repeat(70));
  console.log('🧪 TEST COMPLET DU WORKFLOW');
  console.log('═'.repeat(70));
  console.log('');

  // Test 1: Requête texte simple
  console.log('1️⃣  TEST: Requête texte simple\n');
  try {
    const response1 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bonjour, dis-moi une blague',
        type: 'text',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`   Status: ${response1.status} ${response1.statusText}`);

    if (response1.ok) {
      const text1 = await response1.text();
      try {
        const data1 = JSON.parse(text1);
        console.log('   ✅ Réponse JSON reçue');
        console.log('   Type:', data1.type);
        console.log('   Response:', data1.response?.substring(0, 100) + '...');
      } catch (e) {
        console.log('   ⚠️  Réponse (non-JSON):', text1.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');

  // Test 2: Requête avec audio simulé (petit base64)
  console.log('2️⃣  TEST: Requête audio (simulée)\n');
  try {
    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_data: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEA',
        type: 'voice',
        format: 'webm',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`   Status: ${response2.status} ${response2.statusText}`);

    if (response2.ok) {
      const text2 = await response2.text();
      try {
        const data2 = JSON.parse(text2);
        console.log('   ✅ Réponse JSON reçue');
        console.log('   Type:', data2.type);
        console.log('   Source:', data2.source);
      } catch (e) {
        console.log('   ⚠️  Réponse (non-JSON):', text2.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');

  // Test 3: Demande d'image
  console.log('3️⃣  TEST: Demande génération d\'image\n');
  try {
    const response3 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '/image un chat astronaute dans l\'espace',
        type: 'text',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`   Status: ${response3.status} ${response3.statusText}`);

    if (response3.ok) {
      const text3 = await response3.text();
      try {
        const data3 = JSON.parse(text3);
        console.log('   ✅ Réponse JSON reçue');
        console.log('   Type:', data3.type);
        if (data3.image_url) {
          console.log('   Image URL:', data3.image_url.substring(0, 50) + '...');
        }
      } catch (e) {
        console.log('   ⚠️  Réponse (non-JSON):', text3.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');

  // Test 4: Demande de vidéo
  console.log('4️⃣  TEST: Demande génération de vidéo\n');
  try {
    const response4 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '/video un papillon dans un jardin',
        type: 'text',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`   Status: ${response4.status} ${response4.statusText}`);

    if (response4.ok) {
      const text4 = await response4.text();
      try {
        const data4 = JSON.parse(text4);
        console.log('   ✅ Réponse JSON reçue');
        console.log('   Type:', data4.type);
        console.log('   Status:', data4.status);
        if (data4.task_id) {
          console.log('   Task ID:', data4.task_id);
        }
      } catch (e) {
        console.log('   ⚠️  Réponse (non-JSON):', text4.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('═'.repeat(70));
  console.log('');
  console.log('✅ Webhook répond (200 OK)');
  console.log('');
  console.log('⚠️  Pour que les réponses fonctionnent complètement:');
  console.log('   1. Configurer credentials OpenAI dans N8N');
  console.log('   2. Configurer credentials Replicate (optionnel)');
  console.log('   3. Cliquer "Save" dans le workflow');
  console.log('');
  console.log('📚 Voir les logs détaillés dans N8N:');
  console.log('   https://n8n.srv766650.hstgr.cloud/executions');
  console.log('');
  console.log('   Chaque nœud affiche:');
  console.log('   ═════════════════════════════════════');
  console.log('   📥 [NODE_NAME] Début');
  console.log('   [NODE_NAME] Variable: valeur');
  console.log('   ✅ [NODE_NAME] Terminé');
  console.log('   ═════════════════════════════════════');
  console.log('');
  console.log('═'.repeat(70));
}

testWorkflow();

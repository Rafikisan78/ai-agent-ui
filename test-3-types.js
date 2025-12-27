// Test des 3 types de contenu: texte, image, vidéo

const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable';

async function testWebhook(message, type) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Test ${type.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Message: "${message}"\n`);

  const payload = {
    message: message,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ Réponse reçue:');
      console.log(JSON.stringify(result, null, 2));

      if (result.metadata?.taskId) {
        console.log(`\n🔑 Task ID: ${result.metadata.taskId}`);
        if (type === 'vidéo') {
          console.log('⏱️  Attendez 2-3 minutes, puis vérifiez avec: node test-debug.js');
        }
      }
    } else {
      const errorText = await response.text();
      console.error(`\n❌ Erreur ${response.status}:`, errorText);
    }
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Lancement des 3 tests...\n');
  console.log('⚠️  Assurez-vous que le workflow "AI Agent - Main (FINAL)" est ACTIF dans N8N\n');

  // Test 1: Texte
  await testWebhook(
    "Qu'est-ce que la poésie romantique française du 19ème siècle ? Cite-moi quelques poètes célèbres.",
    "texte"
  );

  // Attendre 2 secondes entre chaque test
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Image
  await testWebhook(
    "/image un coucher de soleil sur l'océan avec des dauphins qui sautent",
    "image"
  );

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Vidéo
  await testWebhook(
    "/video un papillon coloré volant dans un jardin fleuri",
    "vidéo"
  );

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Tous les tests ont été lancés!');
  console.log(`${'='.repeat(60)}`);
  console.log('\n📋 Prochaines étapes:');
  console.log('   1. Pour le texte: réponse immédiate');
  console.log('   2. Pour l\'image: devrait arriver rapidement');
  console.log('   3. Pour la vidéo: exécutez "node test-debug.js" dans 2-3 minutes');
  console.log('\n💡 Ou ouvrez l\'interface web: http://localhost:5173\n');
}

runAllTests();

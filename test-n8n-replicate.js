// Test du workflow N8N avec Replicate pour génération d'images
const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/ai-agent-fiable';

async function testN8NReplicate() {
  console.log('🧪 Test du workflow N8N avec Replicate\n');
  console.log('🔗 Webhook URL:', WEBHOOK_URL);

  // Test 1: Génération d'image avec le préfixe \image
  console.log('\n📝 Test 1: Génération d\'image avec "\\image un chat astronaute"...\n');

  try {
    const startTime = Date.now();

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '\\image un chat astronaute',
        type: 'text'
      })
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('⏱️  Temps de réponse:', duration, 'secondes');
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);

    if (response.status === 200) {
      const text = await response.text();
      console.log('\n📦 Réponse brute (premiers 500 caractères):');
      console.log(text.substring(0, 500));

      try {
        const parsed = JSON.parse(text);
        const data = Array.isArray(parsed) ? parsed[0] : parsed;

        console.log('\n✅ JSON parsé avec succès !');
        console.log('📄 Réponse complète:');
        console.log(JSON.stringify(data, null, 2));

        // Vérifier les champs attendus
        console.log('\n🔍 Vérification des champs:');
        console.log('   - type:', data.type);
        console.log('   - image_url:', data.image_url ? '✅ Présent' : '❌ Manquant');
        console.log('   - content:', data.content ? data.content.substring(0, 50) + '...' : '❌ Manquant');
        console.log('   - metadata:', data.metadata ? '✅ Présent' : '❌ Manquant');

        // Si image_url est présent
        if (data.image_url) {
          console.log('\n🖼️  URL de l\'image:', data.image_url);

          // Essayer de télécharger l'image
          console.log('\n📥 Tentative de téléchargement de l\'image...');
          try {
            const imageResponse = await fetch(data.image_url);
            if (imageResponse.ok) {
              const imageBlob = await imageResponse.blob();
              const fs = require('fs');
              const buffer = Buffer.from(await imageBlob.arrayBuffer());
              fs.writeFileSync('test-n8n-replicate-output.png', buffer);
              console.log('✅ Image téléchargée et sauvegardée: test-n8n-replicate-output.png');
              console.log('   Taille:', (imageBlob.size / 1024).toFixed(2), 'KB');
            } else {
              console.log('❌ Erreur lors du téléchargement:', imageResponse.status);
            }
          } catch (err) {
            console.log('❌ Erreur lors du téléchargement:', err.message);
          }
        }

        // Vérifier les métadonnées Replicate
        if (data.metadata) {
          console.log('\n📊 Métadonnées Replicate:');
          console.log('   - prediction_id:', data.metadata.predictionId || data.metadata.prediction_id);
          console.log('   - model:', data.metadata.model);
          console.log('   - status:', data.metadata.status);
          if (data.metadata.metrics) {
            console.log('   - predict_time:', data.metadata.metrics.predict_time, 'secondes');
          }
        }

        // Résumé
        console.log('\n📌 RÉSUMÉ:');
        if (data.type === 'image' && data.image_url) {
          console.log('✅ Le workflow N8N avec Replicate fonctionne parfaitement !');
          console.log('✅ Image générée et URL retournée');
          console.log('✅ Format de réponse correct');
        } else {
          console.log('⚠️  Le workflow a répondu mais le format est inattendu');
          console.log('   Type reçu:', data.type);
          console.log('   image_url présent:', !!data.image_url);
        }

      } catch (parseError) {
        console.log('❌ Erreur lors du parsing JSON:', parseError.message);
        console.log('Réponse brute:', text);
      }

    } else {
      console.log('❌ Erreur HTTP:', response.status);
      const errorText = await response.text();
      console.log('Détails:', errorText);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }

  // Test 2: Vérifier le format avec un prompt différent
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 Test 2: Génération d\'image avec "\\image une licorne arc-en-ciel"...\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '\\image une licorne arc-en-ciel',
        type: 'text'
      })
    });

    if (response.status === 200) {
      const text = await response.text();
      const parsed = JSON.parse(text);
      const data = Array.isArray(parsed) ? parsed[0] : parsed;

      console.log('✅ Status:', response.status);
      console.log('✅ Type:', data.type);
      console.log('✅ Image URL:', data.image_url ? 'Présent' : 'Manquant');
      console.log('📄 Réponse:');
      console.log(JSON.stringify(data, null, 2));

    } else {
      console.log('❌ Erreur:', response.status);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Instructions pour ajouter des logs dans N8N:\n');
  console.log('1. Ouvrez votre workflow dans N8N');
  console.log('2. Ajoutez un nœud "Code" (JavaScript) après le nœud Replicate');
  console.log('3. Ajoutez ce code pour logger les données:\n');
  console.log('   console.log("🎨 Replicate Response:", JSON.stringify($input.all(), null, 2));');
  console.log('   return $input.all();');
  console.log('\n4. Vérifiez les logs dans N8N > Executions');
  console.log('5. Recherchez les logs commençant par "🎨 Replicate Response:"');
}

testN8NReplicate();

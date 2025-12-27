// Test de la clé API Together AI pour génération d'images
const TOGETHER_API_KEY = 'VOTRE_CLE_API_ICI'; // Remplacez par votre clé

async function testTogetherAI() {
  console.log('🧪 Test de la clé API Together AI\n');
  console.log('📝 Clé API:', TOGETHER_API_KEY.substring(0, 15) + '...');

  // Test avec FLUX.1-schnell (rapide et gratuit)
  console.log('\n🖼️  Test de génération d\'image avec FLUX.1-schnell...');

  try {
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt: 'a cat astronaut floating in space',
        width: 1024,
        height: 768,
        steps: 4,
        n: 1
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.status === 200) {
      const data = await response.json();
      console.log('\n✅ SUCCÈS ! Votre clé API Together AI fonctionne parfaitement !');
      console.log('✅ Image générée avec succès !');
      console.log('\n📄 Réponse complète:');
      console.log(JSON.stringify(data, null, 2));

      // L'URL de l'image est dans data.data[0].url
      if (data.data && data.data[0] && data.data[0].url) {
        console.log('\n🖼️  URL de l\'image:', data.data[0].url);
        console.log('\n💡 Vous pouvez ouvrir cette URL dans votre navigateur pour voir l\'image.');

        // Optionnel: télécharger l'image
        console.log('\n📥 Téléchargement de l\'image...');
        const imageResponse = await fetch(data.data[0].url);
        const imageBlob = await imageResponse.blob();
        const fs = require('fs');
        const buffer = Buffer.from(await imageBlob.arrayBuffer());
        fs.writeFileSync('test-together-output.png', buffer);
        console.log('✅ Image sauvegardée: test-together-output.png');
      }

    } else if (response.status === 401) {
      console.log('❌ Clé API invalide ou manquante');
      const error = await response.text();
      console.log('Erreur:', error);
      console.log('\n💡 Vérifiez que vous avez bien copié la clé complète depuis:');
      console.log('   https://api.together.xyz/settings/api-keys');

    } else if (response.status === 429) {
      console.log('⚠️  Limite de taux atteinte (429)');
      const error = await response.text();
      console.log('Détails:', error);
      console.log('\n💡 Attendez quelques instants avant de réessayer.');

    } else if (response.status === 402) {
      console.log('❌ Crédits insuffisants (402)');
      const error = await response.text();
      console.log('Détails:', error);
      console.log('\n💡 Ajoutez des crédits sur: https://api.together.xyz/settings/billing');

    } else {
      console.log('❌ Erreur:', response.status);
      const error = await response.text();
      console.log('Détails:', error);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }

  console.log('\n📊 Informations utiles:');
  console.log('👉 Dashboard: https://api.together.xyz');
  console.log('👉 API Keys: https://api.together.xyz/settings/api-keys');
  console.log('👉 Documentation: https://docs.together.ai/docs/quickstart');
  console.log('👉 Pricing: https://www.together.ai/pricing');
  console.log('\n💰 Modèles recommandés pour images:');
  console.log('   - black-forest-labs/FLUX.1-schnell (le plus rapide, ~$0.003/image)');
  console.log('   - black-forest-labs/FLUX.1-dev (meilleure qualité, ~$0.025/image)');
  console.log('   - stabilityai/stable-diffusion-xl-base-1.0 (classique, ~$0.015/image)');
}

testTogetherAI();

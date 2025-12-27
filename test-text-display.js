// Test pour vérifier l'affichage du texte
const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/ai-agent-fiable';

async function testTextDisplay() {
  console.log('📝 Test de l\'affichage du texte\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '\\text capitale de Haiti',
        type: 'text'
      })
    });

    console.log('Status:', response.status);
    const text = await response.text();
    const parsed = JSON.parse(text);
    const data = Array.isArray(parsed) ? parsed[0] : parsed;

    console.log('\n📦 Données brutes:');
    console.log(JSON.stringify(data, null, 2));

    // Simuler ce que fait normalizedData
    const normalizedData = {
      type: data.type || 'text',
      prompt: 'capitale de Haiti',
      response: data.content || data.response || '',
      source: 'text',
      originalMessage: '\\text capitale de Haiti',
      success: data.success,
      metadata: data.metadata
    };

    console.log('\n📦 Données normalisées:');
    console.log(JSON.stringify(normalizedData, null, 2));

    console.log('\n💬 Texte à afficher:');
    console.log('Response:', normalizedData.response);
    console.log('Type:', normalizedData.type);
    console.log('Longueur:', normalizedData.response.length);

    // Vérifier la condition d'affichage
    const textResponse = normalizedData.response || normalizedData.content;
    const shouldDisplay = textResponse && normalizedData.type === 'text';

    console.log('\n✅ Conditions d\'affichage:');
    console.log('textResponse existe:', !!textResponse);
    console.log('type === "text":', normalizedData.type === 'text');
    console.log('Devrait afficher:', shouldDisplay);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testTextDisplay();

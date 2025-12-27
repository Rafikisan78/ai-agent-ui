// Test pour voir le format exact du payload reçu par N8N

const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable';

async function testPayloadFormat() {
  console.log('🔍 Test du format de payload\n');

  const payload = {
    message: "/video un chat qui court dans un jardin",
    timestamp: new Date().toISOString()
  };

  console.log('📤 Payload envoyé :');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

  console.log('📋 Ce que Validate Input devrait recevoir :');
  console.log('- Si N8N enveloppe : { body: { message: "...", timestamp: "..." } }');
  console.log('- Si N8N ne enveloppe pas : { message: "...", timestamp: "..." }');
  console.log('');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      const result = Array.isArray(data) ? data[0] : data;

      console.log('✅ Réponse reçue');
      console.log('Type détecté:', result.metadata?.inputType || result.type);
      console.log('');

      if (result.metadata?.inputType === 'video-generation') {
        console.log('✅ SUCCÈS - La vidéo est détectée !');
      } else {
        console.log('❌ ÉCHEC - Détection incorrecte');
        console.log('Reçu:', result.metadata?.inputType || result.type);
      }
    } else {
      console.log('❌ Erreur HTTP:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

testPayloadFormat();

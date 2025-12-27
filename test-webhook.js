// Script de test Node.js pour vérifier le webhook N8N
const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable';

async function testWebhook() {
    console.log('🧪 Test du webhook N8N...\n');
    console.log('URL:', WEBHOOK_URL);

    const payload = {
        message: "/video un chat qui joue avec une balle",
        timestamp: new Date().toISOString()
    };

    console.log('⚠️  IMPORTANT: Assurez-vous que le workflow "AI Agent - Async Video Generation" est bien importé et ACTIF dans N8N');

    console.log('\n📤 Payload envoyé:');
    console.log(JSON.stringify(payload, null, 2));

    try {
        const startTime = Date.now();
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log('\n⏱️  Temps de réponse:', duration, 'ms');
        console.log('📊 Status HTTP:', response.status, response.statusText);

        if (response.ok) {
            // Récupérer le texte brut d'abord
            const text = await response.text();
            console.log('\n📄 Réponse brute:');
            console.log(text);

            // Essayer de parser en JSON
            if (text) {
                try {
                    const data = JSON.parse(text);
                    console.log('\n✅ Succès! Réponse JSON:');
                    console.log(JSON.stringify(data, null, 2));
                } catch (e) {
                    console.log('\n⚠️  La réponse n\'est pas du JSON valide');
                }
            } else {
                console.log('\n⚠️  Réponse vide');
            }
        } else {
            console.error('\n❌ Erreur HTTP:', response.status);
            const text = await response.text();
            console.error('Réponse:', text);
        }
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Exécuter le test
testWebhook();

// Créer le workflow avec structure minimale compatible API

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';

async function createSimpleWorkflow() {
  console.log('🚀 Création du workflow simplifié...\n');

  const workflow = {
    name: "Video-Voice-Text Watcher",
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: "voice-text-video",
          responseMode: "responseNode",
          options: {}
        },
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1.1,
        position: [240, 300]
      },
      {
        parameters: {
          functionCode: `// Log et analyse de la requête
const body = $input.first().json.body || $input.first().json;
console.log('📥 Requête:', JSON.stringify(body, null, 2));

const isVoice = body.audio_data || body.audioData || body.type === 'voice';
const message = body.message || '';
const isImage = message.includes('/image');
const isVideo = message.includes('/video');

console.log('Type:', { isVoice, isImage, isVideo });

return {
  json: {
    ...body,
    requestType: isVoice ? 'voice' : isImage ? 'image' : isVideo ? 'video' : 'text',
    timestamp: new Date().toISOString()
  }
};`
        },
        name: "Analyze Request",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [460, 300]
      },
      {
        parameters: {
          respondWith: "json",
          responseBody: "={{ $json }}",
          options: {}
        },
        name: "Respond to Webhook",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1.1,
        position: [680, 300]
      }
    ],
    connections: {
      "Webhook": {
        main: [[{ node: "Analyze Request", type: "main", index: 0 }]]
      },
      "Analyze Request": {
        main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]]
      }
    },
    settings: {},
    staticData: null
  };

  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur:', response.status);
      console.error(error);
      return;
    }

    const created = await response.json();
    console.log('✅ Workflow de base créé!');
    console.log(`📋 ID: ${created.id}`);
    console.log(`🔗 URL: ${N8N_BASE_URL}/workflow/${created.id}`);
    console.log(`\n📝 Prochaine étape:`);
    console.log(`1. Ouvrez le workflow dans N8N`);
    console.log(`2. Ajoutez manuellement les nœuds suivants:`);
    console.log(`   - Whisper (OpenAI) pour la transcription audio`);
    console.log(`   - ChatGPT pour les réponses texte`);
    console.log(`   - DALL-E pour les images`);
    console.log(`   - Replicate pour les vidéos`);
    console.log(`3. Activez le workflow`);
    console.log(`\n💾 Ajoutez dans .env:`);
    console.log(`VITE_N8N_VOICE_WORKFLOW_ID=${created.id}`);
    console.log(`VITE_N8N_VOICE_WEBHOOK_URL=${N8N_BASE_URL}/webhook/voice-text-video`);

    return created;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createSimpleWorkflow();

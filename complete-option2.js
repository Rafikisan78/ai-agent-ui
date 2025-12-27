// Compléter le workflow pour l'Option 2 (Whisper + ChatGPT + DALL-E + Replicate)

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'EM3TcglVa2ngfwRF';

async function completeWorkflow() {
  console.log('🚀 Complétion du workflow pour Option 2...\n');

  try {
    // 1. Récupérer le workflow actuel
    console.log('📥 Récupération du workflow...');
    const getResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    const workflow = await getResponse.json();
    console.log(`✅ Workflow récupéré: ${workflow.nodes.length} nœuds actuels\n`);

    // 2. Créer tous les nouveaux nœuds
    console.log('🔧 Ajout des nouveaux nœuds...\n');

    // Garder les 3 nœuds existants
    const existingNodes = workflow.nodes;

    // Modifier le nœud "Analyze Request" pour détecter voice/text/image/video
    const analyzeNode = existingNodes.find(n => n.name === 'Analyze Request');
    analyzeNode.parameters.functionCode = `// [LOG] Analyse du type de requête
console.log('═'.repeat(60));
console.log('📥 [ANALYZE REQUEST] Début');

const body = $input.first().json.body || $input.first().json;
console.log('[ANALYZE] Body reçu:', JSON.stringify(body, null, 2));

const isVoice = body.type === 'voice' || body.audio_data;
const message = body.message || '';
const isImage = message.toLowerCase().includes('/image');
const isVideo = message.toLowerCase().includes('/video');

const detectedType = isVoice ? 'voice' : isImage ? 'image' : isVideo ? 'video' : 'text';

console.log('[ANALYZE] Détection:', {
  isVoice,
  isImage,
  isVideo,
  detectedType,
  messageLength: message.length,
  hasAudioData: !!body.audio_data
});

console.log('✅ [ANALYZE REQUEST] Type détecté:', detectedType);
console.log('═'.repeat(60));

return {
  json: {
    ...body,
    requestType: detectedType,
    timestamp: new Date().toISOString()
  }
};`;

    // Nouveaux nœuds à ajouter
    const newNodes = [
      // Switch pour router voice/text
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true },
            conditions: [
              {
                leftValue: "={{ $json.requestType }}",
                rightValue: "voice",
                operator: { type: "string", operation: "equals" }
              },
              {
                leftValue: "={{ $json.requestType }}",
                rightValue: "text",
                operator: { type: "string", operation: "equals" }
              }
            ]
          }
        },
        name: "Route Voice or Text",
        type: "n8n-nodes-base.switch",
        typeVersion: 3,
        position: [680, 300]
      },

      // Traitement texte simple
      {
        parameters: {
          functionCode: `// [LOG] Traitement texte
console.log('═'.repeat(60));
console.log('💬 [PROCESS TEXT] Début');

const data = $input.first().json;
console.log('[PROCESS TEXT] Message:', data.message);
console.log('[PROCESS TEXT] Request type:', data.requestType);

const result = {
  message: data.message || '',
  source: 'text',
  timestamp: new Date().toISOString()
};

console.log('✅ [PROCESS TEXT] Traitement terminé');
console.log('[PROCESS TEXT] Output:', result);
console.log('═'.repeat(60));

return { json: result };`
        },
        name: "Process Text Input",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [900, 400]
      },

      // Préparation audio pour Whisper
      {
        parameters: {
          functionCode: `// [LOG] Préparation audio
console.log('═'.repeat(60));
console.log('🎤 [PREPARE AUDIO] Début');

const data = $input.first().json;
const audioData = data.audio_data || data.audioData;

console.log('[PREPARE AUDIO] Taille audio base64:', audioData ? audioData.length : 0);
console.log('[PREPARE AUDIO] Format:', data.format || 'webm');

if (!audioData) {
  console.error('❌ [PREPARE AUDIO] Aucune donnée audio!');
  throw new Error('Aucune donnée audio');
}

// Décoder base64 en buffer
const audioBuffer = Buffer.from(audioData, 'base64');
console.log('[PREPARE AUDIO] Buffer créé:', audioBuffer.length, 'bytes');

console.log('✅ [PREPARE AUDIO] Audio prêt pour Whisper');
console.log('═'.repeat(60));

return {
  json: {
    format: data.format || 'webm'
  },
  binary: {
    data: {
      data: audioBuffer,
      mimeType: 'audio/webm',
      fileName: 'voice.webm'
    }
  }
};`
        },
        name: "Prepare Audio for Whisper",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [900, 200]
      },

      // Whisper (OpenAI) - Transcription
      {
        parameters: {
          resource: "audio",
          operation: "transcribe",
          binaryPropertyName: "data",
          options: {
            language: "fr"
          }
        },
        name: "Whisper Transcription",
        type: "n8n-nodes-base.openAi",
        typeVersion: 1.3,
        position: [1120, 200],
        credentials: {
          openAiApi: {
            name: "OpenAI Account"
          }
        }
      },

      // Extraire la transcription
      {
        parameters: {
          functionCode: `// [LOG] Extraction transcription
console.log('═'.repeat(60));
console.log('📝 [EXTRACT TRANSCRIPTION] Début');

const data = $input.first().json;
console.log('[EXTRACT] Data reçue:', JSON.stringify(data, null, 2));

const transcription = data.text || '';
console.log('[EXTRACT] Transcription:', transcription);
console.log('[EXTRACT] Longueur:', transcription.length, 'caractères');

const result = {
  message: transcription,
  source: 'voice',
  timestamp: new Date().toISOString()
};

console.log('✅ [EXTRACT TRANSCRIPTION] Terminé');
console.log('[EXTRACT] Output:', result);
console.log('═'.repeat(60));

return { json: result };`
        },
        name: "Extract Transcription",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [1340, 200]
      },

      // Merge voice et text
      {
        parameters: {
          mode: "mergeByIndex"
        },
        name: "Merge Voice and Text",
        type: "n8n-nodes-base.merge",
        typeVersion: 2.1,
        position: [1560, 300]
      },

      // Détecter image/video dans le message
      {
        parameters: {
          functionCode: `// [LOG] Détection du type de contenu
console.log('═'.repeat(60));
console.log('🔍 [DETECT CONTENT] Début');

const data = $input.first().json;
const message = data.message || '';

console.log('[DETECT] Message original:', message);
console.log('[DETECT] Source:', data.source);

const isImage = message.toLowerCase().includes('/image');
const isVideo = message.toLowerCase().includes('/video');

let prompt = message;
if (isImage) prompt = message.replace(/\\/image/gi, '').trim();
if (isVideo) prompt = message.replace(/\\/video/gi, '').trim();

const contentType = isImage ? 'image' : isVideo ? 'video' : 'text';

console.log('[DETECT] Détection:', {
  isImage,
  isVideo,
  contentType,
  originalLength: message.length,
  promptLength: prompt.length
});

const result = {
  originalMessage: message,
  prompt: prompt,
  type: contentType,
  source: data.source
};

console.log('✅ [DETECT CONTENT] Type détecté:', contentType);
console.log('[DETECT] Prompt final:', prompt);
console.log('═'.repeat(60));

return { json: result };`
        },
        name: "Detect Content Type",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [1780, 300]
      },

      // Router final (text/image/video)
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true },
            conditions: [
              {
                leftValue: "={{ $json.type }}",
                rightValue: "text",
                operator: { type: "string", operation: "equals" }
              },
              {
                leftValue: "={{ $json.type }}",
                rightValue: "image",
                operator: { type: "string", operation: "equals" }
              },
              {
                leftValue: "={{ $json.type }}",
                rightValue: "video",
                operator: { type: "string", operation: "equals" }
              }
            ]
          }
        },
        name: "Route Content Type",
        type: "n8n-nodes-base.switch",
        typeVersion: 3,
        position: [2000, 300]
      },

      // ChatGPT pour texte
      {
        parameters: {
          resource: "text",
          operation: "message",
          modelId: "gpt-4",
          messages: {
            values: [
              {
                role: "user",
                content: "={{ $json.prompt }}"
              }
            ]
          }
        },
        name: "ChatGPT Response",
        type: "n8n-nodes-base.openAi",
        typeVersion: 1.3,
        position: [2220, 300],
        credentials: {
          openAiApi: {
            name: "OpenAI Account"
          }
        }
      },

      // Formater réponse texte
      {
        parameters: {
          functionCode: `// [LOG] Formatage réponse texte
console.log('═'.repeat(60));
console.log('💬 [FORMAT TEXT] Début');

const data = $input.first().json;
console.log('[FORMAT TEXT] Data ChatGPT:', JSON.stringify(data, null, 2).substring(0, 500));

const response = data.choices?.[0]?.message?.content || data.text || '';
console.log('[FORMAT TEXT] Réponse extraite:', response.substring(0, 200));

const result = {
  type: 'text',
  response: response,
  prompt: $('Detect Content Type').item.json.prompt,
  source: $('Detect Content Type').item.json.source
};

console.log('✅ [FORMAT TEXT] Formatage terminé');
console.log('[FORMAT TEXT] Type:', result.type);
console.log('[FORMAT TEXT] Longueur réponse:', response.length);
console.log('═'.repeat(60));

return { json: result };`
        },
        name: "Format Text Response",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [2440, 300]
      },

      // DALL-E pour images
      {
        parameters: {
          resource: "image",
          operation: "generate",
          prompt: "={{ $json.prompt }}",
          options: {
            size: "1024x1024",
            n: 1
          }
        },
        name: "DALL-E Generate Image",
        type: "n8n-nodes-base.openAi",
        typeVersion: 1.3,
        position: [2220, 150],
        credentials: {
          openAiApi: {
            name: "OpenAI Account"
          }
        }
      },

      // Formater réponse image
      {
        parameters: {
          functionCode: `// [LOG] Formatage réponse image
console.log('═'.repeat(60));
console.log('🖼️ [FORMAT IMAGE] Début');

const data = $input.first().json;
console.log('[FORMAT IMAGE] Data DALL-E:', JSON.stringify(data, null, 2).substring(0, 500));

const imageUrl = data.data?.[0]?.url || '';
console.log('[FORMAT IMAGE] URL extraite:', imageUrl);

const result = {
  type: 'image',
  response: 'Image générée avec succès',
  image_url: imageUrl,
  prompt: $('Detect Content Type').item.json.prompt,
  source: $('Detect Content Type').item.json.source
};

console.log('✅ [FORMAT IMAGE] Formatage terminé');
console.log('[FORMAT IMAGE] Type:', result.type);
console.log('[FORMAT IMAGE] Has URL:', !!imageUrl);
console.log('═'.repeat(60));

return { json: result };`
        },
        name: "Format Image Response",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [2440, 150]
      },

      // Replicate pour vidéos
      {
        parameters: {
          url: "https://api.replicate.com/v1/predictions",
          method: "POST",
          authentication: "predefinedCredentialType",
          nodeCredentialType: "replicateApi",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: "Content-Type",
                value: "application/json"
              }
            ]
          },
          sendBody: true,
          specifyBody: "json",
          jsonBody: `={
  "version": "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
  "input": {
    "prompt": "{{ $json.prompt }}"
  }
}`,
          options: {}
        },
        name: "Replicate Video Generation",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [2220, 450],
        credentials: {
          replicateApi: {
            name: "Replicate Account"
          }
        }
      },

      // Formater réponse vidéo
      {
        parameters: {
          functionCode: `// [LOG] Formatage réponse vidéo
console.log('═'.repeat(60));
console.log('🎬 [FORMAT VIDEO] Début');

const data = $input.first().json;
console.log('[FORMAT VIDEO] Data Replicate:', JSON.stringify(data, null, 2).substring(0, 500));

const taskId = data.id || '';
console.log('[FORMAT VIDEO] Task ID:', taskId);
console.log('[FORMAT VIDEO] Status:', data.status || 'starting');

const result = {
  type: 'video',
  response: 'Vidéo en cours de génération',
  task_id: taskId,
  status: 'processing',
  prompt: $('Detect Content Type').item.json.prompt,
  source: $('Detect Content Type').item.json.source
};

console.log('✅ [FORMAT VIDEO] Formatage terminé');
console.log('[FORMAT VIDEO] Type:', result.type);
console.log('[FORMAT VIDEO] Task ID présent:', !!taskId);
console.log('═'.repeat(60));

return { json: result };`
        },
        name: "Format Video Response",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [2440, 450]
      },

      // Merge toutes les réponses
      {
        parameters: {
          mode: "mergeByIndex"
        },
        name: "Merge All Responses",
        type: "n8n-nodes-base.merge",
        typeVersion: 2.1,
        position: [2660, 300]
      }
    ];

    // Combiner tous les nœuds
    workflow.nodes = [...existingNodes, ...newNodes];

    // 3. Configurer les connexions
    workflow.connections = {
      "Webhook": {
        main: [[{ node: "Analyze Request", type: "main", index: 0 }]]
      },
      "Analyze Request": {
        main: [[{ node: "Route Voice or Text", type: "main", index: 0 }]]
      },
      "Route Voice or Text": {
        main: [
          [{ node: "Prepare Audio for Whisper", type: "main", index: 0 }],  // voice
          [{ node: "Process Text Input", type: "main", index: 0 }]          // text
        ]
      },
      "Prepare Audio for Whisper": {
        main: [[{ node: "Whisper Transcription", type: "main", index: 0 }]]
      },
      "Whisper Transcription": {
        main: [[{ node: "Extract Transcription", type: "main", index: 0 }]]
      },
      "Extract Transcription": {
        main: [[{ node: "Merge Voice and Text", type: "main", index: 0 }]]
      },
      "Process Text Input": {
        main: [[{ node: "Merge Voice and Text", type: "main", index: 1 }]]
      },
      "Merge Voice and Text": {
        main: [[{ node: "Detect Content Type", type: "main", index: 0 }]]
      },
      "Detect Content Type": {
        main: [[{ node: "Route Content Type", type: "main", index: 0 }]]
      },
      "Route Content Type": {
        main: [
          [{ node: "ChatGPT Response", type: "main", index: 0 }],        // text
          [{ node: "DALL-E Generate Image", type: "main", index: 0 }],   // image
          [{ node: "Replicate Video Generation", type: "main", index: 0 }] // video
        ]
      },
      "ChatGPT Response": {
        main: [[{ node: "Format Text Response", type: "main", index: 0 }]]
      },
      "DALL-E Generate Image": {
        main: [[{ node: "Format Image Response", type: "main", index: 0 }]]
      },
      "Replicate Video Generation": {
        main: [[{ node: "Format Video Response", type: "main", index: 0 }]]
      },
      "Format Text Response": {
        main: [[{ node: "Merge All Responses", type: "main", index: 0 }]]
      },
      "Format Image Response": {
        main: [[{ node: "Merge All Responses", type: "main", index: 1 }]]
      },
      "Format Video Response": {
        main: [[{ node: "Merge All Responses", type: "main", index: 2 }]]
      },
      "Merge All Responses": {
        main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]]
      }
    };

    console.log(`✅ ${newNodes.length} nouveaux nœuds ajoutés`);
    console.log(`📊 Total: ${workflow.nodes.length} nœuds\n`);

    // 4. Sauvegarder
    console.log('💾 Sauvegarde du workflow complet...');

    const cleanWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
      staticData: workflow.staticData || null
    };

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
      console.error('❌ Erreur sauvegarde:', updateResponse.status);
      console.error(error);
      return;
    }

    console.log('✅ Workflow sauvegardé!\n');

    // 5. Désactiver puis réactiver
    console.log('🔄 Réactivation du workflow...');

    await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}/deactivate`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await fetch(`${N8N_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}/activate`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    console.log('✅ Workflow réactivé!\n');

    console.log('═'.repeat(70));
    console.log('🎉 OPTION 2 COMPLÉTÉE AVEC SUCCÈS!');
    console.log('═'.repeat(70));

    console.log('\n📋 Workflow complet avec:');
    console.log('  ✅ Whisper AI (transcription audio)');
    console.log('  ✅ ChatGPT (réponses texte)');
    console.log('  ✅ DALL-E (génération d\'images)');
    console.log('  ✅ Replicate (génération de vidéos)');

    console.log('\n⚠️ IMPORTANT: Vérifier les credentials dans N8N');
    console.log('  1. Ouvrir: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF');
    console.log('  2. Vérifier que les nœuds OpenAI et Replicate ont leurs credentials');
    console.log('  3. Sauvegarder si nécessaire');

    console.log('\n🧪 Tests suggérés:');
    console.log('  1. Mode Audio: "Bonjour" → Réponse ChatGPT');
    console.log('  2. Mode Audio: "Génère une image de chat" → DALL-E');
    console.log('  3. Mode Audio: "Crée une vidéo de papillon" → Replicate');
    console.log('  4. Mode Texte: Taper directement un message');

    console.log('\n🚀 Ouvrir l\'application: http://localhost:3001');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

completeWorkflow();

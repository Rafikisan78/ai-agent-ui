// Créer le nouveau workflow "Video-Voice-Text Watcher" avec gestion vocale

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';

async function createVoiceWorkflow() {
  console.log('🚀 Création du workflow "Video-Voice-Text Watcher"...\n');

  const workflow = {
    name: "Video-Voice-Text Watcher",
    nodes: [
      // 1. Webhook d'entrée
      {
        parameters: {
          httpMethod: "POST",
          path: "voice-text-video",
          responseMode: "responseNode",
          options: {}
        },
        id: "webhook-voice",
        name: "Webhook Voice Input",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1.1,
        position: [240, 300],
        webhookId: "voice-webhook-001"
      },

      // 2. Function pour logger l'entrée
      {
        parameters: {
          functionCode: `// Log de la requête entrante
const inputData = $input.all();
console.log('📥 Requête reçue:', JSON.stringify(inputData, null, 2));

const body = $input.first().json.body || $input.first().json;
console.log('📋 Body:', JSON.stringify(body, null, 2));

// Déterminer le type de requête
const isVoice = body.audio_data || body.audioData || body.type === 'voice';
const isText = body.message && !isVoice;
const isImage = body.message && body.message.includes('/image');
const isVideo = body.message && body.message.includes('/video');

console.log('🔍 Type détecté:', { isVoice, isText, isImage, isVideo });

return {
  json: {
    ...body,
    requestType: isVoice ? 'voice' : isImage ? 'image' : isVideo ? 'video' : 'text',
    timestamp: new Date().toISOString()
  }
};`
        },
        id: "log-input",
        name: "Log Input",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [460, 300]
      },

      // 3. Switch pour router selon le type
      {
        parameters: {
          conditions: {
            options: {
              caseSensitive: true,
              leftValue: "",
              typeValidation: "strict"
            },
            conditions: [
              {
                id: "voice-condition",
                leftValue: "={{ $json.requestType }}",
                rightValue: "voice",
                operator: {
                  type: "string",
                  operation: "equals"
                }
              },
              {
                id: "text-condition",
                leftValue: "={{ $json.requestType }}",
                rightValue: "text",
                operator: {
                  type: "string",
                  operation: "equals"
                }
              },
              {
                id: "image-condition",
                leftValue: "={{ $json.requestType }}",
                rightValue: "image",
                operator: {
                  type: "string",
                  operation: "equals"
                }
              },
              {
                id: "video-condition",
                leftValue: "={{ $json.requestType }}",
                rightValue: "video",
                operator: {
                  type: "string",
                  operation: "equals"
                }
              }
            ],
            combinator: "and"
          },
          options: {}
        },
        id: "switch-type",
        name: "Route by Type",
        type: "n8n-nodes-base.switch",
        typeVersion: 3,
        position: [680, 300]
      },

      // 4. Traitement VOIX - Conversion audio vers texte
      {
        parameters: {
          functionCode: `// Préparation pour Whisper API
const data = $input.first().json;
console.log('🎤 Traitement voix détecté');

// L'audio sera en base64 depuis le frontend
const audioData = data.audio_data || data.audioData;

if (!audioData) {
  throw new Error('Aucune donnée audio fournie');
}

console.log('📊 Taille audio (base64):', audioData.length);

return {
  json: {
    audioData: audioData,
    format: data.format || 'webm',
    language: data.language || 'fr',
    timestamp: data.timestamp
  }
};`
        },
        id: "prepare-whisper",
        name: "Prepare Audio for Whisper",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [900, 200]
      },

      // 5. Appel Whisper (OpenAI Speech-to-Text)
      {
        parameters: {
          resource: "audio",
          operation: "transcribe",
          binaryPropertyName: "data",
          options: {
            language: "fr",
            prompt: "",
            temperature: 0
          }
        },
        id: "whisper-api",
        name: "Whisper STT",
        type: "n8n-nodes-base.openAi",
        typeVersion: 1.3,
        position: [1120, 200],
        credentials: {
          openAiApi: {
            id: "openai-credential",
            name: "OpenAI Account"
          }
        }
      },

      // 6. Log du texte transcrit
      {
        parameters: {
          functionCode: `// Log de la transcription
const transcription = $input.first().json;
console.log('✅ Transcription:', transcription.text);

return {
  json: {
    message: transcription.text,
    source: 'voice',
    timestamp: new Date().toISOString()
  }
};`
        },
        id: "log-transcription",
        name: "Log Transcription",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [1340, 200]
      },

      // 7. Traitement TEXTE classique
      {
        parameters: {
          functionCode: `// Traitement texte classique
const data = $input.first().json;
console.log('💬 Requête texte:', data.message);

return {
  json: {
    message: data.message,
    source: 'text',
    timestamp: data.timestamp || new Date().toISOString()
  }
};`
        },
        id: "process-text",
        name: "Process Text",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [900, 300]
      },

      // 8. Merge des branches voix et texte
      {
        parameters: {
          mode: "mergeByIndex"
        },
        id: "merge-voice-text",
        name: "Merge Voice & Text",
        type: "n8n-nodes-base.merge",
        typeVersion: 2.1,
        position: [1560, 250]
      },

      // 9. Détection image/video dans le message
      {
        parameters: {
          functionCode: `// Analyser si c'est une demande image ou vidéo
const data = $input.first().json;
const message = data.message || '';

const isImage = message.toLowerCase().includes('/image');
const isVideo = message.toLowerCase().includes('/video');

console.log('🔍 Analyse:', { message, isImage, isVideo });

let prompt = message;
if (isImage) {
  prompt = message.replace('/image', '').trim();
}
if (isVideo) {
  prompt = message.replace('/video', '').trim();
}

return {
  json: {
    originalMessage: message,
    prompt: prompt,
    type: isImage ? 'image' : isVideo ? 'video' : 'text',
    source: data.source,
    timestamp: data.timestamp
  }
};`
        },
        id: "analyze-request",
        name: "Analyze Request Type",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [1780, 250]
      },

      // 10. Router final (texte/image/vidéo)
      {
        parameters: {
          conditions: {
            options: {
              caseSensitive: true,
              leftValue: "",
              typeValidation: "strict"
            },
            conditions: [
              {
                id: "final-text",
                leftValue: "={{ $json.type }}",
                rightValue: "text",
                operator: {
                  type: "string",
                  operation: "equals"
                }
              },
              {
                id: "final-image",
                leftValue: "={{ $json.type }}",
                rightValue: "image",
                operator: {
                  type: "string",
                  operation: "equals"
                }
              },
              {
                id: "final-video",
                leftValue: "={{ $json.type }}",
                rightValue: "video",
                operator: {
                  type: "string",
                  operation: "equals"
                }
              }
            ],
            combinator: "and"
          },
          options: {}
        },
        id: "final-router",
        name: "Final Router",
        type: "n8n-nodes-base.switch",
        typeVersion: 3,
        position: [2000, 250]
      },

      // 11. Traitement IMAGE (DALL-E)
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
        id: "dalle-generate",
        name: "DALL-E Generate",
        type: "n8n-nodes-base.openAi",
        typeVersion: 1.3,
        position: [2220, 150],
        credentials: {
          openAiApi: {
            id: "openai-credential",
            name: "OpenAI Account"
          }
        }
      },

      // 12. Log réponse image
      {
        parameters: {
          functionCode: `const data = $input.first().json;
console.log('🖼️ Image générée:', data.data?.[0]?.url);

return {
  json: {
    type: 'image',
    response: 'Image générée avec succès',
    image_url: data.data?.[0]?.url,
    prompt: $('Analyze Request Type').item.json.prompt,
    source: $('Analyze Request Type').item.json.source
  }
};`
        },
        id: "log-image",
        name: "Log Image Response",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [2440, 150]
      },

      // 13. Traitement TEXTE (ChatGPT)
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
          },
          options: {}
        },
        id: "chatgpt-response",
        name: "ChatGPT Response",
        type: "n8n-nodes-base.openAi",
        typeVersion: 1.3,
        position: [2220, 250],
        credentials: {
          openAiApi: {
            id: "openai-credential",
            name: "OpenAI Account"
          }
        }
      },

      // 14. Log réponse texte
      {
        parameters: {
          functionCode: `const data = $input.first().json;
const response = data.choices?.[0]?.message?.content || data.text;

console.log('💬 Réponse ChatGPT:', response);

return {
  json: {
    type: 'text',
    response: response,
    prompt: $('Analyze Request Type').item.json.prompt,
    source: $('Analyze Request Type').item.json.source
  }
};`
        },
        id: "log-text-response",
        name: "Log Text Response",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [2440, 250]
      },

      // 15. Traitement VIDEO (Replicate)
      {
        parameters: {
          functionCode: `const data = $input.first().json;
console.log('🎬 Démarrage génération vidéo:', data.prompt);

return {
  json: {
    prompt: data.prompt,
    source: data.source,
    timestamp: data.timestamp
  }
};`
        },
        id: "prepare-video",
        name: "Prepare Video Request",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [2220, 350]
      },

      // 16. Appel Replicate pour vidéo
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
          bodyParameters: {
            parameters: [
              {
                name: "version",
                value: "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351"
              },
              {
                name: "input",
                value: "={{ {\"prompt\": $json.prompt} }}"
              }
            ]
          },
          options: {}
        },
        id: "replicate-video",
        name: "Replicate Video API",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [2440, 350],
        credentials: {
          replicateApi: {
            id: "replicate-credential",
            name: "Replicate Account"
          }
        }
      },

      // 17. Log réponse vidéo
      {
        parameters: {
          functionCode: `const data = $input.first().json;
console.log('🎬 Vidéo en cours:', data.id);

return {
  json: {
    type: 'video',
    response: 'Vidéo en cours de génération',
    task_id: data.id,
    status: 'processing',
    prompt: $('Prepare Video Request').item.json.prompt,
    source: $('Prepare Video Request').item.json.source
  }
};`
        },
        id: "log-video-response",
        name: "Log Video Response",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [2660, 350]
      },

      // 18. Merge final de toutes les réponses
      {
        parameters: {
          mode: "mergeByIndex"
        },
        id: "merge-all-responses",
        name: "Merge All Responses",
        type: "n8n-nodes-base.merge",
        typeVersion: 2.1,
        position: [2880, 250]
      },

      // 19. Réponse finale au webhook
      {
        parameters: {
          respondWith: "json",
          responseBody: "={{ $json }}",
          options: {
            responseHeaders: {
              entries: [
                {
                  name: "Content-Type",
                  value: "application/json"
                }
              ]
            }
          }
        },
        id: "webhook-response",
        name: "Webhook Response",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1.1,
        position: [3100, 250]
      }
    ],

    connections: {
      "Webhook Voice Input": {
        main: [[{ node: "Log Input", type: "main", index: 0 }]]
      },
      "Log Input": {
        main: [[{ node: "Route by Type", type: "main", index: 0 }]]
      },
      "Route by Type": {
        main: [
          [{ node: "Prepare Audio for Whisper", type: "main", index: 0 }], // voice
          [{ node: "Process Text", type: "main", index: 0 }],              // text
          [],                                                               // image (géré après)
          []                                                                // video (géré après)
        ]
      },
      "Prepare Audio for Whisper": {
        main: [[{ node: "Whisper STT", type: "main", index: 0 }]]
      },
      "Whisper STT": {
        main: [[{ node: "Log Transcription", type: "main", index: 0 }]]
      },
      "Log Transcription": {
        main: [[{ node: "Merge Voice & Text", type: "main", index: 0 }]]
      },
      "Process Text": {
        main: [[{ node: "Merge Voice & Text", type: "main", index: 1 }]]
      },
      "Merge Voice & Text": {
        main: [[{ node: "Analyze Request Type", type: "main", index: 0 }]]
      },
      "Analyze Request Type": {
        main: [[{ node: "Final Router", type: "main", index: 0 }]]
      },
      "Final Router": {
        main: [
          [{ node: "ChatGPT Response", type: "main", index: 0 }],         // text
          [{ node: "DALL-E Generate", type: "main", index: 0 }],          // image
          [{ node: "Prepare Video Request", type: "main", index: 0 }]     // video
        ]
      },
      "DALL-E Generate": {
        main: [[{ node: "Log Image Response", type: "main", index: 0 }]]
      },
      "ChatGPT Response": {
        main: [[{ node: "Log Text Response", type: "main", index: 0 }]]
      },
      "Prepare Video Request": {
        main: [[{ node: "Replicate Video API", type: "main", index: 0 }]]
      },
      "Replicate Video API": {
        main: [[{ node: "Log Video Response", type: "main", index: 0 }]]
      },
      "Log Image Response": {
        main: [[{ node: "Merge All Responses", type: "main", index: 0 }]]
      },
      "Log Text Response": {
        main: [[{ node: "Merge All Responses", type: "main", index: 1 }]]
      },
      "Log Video Response": {
        main: [[{ node: "Merge All Responses", type: "main", index: 2 }]]
      },
      "Merge All Responses": {
        main: [[{ node: "Webhook Response", type: "main", index: 0 }]]
      }
    },

    active: false,
    settings: {
      executionOrder: "v1"
    },
    versionId: "1"
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
      console.error('❌ Erreur lors de la création:', response.status);
      console.error(error);
      return;
    }

    const created = await response.json();
    console.log('✅ Workflow créé avec succès!');
    console.log(`📋 ID: ${created.id}`);
    console.log(`📛 Nom: ${created.name}`);
    console.log(`🔗 URL: ${N8N_BASE_URL}/workflow/${created.id}`);
    console.log(`\n🎯 Webhook URL: ${N8N_BASE_URL}/webhook/voice-text-video`);
    console.log(`\n⚠️ IMPORTANT: Ajoutez cet ID dans .env:`);
    console.log(`VITE_N8N_VOICE_WORKFLOW_ID=${created.id}`);

    return created;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createVoiceWorkflow();

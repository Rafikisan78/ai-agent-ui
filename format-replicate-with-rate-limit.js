// Formater la réponse Replicate avec gestion du rate limit
const input = $input.item.json;
const previousData = $('Detect Input Type').item.json;

console.log("🎨 DEBUG - Input complet:", JSON.stringify(input, null, 2));

// Vérifier si c'est une erreur de rate limit (429)
if (input.data && typeof input.data === 'string') {
  try {
    const errorData = JSON.parse(input.data);

    if (errorData.status === 429) {
      console.log("⚠️  Rate limit atteint!");
      return {
        json: {
          success: false,
          type: 'error',
          content: {
            message: 'Rate limit atteint',
            error: errorData.detail || 'Trop de requêtes. Attendez quelques secondes.',
            retryAfter: errorData.retry_after || 5
          },
          metadata: {
            inputType: previousData.inputType,
            command: previousData.command,
            originalMessage: previousData.originalMessage,
            statusCode: 429,
            solution: 'Ajoutez des crédits sur https://replicate.com/account/billing'
          },
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (e) {
    console.log("Erreur parsing:", e.message);
  }
}

// Extraire l'URL de l'image
const imageUrl = input.output?.[0] || null;

console.log("📊 Status:", input.status);
console.log("🖼️  Image URL:", imageUrl);

// Vérifier le succès
if (!imageUrl || input.status !== 'succeeded') {

  // Si le statut est "starting" ou "processing"
  if (input.status === 'starting' || input.status === 'processing') {
    return {
      json: {
        success: false,
        type: 'error',
        content: {
          message: 'L\'image est en cours de génération',
          error: 'Status: ' + input.status + '. Le header Prefer: wait n\'a pas attendu la fin.'
        },
        metadata: {
          inputType: previousData.inputType,
          command: previousData.command,
          originalMessage: previousData.originalMessage,
          predictionId: input.id,
          predictionUrl: input.urls?.get
        },
        timestamp: new Date().toISOString()
      }
    };
  }

  // Autre erreur
  return {
    json: {
      success: false,
      type: 'error',
      content: {
        message: 'Erreur lors de la génération de l\'image',
        error: input.error || 'URL d\'image non trouvée. Status: ' + input.status
      },
      metadata: {
        inputType: previousData.inputType,
        command: previousData.command,
        originalMessage: previousData.originalMessage,
        replicateStatus: input.status,
        predictionId: input.id
      },
      timestamp: new Date().toISOString()
    }
  };
}

// Succès!
return {
  json: {
    success: true,
    type: 'image',
    image_url: imageUrl,
    content: {
      url: imageUrl,
      description: previousData.prompt,
      originalPrompt: previousData.prompt
    },
    metadata: {
      inputType: previousData.inputType,
      command: previousData.command,
      originalMessage: previousData.originalMessage,
      model: 'flux-schnell',
      predictionId: input.id,
      metrics: input.metrics
    },
    timestamp: new Date().toISOString()
  }
};

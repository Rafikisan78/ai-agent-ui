// Service pour envoyer l'audio au workflow voice

const VOICE_WEBHOOK_URL = import.meta.env.VITE_N8N_VOICE_WEBHOOK_URL || 'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video'

/**
 * Envoyer un enregistrement vocal au workflow N8N
 * @param {Object} voiceData - { audio_data: base64, format: 'webm', duration: seconds }
 * @returns {Promise<Object>} - Réponse du workflow
 */
export async function sendVoiceToWorkflow(voiceData) {
  console.log('🎤 Envoi audio au workflow voice...')
  console.log('📊 Taille audio (base64):', voiceData.audio_data?.length || 0)

  try {
    const response = await fetch(VOICE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'voice',
        audio_data: voiceData.audio_data,
        format: voiceData.format || 'webm',
        duration: voiceData.duration,
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur webhook:', response.status, errorText)
      throw new Error(`Erreur ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Réponse reçue:', result)

    return {
      success: true,
      type: result.type || 'text',
      content: {
        text: result.response,
        image_url: result.image_url,
        task_id: result.task_id
      },
      metadata: {
        source: 'voice',
        prompt: result.prompt,
        inputType: result.type
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi vocal:', error)
    throw new Error(`Échec de l'envoi vocal: ${error.message}`)
  }
}

/**
 * Envoyer un message texte au workflow voice
 * @param {string} message - Le message texte
 * @returns {Promise<Object>} - Réponse du workflow
 */
export async function sendTextToVoiceWorkflow(message) {
  console.log('💬 Envoi texte au workflow voice:', message)

  try {
    const response = await fetch(VOICE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        type: 'text',
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Réponse reçue:', result)

    return {
      success: true,
      type: result.type || 'text',
      content: {
        text: result.response,
        image_url: result.image_url,
        task_id: result.task_id
      },
      metadata: {
        source: 'text',
        prompt: result.prompt,
        inputType: result.type,
        status: result.status
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
    throw new Error(`Échec de l'envoi: ${error.message}`)
  }
}

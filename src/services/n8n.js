/**
 * Service pour interagir avec le webhook N8N
 */

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL

/**
 * Déclenche un workflow N8N en envoyant un message au webhook
 * @param {string} message - Le message à envoyer au workflow
 * @returns {Promise<Object>} La réponse du webhook N8N
 * @throws {Error} En cas d'erreur réseau ou de réponse non-OK
 */
export async function triggerWorkflow(message) {
  if (!WEBHOOK_URL) {
    throw new Error('URL du webhook N8N non configurée. Vérifiez votre fichier .env')
  }

  if (!message || message.trim() === '') {
    throw new Error('Le message ne peut pas être vide')
  }

  try {
    const payload = {
      message: message.trim(),
      timestamp: new Date().toISOString()
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(
        `Erreur HTTP ${response.status}: ${response.statusText}`
      )
    }

    // Essayer de parser la réponse JSON
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      // Si la réponse n'est pas JSON, retourner le texte brut
      const text = await response.text()
      return {
        message: 'Réponse reçue (format non-JSON)',
        data: text
      }
    }
  } catch (error) {
    // Améliorer les messages d'erreur
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Impossible de se connecter au webhook N8N. Vérifiez votre connexion réseau et l\'URL du webhook.'
      )
    }
    throw error
  }
}

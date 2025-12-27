/**
 * Service de reconnaissance vocale et synthèse vocale
 * Utilise les APIs Web Speech quand disponibles
 */

/**
 * Vérifie si la reconnaissance vocale est supportée
 */
export function isSpeechRecognitionSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

/**
 * Vérifie si la synthèse vocale est supportée
 */
export function isSpeechSynthesisSupported() {
  return 'speechSynthesis' in window
}

/**
 * Crée une instance de reconnaissance vocale
 * @param {Function} onResult - Callback appelé avec le texte reconnu
 * @param {Function} onError - Callback appelé en cas d'erreur
 * @returns {Object} Instance de reconnaissance vocale
 */
export function createSpeechRecognition(onResult, onError) {
  if (!isSpeechRecognitionSupported()) {
    console.error('La reconnaissance vocale n\'est pas supportée par ce navigateur')
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'fr-FR'

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    if (onResult) {
      onResult(transcript)
    }
  }

  recognition.onerror = (event) => {
    console.error('Erreur de reconnaissance vocale:', event.error)
    if (onError) {
      onError(event.error)
    }
  }

  recognition.onend = () => {
    console.log('Reconnaissance vocale terminée')
  }

  return recognition
}

/**
 * Lit un texte à voix haute
 * @param {string} text - Texte à lire
 * @param {Object} options - Options de synthèse vocale
 */
export function speakText(text, options = {}) {
  if (!isSpeechSynthesisSupported()) {
    console.error('La synthèse vocale n\'est pas supportée par ce navigateur')
    return
  }

  // Annuler toute lecture en cours
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = options.lang || 'fr-FR'
  utterance.rate = options.rate || 1
  utterance.pitch = options.pitch || 1
  utterance.volume = options.volume || 1

  // Sélectionner une voix française si disponible
  const voices = window.speechSynthesis.getVoices()
  const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'))
  if (frenchVoice) {
    utterance.voice = frenchVoice
  }

  window.speechSynthesis.speak(utterance)

  return utterance
}

/**
 * Arrête la lecture vocale en cours
 */
export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Enregistre de l'audio depuis le microphone
 * @param {Function} onDataAvailable - Callback appelé avec les données audio
 * @returns {Promise<MediaRecorder>} Instance de MediaRecorder
 */
export async function createAudioRecorder(onDataAvailable) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && onDataAvailable) {
        onDataAvailable(event.data)
      }
    }

    return mediaRecorder
  } catch (error) {
    console.error('Erreur lors de l\'accès au microphone:', error)
    throw error
  }
}

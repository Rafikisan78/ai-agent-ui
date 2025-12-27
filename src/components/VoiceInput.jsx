import { useState, useEffect } from 'react'
import { createSpeechRecognition, isSpeechRecognitionSupported } from '../services/speech'

/**
 * Composant de saisie vocale
 * Permet d'enregistrer la voix de l'utilisateur et de la transcrire en texte
 */
export default function VoiceInput({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported())
  }, [])

  useEffect(() => {
    if (!isSupported) return

    const handleResult = (transcript) => {
      setIsListening(false)
      if (onTranscript) {
        onTranscript(transcript)
      }
    }

    const handleError = (error) => {
      console.error('Erreur de reconnaissance vocale:', error)
      setIsListening(false)
    }

    const rec = createSpeechRecognition(handleResult, handleError)
    setRecognition(rec)

    return () => {
      if (rec) {
        rec.abort()
      }
    }
  }, [isSupported, onTranscript])

  const toggleListening = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className="p-2 rounded-lg bg-slate-700 text-slate-500 cursor-not-allowed"
        title="La reconnaissance vocale n'est pas supportée par votre navigateur"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isListening
          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isListening ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement vocal'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    </button>
  )
}

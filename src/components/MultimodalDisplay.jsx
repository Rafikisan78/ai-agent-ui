import { useState } from 'react'
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '../services/speech'

/**
 * Composant d'affichage multimodal
 * Gère l'affichage de différents types de contenu : texte, image, audio, vidéo
 */
export default function MultimodalDisplay({ response, error, isLoading, elapsedTime }) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  // État vide par défaut
  if (!isLoading && !response && !error) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8">
        <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-lg font-medium">En attente de votre message</p>
          <p className="text-sm text-center max-w-md">
            Saisissez un message, utilisez la voix, ou uploadez un fichier pour déclencher le workflow N8N
          </p>
        </div>
      </div>
    )
  }

  // État de chargement
  if (isLoading) {
    const minutes = Math.floor((elapsedTime || 0) / 60)
    const seconds = (elapsedTime || 0) % 60
    const timeDisplay = elapsedTime > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : ''

    return (
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8">
        <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Traitement en cours...</p>
          <p className="text-sm">Le workflow N8N est en cours d'exécution</p>
          {timeDisplay && (
            <p className="text-xs text-blue-400 font-mono">
              Temps écoulé: {timeDisplay}
            </p>
          )}
        </div>
      </div>
    )
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-lg border border-red-900/50 p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Erreur</h3>
            <p className="text-slate-300 break-words">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // État de succès avec réponse
  if (response) {
    const responseType = response.type || 'text'
    const content = response.content || response

    const handleSpeak = () => {
      if (isSpeaking) {
        stopSpeaking()
        setIsSpeaking(false)
      } else {
        const textToSpeak = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
        speakText(textToSpeak)
        setIsSpeaking(true)
      }
    }

    return (
      <div className="bg-slate-800 rounded-xl shadow-lg border border-green-900/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400">Réponse N8N</h3>
              <p className="text-sm text-slate-400">Type: {responseType}</p>
            </div>
          </div>

          {/* Bouton de lecture vocale */}
          {isSpeechSynthesisSupported() && (
            <button
              onClick={handleSpeak}
              className={`p-2 rounded-lg transition-all ${
                isSpeaking
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              title={isSpeaking ? 'Arrêter la lecture' : 'Lire à voix haute'}
            >
              {isSpeaking ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Affichage selon le type de contenu */}
          {responseType === 'image' && content.url && (
            <div className="rounded-lg overflow-hidden">
              <img src={content.url} alt={content.description || 'Image générée'} className="w-full h-auto" />
              {content.description && (
                <p className="mt-2 text-sm text-slate-400">{content.description}</p>
              )}
            </div>
          )}

          {responseType === 'video' && content.url && (
            <div className="rounded-lg overflow-hidden">
              <video controls className="w-full h-auto">
                <source src={content.url} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
              {content.description && (
                <p className="mt-2 text-sm text-slate-400">{content.description}</p>
              )}
            </div>
          )}

          {responseType === 'audio' && content.url && (
            <div className="rounded-lg overflow-hidden">
              <audio controls className="w-full">
                <source src={content.url} type="audio/mpeg" />
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
              {content.description && (
                <p className="mt-2 text-sm text-slate-400">{content.description}</p>
              )}
            </div>
          )}

          {/* Affichage par défaut (texte/JSON) */}
          {(responseType === 'text' || !['image', 'video', 'audio'].includes(responseType)) && (
            <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-[600px]">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words">
                {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

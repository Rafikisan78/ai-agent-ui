import { useState, useEffect, useRef } from 'react'
import VoiceInput from './VoiceInput'
import VoiceRecorder from './VoiceRecorder'
import FileUpload from './FileUpload'

/**
 * Composant de saisie avec support voix amélioré
 * Supporte: texte, reconnaissance vocale (Web Speech), enregistrement audio (pour Whisper), fichiers
 */
export default function PromptInputWithVoice({ onSubmit, onVoiceSubmit, isLoading }) {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [voiceMode, setVoiceMode] = useState('text') // 'text' ou 'record'
  const textareaRef = useRef(null)

  // Auto-resize du textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    if ((message.trim() || selectedFile) && !isLoading) {
      onSubmit({ message: message.trim(), file: selectedFile })
      setMessage('')
      setSelectedFile(null)
      setShowFileUpload(false)
    }
  }

  const handleKeyDown = (e) => {
    // Ctrl+Enter pour soumettre
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleVoiceTranscript = (transcript) => {
    setMessage(transcript)
  }

  const handleVoiceRecorded = (voiceData) => {
    console.log('🎤 Audio enregistré, envoi au workflow...')
    if (onVoiceSubmit) {
      onVoiceSubmit(voiceData)
    }
  }

  const handleFileSelect = (file) => {
    setSelectedFile(file)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
        {/* Zone de texte */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Entrez votre message, utilisez la voix ou uploadez un fichier..."
          className="w-full px-4 py-3 bg-transparent text-white placeholder-slate-400
                   resize-none outline-none min-h-[120px] max-h-[400px]
                   disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
        />

        {/* Section upload de fichier */}
        {showFileUpload && (
          <div className="px-4 pb-3">
            <FileUpload onFileSelect={handleFileSelect} disabled={isLoading} />
          </div>
        )}

        {/* Barre d'outils */}
        <div className="px-4 py-3 border-t border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 hidden sm:block">
              Ctrl+Enter pour envoyer
            </span>

            {/* Bouton d'upload */}
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all ${
                showFileUpload ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Uploader un fichier"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Sélecteur de mode vocal */}
            <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setVoiceMode('text')}
                disabled={isLoading}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  voiceMode === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                } disabled:opacity-50`}
                title="Reconnaissance vocale instantanée (Web Speech)"
              >
                📝 Texte
              </button>
              <button
                type="button"
                onClick={() => setVoiceMode('record')}
                disabled={isLoading}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  voiceMode === 'record'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-white'
                } disabled:opacity-50`}
                title="Enregistrement audio pour Whisper (meilleure qualité)"
              >
                🎤 Audio
              </button>
            </div>

            {/* Bouton vocal selon le mode */}
            {voiceMode === 'text' ? (
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />
            ) : (
              <VoiceRecorder onVoiceRecorded={handleVoiceRecorded} isLoading={isLoading} />
            )}
          </div>

          {/* Bouton d'envoi */}
          <button
            type="submit"
            disabled={(!message.trim() && !selectedFile) || isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium
                     rounded-lg transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span>Envoyer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Indicateur du mode actif */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {voiceMode === 'text' && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Mode reconnaissance vocale instantanée (Web Speech API)
          </span>
        )}
        {voiceMode === 'record' && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            Mode enregistrement audio (Whisper AI - meilleure précision)
          </span>
        )}
      </div>
    </form>
  )
}

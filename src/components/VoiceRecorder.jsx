import { useState, useRef, useEffect } from 'react'

export default function VoiceRecorder({ onVoiceRecorded, isLoading }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      console.log('🎤 Demande d\'accès au microphone...')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('✅ Microphone autorisé')

      // Utiliser webm pour une meilleure compatibilité
      const options = { mimeType: 'audio/webm;codecs=opus' }

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn('⚠️ webm non supporté, utilisation du format par défaut')
        mediaRecorderRef.current = new MediaRecorder(stream)
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream, options)
      }

      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log('📊 Chunk audio:', event.data.size, 'bytes')
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        console.log('⏹️ Enregistrement arrêté')
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        console.log('📦 Blob créé:', blob.size, 'bytes')

        setAudioBlob(blob)

        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop())

        // Convertir en base64 et envoyer
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1]
          console.log('📤 Envoi audio (base64):', base64Audio.substring(0, 50) + '...')

          onVoiceRecorded({
            audio_data: base64Audio,
            format: 'webm',
            type: 'voice',
            duration: recordingTime
          })
        }
        reader.readAsDataURL(blob)
      }

      mediaRecorderRef.current.start(1000) // Capturer toutes les secondes
      setIsRecording(true)
      setRecordingTime(0)

      // Démarrer le timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      console.log('🔴 Enregistrement démarré')
    } catch (error) {
      console.error('❌ Erreur microphone:', error)
      alert('Erreur d\'accès au microphone. Vérifiez les permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('⏸️ Arrêt de l\'enregistrement...')
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setAudioBlob(null)
      setRecordingTime(0)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      console.log('❌ Enregistrement annulé')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !audioBlob && (
        <button
          onClick={startRecording}
          disabled={isLoading}
          className="p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Enregistrer un message vocal"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-mono text-red-700">
              {formatTime(recordingTime)}
            </span>
          </div>

          <button
            onClick={stopRecording}
            className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all"
            title="Arrêter l'enregistrement"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            onClick={cancelRecording}
            className="p-2 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-all"
            title="Annuler"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import PromptInputWithVoice from './components/PromptInputWithVoice'
import MultimodalDisplay from './components/MultimodalDisplay'
import Login from './components/Login'
import { triggerWorkflow } from './services/n8n'
import { sendVoiceToWorkflow } from './services/n8n-voice'
import { saveConversation, getConversationHistory, getVideoByTaskId } from './services/supabase'
import { getSession, saveSession, clearSession, isAuthenticated, getSupabaseSession, onAuthStateChange, signOut } from './services/auth'
import { notifyUserLogin, pingN8N, activateWorkflow } from './services/n8n-workflow'

/**
 * Composant principal de l'application
 * Gère l'état global, la communication avec N8N et l'historique des conversations
 */
function App() {
  const [user, setUser] = useState(null)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [videoPolling, setVideoPolling] = useState(null) // { taskId, startTime }
  const pollingIntervalRef = useRef(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [n8nConnected, setN8nConnected] = useState(false)

  // Vérifier la session au démarrage (localStorage + Supabase OAuth)
  useEffect(() => {
    // Vérifier d'abord la session locale
    const localSession = getSession()
    if (localSession) {
      setUser(localSession)
    }

    // Vérifier la session Supabase OAuth
    const checkSupabaseSession = async () => {
      const supabaseSession = await getSupabaseSession()
      if (supabaseSession?.user) {
        const userData = {
          email: supabaseSession.user.email,
          id: supabaseSession.user.id,
          provider: supabaseSession.user.app_metadata?.provider || 'email'
        }
        setUser(userData)
        saveSession(userData)
      }
    }

    checkSupabaseSession()

    // Écouter les changements d'authentification OAuth
    const unsubscribe = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = {
          email: session.user.email,
          id: session.user.id,
          provider: session.user.app_metadata?.provider || 'email'
        }
        setUser(userData)
        saveSession(userData)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        clearSession()
      }
    })

    return () => unsubscribe()
  }, [])

  // Charger l'historique et initialiser N8N quand l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      loadHistory()

      // Notifier N8N que l'utilisateur est connecté
      const initializeN8N = async () => {
        console.log('🔄 Initialisation de la connexion N8N...')

        // Vérifier que N8N est accessible
        const isAccessible = await pingN8N()
        if (isAccessible) {
          console.log('✅ N8N est accessible')
          setN8nConnected(true)

          // Activer le workflow automatiquement
          const activationResult = await activateWorkflow()
          if (activationResult.success) {
            if (activationResult.alreadyActive) {
              console.log('ℹ️ Workflow déjà actif')
            } else {
              console.log('✅ Workflow activé automatiquement')
            }
          } else {
            console.warn('⚠️ Impossible d\'activer le workflow:', activationResult.error)
          }

          // Notifier N8N de la connexion utilisateur
          const result = await notifyUserLogin(user.email)
          if (result.success) {
            console.log('✅ Session N8N initialisée')
          }
        } else {
          console.warn('⚠️ N8N non accessible - vérifiez que le workflow est actif')
          setN8nConnected(false)
        }
      }

      initializeN8N()
    }
  }, [user])

  // Polling pour les vidéos en cours
  useEffect(() => {
    if (videoPolling?.taskId) {
      console.log('🎬 Démarrage du polling vidéo pour taskId:', videoPolling.taskId)
      const startTime = videoPolling.startTime || Date.now()

      // Timer pour afficher le temps écoulé
      const timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setElapsedTime(elapsed)
      }, 1000)

      const checkVideoStatus = async () => {
        try {
          const videoData = await getVideoByTaskId(videoPolling.taskId)

          if (videoData && videoData.status === 'completed' && videoData.video_url) {
            console.log('✅ Vidéo prête!', videoData.video_url)

            // Mettre à jour la réponse avec la vidéo
            setResponse({
              success: true,
              type: 'video',
              content: {
                url: videoData.video_url,
                description: videoData.prompt,
                taskId: videoData.task_id
              },
              metadata: {
                inputType: 'video-generation',
                model: 'replicate',
                completedAt: videoData.completed_at
              }
            })

            // Arrêter le polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            clearInterval(timerInterval)
            setVideoPolling(null)
            setElapsedTime(0)
            setIsLoading(false)
          }
        } catch (err) {
          console.error('Erreur lors du polling vidéo:', err)
        }
      }

      // Premier check immédiat après 5 secondes
      const initialTimeout = setTimeout(checkVideoStatus, 5000)

      // Puis vérifier toutes les 5 secondes
      pollingIntervalRef.current = setInterval(checkVideoStatus, 5000)

      // Timeout après 10 minutes (les vidéos Replicate peuvent prendre du temps)
      const timeout = setTimeout(() => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        clearInterval(timerInterval)
        setVideoPolling(null)
        setElapsedTime(0)
        setIsLoading(false)
        setError('La génération de la vidéo a pris trop de temps (timeout 10min). La vidéo pourrait toujours être en cours de génération.')
      }, 600000) // 10 minutes

      // Nettoyage
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        clearInterval(timerInterval)
        clearTimeout(timeout)
        clearTimeout(initialTimeout)
      }
    }
  }, [videoPolling])

  const loadHistory = async () => {
    try {
      const data = await getConversationHistory(20)
      setHistory(data)
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err)
    }
  }

  const handleSubmit = async (data) => {
    const { message, file } = data

    // Réinitialiser les états
    setError(null)
    setResponse(null)
    setIsLoading(true)

    // Arrêter tout polling vidéo en cours
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setVideoPolling(null)

    try {
      // Si un fichier est présent, on peut l'encoder en base64 pour l'envoyer
      let fileData = null
      if (file) {
        fileData = await fileToBase64(file)
      }

      const payload = message || (file ? `Fichier uploadé: ${file.name}` : '')
      const result = await triggerWorkflow(payload, fileData)

      // N8N renvoie un tableau, extraire le premier élément
      const responseData = Array.isArray(result) ? result[0] : result
      setResponse(responseData)

      // Si c'est une vidéo en cours de génération, démarrer le polling
      if (responseData.metadata?.taskId && responseData.metadata?.status === 'processing') {
        console.log('🎬 Vidéo en cours, démarrage du polling...')
        setVideoPolling({ taskId: responseData.metadata.taskId, startTime: Date.now() })
        setElapsedTime(0)
        // Ne pas mettre isLoading à false, on attend la vidéo
      } else {
        setIsLoading(false)
      }

      // Sauvegarder dans l'historique
      try {
        await saveConversation({
          userMessage: payload,
          assistantResponse: responseData,
          responseType: responseData.type || 'text',
          metadata: file ? { fileName: file.name, fileType: file.type } : {}
        })
        await loadHistory() // Recharger l'historique
      } catch (err) {
        console.warn('Impossible de sauvegarder dans l\'historique:', err)
      }
    } catch (err) {
      setError(err.message || 'Une erreur inconnue est survenue')
      console.error('Erreur lors de l\'appel au webhook N8N:', err)
      setIsLoading(false)
    }
  }

  // Gérer l'envoi d'un enregistrement vocal
  const handleVoiceSubmit = async (voiceData) => {
    console.log('🎤 Traitement de l\'enregistrement vocal...')

    setError(null)
    setResponse(null)
    setIsLoading(true)

    // Arrêter tout polling vidéo en cours
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setVideoPolling(null)

    try {
      const result = await sendVoiceToWorkflow(voiceData)

      setResponse(result)

      // Si c'est une vidéo en cours de génération, démarrer le polling
      if (result.metadata?.inputType === 'video' && result.content?.task_id) {
        console.log('🎬 Vidéo en cours depuis vocal, démarrage du polling...')
        setVideoPolling({ taskId: result.content.task_id, startTime: Date.now() })
        setElapsedTime(0)
      } else {
        setIsLoading(false)
      }

      // Sauvegarder dans l'historique
      try {
        await saveConversation({
          userMessage: '[Message vocal]',
          assistantResponse: result,
          responseType: result.type || 'text',
          metadata: { source: 'voice', duration: voiceData.duration }
        })
        await loadHistory()
      } catch (err) {
        console.warn('Impossible de sauvegarder dans l\'historique:', err)
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du traitement vocal')
      console.error('Erreur vocal:', err)
      setIsLoading(false)
    }
  }

  // Convertir un fichier en base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // Gérer la connexion réussie
  const handleLoginSuccess = (userData) => {
    setUser(userData)
    saveSession(userData)
  }

  // Gérer la déconnexion
  const handleLogout = async () => {
    // Déconnexion Supabase (si OAuth) + nettoyage local
    await signOut()
    setUser(null)
    setResponse(null)
    setError(null)
    setHistory([])
  }

  // Si pas connecté, afficher le formulaire de login
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <h1 className="text-2xl font-bold">N8N Multimodal Interface</h1>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <span>Texte, Voix, Images, Vidéos - Interface complète</span>
                  {n8nConnected && (
                    <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      N8N connecté
                    </span>
                  )}
                  {!n8nConnected && user && (
                    <span className="inline-flex items-center gap-1 text-orange-400 text-xs">
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      N8N déconnecté
                    </span>
                  )}
                  {videoPolling && (
                    <span className="ml-2 text-blue-400 animate-pulse">
                      🎬 Génération vidéo... ({Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Boutons Header */}
            <div className="flex items-center space-x-3">
              {/* Bouton historique */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                title="Afficher l'historique"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm font-medium"
                title="Se déconnecter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section principale */}
          <div className={`space-y-6 ${showHistory ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {/* Section de saisie */}
            <section>
              <h2 className="text-lg font-semibold mb-3 text-slate-300">
                Votre message
              </h2>
              <PromptInputWithVoice
                onSubmit={handleSubmit}
                onVoiceSubmit={handleVoiceSubmit}
                isLoading={isLoading}
              />
            </section>

            {/* Section de réponse */}
            <section>
              <h2 className="text-lg font-semibold mb-3 text-slate-300">
                Réponse du workflow
              </h2>
              <MultimodalDisplay
                response={response}
                error={error}
                isLoading={isLoading}
                elapsedTime={elapsedTime}
              />
            </section>
          </div>

          {/* Historique (sidebar) */}
          {showHistory && (
            <aside className="lg:col-span-1">
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-4">
                <h3 className="text-lg font-semibold mb-4 text-slate-300">Historique</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">
                      Aucune conversation enregistrée
                    </p>
                  ) : (
                    history.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                        onClick={() => {
                          setResponse(item.assistant_response)
                          setError(null)
                        }}
                      >
                        <p className="text-xs text-slate-500 mb-1">
                          {new Date(item.created_at).toLocaleString('fr-FR')}
                        </p>
                        <p className="text-sm text-slate-300 line-clamp-2">
                          {item.user_message}
                        </p>
                        <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded">
                          {item.response_type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-6 mt-12 border-t border-slate-800">
        <div className="text-center text-sm text-slate-500">
          <p>Propulsé par React + Vite + Tailwind CSS + Supabase</p>
          <p className="mt-1">N8N Workflow Automation - Interface Multimodale</p>
        </div>
      </footer>
    </div>
  )
}

export default App

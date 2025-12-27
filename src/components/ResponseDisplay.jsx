/**
 * Composant d'affichage de la réponse N8N
 * Gère les états : vide, chargement, succès, erreur
 */
export default function ResponseDisplay({ response, error, isLoading }) {
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
            Saisissez un message ci-dessus et cliquez sur "Envoyer" pour déclencher le workflow N8N
          </p>
        </div>
      </div>
    )
  }

  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8">
        <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Traitement en cours...</p>
          <p className="text-sm">Le workflow N8N est en cours d'exécution</p>
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
    return (
      <div className="bg-slate-800 rounded-xl shadow-lg border border-green-900/50 p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-400 mb-2">Réponse N8N</h3>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-[600px]">
          <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  return null
}

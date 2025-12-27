// Service pour gérer les workflows N8N

const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'https://n8n.srv766650.hstgr.cloud'
const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY
const N8N_WORKFLOW_ID = import.meta.env.VITE_N8N_WORKFLOW_ID

// Activer le workflow automatiquement
export async function activateWorkflow() {
  const workflowId = N8N_WORKFLOW_ID
  const baseUrl = N8N_BASE_URL
  const apiKey = N8N_API_KEY

  if (!apiKey) {
    console.warn('⚠️ API key N8N non configurée')
    return { success: false, error: 'No API key' }
  }

  if (!workflowId) {
    console.warn('⚠️ ID du workflow non configuré')
    return { success: false, error: 'No workflow ID' }
  }

  try {
    console.log(`🚀 Activation du workflow ${workflowId}...`)

    const response = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      return { success: true, active: true }
    }

    // Si déjà actif (status 304 Not Modified)
    if (response.status === 304) {
      return { success: true, active: true, alreadyActive: true }
    }

    // Si le workflow est déjà actif (certaines API retournent 200 avec un message)
    if (response.status === 200) {
      const data = await response.json()
      return { success: true, active: true, alreadyActive: true, data }
    }

    // Gérer les erreurs spécifiques
    if (response.status === 401) {
      console.error('❌ API key invalide ou expirée')
      return { success: false, error: 'Unauthorized - Invalid API key' }
    }

    if (response.status === 404) {
      console.error('❌ Workflow introuvable')
      return { success: false, error: 'Workflow not found' }
    }

    const errorText = await response.text()
    console.error(`❌ Erreur ${response.status}:`, errorText)
    return { success: false, error: errorText, status: response.status }
  } catch (error) {
    console.error('❌ Erreur lors de l\'activation du workflow:', error)
    return { success: false, error: error.message }
  }
}

// Démarrer/activer un workflow automatiquement (deprecated - utiliser activateWorkflow)
export async function startWorkflow(workflowId) {
  return activateWorkflow()
}

// Vérifier le statut d'un workflow
export async function checkWorkflowStatus(workflowId) {
  try {
    if (!N8N_API_KEY) {
      console.warn('⚠️ Clé API N8N non configurée')
      return { active: null }
    }

    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${workflowId}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    })

    if (response.ok) {
      const workflow = await response.json()
      return { active: workflow.active }
    }

    return { active: null }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du workflow:', error)
    return { active: null }
  }
}

// Ping de santé pour vérifier que N8N est accessible
export async function pingN8N() {
  try {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'ping',
        timestamp: new Date().toISOString()
      })
    })

    return response.ok
  } catch (error) {
    console.error('❌ N8N non accessible:', error)
    return false
  }
}

// Notifier N8N qu'un utilisateur s'est connecté
export async function notifyUserLogin(userEmail) {
  try {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: 'user_login',
        email: userEmail,
        timestamp: new Date().toISOString(),
        action: 'initialize_session'
      })
    })

    if (response.ok) {
      console.log('✅ N8N notifié de la connexion utilisateur')
      return { success: true }
    }

    return { success: false }
  } catch (error) {
    console.error('❌ Erreur lors de la notification N8N:', error)
    return { success: false, error: error.message }
  }
}

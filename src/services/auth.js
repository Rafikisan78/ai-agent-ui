// Service d'authentification avec support OAuth

import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Hash simple pour le mot de passe (en production, utiliser bcrypt côté serveur)
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Connexion avec OAuth (Google ou GitHub)
 * @param {string} provider - 'google' ou 'github'
 * @returns {Promise<Object>} Résultat de la tentative de connexion
 */
export async function loginWithOAuth(provider) {
  if (!supabase) {
    return { success: false, error: 'Supabase non configuré' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error(`Erreur OAuth ${provider}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupère la session active Supabase
 * @returns {Promise<Object|null>} Session utilisateur ou null
 */
export async function getSupabaseSession() {
  if (!supabase) return null

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Erreur récupération session:', error)
    return null
  }
}

/**
 * Écoute les changements d'état d'authentification
 * @param {Function} callback - Fonction appelée lors des changements
 */
export function onAuthStateChange(callback) {
  if (!supabase) return () => {}

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      callback(event, session)
    }
  )

  return () => subscription.unsubscribe()
}

/**
 * Déconnexion de l'utilisateur
 * @returns {Promise<Object>} Résultat de la déconnexion
 */
export async function signOut() {
  if (!supabase) {
    clearSession()
    return { success: true }
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    clearSession()
    return { success: true }
  } catch (error) {
    console.error('Erreur déconnexion:', error)
    return { success: false, error: error.message }
  }
}

// Login avec email et mot de passe (système legacy maintenu pour compatibilité)
export async function login(email, password) {
  try {
    // Récupérer l'utilisateur depuis Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/app_users?email=eq.${encodeURIComponent(email)}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    )

    if (!response.ok) {
      return { success: false, error: 'Erreur de connexion' }
    }

    const users = await response.json()

    if (users.length === 0) {
      return { success: false, error: 'Email non autorisé' }
    }

    const user = users[0]

    // Vérifier le mot de passe
    const passwordHash = await hashPassword(password)

    if (passwordHash !== user.password_hash) {
      return { success: false, error: 'Mot de passe incorrect' }
    }

    // Mettre à jour la date de dernière connexion
    await fetch(
      `${SUPABASE_URL}/rest/v1/app_users?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          last_login: new Date().toISOString()
        })
      }
    )

    // Retourner succès avec les infos utilisateur
    return {
      success: true,
      user: {
        email: user.email,
        id: user.id
      }
    }
  } catch (error) {
    console.error('Erreur login:', error)
    return { success: false, error: error.message }
  }
}

// Gestion de la session avec localStorage
export function saveSession(user) {
  localStorage.setItem('auth_user', JSON.stringify(user))
}

export function getSession() {
  const user = localStorage.getItem('auth_user')
  return user ? JSON.parse(user) : null
}

export function clearSession() {
  localStorage.removeItem('auth_user')
}

export function isAuthenticated() {
  return getSession() !== null
}

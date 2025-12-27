/**
 * Service Supabase pour la gestion de l'historique conversationnel
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials manquantes. L\'historique ne sera pas sauvegardé.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Sauvegarde une conversation dans Supabase
 * @param {Object} conversation - Les données de la conversation
 * @returns {Promise<Object>} La conversation sauvegardée
 */
export async function saveConversation(conversation) {
  if (!supabase) {
    console.warn('Supabase non configuré, conversation non sauvegardée')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_message: conversation.userMessage,
          assistant_response: conversation.assistantResponse,
          response_type: conversation.responseType || 'text',
          metadata: conversation.metadata || {},
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la conversation:', error)
    throw error
  }
}

/**
 * Récupère l'historique des conversations
 * @param {number} limit - Nombre de conversations à récupérer
 * @returns {Promise<Array>} Liste des conversations
 */
export async function getConversationHistory(limit = 50) {
  if (!supabase) {
    console.warn('Supabase non configuré')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error)
    return []
  }
}

/**
 * Supprime une conversation
 * @param {string} id - ID de la conversation à supprimer
 */
export async function deleteConversation(id) {
  if (!supabase) return

  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    throw error
  }
}

/**
 * Récupère une vidéo par son taskId
 * @param {string} taskId - ID de la tâche vidéo
 * @returns {Promise<Object|null>} Les données de la vidéo
 */
export async function getVideoByTaskId(taskId) {
  if (!supabase) {
    console.warn('Supabase non configuré')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('video_tasks')
      .select('*')
      .eq('task_id', taskId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Aucun enregistrement trouvé
        return null
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération de la vidéo:', error)
    return null
  }
}

/**
 * Récupère les vidéos en cours de traitement
 * @returns {Promise<Array>} Liste des vidéos en cours
 */
export async function getPendingVideos() {
  if (!supabase) {
    console.warn('Supabase non configuré')
    return []
  }

  try {
    const { data, error} = await supabase
      .from('video_tasks')
      .select('*')
      .eq('status', 'processing')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des vidéos en cours:', error)
    return []
  }
}

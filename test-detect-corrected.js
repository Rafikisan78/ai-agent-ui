// Script pour tester si Replicate termine mais Supabase n'est pas mis à jour
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qrbtxbwhbjvytsfsazlg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y';
const REPLICATE_TOKEN = 'VOTRE_TOKEN_REPLICATE_ICI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkPredictionStatus(predictionId) {
  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la vérification Replicate:', error.message);
    return null;
  }
}

async function detectAndFix() {
  console.log('🔍 Détection des vidéos non synchronisées...\n');

  try {
    // Récupérer toutes les vidéos en "processing"
    const { data: processingVideos, error } = await supabase
      .from('video_tasks')
      .select('*')
      .eq('status', 'processing')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase:', error.message);
      return;
    }

    if (!processingVideos || processingVideos.length === 0) {
      console.log('✅ Aucune vidéo en cours de traitement');
      return;
    }

    console.log(`📋 ${processingVideos.length} vidéo(s) en cours trouvée(s)\n`);

    for (const video of processingVideos) {
      console.log(`\n🎬 Vérification: ${video.task_id}`);
      console.log(`   Prompt: ${video.prompt}`);
      console.log(`   Créée: ${new Date(video.created_at).toLocaleString('fr-FR')}`);

      // Vérifier le statut sur Replicate
      const replicateData = await checkPredictionStatus(video.task_id);

      if (replicateData) {
        console.log(`   📊 Statut Replicate: ${replicateData.status}`);

        if (replicateData.status === 'succeeded' && replicateData.output) {
          const videoUrl = Array.isArray(replicateData.output)
            ? replicateData.output[0]
            : replicateData.output;

          console.log(`   ✅ Vidéo terminée sur Replicate!`);
          console.log(`   🔗 URL: ${videoUrl}`);
          console.log(`   🔧 Mise à jour de Supabase...`);

          // Mettre à jour Supabase
          const { error: updateError } = await supabase
            .from('video_tasks')
            .update({
              status: 'completed',
              video_url: videoUrl,
              completed_at: new Date().toISOString()
            })
            .eq('task_id', video.task_id);

          if (updateError) {
            console.error(`   ❌ Erreur mise à jour:`, updateError.message);
          } else {
            console.log(`   ✅ Supabase mis à jour avec succès!`);
          }
        } else if (replicateData.status === 'failed') {
          console.log(`   ❌ Échec sur Replicate`);
          if (replicateData.error) {
            console.log(`   Erreur: ${replicateData.error}`);
          }

          // Marquer comme échoué dans Supabase
          await supabase
            .from('video_tasks')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString()
            })
            .eq('task_id', video.task_id);
        } else {
          console.log(`   ⏳ Toujours en cours sur Replicate...`);
        }
      } else {
        console.log(`   ⚠️  Impossible de vérifier le statut sur Replicate`);
      }

      // Attendre un peu entre chaque requête
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Vérification terminée');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

// Exécuter
detectAndFix();

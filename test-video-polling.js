// Script de test pour vérifier le polling vidéo et Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qrbtxbwhbjvytsfsazlg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnR4YndoYmp2eXRzZnNhemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDkxMzEsImV4cCI6MjA1MzIyNTEzMX0.BKoA2dPRIpV55cUGCCNdWqP0EhQEOl3E0CZdxFBw10Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testVideoPolling() {
  console.log('🧪 Test du système de polling vidéo\n');

  try {
    // 1. Vérifier la connexion à Supabase
    console.log('📡 Vérification de la connexion à Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('video_tasks')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError.message);
      return;
    }
    console.log('✅ Connexion Supabase OK\n');

    // 2. Récupérer les vidéos en cours
    console.log('🔍 Recherche des vidéos en cours de traitement...');
    const { data: pendingVideos, error: pendingError } = await supabase
      .from('video_tasks')
      .select('*')
      .eq('status', 'processing')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('❌ Erreur:', pendingError.message);
      return;
    }

    if (pendingVideos && pendingVideos.length > 0) {
      console.log(`✅ ${pendingVideos.length} vidéo(s) en cours trouvée(s):\n`);
      pendingVideos.forEach((video, index) => {
        console.log(`${index + 1}. Task ID: ${video.task_id}`);
        console.log(`   Prompt: ${video.prompt}`);
        console.log(`   Status: ${video.status}`);
        console.log(`   Créée: ${new Date(video.created_at).toLocaleString('fr-FR')}`);
        console.log('');
      });
    } else {
      console.log('ℹ️  Aucune vidéo en cours de traitement\n');
    }

    // 3. Récupérer toutes les vidéos complétées
    console.log('🎬 Recherche des vidéos complétées...');
    const { data: completedVideos, error: completedError } = await supabase
      .from('video_tasks')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);

    if (completedError) {
      console.error('❌ Erreur:', completedError.message);
      return;
    }

    if (completedVideos && completedVideos.length > 0) {
      console.log(`✅ ${completedVideos.length} vidéo(s) complétée(s) (5 dernières):\n`);
      completedVideos.forEach((video, index) => {
        console.log(`${index + 1}. Task ID: ${video.task_id}`);
        console.log(`   Prompt: ${video.prompt}`);
        console.log(`   Video URL: ${video.video_url}`);
        console.log(`   Complétée: ${new Date(video.completed_at).toLocaleString('fr-FR')}`);
        console.log('');
      });
    } else {
      console.log('ℹ️  Aucune vidéo complétée trouvée\n');
    }

    // 4. Tester la récupération par task_id (si une vidéo existe)
    const { data: allVideos } = await supabase
      .from('video_tasks')
      .select('task_id')
      .limit(1);

    if (allVideos && allVideos.length > 0) {
      const taskId = allVideos[0].task_id;
      console.log(`🔍 Test de récupération par task_id: ${taskId}`);

      const { data: videoData, error: videoError } = await supabase
        .from('video_tasks')
        .select('*')
        .eq('task_id', taskId)
        .single();

      if (videoError) {
        console.error('❌ Erreur:', videoError.message);
      } else {
        console.log('✅ Vidéo récupérée avec succès');
        console.log(`   Status: ${videoData.status}`);
        console.log(`   URL: ${videoData.video_url || 'N/A'}`);
      }
    }

    console.log('\n✅ Test terminé avec succès');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Exécuter le test
testVideoPolling();

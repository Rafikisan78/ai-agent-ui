// Script de debug rapide pour tester le problème
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nivbykzatzugwslnodqi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1zpjTYfnH8i2lfX3kcinFQ_l7TD20AO';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function quickDebug() {
  console.log('🐛 Debug rapide du système\n');

  try {
    // 1. Vérifier les vidéos en cours
    console.log('1️⃣ Vérification des vidéos en cours...');
    const { data: processing, error: err1 } = await supabase
      .from('video_tasks')
      .select('*')
      .eq('status', 'processing')
      .order('created_at', { ascending: false })
      .limit(5);

    if (err1) {
      console.error('❌ Erreur:', err1.message);
    } else {
      console.log(`   ${processing?.length || 0} vidéo(s) en processing\n`);
      if (processing && processing.length > 0) {
        processing.forEach((v, i) => {
          console.log(`   ${i + 1}. ${v.task_id}`);
          console.log(`      Prompt: ${v.prompt}`);
          console.log(`      Depuis: ${new Date(v.created_at).toLocaleString('fr-FR')}`);
          console.log('');
        });
      }
    }

    // 2. Vérifier les vidéos complétées
    console.log('2️⃣ Dernières vidéos complétées...');
    const { data: completed, error: err2 } = await supabase
      .from('video_tasks')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(3);

    if (err2) {
      console.error('❌ Erreur:', err2.message);
    } else {
      console.log(`   ${completed?.length || 0} vidéo(s) complétées (3 dernières)\n`);
      if (completed && completed.length > 0) {
        completed.forEach((v, i) => {
          console.log(`   ${i + 1}. ${v.task_id}`);
          console.log(`      Prompt: ${v.prompt}`);
          console.log(`      URL: ${v.video_url}`);
          console.log(`      Terminée: ${new Date(v.completed_at).toLocaleString('fr-FR')}`);
          console.log('');
        });
      }
    }

    // 3. Statistiques
    console.log('3️⃣ Statistiques globales...');
    const { count: totalCount } = await supabase
      .from('video_tasks')
      .select('*', { count: 'exact', head: true });

    const { count: processingCount } = await supabase
      .from('video_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');

    const { count: completedCount } = await supabase
      .from('video_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    console.log(`   Total: ${totalCount || 0} vidéos`);
    console.log(`   En cours: ${processingCount || 0}`);
    console.log(`   Complétées: ${completedCount || 0}`);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }

  console.log('\n✅ Debug terminé');
}

quickDebug();

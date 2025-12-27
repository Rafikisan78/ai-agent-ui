// Script pour corriger toutes les vidéos qui ont une URL mais le statut "processing"

const SUPABASE_URL = 'https://nivbykzatzugwslnodqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1zpjTYfnH8i2lfX3kcinFQ_l7TD20AO';

async function fixAllVideos() {
  console.log('🔧 Correction des vidéos avec URL mais statut "processing"\n');

  // 1. Récupérer toutes les vidéos en processing avec une URL
  const getResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/video_tasks?status=eq.processing&video_url=not.is.null&select=*`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  if (!getResponse.ok) {
    console.error('❌ Erreur lors de la récupération:', await getResponse.text());
    return;
  }

  const videos = await getResponse.json();

  if (videos.length === 0) {
    console.log('✅ Aucune vidéo à corriger!\n');

    // Afficher toutes les vidéos complétées
    const completedResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/video_tasks?status=eq.completed&order=completed_at.desc&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (completedResponse.ok) {
      const completed = await completedResponse.json();
      console.log(`📊 ${completed.length} vidéo(s) complétée(s):\n`);

      completed.forEach((video, index) => {
        console.log(`${index + 1}. ${video.task_id}`);
        console.log(`   Prompt: ${video.prompt}`);
        console.log(`   URL: ${video.video_url}`);
        console.log(`   Complétée: ${new Date(video.completed_at).toLocaleString('fr-FR')}`);
        console.log();
      });
    }
    return;
  }

  console.log(`🔍 Trouvé ${videos.length} vidéo(s) à corriger:\n`);

  // 2. Corriger chaque vidéo
  for (const video of videos) {
    console.log(`📹 Correction: ${video.task_id}`);
    console.log(`   Prompt: ${video.prompt}`);

    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/video_tasks?task_id=eq.${video.task_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status: 'completed'
        })
      }
    );

    if (updateResponse.ok) {
      console.log(`   ✅ Corrigé!\n`);
    } else {
      console.error(`   ❌ Erreur:`, await updateResponse.text());
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Toutes les vidéos ont été corrigées!\n');

  // 3. Afficher toutes les vidéos complétées
  const completedResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/video_tasks?status=eq.completed&order=completed_at.desc&select=*`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  if (completedResponse.ok) {
    const completed = await completedResponse.json();
    console.log(`🎬 ${completed.length} VIDÉO(S) DISPONIBLE(S):\n`);

    completed.forEach((video, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`${index + 1}. Task ID: ${video.task_id}`);
      console.log(`   Prompt: ${video.prompt}`);
      console.log(`   Complétée: ${new Date(video.completed_at).toLocaleString('fr-FR')}`);
      console.log(`   \n   🔗 URL de la vidéo:`);
      console.log(`   ${video.video_url}\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Pour voir les vidéos:');
    console.log('   - Copiez une URL ci-dessus et collez dans votre navigateur');
    console.log('   - Ou ouvrez: http://localhost:5173\n');
  }
}

fixAllVideos();

// Script pour corriger le statut et afficher la vidéo

const SUPABASE_URL = 'https://nivbykzatzugwslnodqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1zpjTYfnH8i2lfX3kcinFQ_l7TD20AO';

async function fixAndDisplayVideo(taskId) {
  console.log('🔧 Correction et affichage de la vidéo\n');

  // 1. Mettre à jour le statut
  console.log(`1️⃣ Mise à jour du statut pour task_id: ${taskId}...`);

  const updateResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/video_tasks?task_id=eq.${taskId}`,
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
    const updated = await updateResponse.json();
    console.log('✅ Statut mis à jour!\n');

    console.log('📊 Détails de la vidéo:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Task ID: ${updated[0].task_id}`);
    console.log(`Prompt: ${updated[0].prompt}`);
    console.log(`Status: ${updated[0].status}`);
    console.log(`Créé: ${new Date(updated[0].created_at).toLocaleString('fr-FR')}`);
    console.log(`Complété: ${new Date(updated[0].completed_at).toLocaleString('fr-FR')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎬 URL de la vidéo:');
    console.log(updated[0].video_url);
    console.log('\n💡 Pour afficher la vidéo:');
    console.log('   1. Copiez l\'URL ci-dessus');
    console.log('   2. Collez-la dans votre navigateur');
    console.log('   3. Ou ouvrez l\'interface web (http://localhost:5173)');
    console.log('      et elle devrait maintenant s\'afficher automatiquement!\n');

    return updated[0];
  } else {
    console.error('❌ Erreur lors de la mise à jour:', await updateResponse.text());
  }
}

// Utiliser le task_id fourni
const taskId = 'dtgg85hqmnrna0cv9sb9tfm6x8';
fixAndDisplayVideo(taskId);

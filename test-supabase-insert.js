// Test d'insertion directe dans Supabase (simule ce que fait N8N)

const SUPABASE_URL = 'https://nivbykzatzugwslnodqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1zpjTYfnH8i2lfX3kcinFQ_l7TD20AO';

async function testInsert() {
  console.log('🧪 Test d\'insertion dans Supabase\n');

  const testData = {
    task_id: `test-${Date.now()}`,
    prompt: '/video test depuis Node.js',
    status: 'processing',
    video_url: null
  };

  console.log('📤 Données à insérer:');
  console.log(JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/video_tasks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testData)
    });

    console.log('\n📊 Status:', response.status, response.statusText);

    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ Succès! Vidéo insérée:');
      console.log(JSON.stringify(result, null, 2));

      console.log('\n🔍 Vérification avec test-debug.js pour voir la vidéo...');
    } else {
      const error = await response.text();
      console.error('\n❌ Erreur:', error);
    }
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

testInsert();

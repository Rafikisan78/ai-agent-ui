// Test: Texte, Image, Video

const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video';

async function testAll() {
  console.log('═'.repeat(70));
  console.log('🧪 TEST COMPLET: TEXTE + IMAGE + VIDEO');
  console.log('═'.repeat(70));
  console.log('');

  // Test 1: TEXTE
  console.log('1️⃣  TEST TEXTE: "Bonjour"\n');

  try {
    const response1 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bonjour',
        type: 'text'
      })
    });

    console.log(`   Status: ${response1.status} ${response1.statusText}`);

    const text1 = await response1.text();
    console.log(`   Longueur: ${text1.length} chars`);

    if (text1) {
      try {
        const data1 = JSON.parse(text1);
        console.log('   ✅ JSON valide');
        console.log('   Type:', data1.type);
        if (data1.response) {
          console.log('   Response:', data1.response.substring(0, 150));
        } else {
          console.log('   ⚠️  Response vide');
        }
        console.log('');
        console.log('   JSON:');
        console.log('   ' + JSON.stringify(data1, null, 2).split('\n').join('\n   '));
      } catch (e) {
        console.log('   ⚠️  Non-JSON:', text1.substring(0, 200));
      }
    } else {
      console.log('   ❌ Reponse vide');
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');
  console.log('-'.repeat(70));
  console.log('');

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: IMAGE
  console.log('2️⃣  TEST IMAGE: "/image un chat astronaute"\n');

  try {
    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '/image un chat astronaute',
        type: 'text'
      })
    });

    console.log(`   Status: ${response2.status} ${response2.statusText}`);

    const text2 = await response2.text();
    console.log(`   Longueur: ${text2.length} chars`);

    if (text2) {
      try {
        const data2 = JSON.parse(text2);
        console.log('   ✅ JSON valide');
        console.log('   Type:', data2.type);
        if (data2.image_url) {
          console.log('   Image URL:', data2.image_url.substring(0, 80) + '...');
        }
        if (data2.response) {
          console.log('   Response:', data2.response);
        }
        console.log('');
        console.log('   JSON:');
        console.log('   ' + JSON.stringify(data2, null, 2).split('\n').join('\n   '));
      } catch (e) {
        console.log('   ⚠️  Non-JSON:', text2.substring(0, 200));
      }
    } else {
      console.log('   ❌ Reponse vide');
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');
  console.log('-'.repeat(70));
  console.log('');

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: VIDEO
  console.log('3️⃣  TEST VIDEO: "/video un papillon"\n');

  try {
    const response3 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '/video un papillon',
        type: 'text'
      })
    });

    console.log(`   Status: ${response3.status} ${response3.statusText}`);

    const text3 = await response3.text();
    console.log(`   Longueur: ${text3.length} chars`);

    if (text3) {
      try {
        const data3 = JSON.parse(text3);
        console.log('   ✅ JSON valide');
        console.log('   Type:', data3.type);
        if (data3.status) {
          console.log('   Status:', data3.status);
        }
        if (data3.task_id) {
          console.log('   Task ID:', data3.task_id);
        }
        if (data3.response) {
          console.log('   Response:', data3.response);
        }
        console.log('');
        console.log('   JSON:');
        console.log('   ' + JSON.stringify(data3, null, 2).split('\n').join('\n   '));
      } catch (e) {
        console.log('   ⚠️  Non-JSON:', text3.substring(0, 200));
      }
    } else {
      console.log('   ❌ Reponse vide');
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('📊 RESULTATS');
  console.log('═'.repeat(70));
  console.log('');
  console.log('Verifier dans N8N: https://n8n.srv766650.hstgr.cloud/executions');
  console.log('');
  console.log('Pour chaque test:');
  console.log('  1. Detect Content Type doit detecter le bon type');
  console.log('  2. Route Content Type doit router vers le bon noeud');
  console.log('  3. Le noeud AI/DALL-E/Replicate doit s executer');
  console.log('  4. Format Response doit formater correctement');
  console.log('  5. Respond to Webhook doit retourner le JSON');
  console.log('');
  console.log('═'.repeat(70));
}

testAll();

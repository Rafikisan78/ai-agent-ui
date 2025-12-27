// Script pour définir un mot de passe fixe pour l'utilisateur

const SUPABASE_URL = 'https://nivbykzatzugwslnodqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1zpjTYfnH8i2lfX3kcinFQ_l7TD20AO';

// Le mot de passe que vous voulez définir
const FIXED_PASSWORD = 'MonMotDePasse2024!'; // CHANGEZ CECI

// Hash simple pour le mot de passe (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function setFixedPassword() {
  console.log('🔐 Définition du mot de passe fixe\n');

  try {
    const passwordHash = await hashPassword(FIXED_PASSWORD);

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/app_users?email=eq.rafikisan78@gmail.com`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          password_hash: passwordHash,
          is_first_login: false,
          last_login: null
        })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Mot de passe défini avec succès!');
      console.log(`   Email: ${result[0].email}`);
      console.log(`   Mot de passe: ${FIXED_PASSWORD}`);
      console.log(`   Hash: ${passwordHash.substring(0, 20)}...`);
      console.log(`   Première connexion: ${result[0].is_first_login ? 'Oui' : 'Non'}`);
      console.log('\n📋 Prochaines étapes:');
      console.log('   1. Actualisez la page de l\'application (F5)');
      console.log('   2. Connectez-vous avec:');
      console.log(`      Email: rafikisan78@gmail.com`);
      console.log(`      Mot de passe: ${FIXED_PASSWORD}`);
      console.log('\n⚠️  IMPORTANT: Notez ce mot de passe quelque part!\n');
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur:', errorText);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

setFixedPassword();

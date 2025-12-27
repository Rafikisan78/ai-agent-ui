// Script pour réinitialiser le mot de passe (retour à la première connexion)

const SUPABASE_URL = 'https://nivbykzatzugwslnodqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1zpjTYfnH8i2lfX3kcinFQ_l7TD20AO';

async function resetPassword() {
  console.log('🔄 Réinitialisation du mot de passe\n');

  try {
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
          password_hash: null,
          is_first_login: true,
          last_login: null
        })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Mot de passe réinitialisé avec succès!');
      console.log(`   Email: ${result[0].email}`);
      console.log(`   Première connexion: ${result[0].is_first_login ? 'Oui' : 'Non'}`);
      console.log('\n📋 Prochaines étapes:');
      console.log('   1. Actualisez la page de l\'application (F5)');
      console.log('   2. Vous verrez l\'écran "Définissez votre mot de passe"');
      console.log('   3. Définissez un nouveau mot de passe (8+ caractères)');
      console.log('   4. Testez la connexion\n');
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur:', errorText);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

resetPassword();

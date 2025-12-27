// Script pour créer la table d'authentification dans Supabase et vérifier la configuration

const SUPABASE_URL = 'https://nivbykzatzugwslnodqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1zpjTYfnH8i2lfX3kcinFQ_l7TD20AO';

async function setupAuth() {
  console.log('🔐 Configuration de l\'authentification\n');

  // 1. Vérifier si l'utilisateur existe déjà
  console.log('1️⃣ Vérification de l\'utilisateur autorisé...');

  try {
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/app_users?email=eq.rafikisan78@gmail.com&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (checkResponse.ok) {
      const users = await checkResponse.json();

      if (users.length > 0) {
        console.log('✅ Utilisateur trouvé!');
        console.log(`   Email: ${users[0].email}`);
        console.log(`   Première connexion: ${users[0].is_first_login ? 'Oui' : 'Non'}`);
        console.log(`   Créé le: ${new Date(users[0].created_at).toLocaleString('fr-FR')}`);

        if (users[0].last_login) {
          console.log(`   Dernière connexion: ${new Date(users[0].last_login).toLocaleString('fr-FR')}`);
        }

        console.log('\n📋 Prochaines étapes:');
        if (users[0].is_first_login) {
          console.log('   1. Lancez l\'application: npm run dev');
          console.log('   2. Vous serez invité à définir votre mot de passe à la première connexion');
          console.log('   3. Utilisez rafikisan78@gmail.com et définissez un mot de passe sécurisé (8+ caractères)');
        } else {
          console.log('   1. Lancez l\'application: npm run dev');
          console.log('   2. Connectez-vous avec rafikisan78@gmail.com et votre mot de passe');
        }
      } else {
        console.log('⚠️  Utilisateur non trouvé dans la base de données');
        console.log('\n📋 Action requise:');
        console.log('   1. Exécutez le script SQL create-auth-table.sql dans Supabase');
        console.log('   2. Rendez-vous sur: https://supabase.com/dashboard/project/nivbykzatzugwslnodqi/editor');
        console.log('   3. Cliquez sur "SQL Editor" dans le menu de gauche');
        console.log('   4. Collez le contenu de create-auth-table.sql');
        console.log('   5. Cliquez sur "Run" pour exécuter');
        console.log('   6. Relancez ce script pour vérifier');
      }
    } else {
      const errorText = await checkResponse.text();

      if (errorText.includes('relation') && errorText.includes('does not exist')) {
        console.log('⚠️  La table app_users n\'existe pas encore');
        console.log('\n📋 Action requise:');
        console.log('   1. Exécutez le script SQL create-auth-table.sql dans Supabase');
        console.log('   2. Rendez-vous sur: https://supabase.com/dashboard/project/nivbykzatzugwslnodqi/editor');
        console.log('   3. Cliquez sur "SQL Editor" dans le menu de gauche');
        console.log('   4. Collez le contenu de create-auth-table.sql');
        console.log('   5. Cliquez sur "Run" pour exécuter');
        console.log('   6. Relancez ce script pour vérifier');
      } else {
        console.error('❌ Erreur lors de la vérification:', errorText);
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔒 Sécurité:');
  console.log('   - Seul rafikisan78@gmail.com est autorisé');
  console.log('   - Le mot de passe est hashé avec SHA-256');
  console.log('   - La session est stockée en localStorage');
  console.log('   - Déconnexion automatique en fermant le navigateur');
}

setupAuth();

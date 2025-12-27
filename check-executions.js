// Vérifier les dernières exécutions du workflow

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';
const WORKFLOW_ID = 'EM3TcglVa2ngfwRF';

async function checkExecutions() {
  console.log('═'.repeat(70));
  console.log('📊 VÉRIFICATION DES EXÉCUTIONS DU WORKFLOW');
  console.log('═'.repeat(70));
  console.log('');

  try {
    // Récupérer les dernières exécutions
    const response = await fetch(
      `${N8N_BASE_URL}/api/v1/executions?workflowId=${WORKFLOW_ID}&limit=5`,
      {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      }
    );

    if (!response.ok) {
      console.error('❌ Erreur:', response.status);
      return;
    }

    const executions = await response.json();

    if (!executions.data || executions.data.length === 0) {
      console.log('⚠️  Aucune exécution trouvée');
      console.log('   Cela signifie que le workflow n\'a jamais été exécuté.');
      return;
    }

    console.log(`📋 ${executions.data.length} dernières exécutions:\n`);

    executions.data.forEach((exec, index) => {
      const date = new Date(exec.startedAt).toLocaleString('fr-FR');
      const status = exec.finished ? (exec.status === 'success' ? '✅' : '❌') : '⏳';
      const statusText = exec.status || 'running';

      console.log(`${index + 1}. ${status} Exécution ${exec.id}`);
      console.log(`   Date: ${date}`);
      console.log(`   Status: ${statusText}`);
      console.log(`   Mode: ${exec.mode}`);

      if (exec.finished) {
        console.log(`   Durée: ${exec.stoppedAt ? new Date(exec.stoppedAt) - new Date(exec.startedAt) : 'N/A'}ms`);
      }

      console.log('');
    });

    // Analyser la dernière exécution en détail
    console.log('═'.repeat(70));
    console.log('🔍 ANALYSE DE LA DERNIÈRE EXÉCUTION');
    console.log('═'.repeat(70));
    console.log('');

    const lastExec = executions.data[0];

    // Récupérer les détails complets
    const detailResponse = await fetch(
      `${N8N_BASE_URL}/api/v1/executions/${lastExec.id}`,
      {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      }
    );

    if (!detailResponse.ok) {
      console.error('❌ Impossible de récupérer les détails');
      return;
    }

    const details = await detailResponse.json();

    console.log(`Status final: ${details.status}`);
    console.log(`Terminé: ${details.finished ? 'OUI' : 'NON'}`);
    console.log('');

    // Analyser les données de chaque nœud
    if (details.data && details.data.resultData) {
      const runData = details.data.resultData.runData;

      console.log('📋 Nœuds exécutés:\n');

      Object.keys(runData || {}).forEach(nodeName => {
        const nodeData = runData[nodeName][0];
        const hasError = nodeData.error !== undefined;
        const hasData = nodeData.data && nodeData.data.main && nodeData.data.main[0];

        console.log(`${hasError ? '❌' : '✅'} ${nodeName}`);

        if (hasError) {
          console.log(`   Erreur: ${nodeData.error.message}`);
        } else if (hasData) {
          const dataCount = nodeData.data.main[0].length;
          console.log(`   Données: ${dataCount} item(s)`);

          // Afficher un aperçu des données
          if (dataCount > 0) {
            const firstItem = nodeData.data.main[0][0].json;
            const preview = JSON.stringify(firstItem, null, 2).substring(0, 200);
            console.log(`   Preview: ${preview}...`);
          }
        }

        console.log('');
      });
    }

    console.log('═'.repeat(70));
    console.log('💡 POUR VOIR LES LOGS DÉTAILLÉS:');
    console.log('═'.repeat(70));
    console.log('');
    console.log(`1. Ouvrir: ${N8N_BASE_URL}/executions`);
    console.log(`2. Cliquer sur l'exécution du ${new Date(lastExec.startedAt).toLocaleString('fr-FR')}`);
    console.log('3. Chaque nœud affichera ses logs avec le format:');
    console.log('   ═════════════════════════════════════');
    console.log('   📥 [NODE_NAME] Début');
    console.log('   [NODE_NAME] Variable: valeur');
    console.log('   ✅ [NODE_NAME] Terminé');
    console.log('   ═════════════════════════════════════');
    console.log('');
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkExecutions();

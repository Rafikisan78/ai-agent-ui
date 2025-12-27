// Analyser n'importe quelle exécution pour comprendre le problème

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NjAxMjMxLCJleHAiOjE3NjkxMjI4MDB9.VhubODyH6ZKscdzr4RmRUZh4NIaWG6HxGhmnJ7V7UKs';

async function analyzeExecutions() {
  console.log('═'.repeat(70));
  console.log('🔍 ANALYSE DES DERNIÈRES EXÉCUTIONS');
  console.log('═'.repeat(70));
  console.log('');

  try {
    // Récupérer les 10 dernières exécutions
    const execResponse = await fetch(
      `${N8N_BASE_URL}/api/v1/executions?limit=10`,
      {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      }
    );

    const execList = await execResponse.json();

    if (!execList.data || execList.data.length === 0) {
      console.log('❌ Aucune exécution trouvée');
      return;
    }

    console.log(`📊 ${execList.data.length} dernières exécutions:\n`);

    // Afficher un résumé
    execList.data.forEach((exec, i) => {
      const status = exec.status === 'success' ? '✅' : '❌';
      const date = new Date(exec.startedAt).toLocaleString('fr-FR');
      console.log(`${i + 1}. ${status} #${exec.id} - ${exec.status} - ${date}`);
    });

    console.log('');
    console.log('═'.repeat(70));

    // Chercher une exécution en succès
    const successExec = execList.data.find(e => e.status === 'success');
    const errorExec = execList.data.find(e => e.status === 'error');

    if (successExec) {
      console.log(`\n✅ ANALYSE EXÉCUTION RÉUSSIE #${successExec.id}`);
      console.log('═'.repeat(70));
      await analyzeExecution(successExec.id);
    }

    if (errorExec) {
      console.log(`\n❌ ANALYSE EXÉCUTION EN ERREUR #${errorExec.id}`);
      console.log('═'.repeat(70));
      await analyzeExecution(errorExec.id);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function analyzeExecution(executionId) {
  try {
    const response = await fetch(
      `${N8N_BASE_URL}/api/v1/executions/${executionId}`,
      {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      }
    );

    if (!response.ok) {
      console.log(`   ❌ Erreur HTTP: ${response.status}`);
      return;
    }

    const details = await response.json();

    console.log(`   Status: ${details.status}`);
    console.log(`   Finished: ${details.finished ? 'OUI' : 'NON'}`);

    if (details.stoppedAt) {
      const duration = new Date(details.stoppedAt) - new Date(details.startedAt);
      console.log(`   Durée: ${duration}ms`);
    }

    // Vérifier la structure des données
    if (!details.data) {
      console.log('   ⚠️  Pas de propriété "data"');
      console.log('   Structure:', Object.keys(details).join(', '));
      return;
    }

    if (!details.data.resultData) {
      console.log('   ⚠️  Pas de propriété "resultData"');
      console.log('   Structure data:', Object.keys(details.data).join(', '));
      return;
    }

    if (!details.data.resultData.runData) {
      console.log('   ⚠️  Pas de propriété "runData"');
      console.log('   Structure resultData:', Object.keys(details.data.resultData).join(', '));

      // Afficher l'erreur si présente
      if (details.data.resultData.error) {
        console.log('\n   ❌ ERREUR GLOBALE:');
        console.log('   Message:', details.data.resultData.error.message || details.data.resultData.error);
      }

      return;
    }

    const runData = details.data.resultData.runData;
    const nodeNames = Object.keys(runData);

    console.log(`   Nœuds exécutés: ${nodeNames.length}`);
    console.log('');

    // Afficher les 4 premiers nœuds
    const firstFour = nodeNames.slice(0, 4);

    firstFour.forEach((nodeName, index) => {
      const nodeRuns = runData[nodeName];
      if (!nodeRuns || nodeRuns.length === 0) return;

      const nodeData = nodeRuns[0];
      const hasError = nodeData.error !== undefined;
      const status = hasError ? '❌' : '✅';

      console.log(`   ${index + 1}. ${status} ${nodeName}`);

      if (hasError) {
        console.log(`      Erreur: ${nodeData.error.message}`);
      } else if (nodeData.data && nodeData.data.main && nodeData.data.main[0] && nodeData.data.main[0].length > 0) {
        const output = nodeData.data.main[0][0].json;
        const keys = Object.keys(output).slice(0, 5);
        console.log(`      Output: ${keys.join(', ')}`);

        if (output.requestType) {
          console.log(`      requestType: "${output.requestType}"`);
        }
      }
    });

    console.log('');

  } catch (error) {
    console.error('   ❌ Erreur:', error.message);
  }
}

analyzeExecutions();

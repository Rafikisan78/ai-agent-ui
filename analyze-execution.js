// Analyser une exécution spécifique en détail

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';

// Analyser l'exécution réussie (1838) et les erreurs (1840, 1839, 1837)
const EXECUTION_IDS = ['1838', '1840', '1839']; // Success, Error, Error

async function analyzeExecution(executionId) {
  console.log('═'.repeat(70));
  console.log(`🔍 ANALYSE EXÉCUTION #${executionId}`);
  console.log('═'.repeat(70));
  console.log('');

  try {
    const response = await fetch(
      `${N8N_BASE_URL}/api/v1/executions/${executionId}`,
      {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      }
    );

    if (!response.ok) {
      console.error('❌ Erreur:', response.status);
      return;
    }

    const details = await response.json();

    console.log(`Status: ${details.status}`);
    console.log(`Mode: ${details.mode}`);
    console.log(`Démarré: ${new Date(details.startedAt).toLocaleString('fr-FR')}`);
    console.log(`Terminé: ${details.finished ? 'OUI' : 'NON'}`);

    if (details.stoppedAt) {
      const duration = new Date(details.stoppedAt) - new Date(details.startedAt);
      console.log(`Durée: ${duration}ms`);
    }

    console.log('');

    // Analyser les nœuds exécutés
    if (details.data && details.data.resultData && details.data.resultData.runData) {
      const runData = details.data.resultData.runData;
      const nodeNames = Object.keys(runData);

      console.log(`📋 Nœuds exécutés: ${nodeNames.length}\n`);

      nodeNames.forEach((nodeName, index) => {
        const nodeRuns = runData[nodeName];
        if (!nodeRuns || nodeRuns.length === 0) return;

        const nodeData = nodeRuns[0];
        const hasError = nodeData.error !== undefined;
        const startTime = nodeData.startTime;
        const executionTime = nodeData.executionTime;

        console.log(`${index + 1}. ${hasError ? '❌' : '✅'} ${nodeName}`);

        if (executionTime !== undefined) {
          console.log(`   Temps: ${executionTime}ms`);
        }

        if (hasError) {
          console.log(`   ❌ ERREUR: ${nodeData.error.message}`);
          if (nodeData.error.description) {
            console.log(`   Description: ${nodeData.error.description}`);
          }
        } else if (nodeData.data && nodeData.data.main) {
          const mainData = nodeData.data.main[0];
          if (mainData && mainData.length > 0) {
            console.log(`   Données: ${mainData.length} item(s)`);

            // Afficher le premier item
            const firstItem = mainData[0].json;
            const keys = Object.keys(firstItem);
            console.log(`   Clés: ${keys.join(', ')}`);

            // Si c'est un nœud avec logs, chercher les logs
            if (nodeName === 'Analyze Request' ||
                nodeName.includes('Process') ||
                nodeName.includes('Prepare') ||
                nodeName.includes('Extract') ||
                nodeName.includes('Detect') ||
                nodeName.includes('Format')) {

              // Les logs sont dans la sortie standard, pas dans les données JSON
              console.log('   📝 (Logs détaillés disponibles dans N8N UI)');
            }

            // Afficher un aperçu des données importantes
            if (firstItem.requestType) {
              console.log(`   Type détecté: ${firstItem.requestType}`);
            }
            if (firstItem.message) {
              console.log(`   Message: ${firstItem.message.substring(0, 50)}...`);
            }
            if (firstItem.type) {
              console.log(`   Type: ${firstItem.type}`);
            }
            if (firstItem.response) {
              console.log(`   Response: ${firstItem.response.substring(0, 50)}...`);
            }
          }
        }

        console.log('');
      });
    }

    // Afficher les erreurs générales
    if (details.data && details.data.resultData && details.data.resultData.error) {
      console.log('❌ ERREUR GLOBALE:');
      console.log(details.data.resultData.error);
      console.log('');
    }

    console.log('═'.repeat(70));
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function analyzeAll() {
  for (const id of EXECUTION_IDS) {
    await analyzeExecution(id);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('═'.repeat(70));
  console.log('📊 RÉSUMÉ');
  console.log('═'.repeat(70));
  console.log('');
  console.log('🔍 Pour voir les logs détaillés [NODE_NAME]:');
  console.log('   1. Ouvrir: https://n8n.srv766650.hstgr.cloud/executions');
  console.log('   2. Cliquer sur une exécution');
  console.log('   3. Cliquer sur chaque nœud (Function)');
  console.log('   4. Voir la console output avec les logs:');
  console.log('');
  console.log('   ═════════════════════════════════════');
  console.log('   📥 [ANALYZE REQUEST] Début');
  console.log('   [ANALYZE] Body reçu: {...}');
  console.log('   [ANALYZE] Détection: {...}');
  console.log('   ✅ [ANALYZE REQUEST] Type détecté: text');
  console.log('   ═════════════════════════════════════');
  console.log('');
  console.log('═'.repeat(70));
}

analyzeAll();

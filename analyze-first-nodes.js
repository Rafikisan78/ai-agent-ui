// Analyser les 4 premiers nœuds de la dernière exécution

const N8N_BASE_URL = 'https://n8n.srv766650.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYmFlYjc5NS00Nzc2LTQzOTctOWY5Yi0xNjExZDliZWY2ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2NTgwMjM4LCJleHAiOjE3NjkxMjI4MDB9.CBbABeefd_ibnSmH-aL1lDvYebsesu6QXsw7n8eLMrQ';

async function analyzeFirstNodes() {
  console.log('═'.repeat(70));
  console.log('🔍 ANALYSE DES 4 PREMIERS NŒUDS');
  console.log('═'.repeat(70));
  console.log('');

  try {
    // Récupérer les dernières exécutions
    const execResponse = await fetch(
      `${N8N_BASE_URL}/api/v1/executions?limit=1&status=error`,
      {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      }
    );

    const execList = await execResponse.json();

    if (!execList.data || execList.data.length === 0) {
      console.log('❌ Aucune exécution en erreur trouvée');
      return;
    }

    const latestExecution = execList.data[0];
    const executionId = latestExecution.id;

    console.log(`📋 Exécution #${executionId}`);
    console.log(`   Date: ${new Date(latestExecution.startedAt).toLocaleString('fr-FR')}`);
    console.log(`   Status: ${latestExecution.status}`);
    console.log('');

    // Récupérer les détails complets
    const detailsResponse = await fetch(
      `${N8N_BASE_URL}/api/v1/executions/${executionId}`,
      {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      }
    );

    const details = await detailsResponse.json();

    if (!details.data || !details.data.resultData || !details.data.resultData.runData) {
      console.log('❌ Pas de données d\'exécution disponibles');
      return;
    }

    const runData = details.data.resultData.runData;
    const nodeNames = Object.keys(runData);

    console.log(`📊 Total nœuds exécutés: ${nodeNames.length}`);
    console.log('');

    // Analyser les 4 premiers nœuds
    const firstFourNodes = nodeNames.slice(0, 4);

    firstFourNodes.forEach((nodeName, index) => {
      console.log('─'.repeat(70));
      console.log(`${index + 1}. NŒUD: ${nodeName}`);
      console.log('─'.repeat(70));

      const nodeRuns = runData[nodeName];
      if (!nodeRuns || nodeRuns.length === 0) {
        console.log('   ⚠️  Aucune donnée d\'exécution');
        console.log('');
        return;
      }

      const nodeData = nodeRuns[0];
      const hasError = nodeData.error !== undefined;

      // Statut
      console.log(`   Status: ${hasError ? '❌ ERREUR' : '✅ SUCCÈS'}`);

      // Temps d'exécution
      if (nodeData.executionTime !== undefined) {
        console.log(`   Temps: ${nodeData.executionTime}ms`);
      }

      // Heure de démarrage
      if (nodeData.startTime) {
        console.log(`   Démarré: ${new Date(nodeData.startTime).toLocaleTimeString('fr-FR')}`);
      }

      console.log('');

      // Afficher l'erreur si présente
      if (hasError) {
        console.log('   ❌ ERREUR DÉTECTÉE:');
        console.log(`   Message: ${nodeData.error.message}`);

        if (nodeData.error.description) {
          console.log(`   Description: ${nodeData.error.description}`);
        }

        if (nodeData.error.context) {
          console.log('   Contexte:', JSON.stringify(nodeData.error.context, null, 2));
        }

        console.log('');
      }

      // Afficher les données de sortie
      if (nodeData.data && nodeData.data.main) {
        const mainData = nodeData.data.main[0];

        if (mainData && mainData.length > 0) {
          console.log(`   📤 Données de sortie: ${mainData.length} item(s)`);

          const firstItem = mainData[0].json;
          const keys = Object.keys(firstItem);

          console.log(`   Clés: ${keys.join(', ')}`);
          console.log('');

          // Afficher les valeurs importantes
          console.log('   📋 Valeurs:');

          if (firstItem.requestType) {
            console.log(`      requestType: "${firstItem.requestType}"`);
          }

          if (firstItem.message) {
            const msg = firstItem.message.substring(0, 100);
            console.log(`      message: "${msg}${firstItem.message.length > 100 ? '...' : ''}"`);
          }

          if (firstItem.type) {
            console.log(`      type: "${firstItem.type}"`);
          }

          if (firstItem.source) {
            console.log(`      source: "${firstItem.source}"`);
          }

          if (firstItem.prompt) {
            const prompt = firstItem.prompt.substring(0, 100);
            console.log(`      prompt: "${prompt}${firstItem.prompt.length > 100 ? '...' : ''}"`);
          }

          if (firstItem.audio_data !== undefined) {
            console.log(`      audio_data: ${firstItem.audio_data ? 'présent' : 'absent'}`);
          }

          if (firstItem.audioData !== undefined) {
            console.log(`      audioData: ${firstItem.audioData ? 'présent' : 'absent'}`);
          }

          console.log('');

          // Afficher l'objet JSON complet si petit
          const jsonStr = JSON.stringify(firstItem, null, 2);
          if (jsonStr.length < 500) {
            console.log('   📄 JSON complet:');
            console.log(jsonStr.split('\n').map(line => '      ' + line).join('\n'));
            console.log('');
          }
        } else {
          console.log('   ⚠️  Aucune donnée de sortie');
          console.log('');
        }
      } else {
        console.log('   ⚠️  Pas de données de sortie disponibles');
        console.log('');
      }
    });

    console.log('═'.repeat(70));
    console.log('📊 DIAGNOSTIC');
    console.log('═'.repeat(70));
    console.log('');

    // Compter les erreurs
    const errorNodes = firstFourNodes.filter(nodeName => {
      const nodeRuns = runData[nodeName];
      return nodeRuns && nodeRuns[0] && nodeRuns[0].error !== undefined;
    });

    if (errorNodes.length > 0) {
      console.log(`❌ ${errorNodes.length} nœud(s) en erreur sur les 4 premiers:`);
      errorNodes.forEach(nodeName => {
        const nodeRuns = runData[nodeName];
        const error = nodeRuns[0].error;
        console.log(`   - ${nodeName}: ${error.message}`);
      });
      console.log('');
    } else {
      console.log('✅ Les 4 premiers nœuds fonctionnent correctement');
      console.log('');
      console.log('⚠️  L\'erreur se situe probablement plus loin dans le workflow.');
      console.log('');
    }

    console.log('💡 Pour voir TOUS les nœuds:');
    console.log(`   https://n8n.srv766650.hstgr.cloud/executions/${executionId}`);
    console.log('');
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

analyzeFirstNodes();

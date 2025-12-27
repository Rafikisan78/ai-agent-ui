# Instructions: Activer le Workflow N8N

## Problème actuel

L'application ne peut pas **démarrer automatiquement** le workflow N8N car:

1. ❌ **N8N nécessite une API key** pour activer/désactiver des workflows via API
2. ❌ **L'API key n'est pas configurée** dans votre instance N8N
3. ✅ **Le workflow doit être activé manuellement** dans l'interface N8N

## Solution Simple: Activation Manuelle (Recommandé)

### Étape 1: Ouvrir votre workflow N8N

1. Allez sur: **https://n8n.srv766650.hstgr.cloud/workflow/Ud7XshnIobx6Dd2U**
2. Vous verrez votre workflow dans l'éditeur

### Étape 2: Activer le workflow

1. En haut à droite du workflow, cherchez le **toggle (interrupteur)**
2. Cliquez dessus pour **l'activer** (il devient vert)
3. Vous devriez voir: **"Active"** ou **"Actif"**

### Étape 3: Vérifier dans l'application

1. Retournez sur votre application: **http://localhost:3004**
2. **Déconnectez-vous** (bouton rouge "Déconnexion")
3. **Reconnectez-vous**
4. Vous devriez maintenant voir: **🟢 N8N connecté**

---

## Alternative: Activation Automatique (Avancé)

Si vous voulez que l'application active automatiquement le workflow, vous devez:

### Option A: Obtenir une API Key N8N

**⚠️ Attention**: Votre instance N8N doit supporter les API keys (version cloud ou self-hosted avec API activée)

1. Ouvrez N8N: **https://n8n.srv766650.hstgr.cloud**
2. Allez dans **Settings** (⚙️)
3. Cherchez **API** ou **API Keys**
4. Créez une nouvelle API key
5. Copiez la clé

6. Ajoutez-la dans `.env`:
   ```env
   VITE_N8N_API_KEY=votre_cle_api_ici
   ```

7. Redémarrez l'application (`npm run dev`)

### Option B: Workflow Auto-Activation

Créer un **second workflow** dans N8N qui:
1. S'active automatiquement au démarrage de N8N
2. Active votre workflow principal via l'API interne

**C'est complexe et non nécessaire** si vous activez simplement le workflow manuellement.

---

## Ce que fait actuellement l'application

Lorsque vous vous connectez, l'application:

1. ✅ **Vérifie que N8N est accessible** (ping le webhook)
2. ✅ **Affiche un indicateur de statut**:
   - 🟢 Vert = N8N répond (webhook accessible)
   - 🟠 Orange = N8N ne répond pas
3. ❌ **NE démarre PAS le workflow** (car pas d'API key)

**Important**: L'indicateur 🟢 signifie que N8N **répond**, mais **ne garantit pas** que le workflow est actif.

---

## Vérification rapide

Pour vérifier si votre workflow est actif:

### Dans N8N:

1. Ouvrez: **https://n8n.srv766650.hstgr.cloud/workflows**
2. Cherchez votre workflow dans la liste
3. Regardez la colonne **"Active"**:
   - ✅ **ON** (vert) = Workflow actif
   - ❌ **OFF** (gris) = Workflow inactif

### Dans votre application:

1. Envoyez un prompt test (ex: "Bonjour")
2. Si vous recevez une réponse → ✅ Workflow actif
3. Si erreur/timeout → ❌ Workflow inactif

---

## Recommandation Finale

**Activez simplement le workflow manuellement dans N8N**:

1. Cliquez sur le toggle pour l'activer (vert)
2. Le workflow reste actif **jusqu'à ce que vous le désactiviez**
3. Même après un redémarrage de N8N, il reste actif
4. Aucune configuration supplémentaire nécessaire

✅ **C'est la méthode la plus simple et la plus fiable!**

---

## Troubleshooting

### Problème: "🟠 N8N déconnecté" même après activation

**Cause**: Le webhook ne répond pas

**Solutions**:
1. Vérifiez que le workflow est **actif** (toggle vert)
2. Vérifiez que le nœud **Webhook** dans le workflow a le bon path:
   - Path attendu: `/webhook-test/ai-agent-fiable`
3. Testez manuellement le webhook:
   ```bash
   curl -X POST https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```

### Problème: Le workflow se désactive tout seul

**Cause**: Erreur dans le workflow

**Solution**:
1. Ouvrez le workflow dans N8N
2. Regardez les **executions** (historique d'exécution)
3. Cherchez les erreurs en rouge
4. Corrigez les erreurs
5. Réactivez le workflow

---

## Résumé

| Action | Automatique? | Requis? |
|--------|--------------|---------|
| Activer le workflow dans N8N | ❌ Manuel | ✅ Oui |
| Vérifier la connexion N8N | ✅ Auto | ✅ Oui |
| Envoyer des requêtes au workflow | ✅ Auto | ✅ Oui |

**Il vous suffit d'activer le workflow une seule fois dans N8N!** 🚀

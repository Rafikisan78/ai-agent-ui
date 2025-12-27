# 🤖 Guide: Configuration Claude AI dans le Workflow

Vous avez remplacé ChatGPT par Claude AI. Voici comment configurer correctement le workflow.

---

## 📊 Configuration Actuelle

- **IA Texte**: Claude AI (Anthropic) au lieu de ChatGPT
- **IA Audio**: Whisper (OpenAI) - transcription
- **IA Image**: DALL-E (OpenAI) - génération d'images
- **IA Vidéo**: Replicate - génération de vidéos

---

## ✅ Étapes de Configuration

### 1. Ouvrir le Workflow

URL: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF

### 2. Vérifier le Nœud Claude AI

**Chercher le nœud**:
- Nom: "AI Agent" ou "Anthropic Chat Model" ou "Claude AI"
- Position: Entre "Route Content Type" et "Format Text Response"

**Vérifier les connexions**:
```
Route Content Type (sortie 0 = text)
    ↓
Claude AI / Anthropic Chat Model
    ↓
Format Text Response
    ↓
Merge All Responses
    ↓
Respond to Webhook ← VÉRIFIER CETTE CONNEXION!
```

### 3. Configurer le Nœud Claude AI

**Si c'est "Anthropic Chat Model"**:
1. Cliquer sur le nœud
2. **Model**: claude-3-5-sonnet-20241022 (ou claude-3-opus, claude-3-haiku)
3. **Prompt**: `{{ $json.prompt }}`
4. **Credential**: Anthropic Account

**Si c'est "AI Agent"**:
1. Cliquer sur le nœud
2. Vérifier que le modèle de langage est "Anthropic Chat Model"
3. Configurer le prompt
4. **Credential**: Anthropic Account

### 4. Créer le Credential Anthropic

**Si le credential "Anthropic Account" n'existe pas**:

1. Dans le nœud Claude AI, cliquer sur "Credential to connect with"
2. Cliquer sur "Create New Credential"
3. Sélectionner "Anthropic API"
4. **API Key**: Entrer votre clé Anthropic
   - Format: `sk-ant-...`
   - Obtenir sur: https://console.anthropic.com/settings/keys
5. Cliquer sur "Save"

### 5. Vérifier le Nœud "Format Text Response"

Le nœud doit extraire la réponse de Claude AI correctement:

```javascript
// [LOG] Formatage réponse texte
console.log('═'.repeat(60));
console.log('💬 [FORMAT TEXT] Début');

const data = $input.first().json;
console.log('[FORMAT TEXT] Data Claude:', JSON.stringify(data, null, 2).substring(0, 500));

// Pour Claude AI via Anthropic Chat Model
const response = data.content?.[0]?.text ||
                 data.text ||
                 data.choices?.[0]?.message?.content || '';

console.log('[FORMAT TEXT] Réponse extraite:', response.substring(0, 200));

const result = {
  type: 'text',
  response: response,
  prompt: $('Detect Content Type').item.json.prompt,
  source: $('Detect Content Type').item.json.source
};

console.log('✅ [FORMAT TEXT] Formatage terminé');
console.log('[FORMAT TEXT] Type:', result.type);
console.log('[FORMAT TEXT] Longueur réponse:', response.length);
console.log('═'.repeat(60));

return { json: result };
```

**Important**: Le format de réponse de Claude AI est différent de ChatGPT:
- **ChatGPT**: `data.choices[0].message.content`
- **Claude AI**: `data.content[0].text`

### 6. Vérifier la Connexion à "Respond to Webhook"

**CRITIQUE**: Vérifiez visuellement dans N8N:

```
Merge All Responses
    ↓  ← Cette flèche DOIT exister!
Respond to Webhook
```

**Si pas de connexion**:
1. Cliquer sur "Merge All Responses"
2. Faire glisser le point de sortie (rond à droite)
3. Connecter à "Respond to Webhook"
4. **Cliquer "SAVE"**

### 7. Configurer les Autres Credentials

**OpenAI** (pour Whisper et DALL-E):
1. Whisper Transcription → OpenAI Account
2. DALL-E Generate Image → OpenAI Account
3. API Key: `sk-proj-...` ou `sk-...`

**Replicate** (optionnel pour vidéos):
1. Replicate Video Generation → Generic Credential (Header Auth)
2. Header Name: `Authorization`
3. Header Value: `Token VOTRE_TOKEN_REPLICATE_ICI...`

### 8. Sauvegarder

1. **Cliquer "SAVE"** en haut à droite
2. Vérifier toggle **VERT** (actif)

---

## 🧪 Tests

### Test 1: Test Manuel dans N8N

1. Cliquer sur "Webhook" → "Listen for Test Event"
2. Dans un terminal:
   ```bash
   curl -X POST https://n8n.srv766650.hstgr.cloud/webhook-test/voice-text-video \
     -H "Content-Type: application/json" \
     -d '{"message":"Bonjour Claude","type":"text"}'
   ```
3. Dans N8N:
   - Vérifier que tous les nœuds deviennent **VERTS**
   - Cliquer sur "Claude AI" → Voir la réponse
   - Cliquer sur "Format Text Response" → Voir les données formatées
   - Cliquer sur "Respond to Webhook" → Voir la réponse finale

4. Désactiver "Listen for Test Event"

### Test 2: Test Automatique

```bash
cd "c:\Users\elias\OneDrive\Documents\Nouveau dossier\n8n-trigger-ui"
node test-workflow-complet.js
```

**Résultat attendu**:
```
1️⃣  TEST: Requête texte simple
   Status: 200 OK
   ✅ Réponse JSON reçue
   Type: text
   Response: Bonjour! Je suis Claude, un assistant IA créé par Anthropic...
```

### Test 3: Dans l'Application

```
1. Ouvrir: http://localhost:3001
2. Mode: 📝 Texte
3. Message: "Bonjour Claude, peux-tu te présenter?"
4. Résultat: Réponse de Claude AI
```

---

## 🔍 Vérifier les Logs

### Dans N8N Executions

1. Ouvrir: https://n8n.srv766650.hstgr.cloud/executions
2. Cliquer sur la dernière exécution
3. Vérifier chaque nœud:
   - **Analyze Request**: `[ANALYZE REQUEST] Type détecté: text`
   - **Process Text**: `[PROCESS TEXT] Message: Bonjour Claude`
   - **Detect Content**: `[DETECT CONTENT] Type détecté: text`
   - **Claude AI**: Voir la réponse de Claude
   - **Format Text**: `[FORMAT TEXT] Réponse extraite: Bonjour!...`
   - **Respond to Webhook**: Données JSON retournées

---

## ❌ Troubleshooting

### Problème: Réponse Vide

**Causes**:
1. "Merge All Responses" pas connecté à "Respond to Webhook"
2. Credential Anthropic manquant ou invalide
3. "Format Text Response" n'extrait pas la bonne propriété

**Solutions**:
1. Vérifier les connexions visuellement
2. Recréer le credential Anthropic
3. Modifier "Format Text Response" pour utiliser `data.content[0].text`

### Problème: Erreur Credential

**Message**: "Missing credentials" ou "Invalid API key"

**Solutions**:
1. Vérifier que la clé Anthropic est valide
2. Format: `sk-ant-api03-...`
3. Créer une nouvelle clé sur: https://console.anthropic.com/settings/keys
4. Reconfigurer le credential dans N8N

### Problème: Format de Réponse Incorrect

**Symptôme**: Le champ `response` est vide dans la réponse finale

**Cause**: "Format Text Response" ne trouve pas la réponse de Claude

**Solution**: Modifier le code de "Format Text Response":

```javascript
// Essayer plusieurs formats
const response = data.content?.[0]?.text ||      // Claude AI
                 data.text ||                     // Fallback 1
                 data.output ||                   // AI Agent
                 data.choices?.[0]?.message?.content || // ChatGPT (fallback)
                 '';
```

### Problème: Exécutions en Erreur

**Symptôme**: Beaucoup d'exécutions avec status "error"

**Causes**:
1. Certaines requêtes passent par des chemins incomplets
2. Nœuds non connectés
3. Credentials manquants

**Solution**:
1. Vérifier que TOUS les chemins sont connectés:
   - Voice path: Prepare Audio → Whisper → Extract → Merge
   - Text path: Process Text → Merge
   - Text content: Claude AI → Format Text → Merge All
   - Image content: DALL-E → Format Image → Merge All
   - Video content: Replicate → Format Video → Merge All
2. Merge All → Respond to Webhook

---

## 📊 Comparaison: ChatGPT vs Claude AI

| Aspect | ChatGPT | Claude AI |
|--------|---------|-----------|
| **Nœud N8N** | OpenAI Chat Model | Anthropic Chat Model |
| **Credential** | OpenAI Account | Anthropic Account |
| **API Key Format** | `sk-proj-...` ou `sk-...` | `sk-ant-api03-...` |
| **Modèles** | gpt-4, gpt-3.5-turbo | claude-3-opus, claude-3-sonnet, claude-3-haiku |
| **Format Réponse** | `choices[0].message.content` | `content[0].text` |
| **Prix** | Variable selon modèle | Variable selon modèle |
| **Avantages** | Très populaire, intégrations | Contexte long, sécurité |

---

## 🎯 Checklist Claude AI

- [ ] Workflow ouvert dans N8N
- [ ] Nœud Claude AI (Anthropic Chat Model) présent
- [ ] Nœud connecté: Route Content Type → Claude AI → Format Text
- [ ] Credential Anthropic configuré (API key `sk-ant-...`)
- [ ] "Format Text Response" extrait `data.content[0].text`
- [ ] "Merge All Responses" connecté à "Respond to Webhook"
- [ ] Credentials OpenAI pour Whisper et DALL-E
- [ ] Credentials Replicate (optionnel)
- [ ] "SAVE" cliqué
- [ ] Toggle VERT
- [ ] Test manuel dans N8N → Succès
- [ ] Test terminal → Réponse JSON reçue
- [ ] Test application → Réponse affichée

---

## 💡 Notes Importantes

1. **Claude AI vs ChatGPT**: Les deux fonctionnent bien, c'est un choix personnel
2. **Format de réponse**: Le code "Format Text Response" doit être adapté pour Claude
3. **Coûts**: Vérifiez les quotas et prix sur console.anthropic.com
4. **Limites**: Claude 3 Opus a un contexte de 200k tokens (très long!)

---

## 🔗 Ressources

- **Console Anthropic**: https://console.anthropic.com
- **API Keys**: https://console.anthropic.com/settings/keys
- **Documentation**: https://docs.anthropic.com
- **Workflow N8N**: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF
- **Executions**: https://n8n.srv766650.hstgr.cloud/executions

---

**Dernière mise à jour**: 24/12/2025 19:02

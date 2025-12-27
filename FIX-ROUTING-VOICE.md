# 🔧 FIX: Erreur "Aucune donnée audio" dans Prepare Audio

**Problème**: Le nœud "Prepare Audio for Whisper" s'exécute même pour des requêtes **texte**, causant l'erreur:
```
Error: Aucune donnée audio [Line 13]
```

**Cause**: Le nœud Switch "Route Voice or Text" ne route pas correctement les requêtes.

---

## 🎯 Solution Rapide (5 minutes)

### Étape 1: Ouvrir le Workflow

URL: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF

### Étape 2: Vérifier le Nœud "Route Voice or Text"

1. Cliquer sur le nœud "Route Voice or Text" (Switch)
2. Vérifier la configuration:

**DOIT ÊTRE**:
```
Mode: Rules
Output: 2 (Voice, Text)

Rule 1 (Voice):
  Condition: requestType equals "voice"
  Output: 0

Rule 2 (Text):
  Condition: ELSE (All other values)
  Output: 1
```

### Étape 3: Configuration Correcte du Switch

**Si le Switch n'est pas configuré correctement**:

1. **Supprimer le Switch actuel**:
   - Clic droit sur "Route Voice or Text" → Delete

2. **Créer un nouveau Switch**:
   - Cliquer sur "+" après "Analyze Request"
   - Chercher "Switch"
   - Sélectionner "Switch"

3. **Configurer le Switch**:

   **Mode**: Rules

   **Rule 1 (Voice)**:
   - Field: `requestType` (ou `{{ $json.requestType }}`)
   - Operation: Equals
   - Value: `voice`
   - Output: 0

   **Fallback (Text)**:
   - Cocher "Fallback Output" (pour tous les autres cas)
   - Output: 1

4. **Connecter les Sorties**:
   - Sortie 0 (Voice) → "Prepare Audio for Whisper"
   - Sortie 1 (Text) → "Process Text Input"

5. **Cliquer "Save"**

### Alternative: Modifier le Code "Prepare Audio"

**Si vous ne voulez pas reconfigurer le Switch**, modifiez le nœud "Prepare Audio for Whisper" pour gérer l'absence de données audio:

```javascript
// [LOG] Préparation audio
console.log('═'.repeat(60));
console.log('🎤 [PREPARE AUDIO] Début');

const data = $input.first().json;
const audioData = data.audio_data || data.audioData;

console.log('[PREPARE AUDIO] Taille audio base64:', audioData ? audioData.length : 0);
console.log('[PREPARE AUDIO] Format:', data.format || 'webm');

// NOUVEAU: Vérifier le type de requête
if (data.requestType !== 'voice') {
  console.log('[PREPARE AUDIO] Requête non-vocale détectée, skip');
  console.log('═'.repeat(60));
  // Retourner les données sans traitement audio
  return { json: data };
}

if (!audioData) {
  console.error('❌ [PREPARE AUDIO] Aucune donnée audio!');
  throw new Error('Aucune donnée audio');
}

// Décoder base64 en buffer
const audioBuffer = Buffer.from(audioData, 'base64');
console.log('[PREPARE AUDIO] Buffer créé:', audioBuffer.length, 'bytes');

console.log('✅ [PREPARE AUDIO] Audio prêt pour Whisper');
console.log('═'.repeat(60));

return {
  json: {
    format: data.format || 'webm'
  },
  binary: {
    data: {
      data: audioBuffer,
      mimeType: 'audio/webm',
      fileName: 'audio.webm'
    }
  }
};
```

---

## 🔍 Diagnostic Complet

### Vérifier le Flux de Données

1. **Ouvrir Executions**: https://n8n.srv766650.hstgr.cloud/executions
2. **Cliquer sur l'exécution en erreur**
3. **Vérifier chaque nœud**:

**Nœud "Analyze Request"**:
- Doit retourner `requestType: "text"` pour requête texte
- Doit retourner `requestType: "voice"` pour requête audio

**Nœud "Route Voice or Text"** (Switch):
- Pour `requestType: "text"` → Doit aller vers "Process Text Input" (Output 1)
- Pour `requestType: "voice"` → Doit aller vers "Prepare Audio for Whisper" (Output 0)

**Si le Switch envoie du texte vers le path audio**:
- Le Switch est mal configuré
- Reconfigurer ou supprimer/recréer

---

## 🧪 Test Après Fix

### Test 1: Requête Texte (ne doit PAS aller vers Prepare Audio)

```bash
curl -X POST https://n8n.srv766650.hstgr.cloud/webhook-test/voice-text-video \
  -H "Content-Type: application/json" \
  -d '{"message":"Bonjour","type":"text"}'
```

**Résultat attendu dans N8N**:
```
Webhook → Analyze Request (requestType: "text")
  → Route Voice or Text
    → Process Text Input (Output 1) ✅
    → (PAS Prepare Audio for Whisper)
  → Merge Voice and Text
  → ...
```

### Test 2: Requête Audio (DOIT aller vers Prepare Audio)

```bash
curl -X POST https://n8n.srv766650.hstgr.cloud/webhook-test/voice-text-video \
  -H "Content-Type: application/json" \
  -d '{"audio_data":"UklGRiQAAABXQVZFZm10IBAAAAABAAEA","type":"voice"}'
```

**Résultat attendu dans N8N**:
```
Webhook → Analyze Request (requestType: "voice")
  → Route Voice or Text
    → Prepare Audio for Whisper (Output 0) ✅
    → Whisper Transcription
    → Extract Transcription
  → Merge Voice and Text
  → ...
```

---

## 📊 Configuration Correcte du Switch

### Paramètres du Nœud "Route Voice or Text"

**Nom**: Route Voice or Text
**Type**: Switch
**Mode**: Rules

**Rules**:

| # | Field | Operation | Value | Output |
|---|-------|-----------|-------|--------|
| 1 | `requestType` | Equals | `voice` | 0 (Voice Path) |
| Fallback | - | - | - | 1 (Text Path) |

**Connexions**:
```
Analyze Request
    ↓
Route Voice or Text (Switch)
    ├─ Output 0 (requestType = "voice") → Prepare Audio for Whisper
    └─ Output 1 (Fallback = text/image/video) → Process Text Input
```

---

## ✅ Checklist de Vérification

- [ ] Workflow ouvert dans N8N
- [ ] Nœud "Analyze Request" retourne `requestType` correct
- [ ] Nœud "Route Voice or Text" (Switch) existe
- [ ] Switch configuré avec:
  - [ ] Rule 1: `requestType` equals `voice` → Output 0
  - [ ] Fallback → Output 1
- [ ] Output 0 connecté à "Prepare Audio for Whisper"
- [ ] Output 1 connecté à "Process Text Input"
- [ ] "Save" cliqué
- [ ] Test texte → Ne passe PAS par Prepare Audio
- [ ] Test audio → Passe par Prepare Audio

---

## 🔧 Solution Alternative: Désactiver le Path Audio

**Si vous voulez seulement utiliser du texte pour l'instant**:

1. **Déconnecter "Prepare Audio for Whisper"**:
   - Supprimer la connexion entre "Route Voice or Text" Output 0 et "Prepare Audio"

2. **Connecter directement "Process Text Input"**:
   - "Route Voice or Text" Output 0 → "Process Text Input"
   - "Route Voice or Text" Output 1 → "Process Text Input"

3. **Ou simplifier le workflow**:
   - Supprimer le Switch
   - Connecter directement: Analyze Request → Process Text Input → ...

**Avantage**: Évite les erreurs audio temporairement
**Inconvénient**: Plus de support vocal

---

## 📋 Récapitulatif

**Problème Root Cause**:
- Le Switch "Route Voice or Text" n'est pas configuré correctement
- Toutes les requêtes (texte ET voice) vont vers "Prepare Audio"
- "Prepare Audio" lance l'erreur car il ne trouve pas `audio_data` dans les requêtes texte

**Solution**:
1. Reconfigurer le Switch avec la règle `requestType equals voice`
2. OU Modifier "Prepare Audio" pour vérifier `requestType` avant de traiter

**Test**: Après le fix, les requêtes texte doivent passer par "Process Text Input" uniquement.

---

**Dernière mise à jour**: 24/12/2025 19:05

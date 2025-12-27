# 🎤 Fonctionnalité Vocale Ajoutée

## ✅ Résumé

J'ai ajouté une fonctionnalité vocale complète à votre application avec **2 modes d'enregistrement vocal**:

### Mode 1: 📝 Reconnaissance Instantanée (existant, amélioré)
- Transcription en temps réel via Web Speech API
- Rapide mais moins précis

### Mode 2: 🎤 Enregistrement Audio (NOUVEAU)
- Enregistre l'audio en webm
- Envoie à N8N → Whisper AI (OpenAI) pour transcription
- Meilleure précision, support multilingue

## 🎯 Ce qui a été fait

### 1. Workflow N8N Créé
- **Nom**: "Video-Voice-Text Watcher"
- **ID**: `EM3TcglVa2ngfwRF`
- **URL**: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF
- **Webhook**: https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video
- **Statut**: ⚠️ Workflow de base créé, À COMPLÉTER manuellement

### 2. Application Web Mise à Jour
- ✅ Nouveau composant `VoiceRecorder` (enregistrement audio)
- ✅ Nouveau composant `PromptInputWithVoice` (UI améliorée)
- ✅ Service `n8n-voice.js` (envoi audio au workflow)
- ✅ `App.jsx` modifié (gestion des requêtes vocales)
- ✅ Sélecteur de mode vocal (Texte/Audio)

### 3. Variables d'Environnement
Ajoutées dans `.env`:
```env
VITE_N8N_VOICE_WORKFLOW_ID=EM3TcglVa2ngfwRF
VITE_N8N_VOICE_WEBHOOK_URL=https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video
```

## 📋 Action Requise (IMPORTANT)

### Le workflow N8N doit être complété manuellement

Le workflow créé ne contient que 3 nœuds de base. Vous devez le compléter dans N8N.

**2 Options**:

### Option A: Test Rapide (5 minutes) ⚡

Pour tester que tout fonctionne:

1. Ouvrir: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF
2. Modifier le nœud "Analyze Request"
3. Remplacer le code par:
   ```javascript
   const body = $input.first().json.body || $input.first().json;
   return {
     json: {
       type: 'text',
       response: `Test OK! Données: ${JSON.stringify(body)}`,
       timestamp: new Date().toISOString()
     }
   };
   ```
4. Sauvegarder (Ctrl+S)
5. Tester dans l'application

### Option B: Workflow Complet (30 minutes) 🎯

Suivre le guide: **[GUIDE-WORKFLOW-VOICE.md](GUIDE-WORKFLOW-VOICE.md)**

Ajoute tous les nœuds pour:
- Whisper (transcription audio)
- ChatGPT (réponses texte)
- DALL-E (images)
- Replicate (vidéos)

## 🧪 Test

```bash
# Tester le workflow
node test-voice-workflow.js

# Résultat attendu après Option A:
# Status: 200 OK
# ✅ Réponse: { "type": "text", "response": "Test OK! ..." }
```

## 📁 Fichiers Créés

### Services
- `src/services/n8n-voice.js` - Envoi audio au workflow

### Composants
- `src/components/VoiceRecorder.jsx` - Enregistrement audio
- `src/components/PromptInputWithVoice.jsx` - UI avec modes vocaux

### Scripts
- `create-voice-workflow-simple.js` - Création du workflow
- `test-voice-workflow.js` - Test du workflow

### Documentation
- **[DEMARRAGE-RAPIDE-VOIX.md](DEMARRAGE-RAPIDE-VOIX.md)** ⭐ Commencer ici
- **[GUIDE-WORKFLOW-VOICE.md](GUIDE-WORKFLOW-VOICE.md)** - Guide complet
- **[RESUME-AJOUT-VOIX.md](RESUME-AJOUT-VOIX.md)** - Détails techniques
- **[N8N-API-GUIDE.md](N8N-API-GUIDE.md)** - Référence API N8N

## 🎮 Utilisation

1. **Ouvrir l'application**: http://localhost:3001
2. **Sélectionner le mode vocal**:
   - 📝 Texte: Reconnaissance instantanée
   - 🎤 Audio: Enregistrement pour Whisper
3. **Enregistrer**:
   - Cliquer sur le micro
   - Parler (ex: "Bonjour")
   - Cliquer sur stop
4. **Attendre la réponse**

## 🔧 Architecture

```
[User parle]
    ↓
[VoiceRecorder] → Enregistre en webm
    ↓
[Convertit en base64]
    ↓
[sendVoiceToWorkflow()]
    ↓
[N8N Webhook]
    ↓
[Whisper AI] → Transcrit
    ↓
[ChatGPT/DALL-E/Replicate] → Répond
    ↓
[Application] → Affiche
```

## ⚠️ État Actuel

| Composant | Statut |
|-----------|--------|
| Application Web | ✅ Prête |
| Services | ✅ Prêts |
| Composants UI | ✅ Prêts |
| Workflow N8N | ⚠️ À compléter |

## 🚀 Prochaines Étapes

1. **Maintenant**: Faire Option A (test rapide - 5 min)
2. **Ensuite**: Faire Option B (workflow complet - 30 min)
3. **Tester**: Tous les types (texte/image/vidéo depuis vocal)

## 📚 Documentation

- **Démarrage**: [DEMARRAGE-RAPIDE-VOIX.md](DEMARRAGE-RAPIDE-VOIX.md)
- **Guide complet**: [GUIDE-WORKFLOW-VOICE.md](GUIDE-WORKFLOW-VOICE.md)
- **Détails**: [RESUME-AJOUT-VOIX.md](RESUME-AJOUT-VOIX.md)

---

**Le code de l'application est prêt. Il vous reste juste à compléter le workflow N8N!** 🎉

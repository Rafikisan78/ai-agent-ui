# Résumé: Ajout de la Fonctionnalité Vocale

## ✅ Ce qui a été fait

### 1. Création du Workflow N8N "Video-Voice-Text Watcher"

- **ID du workflow**: `EM3TcglVa2ngfwRF`
- **Webhook URL**: `https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video`
- **Statut**: Workflow de base créé, à compléter manuellement dans N8N

**Architecture prévue**:
```
Webhook → Analyse → Switch (voice/text)
  ↓
Voice: Prepare Audio → Whisper (OpenAI) → Extract Text
Text: Process Text
  ↓
Merge → Detect Image/Video → Router (text/image/video)
  ↓
Text: ChatGPT
Image: DALL-E
Video: Replicate
  ↓
Merge All → Respond
```

### 2. Nouveaux Fichiers Créés

#### Backend/Services

1. **[src/services/n8n-voice.js](src/services/n8n-voice.js)**
   - Service pour envoyer l'audio au nouveau workflow
   - `sendVoiceToWorkflow()` - Envoie l'audio encodé en base64
   - `sendTextToVoiceWorkflow()` - Envoie du texte au workflow voice

#### Composants UI

2. **[src/components/VoiceRecorder.jsx](src/components/VoiceRecorder.jsx)**
   - Composant d'enregistrement audio avec MediaRecorder API
   - Capture l'audio en webm/opus
   - Conversion en base64 pour envoi à N8N
   - Interface avec timer et contrôles (enregistrer/arrêter/annuler)

3. **[src/components/PromptInputWithVoice.jsx](src/components/PromptInputWithVoice.jsx)**
   - Nouvelle version du PromptInput avec 2 modes vocaux:
     - **Mode Texte** (📝): Reconnaissance vocale instantanée (Web Speech API)
     - **Mode Audio** (🎤): Enregistrement audio pour Whisper (meilleure qualité)
   - Sélecteur de mode
   - Intégration des deux composants vocaux

#### Scripts

4. **[create-voice-workflow.js](create-voice-workflow.js)**
   - Script complexe (non utilisé, trop de détails pour l'API)

5. **[create-voice-workflow-simple.js](create-voice-workflow-simple.js)**
   - Script utilisé pour créer le workflow de base via l'API N8N
   - Workflow minimal (Webhook → Function → Response)

#### Documentation

6. **[GUIDE-WORKFLOW-VOICE.md](GUIDE-WORKFLOW-VOICE.md)**
   - Guide complet étape par étape pour compléter le workflow dans N8N
   - Instructions détaillées pour chaque nœud
   - Code des fonctions à copier-coller
   - Troubleshooting

7. **[N8N-API-GUIDE.md](N8N-API-GUIDE.md)**
   - Guide complet de l'API N8N
   - Tous les endpoints disponibles
   - Exemples de code pour chaque fonctionnalité
   - Cas d'usage pratiques

### 3. Fichiers Modifiés

#### [.env](.env)
Ajout des variables pour le workflow voice:
```env
VITE_N8N_VOICE_WORKFLOW_ID=EM3TcglVa2ngfwRF
VITE_N8N_VOICE_WEBHOOK_URL=https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video
```

#### [src/App.jsx](src/App.jsx)
- Import du nouveau composant `PromptInputWithVoice`
- Import du service `sendVoiceToWorkflow`
- Ajout de la fonction `handleVoiceSubmit()` pour traiter les enregistrements audio
- Remplacement de `PromptInput` par `PromptInputWithVoice` dans le rendu
- Gestion du polling vidéo pour les demandes vocales

---

## 🎯 Fonctionnalités Ajoutées

### Mode Vocal Amélioré

L'application dispose maintenant de **2 modes vocaux**:

#### 1. Mode Reconnaissance Instantanée (📝 Texte)
- **Technologie**: Web Speech Recognition API (navigateur)
- **Fonctionnement**: Transcription en temps réel par le navigateur
- **Avantage**: Instantané, gratuit
- **Inconvénient**: Moins précis, nécessite connexion internet active

#### 2. Mode Enregistrement Audio (🎤 Audio) - **NOUVEAU**
- **Technologie**: MediaRecorder API → Whisper AI (OpenAI)
- **Fonctionnement**:
  1. Enregistre l'audio en webm
  2. Convertit en base64
  3. Envoie au workflow N8N
  4. Whisper transcrit l'audio
  5. Le texte est traité (ChatGPT/DALL-E/Replicate)
- **Avantages**:
  - Meilleure précision (Whisper AI)
  - Support multilingue excellent
  - Fonctionne même avec accents/bruits
- **Inconvénient**: Légèrement plus lent (envoi audio + transcription)

### Interface Utilisateur

**Nouveau sélecteur de mode vocal**:
```
[📝 Texte] [🎤 Audio]
```

**Indicateur visuel**:
- Mode Texte: Point bleu + "Mode reconnaissance vocale instantanée"
- Mode Audio: Point rouge + "Mode enregistrement audio (Whisper AI)"

**Contrôles d'enregistrement**:
- Bouton microphone rouge pour démarrer
- Timer en temps réel (MM:SS)
- Bouton vert (stop) pour envoyer
- Bouton gris (X) pour annuler

---

## 📋 Étapes Restantes (À FAIRE)

### Étape 1: Compléter le Workflow dans N8N

⚠️ **CRITIQUE**: Le workflow créé est minimal et doit être complété manuellement.

1. **Ouvrir le workflow**: https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF

2. **Suivre le guide**: Ouvrir [GUIDE-WORKFLOW-VOICE.md](GUIDE-WORKFLOW-VOICE.md)

3. **Ajouter tous les nœuds**:
   - Switch pour router voice/text
   - OpenAI Whisper pour la transcription
   - ChatGPT pour les réponses texte
   - DALL-E pour les images
   - Replicate pour les vidéos
   - Functions pour les logs

4. **Configurer les credentials**:
   - OpenAI API (pour Whisper, ChatGPT, DALL-E)
   - Replicate API (pour les vidéos)

5. **Activer le workflow** (toggle vert)

### Étape 2: Tester l'Application

1. **Redémarrer le serveur** (si pas déjà fait):
   ```bash
   npm run dev
   ```

2. **Ouvrir l'application**: http://localhost:3001

3. **Tester le mode Audio**:
   - Sélectionner "🎤 Audio"
   - Cliquer sur le micro rouge
   - Parler (ex: "Bonjour, génère-moi une image d'un coucher de soleil")
   - Cliquer sur le bouton vert (stop)
   - Attendre la transcription et la réponse

4. **Tester le mode Texte**:
   - Sélectionner "📝 Texte"
   - Cliquer sur le micro bleu
   - Parler
   - Le texte apparaît automatiquement dans la zone de saisie

### Étape 3: Vérifier les Logs

**Dans la console du navigateur (F12)**:
```
🎤 Audio enregistré, envoi au workflow...
📊 Chunk audio: 8192 bytes
📦 Blob créé: 245760 bytes
📤 Envoi audio (base64): U29tZUF1ZGlvRGF0YQ...
🎤 Envoi audio au workflow voice...
📊 Taille audio (base64): 327680
✅ Réponse reçue: {...}
```

**Dans N8N (Executions)**:
1. Aller sur: https://n8n.srv766650.hstgr.cloud/executions
2. Voir la dernière exécution
3. Vérifier chaque nœud (vert = succès, rouge = erreur)
4. Consulter les logs console.log dans les Functions

---

## 🧪 Tests Suggérés

### Test 1: Requête Texte Vocale
```
🎤 "Bonjour, comment ça va ?"
→ Devrait retourner une réponse ChatGPT
```

### Test 2: Génération d'Image Vocale
```
🎤 "Génère-moi une image d'un chat astronaute dans l'espace"
→ Détecte "/image" (ou pas selon transcription)
→ Génère une image avec DALL-E
```

### Test 3: Génération de Vidéo Vocale
```
🎤 "Crée une vidéo d'un papillon dans un jardin"
→ Détecte "/video" (ou pas)
→ Lance Replicate
→ Démarre le polling
```

### Test 4: Comparaison des Modes
```
📝 Mode Texte: "Raconte-moi une blague"
🎤 Mode Audio: "Raconte-moi une blague"
→ Comparer vitesse et précision
```

---

## 🔧 Dépannage

### Problème: "Erreur d'accès au microphone"

**Cause**: Permissions non accordées

**Solution**:
1. Vérifier que l'application est en HTTPS (ou localhost)
2. Autoriser le microphone dans les paramètres du navigateur
3. Chrome: icône cadenas → Autoriser Microphone

### Problème: "Erreur 404 Not Found" sur le webhook

**Cause**: Workflow non actif

**Solution**:
1. Ouvrir https://n8n.srv766650.hstgr.cloud/workflow/EM3TcglVa2ngfwRF
2. Cliquer sur le toggle pour activer (vert)
3. Réessayer

### Problème: Transcription vide ou incorrecte

**Cause**: Audio trop court, trop de bruit, ou Whisper non configuré

**Solution**:
1. Parler plus fort et clairement
2. Enregistrer au moins 2-3 secondes
3. Vérifier que Whisper est bien configuré dans N8N
4. Vérifier les credentials OpenAI

### Problème: "No audio data" dans les logs

**Cause**: MediaRecorder non supporté ou erreur d'enregistrement

**Solution**:
1. Utiliser Chrome ou Edge (meilleur support)
2. Vérifier la console pour les erreurs
3. Essayer de redémarrer le navigateur

---

## 📊 Architecture Technique

### Flux de Données - Mode Audio

```
User (microphone)
    ↓
[VoiceRecorder Component]
    ↓ (MediaRecorder API)
Audio Blob (webm)
    ↓ (FileReader)
Base64 String
    ↓
[handleVoiceSubmit()]
    ↓
[sendVoiceToWorkflow()]
    ↓ (HTTP POST)
N8N Webhook (/voice-text-video)
    ↓
[Analyze Request Function]
    ↓ (type: 'voice')
[Switch Node] → Voice branch
    ↓
[Prepare Audio Function]
    ↓ (decode base64)
[Whisper STT (OpenAI)]
    ↓
Text transcription
    ↓
[Detect Image/Video]
    ↓
[Router] → Text/Image/Video
    ↓
[ChatGPT / DALL-E / Replicate]
    ↓
Response
    ↓
Frontend (setResponse)
    ↓
[MultimodalDisplay]
```

### Flux de Données - Mode Texte

```
User (microphone)
    ↓
[VoiceInput Component]
    ↓ (Web Speech Recognition)
Text transcription
    ↓
[handleVoiceTranscript()]
    ↓ (fills textarea)
User clicks "Envoyer"
    ↓
[handleSubmit()]
    ↓
[triggerWorkflow()] (workflow classique)
```

---

## 💾 Variables d'Environnement

```env
# Workflow classique (existant)
VITE_N8N_WEBHOOK_URL=https://n8n.srv766650.hstgr.cloud/webhook/ai-agent-fiable
VITE_N8N_WORKFLOW_ID=SYKtWT1uWl7GlsKq

# Workflow voice (nouveau)
VITE_N8N_VOICE_WEBHOOK_URL=https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video
VITE_N8N_VOICE_WORKFLOW_ID=EM3TcglVa2ngfwRF

# API N8N
VITE_N8N_BASE_URL=https://n8n.srv766650.hstgr.cloud
VITE_N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase
VITE_SUPABASE_URL=https://nivbykzatzugwslnodqi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## 🎓 Pour Aller Plus Loin

### Améliorations Possibles

1. **Streaming audio en temps réel**: Envoyer l'audio par chunks pendant l'enregistrement
2. **Feedback visuel**: Afficher la forme d'onde pendant l'enregistrement
3. **Support multi-langues**: Sélecteur de langue pour Whisper
4. **Historique audio**: Sauvegarder les enregistrements dans Supabase
5. **Lecture audio**: Permettre de réécouter avant d'envoyer
6. **Text-to-Speech**: Lire les réponses à voix haute

### Optimisations

1. **Compression audio**: Réduire la taille avant envoi
2. **Cache Whisper**: Éviter de retranscrire le même audio
3. **Détection de silence**: Arrêter automatiquement l'enregistrement
4. **Détection de langue**: Auto-détecter la langue parlée

---

## ✅ Checklist Finale

- [x] Workflow N8N créé (base)
- [x] Service n8n-voice.js créé
- [x] Composant VoiceRecorder créé
- [x] Composant PromptInputWithVoice créé
- [x] App.jsx modifié pour gérer la voix
- [x] .env mis à jour
- [x] Guide de complétion du workflow rédigé
- [ ] **Workflow complété dans N8N** (À FAIRE)
- [ ] **Workflow activé** (À FAIRE)
- [ ] **Tests effectués** (À FAIRE)

---

## 🚀 Commandes Rapides

```bash
# Redémarrer le serveur
npm run dev

# Tester le workflow voice
node test-voice-workflow.js  # (à créer si besoin)

# Vérifier les credentials N8N
node check-n8n-credentials.js  # (à créer si besoin)
```

---

## 📞 Support

En cas de problème:
1. Vérifier les logs console (F12)
2. Vérifier les exécutions N8N: https://n8n.srv766650.hstgr.cloud/executions
3. Consulter [GUIDE-WORKFLOW-VOICE.md](GUIDE-WORKFLOW-VOICE.md)
4. Consulter [N8N-API-GUIDE.md](N8N-API-GUIDE.md)

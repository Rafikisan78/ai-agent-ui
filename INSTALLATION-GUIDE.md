# Guide d'Installation - Workflows Multimodaux

## 📋 Vue d'ensemble

Ce guide vous permet d'installer deux workflows N8N pour créer un système multimodal avec :
- ✅ Conversations textuelles (Claude Sonnet 4.5)
- ✅ Génération d'images (DALL-E 3)
- ✅ Génération de vidéos asynchrone (Replicate)

---

## 🔧 Prérequis

### 1. Comptes et API Keys nécessaires

| Service | Usage | Où l'obtenir |
|---------|-------|--------------|
| **Anthropic** | Claude (conversations) | https://console.anthropic.com |
| **OpenAI** | DALL-E 3 (images) | https://platform.openai.com |
| **Replicate** | Zeroscope v2 (vidéos) | https://replicate.com |
| **Supabase** | Base de données (optionnel) | https://supabase.com |

### 2. Votre clé Replicate actuelle
```
Token VOTRE_TOKEN_REPLICATE_ICI
```

---

## 📦 Installation - Workflow Principal

### Étape 1 : Importer le workflow

1. Ouvrez N8N : `https://n8n.srv766650.hstgr.cloud`
2. Menu (☰) → **Import from File**
3. Sélectionnez : `n8n-main-workflow-final.json`
4. Cliquez sur **Import**

### Étape 2 : Configurer Anthropic (Claude)

1. Cliquez sur le nœud **"Claude Model"**
2. Dans "Credentials", cliquez sur **"Create New"**
3. Remplissez :
   - **Name** : `Anthropic API`
   - **API Key** : Votre clé Anthropic
4. Cliquez sur **Save**

### Étape 3 : Configurer OpenAI (DALL-E)

1. Cliquez sur le nœud **"DALL-E Request"**
2. Dans "Credentials", cliquez sur **"Create New"**
3. Remplissez :
   - **Name** : `OpenAI API`
   - **API Key** : Votre clé OpenAI
4. Cliquez sur **Save**

### Étape 4 : Activer le workflow

1. Cliquez sur le bouton **"Active"** (en haut à droite)
2. Le workflow devient actif
3. Notez l'URL du webhook : `https://n8n.srv766650.hstgr.cloud/webhook-test/ai-agent-fiable`

---

## 🎬 Installation - Workflow Background (Vidéo)

### Étape 1 : Importer le workflow

1. Menu (☰) → **Import from File**
2. Sélectionnez : `n8n-background-workflow-final.json`
3. Cliquez sur **Import**

### Étape 2 : Configurer Replicate

1. Cliquez sur le nœud **"Replicate Start"**
2. Authentication : **Generic Credential Type** → **Header Auth**
3. Cliquez sur **"Create New"**
4. Remplissez :
   - **Credential Name** : `Replicate API`
   - **Header Name** : `Authorization`
   - **Header Value** : `Token VOTRE_TOKEN_REPLICATE_ICI`
5. Cliquez sur **Save**

### Étape 3 : Appliquer le credential au second nœud

1. Cliquez sur le nœud **"Check Status"**
2. Dans "Credentials", sélectionnez le credential **"Replicate API"** créé à l'étape précédente
3. Cliquez sur **Save**

### Étape 4 : Configurer Supabase (Optionnel)

> ⚠️ Vous pouvez sauter cette étape pour l'instant. Les vidéos seront générées mais non sauvegardées.

1. Cliquez sur le nœud **"Save to Supabase"**
2. Créez un credential Supabase avec votre URL et Anon Key

### Étape 5 : Activer le workflow

1. Cliquez sur le bouton **"Active"**
2. Le workflow devient actif
3. Vérifiez que le webhook est enregistré : `https://n8n.srv766650.hstgr.cloud/webhook-test/video-bg-process`

---

## 🧪 Tests

### Test 1 : Conversation texte

```bash
cd n8n-trigger-ui
node test-webhook.js
```

Modifiez le payload dans `test-webhook.js` :
```javascript
const payload = {
    message: "Quelle est la capitale de la France ?",
    timestamp: new Date().toISOString()
};
```

**Résultat attendu** : Réponse de Claude (4-5 secondes)

---

### Test 2 : Génération d'image

Modifiez le payload :
```javascript
const payload = {
    message: "/image un chat mignon dans l'espace",
    timestamp: new Date().toISOString()
};
```

**Résultat attendu** : URL d'image DALL-E (10-12 secondes)

---

### Test 3 : Génération vidéo

Modifiez le payload :
```javascript
const payload = {
    message: "/video un chat qui court dans un jardin",
    timestamp: new Date().toISOString()
};
```

**Résultat attendu** : Message "🎬 Génération vidéo en cours..." avec taskId (< 1 seconde)

---

## 🔍 Vérification du routage

Pour vérifier que le Router fonctionne :

```bash
node test-detect-type.js
```

Résultat attendu :
```
Test 1 - Texte normal:
{ inputType: 'text', command: null, prompt: '...' }

Test 2 - Image:
{ inputType: 'image-generation', command: 'image', prompt: 'un chat mignon' }

Test 3 - Vidéo:
{ inputType: 'video-generation', command: 'video', prompt: 'un chat qui court...' }
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────┐
│           WORKFLOW PRINCIPAL (Synchrone)            │
│  webhook: ai-agent-fiable                           │
│                                                     │
│  Webhook → Validate → Detect Type → Router         │
│                           │                         │
│           ┌───────────────┼───────────────┐         │
│           ▼               ▼               ▼         │
│      AI Agent        DALL-E        Video Async      │
│      (Claude)       (OpenAI)       Response         │
│           │               │               │         │
│           └───────────────┴───────┬───────┘         │
│                                   │                 │
│                           Trigger BG (fire)         │
│                                   │                 │
│                           Format Response           │
│                                   │                 │
│                            Send Response            │
│                                                     │
└─────────────────────────────────────────────────────┘
                          │
          HTTP POST       │ (fire-and-forget)
                          ▼
┌─────────────────────────────────────────────────────┐
│         WORKFLOW BACKGROUND (Asynchrone)            │
│  webhook: video-bg-process                          │
│                                                     │
│  Webhook BG → Replicate Start → Wait 10s           │
│                                    ↓                │
│                            Check Status             │
│                                    ↓                │
│                      Is Ready? → Wait 5s Retry      │
│                           ↓                         │
│                    Save to Supabase                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Checklist d'installation

- [ ] Workflow principal importé
- [ ] Credential Anthropic configuré
- [ ] Credential OpenAI configuré
- [ ] Workflow principal **ACTIF**
- [ ] Workflow background importé
- [ ] Credential Replicate configuré (Header Auth)
- [ ] Credential Replicate appliqué à "Check Status"
- [ ] Workflow background **ACTIF**
- [ ] Test texte réussi
- [ ] Test image réussi
- [ ] Test vidéo réussi (message immédiat)

---

## 🐛 Dépannage

### Erreur 404 "webhook not registered"

→ Le workflow n'est pas actif. Cliquez sur "Active"

### Erreur "Invalid version" Replicate

→ La version du modèle a changé. Utilisez :
```
9ca6c6d8e3bb2a954e5cb2f68aeec48d4e70aed4c7e3b6e7dbd741aae6ad0e85
```

### La vidéo ne route pas vers la bonne branche

→ Vérifiez que vous utilisez bien `n8n-main-workflow-final.json`

### Le workflow background ne se déclenche pas

→ Vérifiez que les deux workflows sont **actifs** simultanément

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'exécution dans N8N
2. Testez chaque nœud individuellement
3. Vérifiez que tous les credentials sont corrects

**Version** : 1.0 Final
**Dernière mise à jour** : 2025-12-23

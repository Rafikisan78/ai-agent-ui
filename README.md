# 🚀 N8N Multimodal Interface

Interface web React pour interagir avec un workflow N8N intelligent capable de générer du texte, des images et des vidéos.

## ✨ Fonctionnalités

- ✅ **Conversation AI** avec Claude Sonnet 4.5
- ✅ **Génération d'images** avec DALL-E 3
- ✅ **Génération de vidéos** avec Replicate (Stable Video Diffusion)
- ✅ **Entrée vocale** (Speech Recognition)
- ✅ **Synthèse vocale** (Text-to-Speech)
- ✅ **Upload de fichiers** (Drag & Drop)
- ✅ **Historique des conversations** (Supabase)
- ✅ **Interface responsive** (Tailwind CSS)

---

## 🎯 Commandes Disponibles

| Commande | Description | Exemple |
|----------|-------------|---------|
| Texte normal | Conversation avec Claude | `Explique-moi la photosynthèse` |
| `/image [description]` | Génération d'image | `/image un dragon bleu volant` |
| `/video [description]` | Génération de vidéo | `/video un chat qui court` |
| 🎤 Microphone | Entrée vocale | Cliquer sur le micro et parler |
| 📎 Upload | Analyse de fichier | Glisser un fichier (à configurer) |

---

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)
- Compte N8N (self-hosted ou cloud)
- Clés API:
  - Anthropic (Claude)
  - OpenAI (DALL-E)
  - Replicate (vidéo)

### Étapes

1. **Cloner le projet**
```bash
cd n8n-trigger-ui
npm install
```

2. **Configurer les variables d'environnement**

Créez/modifiez le fichier `.env` :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
VITE_N8N_WEBHOOK_URL=https://votre-n8n.com/webhook-test/ai-agent-fiable
```

3. **Configurer Supabase**

Créez la table `conversations` :
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_message TEXT NOT NULL,
  assistant_response JSONB NOT NULL,
  response_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. **Importer le workflow N8N**

- Ouvrez N8N
- Menu → Import from File
- Sélectionnez `n8n-multimodal-workflow-v4-dalle-replicate.json`
- Configurez les credentials (Anthropic, OpenAI, Replicate)
- Activez le workflow

5. **Lancer l'application**
```bash
npm run dev
```

Ouvrez http://localhost:3003

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         React Frontend (Vite)               │
│  ┌──────────┐  ┌──────────────────────┐    │
│  │ UI       │  │ Services             │    │
│  │ - Input  │  │ - n8n.js             │    │
│  │ - Display│  │ - supabase.js        │    │
│  │ - Voice  │  │ - speech.js          │    │
│  └──────────┘  └──────────────────────┘    │
└────────────┬────────────────┬───────────────┘
             │ HTTP           │ REST API
             │                │
┌────────────▼────────────────▼───────────────┐
│  N8N Workflow          Supabase DB          │
│  ┌─────────────┐      ┌─────────────────┐  │
│  │ Webhook     │      │ conversations   │  │
│  │ Router      │      │ - user_message  │  │
│  │ - Text      │      │ - response      │  │
│  │ - Image     │      │ - type          │  │
│  │ - Video     │      └─────────────────┘  │
│  └─────────────┘                            │
└────────┬────────────────────────────────────┘
         │ API Calls
┌────────▼────────────────────────────────────┐
│        External AI Services                 │
│  Claude 4.5  |  DALL-E 3  |  Replicate     │
└─────────────────────────────────────────────┘
```

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour plus de détails.

---

## 📁 Structure du Projet

```
n8n-trigger-ui/
├── src/
│   ├── components/          # Composants React
│   │   ├── PromptInput.jsx
│   │   ├── MultimodalDisplay.jsx
│   │   ├── VoiceInput.jsx
│   │   └── FileUpload.jsx
│   ├── services/            # Services
│   │   ├── n8n.js          # API N8N
│   │   ├── supabase.js     # Base de données
│   │   └── speech.js       # Voix
│   ├── App.jsx             # Composant principal
│   └── main.jsx            # Point d'entrée
├── .env                     # Variables d'environnement
├── n8n-multimodal-workflow-v4-dalle-replicate.json
├── ARCHITECTURE.md          # Documentation architecture
├── DALLE-SETUP-GUIDE.md    # Guide DALL-E
├── REPLICATE-SETUP-GUIDE.md # Guide Replicate
└── README.md               # Ce fichier
```

---

## 🧪 Tests

### Test du webhook N8N

```bash
cd n8n-trigger-ui
node test-webhook.js
```

### Test de l'interface web

1. Ouvrez http://localhost:3003
2. Testez les commandes:
   - `Bonjour, comment vas-tu ?` (texte)
   - `/image un chat dans l'espace` (image)
   - `/video un chat qui court` (vidéo)
3. Testez le microphone 🎤
4. Vérifiez l'historique dans la sidebar

---

## 🔧 Configuration Avancée

### Ajuster le délai d'attente vidéo

Dans N8N, nœud "Wait 8 Seconds" :
- Changez `Amount: 8` à `Amount: 12` si les vidéos prennent plus de temps

### Modifier la qualité d'image DALL-E

Dans N8N, nœud "DALL-E Request", JSON Body :
```json
{
  "model": "dall-e-3",
  "prompt": "...",
  "quality": "hd",        // "standard" ou "hd"
  "size": "1792x1024"     // Portrait, paysage, carré
}
```

### Modifier la durée de vidéo

Dans N8N, nœud "Replicate Video Start", JSON Body :
```json
{
  "input": {
    "num_frames": 40,  // Plus de frames = vidéo plus longue
    "fps": 7
  }
}
```

---

## 💰 Coûts Estimés

| Service | Coût approximatif | Notes |
|---------|------------------|-------|
| Claude Sonnet 4.5 | ~$0.003/message | Conversation |
| DALL-E 3 | ~$0.04/image | Qualité standard |
| Replicate Video | ~$0.01-0.02/vidéo | 3-5 secondes |
| Supabase | Gratuit | Plan gratuit 500 MB |
| N8N | Gratuit | Self-hosted |

**Estimation mensuelle** : ~$5-10 pour usage modéré (100 images, 50 vidéos, conversations illimitées)

---

## 🐛 Dépannage

### Erreur : "webhook not registered"
→ Activez le workflow N8N (bouton "Active")

### Erreur : "Invalid API key"
→ Vérifiez vos credentials dans N8N (Settings → Credentials)

### L'image/vidéo ne s'affiche pas
→ Vérifiez que `responseData = result[0]` est bien dans App.jsx (ligne 51)
→ Vérifiez les logs N8N pour voir le format de réponse

### Le microphone ne fonctionne pas
→ Autorisez l'accès au microphone dans le navigateur
→ Utilisez HTTPS en production (requis pour Speech API)

### Pas d'historique
→ Vérifiez que la table `conversations` existe dans Supabase
→ Vérifiez les credentials Supabase dans `.env`

---

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture complète
- [SCHEMA-ARCHITECTURE.txt](SCHEMA-ARCHITECTURE.txt) - Schéma visuel
- [DALLE-SETUP-GUIDE.md](DALLE-SETUP-GUIDE.md) - Configuration DALL-E
- [REPLICATE-SETUP-GUIDE.md](REPLICATE-SETUP-GUIDE.md) - Configuration Replicate
- [VIDEO-GENERATION-GUIDE.md](VIDEO-GENERATION-GUIDE.md) - Guide vidéo complet

### Ressources externes

- [React Docs](https://react.dev)
- [N8N Docs](https://docs.n8n.io)
- [Supabase Docs](https://supabase.com/docs)
- [Anthropic API](https://docs.anthropic.com)
- [OpenAI API](https://platform.openai.com/docs)
- [Replicate Docs](https://replicate.com/docs)

---

## 🛣️ Roadmap

- [x] Conversation texte (Claude)
- [x] Génération d'images (DALL-E)
- [x] Génération de vidéos (Replicate)
- [x] Entrée vocale (Speech Recognition)
- [x] Synthèse vocale (TTS)
- [x] Historique (Supabase)
- [ ] Analyse de fichiers (GPT-4 Vision / Claude Vision)
- [ ] Recherche web (Serper API)
- [ ] Génération audio (ElevenLabs)
- [ ] Authentification utilisateur
- [ ] Partage de conversations
- [ ] Export PDF/Markdown
- [ ] Multi-langues

---

## 📄 Licence

MIT

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

---

## 📧 Contact

Pour toute question ou support, ouvrez une issue sur GitHub.

---

**Version** : 4.0 (DALL-E + Replicate)
**Dernière mise à jour** : 2025-12-22

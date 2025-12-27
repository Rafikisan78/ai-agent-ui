# 🔧 Configuration du Switch "Route Voice or Text"

**Date**: 24/12/2025
**Objectif**: Corriger l'erreur "Unexpected character ' ' [Line 169]"

---

## ⚠️ Problème Identifié

Le Switch "Route Voice or Text" a une erreur de syntaxe dans sa configuration, causant:
```
Unexpected character ' ' [Line 169]
```

**Solution**: Supprimer et recréer le Switch avec la bonne configuration.

---

## 📋 Configuration Correcte du Switch

### Paramètres du Nœud

```
Nom: Route Voice or Text
Type: Switch
Mode: Rules
Nombre de Routing Rules: 1
Fallback Output: 1
```

### Routing Rule 1 (Voice)

```
Field Type: Expression
Field Value: {{ $json.requestType }}
Operation: is equal to
Comparison Value: voice
Output: 0
```

**⚠️ ATTENTION**:
- `{{ $json.requestType }}` doit être tapé EXACTEMENT comme ça
- `voice` doit être en minuscules
- Pas d'espaces avant/après

### Fallback Output

```
Fallback Output: 1
```

Cela signifie: toutes les requêtes qui ne sont PAS "voice" (donc texte, image, vidéo) iront vers l'Output 1.

---

## 🔌 Connexions

### Entrée
```
Analyze Request → Route Voice or Text
```

### Sorties
```
Route Voice or Text (Output 0) → Prepare Audio for Whisper
Route Voice or Text (Output 1) → Process Text Input
```

### Flux Complet
```
Webhook
  → Analyze Request
      → Route Voice or Text
          ├─ Output 0 (requestType = "voice")
          │   → Prepare Audio for Whisper
          │       → Whisper Transcription
          │           → Extract Transcription
          │
          └─ Output 1 (tout le reste: text, image, video)
              → Process Text Input

  → Merge Voice and Text
  → Detect Content Type
  → Route Content Type
  → ...
```

---

## ✅ Test de Validation

### Test 1: Requête Voice
```bash
curl -X POST https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video \
  -H "Content-Type: application/json" \
  -d '{"audio_data":"UklGRiQAAABXQVZF","type":"voice"}'
```

**Résultat attendu dans N8N**:
- ✅ Analyze Request: `requestType = "voice"`
- ✅ Route Voice or Text: Prend Output 0
- ✅ Prepare Audio for Whisper: S'exécute
- ✅ Process Text Input: Ne s'exécute PAS

### Test 2: Requête Text
```bash
curl -X POST https://n8n.srv766650.hstgr.cloud/webhook/voice-text-video \
  -H "Content-Type: application/json" \
  -d '{"message":"Bonjour","type":"text"}'
```

**Résultat attendu dans N8N**:
- ✅ Analyze Request: `requestType = "text"`
- ✅ Route Voice or Text: Prend Output 1 (fallback)
- ✅ Process Text Input: S'exécute
- ✅ Prepare Audio for Whisper: Ne s'exécute PAS

---

## 🐛 Erreurs Courantes

### Erreur: "Output 1 is not allowed"

**Cause**: Fallback Output est défini à 1, mais il n'y a qu'un seul Routing Rule.

**Solution**: C'est normal! Le Fallback Output crée automatiquement l'Output 1. Pas besoin de créer une deuxième Rule.

### Erreur: "Unexpected character"

**Cause**: Caractère invisible ou espace dans la configuration.

**Solution**:
1. Supprimer le Switch complètement
2. En recréer un nouveau
3. Taper les valeurs manuellement (ne pas copier-coller)

### Erreur: Toutes les requêtes vont vers le même nœud

**Cause**: La valeur "voice" ne correspond pas exactement.

**Solution**: Vérifier que:
- Le champ est bien `{{ $json.requestType }}`
- La valeur est bien `voice` (minuscules)
- Pas d'espaces

---

## 📊 Configuration Alternative: Deux Rules

Si vous préférez être explicite avec deux rules au lieu d'un fallback:

```
Rule 1 (Voice):
  Field: {{ $json.requestType }}
  Operation: is equal to
  Value: voice
  Output: 0

Rule 2 (Not Voice):
  Field: {{ $json.requestType }}
  Operation: is not equal to
  Value: voice
  Output: 1

Fallback Output: 1 (au cas où)
```

---

## ⚡ Raccourci Clavier

Pour supprimer rapidement un nœud:
1. **Cliquer** sur le nœud pour le sélectionner
2. **Appuyer sur Delete** ou **Backspace**

---

**Dernière mise à jour**: 24/12/2025 23:55
**Auteur**: Claude Sonnet 4.5

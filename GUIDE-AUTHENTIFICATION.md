# Guide d'Installation de l'Authentification

## Vue d'ensemble

Un système d'authentification a été ajouté à l'application pour restreindre l'accès à **rafikisan78@gmail.com** uniquement.

### Fonctionnalités

- ✅ **Email autorisé unique**: Seul rafikisan78@gmail.com peut se connecter
- ✅ **Définition du mot de passe à la première connexion**: Vous définissez votre mot de passe lors de votre première visite
- ✅ **Sécurité**: Mot de passe hashé avec SHA-256
- ✅ **Session persistante**: Reste connecté jusqu'à déconnexion manuelle
- ✅ **Interface moderne**: Écran de connexion responsive et élégant

---

## Installation (2 minutes)

### Étape 1: Créer la table d'authentification dans Supabase

1. Ouvrez votre projet Supabase: https://supabase.com/dashboard/project/nivbykzatzugwslnodqi

2. Cliquez sur **"SQL Editor"** dans le menu de gauche

3. Cliquez sur **"New query"**

4. Copiez le contenu du fichier [create-auth-table.sql](create-auth-table.sql) et collez-le dans l'éditeur SQL

5. Cliquez sur **"Run"** (ou appuyez sur Ctrl+Enter)

6. Vous devriez voir le message: **"Success. No rows returned"**

### Étape 2: Vérifier l'installation

Exécutez le script de test:

```bash
node test-auth-setup.js
```

**Résultat attendu:**

```
🔐 Configuration de l'authentification

1️⃣ Vérification de l'utilisateur autorisé...
✅ Utilisateur trouvé!
   Email: rafikisan78@gmail.com
   Première connexion: Oui
   Créé le: 24/12/2025 12:30:00

📋 Prochaines étapes:
   1. Lancez l'application: npm run dev
   2. Vous serez invité à définir votre mot de passe à la première connexion
   3. Utilisez rafikisan78@gmail.com et définissez un mot de passe sécurisé (8+ caractères)
```

---

## Première Connexion

### 1. Lancer l'application

```bash
npm run dev
```

L'application s'ouvrira sur http://localhost:5173

### 2. Écran de première connexion

Vous verrez un écran vous invitant à **définir votre mot de passe**:

- **Email**: rafikisan78@gmail.com (pré-rempli, non modifiable)
- **Créer un mot de passe**: Entrez un mot de passe sécurisé (minimum 8 caractères)
- **Confirmer le mot de passe**: Re-saisissez le même mot de passe

### 3. Définir le mot de passe

- Choisissez un mot de passe fort (8 caractères minimum)
- Exemples de mots de passe forts:
  - `MonMotDePasse2024!`
  - `SecurePass123@`
  - `MyPassword#2025`

- Cliquez sur **"Définir le mot de passe et se connecter"**

### 4. Vous êtes connecté!

Une fois le mot de passe défini, vous serez automatiquement connecté et redirigé vers l'application.

---

## Connexions Suivantes

### Écran de connexion standard

Après la première connexion, vous verrez l'écran de connexion classique:

- **Email**: rafikisan78@gmail.com
- **Mot de passe**: Entrez le mot de passe que vous avez défini

Cliquez sur **"Se connecter"**

---

## Utilisation

### Déconnexion

Pour se déconnecter:

1. Cliquez sur le bouton **"Déconnexion"** en haut à droite (bouton rouge)
2. Vous serez redirigé vers l'écran de connexion

### Persistance de session

- La session reste active même si vous fermez l'onglet
- La session persiste dans le localStorage du navigateur
- Pour forcer une déconnexion, utilisez le bouton "Déconnexion"

---

## Sécurité

### Mesures de sécurité implémentées

1. **Email unique autorisé**: Seul rafikisan78@gmail.com est dans la base de données
2. **Hashage du mot de passe**: Le mot de passe est hashé avec SHA-256 avant stockage
3. **Pas de stockage en clair**: Le mot de passe n'est jamais stocké en texte brut
4. **Validation côté client**: Vérifications de longueur et de correspondance
5. **Session locale**: Stockée dans localStorage, accessible uniquement à votre navigateur

### Limitations connues

⚠️ **Important pour la production**:

- Le hashage SHA-256 est effectué côté client (pour simplification)
- En production, utilisez:
  - Supabase Auth natif avec hash bcrypt côté serveur
  - Ou un système backend avec bcrypt/argon2
  - HTTPS obligatoire
  - Tokens JWT avec expiration

### Recommandations

Pour une sécurité optimale:

1. **Utilisez un mot de passe fort** (12+ caractères, lettres, chiffres, symboles)
2. **Ne partagez jamais votre mot de passe**
3. **Déconnectez-vous** sur les ordinateurs partagés
4. **Changez régulièrement** votre mot de passe

---

## Fichiers Créés

### Backend (Supabase)

1. **[create-auth-table.sql](create-auth-table.sql)** - Script SQL pour créer la table `app_users`

### Frontend (React)

1. **[src/services/auth.js](src/services/auth.js)** - Service d'authentification
   - `checkFirstLogin()` - Vérifier si c'est la première connexion
   - `setPassword()` - Définir le mot de passe
   - `login()` - Connexion
   - `getSession()`, `saveSession()`, `clearSession()` - Gestion de session

2. **[src/components/Login.jsx](src/components/Login.jsx)** - Composant de connexion
   - Écran de première connexion
   - Écran de connexion standard
   - Validation des mots de passe

3. **[src/App.jsx](src/App.jsx)** - Modifié pour inclure l'authentification
   - Vérification de session au démarrage
   - Redirection vers login si non connecté
   - Bouton de déconnexion

### Scripts de test

1. **[test-auth-setup.js](test-auth-setup.js)** - Vérifier la configuration de l'authentification

---

## Troubleshooting

### Problème: "Could not find the table 'app_users'"

**Cause**: La table n'a pas été créée dans Supabase

**Solution**:
1. Exécutez le script SQL `create-auth-table.sql` dans Supabase SQL Editor
2. Relancez `node test-auth-setup.js` pour vérifier

### Problème: "Email non autorisé"

**Cause**: Vous essayez de vous connecter avec un autre email

**Solution**: Seul rafikisan78@gmail.com est autorisé. Utilisez cet email.

### Problème: "Mot de passe incorrect"

**Cause**: Le mot de passe saisi ne correspond pas

**Solutions**:
1. Vérifiez les majuscules/minuscules
2. Si vous avez oublié votre mot de passe, exécutez ce SQL dans Supabase pour réinitialiser:

```sql
UPDATE app_users
SET is_first_login = TRUE, password_hash = NULL
WHERE email = 'rafikisan78@gmail.com';
```

Puis reconnectez-vous pour redéfinir votre mot de passe.

### Problème: "Les mots de passe ne correspondent pas"

**Cause**: Les deux champs de mot de passe ne sont pas identiques

**Solution**: Assurez-vous de saisir exactement le même mot de passe dans les deux champs

---

## Structure de la Base de Données

### Table `app_users`

| Colonne          | Type      | Description                                    |
|------------------|-----------|------------------------------------------------|
| id               | UUID      | Identifiant unique (auto-généré)               |
| email            | TEXT      | Email de l'utilisateur (unique)                |
| password_hash    | TEXT      | Hash SHA-256 du mot de passe                   |
| is_first_login   | BOOLEAN   | TRUE si première connexion, FALSE après        |
| created_at       | TIMESTAMP | Date de création du compte                     |
| last_login       | TIMESTAMP | Date de dernière connexion                     |

### Données initiales

Un seul utilisateur:
- Email: `rafikisan78@gmail.com`
- is_first_login: `TRUE`
- password_hash: `NULL` (sera défini à la première connexion)

---

## Captures d'Écran

### Écran de Première Connexion

```
┌─────────────────────────────────────────┐
│        AI Agent Multimodal              │
│   Bienvenue! Définissez votre mot       │
│              de passe                   │
├─────────────────────────────────────────┤
│                                         │
│  Email autorisé                         │
│  rafikisan78@gmail.com                  │
│                                         │
│  Créer un mot de passe                  │
│  ┌─────────────────────────────────┐   │
│  │ Au moins 8 caractères...        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Confirmer le mot de passe              │
│  ┌─────────────────────────────────┐   │
│  │ Confirmez votre mot de passe... │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Définir le mot de passe et      │   │
│  │      se connecter               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🔒 Connexion sécurisée                 │
│  Seul rafikisan78@gmail.com est         │
│            autorisé                     │
└─────────────────────────────────────────┘
```

### Écran de Connexion Standard

```
┌─────────────────────────────────────────┐
│        AI Agent Multimodal              │
│   Connectez-vous pour continuer         │
├─────────────────────────────────────────┤
│                                         │
│  Email autorisé                         │
│  rafikisan78@gmail.com                  │
│                                         │
│  Mot de passe                           │
│  ┌─────────────────────────────────┐   │
│  │ Entrez votre mot de passe...    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Se connecter              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🔒 Connexion sécurisée                 │
│  Seul rafikisan78@gmail.com est         │
│            autorisé                     │
└─────────────────────────────────────────┘
```

---

## Checklist Complète

Avant de lancer l'application:

- [ ] Script SQL `create-auth-table.sql` exécuté dans Supabase
- [ ] `node test-auth-setup.js` retourne "Utilisateur trouvé!"
- [ ] `npm run dev` lance l'application
- [ ] L'écran de connexion s'affiche

Première connexion:

- [ ] Email pré-rempli avec rafikisan78@gmail.com
- [ ] Mot de passe défini (8+ caractères)
- [ ] Confirmation du mot de passe identique
- [ ] Connexion réussie
- [ ] Redirection vers l'application principale

Connexions suivantes:

- [ ] Email + mot de passe fonctionnent
- [ ] Bouton "Déconnexion" visible en haut à droite
- [ ] Déconnexion fonctionne
- [ ] Re-connexion fonctionne

---

## Support

Si vous rencontrez des problèmes:

1. Vérifiez que la table existe: `node test-auth-setup.js`
2. Consultez la console du navigateur (F12) pour les erreurs
3. Vérifiez les logs dans Supabase Dashboard → Logs

Tout est prêt! 🚀 Vous pouvez maintenant sécuriser votre application avec l'authentification.

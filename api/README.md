# Bobberchat - API Backend

---

## Vue d'ensemble

API RESTful + WebSocket pour l'application de messagerie Bobberchat.

**Fonctionnalités principales:**
- Authentification JWT (access + refresh tokens)
- CRUD utilisateurs, groupes, messages
- Messagerie temps réel via WebSockets + Redis Pub/Sub
- Rate limiting et sécurité (Helmet)
- Support CORS pour web et Electron
- Base de données MySQL avec Knex.js
- Cache Redis pour WebSockets scalables

---

## Architecture technique

### Stack

- **Runtime**: Node.js 20
- **Framework**: Express 5.1.0
- **Base de données**: MySQL 8.0 (via Knex.js)
- **Cache/PubSub**: Redis 7
- **WebSocket**: ws (native WebSocket library)
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Conteneurisation**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (SSL/TLS via Let's Encrypt)

### Schéma d'architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Internet / Clients                       │
│   (Electron App, Mobile App, Web Browser)                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ HTTPS/WSS (443)
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│  - SSL/TLS Termination (Let's Encrypt)                       │
│  - Rate Limiting                                             │
│  - Static Files Serving                                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ HTTP/WS (3000)
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                  Express API Server                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Middleware Stack                        │    │
│  │  - CORS (origins whitelisted)                        │    │
│  │  - Helmet (security headers)                         │    │
│  │  - Rate Limiter (100k req/15min)                     │    │
│  │  - Cookie Parser (refresh tokens)                    │    │
│  │  - Body Parser (JSON)                                │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Routes (Public)                         │    │
│  │  POST /auth/login                                    │    │
│  │  POST /auth/register                                 │    │
│  │  POST /auth/refresh                                  │    │
│  │  POST /auth/logout                                   │    │
│  │  GET  /health                                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │         Auth Middleware (JWT Verification)           │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │             Routes (Protected)                       │    │
│  │  /api/users       → User CRUD                        │    │
│  │  /api/groups      → Groups CRUD                      │    │
│  │  /api/messages    → Messages CRUD + Lazy Loading     │    │
│  │  /api/groups-users → Group Membership                │    │
│  │  /api/search      → Search Users/Groups              │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              WebSocket Server                        │    │
│  │  - Connection: ws://api:3000/ws?user=<userId>        │    │
│  │  - Events: message, typing, status                   │    │
│  │  - Redis Pub/Sub for multi-instance scaling          │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────┬───────────────────────┬─────────────────────────┘
             │                       │
             │                       │
    ┌────────▼────────┐     ┌────────▼───────┐
    │   MySQL 8.0     │     │   Redis 7      │
    │                 │     │                │
    │  - users        │     │  - WebSocket   │
    │  - groups       │     │    Pub/Sub     │
    │  - messages     │     │  - Sessions    │
    │  - groups_users │     │    (future)    │
    │  - tokens       │     │                │
    └─────────────────┘     └────────────────┘
```

### Flux de données

**Authentification:**
```
1. Client → POST /auth/login {username, password}
2. Backend → bcrypt.compare(password, hash)
3. Backend → JWT.sign(accessToken, 15m) + JWT.sign(refreshToken, 7d)
4. Backend → Set httpOnly cookie (refreshToken)
5. Backend → Response {user, accessToken}
6. Client → Store accessToken in memory
7. Client → Include Authorization: Bearer <token> in all requests
8. If 401 → POST /auth/refresh → New accessToken
```

**Messagerie temps réel:**
```
1. Client A → WebSocket connect ws://api/ws?user=123
2. Client A → ws.send({type: "message", content: "Hello", group_id: 5})
3. Backend → Save to MySQL (messages table)
4. Backend → Redis PUBLISH "chat_messages" {data}
5. Redis → Broadcast to all API instances (horizontal scaling)
6. Backend → ws.send(data) to all connected clients in group
7. Clients B, C, D → Receive message in real-time
```

---

## Prérequis

- **Docker**: >= 20.x
- **Docker Compose**: >= 2.x
- **Node.js**: >= 20.x (pour dev local sans Docker)
- **npm**: >= 9.x

---

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/JMOYSAN/PROJETMULTI_API.git
cd PROJETMULTI_API
git checkout develop
```

### 2. Installer les dépendances (optionnel si Docker)

```bash
npm install
```

> Si vous utilisez Docker, les dépendances seront installées dans le conteneur.

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine:

```env
# JWT Secrets (CHANGER EN PRODUCTION!)
ACCESS_TOKEN_SECRET=your_super_secret_access_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_here
```
---

## Lancement

### Avec Docker (recommandé)

**Démarrer tous les services:**

```bash
npm run restart
```

Cette commande:
1. Arrête les conteneurs existants
2. Rebuild les images Docker
3. Démarre MySQL, Redis, API, Nginx
4. Exécute les migrations Knex automatiquement

**Ou démarrage manuel:**

```bash
# Démarrer les conteneurs
docker compose up -d

# Exécuter les migrations
npm run migrate
```

### Sans Docker (dev local)

**Prérequis:**
- MySQL 8.0 installé localement (port 3306)
- Redis 7 installé localement (port 6379)

```bash
# Installer les dépendances
npm install

# Configurer .env avec MySQL local
# Modifier knexfile.js: host: 'localhost' au lieu de 'mysql'

# Exécuter les migrations
npx knex migrate:latest

# Lancer le serveur
npm start
```

---

## Configuration

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `ACCESS_TOKEN_SECRET` | Secret pour JWT access tokens | (requis) |
| `REFRESH_TOKEN_SECRET` | Secret pour JWT refresh tokens | (requis) |
| `REDIS_URL` | URL de connexion Redis | `redis://redis:6379` |
| `NODE_ENV` | Environnement (dev/prod) | `development` |
| `MYSQL_ROOT_PASSWORD` | Password MySQL root | `password` |
| `MYSQL_DATABASE` | Nom de la base | `mydb` |

### Fichier `.env.example`

```env
# JWT Secrets - GENERATE STRONG SECRETS IN PRODUCTION!
ACCESS_TOKEN_SECRET=abcdefghijklmnopqrstuv
REFRESH_TOKEN_SECRET=eeqwefjsghrguah
```

### Configuration CORS

Dans `index.js`, modifier les origines autorisées:

```javascript
app.use(cors({
    origin: [
        "https://bobberchat.com",      // Production
        "http://localhost:5173",       // Electron dev
        "http://localhost:8081"        // Mobile dev (Expo)
    ],
    credentials: true,
}));
```

---

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Lance le serveur avec nodemon (hot-reload) |
| `npm run restart` | Rebuild + redémarre Docker + migrations |
| `npm run up` | Démarre les conteneurs Docker |
| `npm run down` | Arrête les conteneurs Docker |
| `npm run logs` | Affiche les logs en temps réel |
| `npm run migrate` | Exécute les migrations Knex |
| `npm run reset` | Rollback + remigrate (reset DB) |

### Exemples d'utilisation

**Voir les logs de l'API:**
```bash
npm run logs
# Ou pour un service spécifique:
docker compose logs -f api
```

**Reset complet de la base de données:**
```bash
npm run reset
```

**Accéder au shell MySQL:**
```bash
docker exec -it api-mysql-1 mysql -u root -ppassword mydb
```

**Accéder au shell Redis:**
```bash
docker exec -it chat_redis redis-cli
```

---

## API Documentation

### Endpoints publics

#### POST `/auth/register`
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "theme": "dark",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

#### POST `/auth/login`
Se connecter et obtenir un token JWT.

**Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "theme": "dark"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Cookies:** `refreshToken` (httpOnly, 7 jours)

---

#### POST `/auth/refresh`
Renouveler l'access token avec le refresh token.

**Headers:**
```
Cookie: refreshToken=<token>
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

#### POST `/auth/logout`
Se déconnecter (invalide le refresh token).

**Headers:**
```
Cookie: refreshToken=<token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### GET `/health`
Health check de l'API.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

### Endpoints protégés (JWT requis)

> **Headers requis:**
> ```
> Authorization: Bearer <accessToken>
> ```

#### GET `/api/users`
Liste tous les utilisateurs.

**Response (200):**
```json
[
  {
    "id": 1,
    "username": "johndoe",
    "theme": "dark",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

---

#### PUT `/api/users/:id`
Modifier un utilisateur (thème, etc.).

**Body:**
```json
{
  "theme": "light"
}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "theme": "light"
}
```

---

#### GET `/api/groups`
Liste tous les groupes publics.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "General",
    "is_private": false,
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

---

#### GET `/api/groups/private/:userId`
Liste les groupes privés d'un utilisateur.

**Response (200):**
```json
[
  {
    "id": 5,
    "name": "Team Alpha",
    "is_private": true,
    "created_at": "2025-01-15T11:00:00Z"
  }
]
```

---

#### POST `/api/groups`
Créer un nouveau groupe.

**Body:**
```json
{
  "name": "DevOps Team",
  "is_private": true,
  "user_ids": [1, 2, 3]
}
```

**Response (201):**
```json
{
  "id": 10,
  "name": "DevOps Team",
  "is_private": true
}
```

---

#### POST `/api/groups/:groupId/members`
Ajouter un membre à un groupe.

**Body:**
```json
{
  "user_id": 4
}
```

**Response (201):**
```json
{
  "message": "Member added successfully"
}
```

---

#### GET `/api/messages/group/:groupId/lazy?limit=20&beforeId=100`
Charger les messages d'un groupe (lazy loading).

**Query params:**
- `limit`: Nombre de messages (défaut: 20)
- `beforeId`: ID du message avant lequel charger (pagination)

**Response (200):**
```json
[
  {
    "id": 150,
    "user_id": 1,
    "group_id": 5,
    "content": "Hello team!",
    "created_at": "2025-01-15T12:30:00Z"
  }
]
```

---

#### POST `/api/messages`
Envoyer un nouveau message.

**Body:**
```json
{
  "user_id": 1,
  "group_id": 5,
  "content": "Great work everyone!"
}
```

**Response (201):**
```json
{
  "id": 151,
  "user_id": 1,
  "group_id": 5,
  "content": "Great work everyone!",
  "created_at": "2025-01-15T12:35:00Z"
}
```

---

#### GET `/api/search?q=john`
Rechercher des utilisateurs ou groupes.

**Query params:**
- `q`: Terme de recherche

**Response (200):**
```json
{
  "users": [
    {"id": 1, "username": "johndoe"}
  ],
  "groups": [
    {"id": 3, "name": "John's Team"}
  ]
}
```

---

## WebSocket

### Connexion

```javascript
const ws = new WebSocket('wss://bobberchat.com/ws?user=<userId>');

ws.onopen = () => console.log('Connected');
ws.onclose = () => console.log('Disconnected');
ws.onerror = (err) => console.error('Error:', err);
```

### Format des messages

**Envoi (client → serveur):**
```json
{
  "type": "message",
  "user_id": 1,
  "group_id": 5,
  "content": "Hello World!",
  "created_at": "2025-01-15T12:00:00Z"
}
```

**Réception (serveur → client):**
```json
{
  "type": "message",
  "id": 200,
  "user_id": 2,
  "group_id": 5,
  "content": "Hi there!",
  "created_at": "2025-01-15T12:01:00Z"
}
```

### Architecture Redis Pub/Sub

- **Publisher**: API instances publient les messages sur le channel `chat_messages`
- **Subscriber**: API instances souscrivent au channel
- **Broadcast**: Tous les clients WebSocket connectés reçoivent les messages

**Avantages:**
- Scalabilité horizontale (plusieurs instances d'API)
- Messages persistants même si un serveur redémarre
- Débit élevé (Redis est ultra rapide)

---

## Base de données

### Schéma

#### Table `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  theme VARCHAR(50) DEFAULT 'dark',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `groups`
```sql
CREATE TABLE groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `groups_users`
```sql
CREATE TABLE groups_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Table `messages`
```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  INDEX idx_group_created (group_id, created_at DESC)
);
```

#### Table `tokens`
```sql
CREATE TABLE tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  refresh_token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Migrations Knex

**Créer une migration:**
```bash
docker exec -it api-api-1 npx knex migrate:make migration_name
```

**Rollback dernière migration:**
```bash
docker exec -it api-api-1 npx knex migrate:rollback
```

**Status des migrations:**
```bash
docker exec -it api-api-1 npx knex migrate:status
```

---

## Sécurité

### Mesures implémentées

1. **JWT Double Token:**
   - Access Token (courte durée, 15min)
   - Refresh Token (longue durée, 7j, httpOnly cookie)

2. **Bcrypt:** Hashing des mots de passe (10 rounds)

3. **Helmet:** Headers de sécurité HTTP
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options

4. **Rate Limiting:** 100,000 requêtes / 15 minutes

5. **CORS:** Whitelist des origines autorisées

6. **Trust Proxy:** Support des reverse proxies (Nginx)

7. **httpOnly Cookies:** Refresh tokens inaccessibles en JavaScript

### Bonnes pratiques

- **Secrets forts:** Générer avec `crypto.randomBytes(64)`
- **HTTPS obligatoire:** En production (Let's Encrypt)
- **Variables d'environnement:** Jamais de secrets dans le code
- **Validation des entrées:** Sanitize user input
---

## Guide utilisateur BETA

### Pour les développeurs utilisant l'API

#### Configuration initiale

1. **Démarrer l'API:**
```bash
git clone https://github.com/JMOYSAN/PROJETMULTI_API.git
cd PROJETMULTI_API
git checkout develop
npm run restart
```

2. **Vérifier que l'API fonctionne:**
```bash
curl http://localhost:3000/health
```

Réponse attendue:
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

3. **Tester l'authentification:**
```bash
# Inscription
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Connexion
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

#### Intégration avec les clients

**Electron / Web:**
```javascript
const API_URL = 'https://bobberchat.com';

// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',  // Important pour cookies
  body: JSON.stringify({username, password})
});
const {user, accessToken} = await response.json();
```

**React Native:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, password})
  });
  const {user, accessToken} = await res.json();
  await AsyncStorage.setItem('accessToken', accessToken);
};
```

#### WebSocket Connection

```javascript
const userId = user.id;
const ws = new WebSocket(`wss://bobberchat.com/ws?user=${userId}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'message') {
    console.log('New message:', message);
  }
};

// Envoyer un message
ws.send(JSON.stringify({
  type: 'message',
  user_id: userId,
  group_id: 5,
  content: 'Hello!'
}));
```
## Déploiement

### Production avec Docker

**1. Configurer le serveur:**
```bash
# Installer Docker
curl -fsSL https://get.docker.com | sh

# Cloner le repo
git clone https://github.com/JMOYSAN/PROJETMULTI_API.git
cd PROJETMULTI_API
git checkout develop
```

**2. Variables d'environnement production:**
```env
ACCESS_TOKEN_SECRET=<generated_secret>
REFRESH_TOKEN_SECRET=<generated_secret>
```

**3. Configurer Nginx SSL:**
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir certificat SSL
sudo certbot --nginx -d bobberchat.com
```

**4. Démarrer:**
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Monitoring

**Logs:**
```bash
docker compose logs -f api
```

**Stats conteneurs:**
```bash
docker stats
```

**Backup MySQL:**
```bash
docker exec api-mysql-1 mysqldump -u root -ppassword mydb > backup.sql
```

---

## Auteurs

- Joaquim Moysan
- Lyam Bathalon
- François Santerre

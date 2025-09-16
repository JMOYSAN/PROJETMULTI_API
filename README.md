# Contrôle 2 – Application de chat (suite)

## Objectif
Étendre l’application de clavardage (Contrôle 1) pour y ajouter :
- Un panneau de configuration dans l’application desktop
- Un backend API (dans un conteneur Docker)
- Une gestion en temps réel des messages privés avec Redis
- Une base de données pour la persistance
- Un panneau d’administration séparé pour gérer utilisateurs, salons et messages

---

## Application Desktop (Electron)
- Ajouter un panneau de configuration pour :
  - Connexion/déconnexion
  - Sélection du nom d’utilisateur
  - Liste des salons (général, équipe, hors-sujet…)
  - Choix du thème (clair/sombre)
  - Affichage des messages entrants (API ou mocks)

- Connexion avec l’API pour :
  - Sauvegarder/récupérer la configuration utilisateur (nom, thème…)
  - Sauvegarder/récupérer les messages privés

- Comportement :
  - Les modifications de configuration doivent être prises en compte immédiatement
  - Au démarrage, l’application ouvre directement la fenêtre de chat
  - La gestion des messages de groupe est prévue plus tard — se concentrer sur les messages privés maintenant

---

## API (Docker)
- Fournir une API REST pour :
  - Utilisateurs : création, authentification, suppression
  - Permissions/rôles : admin, modérateur, utilisateur
  - Salons : création, modification, suppression
  - Messages : création, modification, suppression
  - Sauvegarder/récupérer les configurations
  - Sauvegarder/récupérer les messages privés

- Technologies :
  - Redis pour la gestion des messages en temps réel
  - Base de données SQL ou NoSQL pour la persistance

- Exigences :
  - Justifier le choix du langage/framework dans le README
  - Fournir une documentation claire de l’API (routes HTTP, méthodes, schémas de données)
  - Inclure un schéma UML/architecture montrant l’app desktop + API + conteneurs
  - Fournir un `docker-compose.yml` pour démarrer l’API et les dépendances

---

## Panneau d’administration
- Accessible uniquement par un administrateur
- Authentification admin
- Liste des utilisateurs / suppression
- Liste des salons / suppression
- Liste des messages / suppression

Le panneau d’administration doit être séparé de l’API et déployable comme un conteneur distinct.  
Il peut être intégré à l’application desktop, sous forme de webapp ou d’outil console.

---

## Livrables
- Trois dépôts Git distincts :
  - Application desktop
  - API
  - Panneau d’administration
- Un README dans chaque dépôt contenant :
  - Prérequis
  - Instructions d’installation
  - Instructions de configuration
  - Instructions de lancement
- Un schéma d’architecture incluant tous les conteneurs et modules
- Une documentation de l’API (Markdown ou OpenAPI)

---

## Critères d’évaluation
- Validation et gestion des erreurs attendues (réseau hors ligne, formats invalides…)
- Explication de la stratégie de synchronisation
- L’ensemble doit tourner via Docker/docker-compose (aucune installation manuelle)
- Gestion de versions (branches + tags)

---

## Résumé
Cette phase ajoute :
- Un panneau de configuration
- Un backend Dockerisé
- Un panneau admin
- Une architecture temps réel avec Redis
- Une base de données persistante

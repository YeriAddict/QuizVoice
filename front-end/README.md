# Big Data Front

Ce repository comprend l'ensemble du code pour l'interface web du projet big data. Ce projet a pour but de créer une plateforme de quiz sur lequel un utilisateur peut répondre à des questions par reconnaissance vocale. L'ensemble du projet est hébergé sur un cloud AWS.

## Framework

L'interface web de notre plateforme de quiz a été réalisé avec le framework Angular.

## Installation des dépendances

Pour cloner le projet, saisir la commande ci-dessous :

```
git clone git@devops.telecomste.fr:big-data-project/big-data-front.git
```

Une fois le projet cloné, lancer la commande `npm install` pour installer l'ensemble des dépendances nécessaires au projet.

## Lancement

En premier lieu, éditez le fichier `big-data-front/src/app/tils/constants.ts` et remplacez:
```
export const API_URL = "http://localhost:8080";
```
Par l'IP de votre back, HTTPS ou HTTP.

Si votre back et votre front sont exécutés en local, vous n'avez pas besoin de modifier cette valeur.

Dans le cas où vous souhaiteriez utiliser ce logiciel en ligne. Il faudra que le front et le back soient hébergés sur un site web sécurisé en HTTPS (règles de sécurité de la plupart des navigateurs). Dans ce cas, il faudra modifier l'adresse de ce fichier vers votre URL en HTTPS.

Pour démarrer l'application web, saisir la commande `ng serve` qui va compiler et lancer le projet sur le port 4200. L'application est alors accessible à l'adresse suivante [http://localhost:4200](http://localhost:4200).

## Auteurs

* Kim-Céline FRANOT
* Yannis GUIRONNET
* Pierre LABATTUT
* Denis LEANG
* Pierre TASSAN

# Explication du travail effectué

### Dossier components

Dans ce dossier, nous retrouvons l'ensemble des composants Angular qui définissent les différentes éléments et pages de notre application, tel que:
* le footer, aka l'élément de bas de page
* la page de jeu "game"
* le leaderboard qui permet de visualiser les 10 meilleurs joueurs
* la page de login pour se connecter
* la page de profil
* la page de création de compte "register"
* la toolbar aka la barre de navigation

### Dossier models

Dans ce dossier, nous retrouvons 3 fichiers comportant les classes d'objets qui sont manipulés dans l'application, soit :
* la classe Question
* la classe User
* la classe Answer

### Dossier services

Dans ce dossier, nous retrouvons l'ensemble des fichiers de services qui nous permettent de consommer notre API depuis notre front, soit :
* AudioService : gère l'envoi de la réponse de l'utilisateur
* QuestionService : gère la récupération des questions et des thèmes
* StorageService : gère le stockage de l'utilisateur et du thème sélectionné dans la session storage de l'onglet du navigateur
* UserService : gère la création de compte, la connexion, la récupération d'utilisateur, la récupération des données pour le leaderboard


### Dossier utils

Dans ce dossier, nous retrouvons 3 fichiers comportant des constantes de notre application, soit :
* L'URL de notre API qui se trouve à [http://localhost:8080](http://localhost:8080).
* La liste de tous les pays qui est utilisée dans notre formulaire d'inscription
* La liste des genres possibles qui est utilisée dans notre formulaire d'inscription.

# TwoNotes

Réalisé dans le cadre d'un projet à l'ENSIMAG en collaboration avec Hugo Cartigny & Tanguy Paymal.

## Objectifs

TwoNotes est une application mobile pour ios et android de notes partagées.
Elle permet de créer des notes et ajouter des colaborateurs en lecture seule ou en lecture et écriture.
Les colaborateurs de la note ont chacun la possibilité de **undo** et **redo** leur traits et peuvent aussi supprimer le contenu d'une note avec **reset**. **Save** permet de sauvegarder la note actuelle en SVG (toujours en développement).

## Cas d'usages

### Cas d'usage global

![](assets/use_case_global.jpg)
La bulle "**All actions**" dans le diagramme (situé en haut à droite) représente les différentes actions réalisable par l'Utilisateur (User).
En effet, un Utilisateur doit s'être préablement connecté et donc disposer d'un compte utilisateur sur l'application avant de pouvoir réaliser quelconque actions.

### Cas d'usage dessin

![](assets/use_case_drawing.jpg)

Un créateur est un Utilisateur (User) qui a crée une note. Il a donc des droits sur celle-ci comme l'ajout de nouveau collaborateurs.
C'est droit sont détaillés sur le diagramme de cas d'utilisation ci-dessus.

### Cas d'usage connexion

![](assets/use_case_connexion.jpg)

Un annonyme est toute personne utilisant l'application sans être connecté. Il devient automatiquement Utilisateur (User) lorsqu'il est connecté. En tant qu'annonyme, seul les pages de connexion et d'inscription sont disponible.

### Cas d'usage de la modification d'un collaborateur

![](assets/use_case_collab.jpg)

Un collaborateur est un Utilisateur (User) qui a été invité à la lecture (et potentiellement l'écriture) par un Créateur sur une de ces notes personnels.  
Ainsi un Utilisateur peut avoir en même temps le rôle de Collaborateur et Créateur sur l'application. Toutefois, il ne peut pas l'être sur la même note.
En effet, si il a crée la note il sera Créateur mais ne pourra pas devenir Collaborateur.

## Scenarii d'usage

### Dessin dans une note partagée

![](assets/scenarii_1.jpeg)

### Register et login d'un utilisateur de l'application

![](assets/scenarii_login.jpeg)

## Diagramme de classe

![](assets/diagramme_données.jpg)

## Choix techniques réalisés

### Front : APP

Nous avons commencé au début du projet à utiliser expo pour avoir rapidement accès à l'application sur Android et iOS en même temps. Nous avons par la suite enlevé expo du projet pour utiliser une librairie récente qui n'était pas disponible avec expo.

Nous avons utilisé Typescript sur l'application pour avoir du typage et rendre le code plus maintenable.
Pour le linting, nous avons choisi d'utiliser ESLint et Prettier.

Par manque de temps, nous avons choisi de ne pas faire de tests Detox.

Concernant l'organisation de l'application :

- Dossier **screens** : Nos différentes pages.
- Dossier **components** : Les différents composants que nous avons créé. Il y en a très peu car nous n'avions pas spécialement besoin de les réutiliser ailleurs dans le code et les pages ne sont pas très grandes.
- Dossier **canvas** : Contient des constantes et des fonctions utilitaires utilisées dans les composants liés au canvas.
- Dossier **constants** : Les constantes sur le layout et les couleurs.
- Dossier **navigation** : L'organisation des pages de l'application avec la gestion de ce qui est visible en fonction de l'authentification.
- Dossier **hooks** : Les hook pour les couleurs.
- Dossier **utils** : Utilitaire pour gérer le token, le nom et le mot de passe de l'utilisateur.
- Dossier **Assets.xcassets** : Pour le logo de l'app.

### Backend : API

Nous avons choisi d'utiliser Sequelize avec SQLite pour la DB car c'est ce que nous avions vu en cours. De plus, le modèle de base de données relationnel correspondait bien au projet. Le backend est une API REST avec des sockets pour la gestion des traits sur les notes partagées. Les traits sont transmis à chaque personne connectée sur la même note en temps réel. Un trait est sauvegardé en base de données uniquement à la fin quand l'utilisateur le relache/fini. Ainsi, nous évitons de faire des modifications dans la base de données à chaque changement lorsque l'utilisateur trace le trait.

Pour avoir une documentation automatique de l'API, nous avons utilisé swagger.

Nous avons implémenté un middleware pour gérer le token pour tous les endpoints.

Le linting est aussi réalisé avec ESLint et Prettier comme dans le front.

Pour tester les endpoints, nous utilisons JEST. La seule feature qui n'est pas testée est le captcha (reCaptcha) qui permet de tester que ce n'est pas un robot qui se connecte à l'API.

Le captcha fonctionne grâce à l'utilisateur de l'API de Google reCaptcha et comble le pré-requis du projet en terme d'utilisation d'API externe.

### Gestion des rôles

Dans l'application un utilisateur peut être un **créateur** et/ou un **collaborateur**.
Il est **créateur** lorsqu'il crée une note. Il peut ensuite vouloir partager la note en lecture et écriture ou juste en lecture à un **collaborateur**. Le rôle **collaborateur** permet à un utilisateur d'accéder à une note qu'un autre utilisateur lui a partagé avec différents droits.

Les droits sont très simple, il y a juste un boolean avec le droit d'écriture ou non pour le collaborateur.

## Démonstration vidéo

[Vidéo](https://www.youtube.com/watch?v=Y7Bk75WKeDg)

Une fonctionnalité a été ajouté après la vidéo pour voir si nous sommes on non en **readonly** sur une note. Cette fonctionnalité est présente sous la forme d'un texte présent sur le haut de la note.

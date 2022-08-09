# Hot Takes - Construisez une API sécurisée pour une application d'avis gastronomiques

Projet étudiant dans le cadre du parcours "Développeur Web" d'OpenClassrooms. Attention : ceci n'est pas une correction officielle. Je décline toute responsabilité en cas de plagiat pour valider le projet.

## Installation du projet

1. Clonez ce repository qui correspond à l'API Backend du projet.

2. OpenClassrooms fournit la partie Frontend que vous pouvez cloner depuis ce repository : https://github.com/OpenClassrooms-Student-Center/Web-Developer-P6

3. Dans le dossier correspondant à l'API Backend, faites "npm install" pour installer les dépendances. Faites-en de même pour le dossier frontend.

4. Si je ne vous ai pas déjà fourni le fichier .env, vous devez en créer un sur la base du .env_sample présent dans le repository. Notez que vous aurez besoin d'une base de données MongoDB.

5. Faites "npm run" dans le dossier backend. Même chose pour le dossier frontend.


## Créer un compte sur Hot Takes

Par mesure de sécurité, j'ai installé le package password-validator pour vérifier la solidité des mots de passe, tout en réduisant les risques d'injections.

À la création du compte, votre mot de passe doit valider les conditions suivantes :
- Faire entre 5 et 35 caractères
- Contenir une lettre majuscule
- Contenir une lettre minuscule
- Contenir un chiffre
- Ne pas avoir d'espace.
- Ne pas avoir de symbole.

L'API renvoie une erreur si une de ces conditions n'est pas validée.
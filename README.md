# Projet JS

Le projet est coupé en deux parties:
	* Notes - la partie principale
	* SiteBootstrap - La reproduction de la page d'acceuil d'un site en bootstrap, ici : https://trello.com/home

-----------------------------

## Partie Principale

Le site a été réalisé avec angular. Il stoque les données en local par le biais du localeStorage.


Le site est composé de plusieurs "Page" :

 * connexion : page par défaut pour ce connecter
 * gestion : page qui affiche les actions réalisable pour le compte connecté
 * formulaire : page de formulaire pour la création, modification et visualisation des enregistrements d'une entitée

******************************

Afin d'installer l'application, il suffit de cloner la branche et sur le dossier de l'application, réaliser : npm i | npm install
et enfin d'executer : ng serve --open | npx ng serve --open

__Composition détaillé__ :

 * l'application offre deux moyens de connexion :
  * Administrateur : Compte pouvant modifier les entitées
  * Etudiant : compte pouvant visualiser les notes d'un étudiant

 * Lors de la première connexion à l'application, une base vide avec un compte administrateur par défaut est créé.
  * Compte : admin@admin.fr - mot de passe : admin1234
 * Il est possible, dans notre cas, d'utiliser le mode "Test", qui fournit une base de donnée préremplit et réduit le temps d'inactivité avant la déconnexion ( 15 seconde )


	Attention toute fois, le passage en mode test est a utilisé sur une application vierge ou avec des informations écrasable.
	Le passage au mode test éfface toutes les données déjà existante, autant dans un sens que dans l'autre.
	Pour passer en mode test, il faut utiliser le raccourci clavier : alt+t


 * Aprés la connexion la bar de navigation change et affiche le compte connecté en haut à droite.
	On peut ici, modifier les informations de base du compte ou se déconnecter
 * Ici deux choix s'offre à vous :
  * Vous êtes en administrateur :
   * Un pannel de bouton apparait, il vous permet de modifier les entitées.
		Au clique d'un bouton, la liste des enregistrements existants dans l'entitée apparait.
		Vous pouvez en ajouter un en cliquant sur ajouter, en modifier ou visualiser un en cliquand sur le bouton bleu de l'enregistrement,
		 ou enfin en supprimer un avec le bouton rouge.
		Toutes les actions sur les entitées son construites de la même manière.
		Certaines entitées nécéssite de sélectionner une ou plusieurs entitées enfant, pour cela si la box de selection le permet, 
		il est possible dans sélectionner plusieurs à la fois avec les combos : shift+click ou ctrl+click

  * Vous êtes étudiant :
   * Une liste de matière s'affiche vous proposant les matières de l'étudiant,
		au clique d'une matière une liste d'évaluations et de notes associèes apparait à droite,
		Enfin au clique d'une note, un popUp de détail apparait, pour montrer les stats liées à la note.
   * Un bouton Suivi global est disponible en dessous des listes. 
		Il permet d'afficher un popUp, contenant la moyenne de l'étudiant sur chaque matières ainsi que celles de la classe, sous forme de graphique.
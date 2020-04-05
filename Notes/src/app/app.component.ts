import { Component, OnInit, HostListener } from '@angular/core';
import { ConnexionService } from './services/connexion.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CrudService } from './services/crud.service';
import * as Mousetrap from 'mousetrap';
import { Howl } from 'howler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Déclaration des attributs
  crud: CrudService
  connexion: ConnexionService
  compteCo: Subscription
  compte: number
  activite: boolean
  it: any
  dispCompte: string
  timeOut: number

  // Test les mouvements de souris ou l'appuie sur le clavier pour déterminer si l'utilisateur est actif
  @HostListener('document:mousemove', ['$event']) 
  @HostListener('document:keydown', ['$event']) 
  onKeyDown(e) {
    this.activite = true
  }
  onMouseMove(e) {
    this.activite = true
  }

  // Constructeur qui prend en paramètres une instance de ConnexionService et Router
  constructor(private connexionService: ConnexionService,
    private route: Router, private crudService: CrudService) {

    }

  // Fonction executé lors de l'initialisation du composant
  ngOnInit() {
    let sound = new Howl({
      src: ['bootstrap/sound.mp3'],
      volume: 0.4
    });

    // Récupération de la liaison à la BDD local
    this.crud = this.crudService
    // Récupération de l'état de connexion de l'utilisateur
    this.connexion = this.connexionService

    this.it = 0
    this.timeOut = 900

    if(sessionStorage.getItem('test') === undefined) sessionStorage.setItem('test', 'n')

    this.TestMode(this.crud, this.connexion, true)

    Mousetrap.bind('alt+t', e => {
      let test = sessionStorage.getItem('test')
      if(test === 'o') sessionStorage.setItem('test', 'n')
      else sessionStorage.setItem('test', 'o')

      this.TestMode(this.crud, this.connexion, false)
      sound.play()
    })

    // Attend l'évenement de connexion ou déconnexion pour lancer le timer et mettre à jour l'utilisateur connecté
    this.compteCo = this.connexion.connect.subscribe((compte: number) => {
        // Récupération de l'id de l'utilisateur connecté ou zéro si personne n'est connecté
        this.compte = compte
        
        if(this.crud.getTypeCompte(compte) === "etudiant") {
          let etudiants = this.crud.select('Etudiant', {compte: compte})
          this.dispCompte = etudiants[0].nom + ' ' + etudiants[0].prenom
        }
        else this.dispCompte = 'Administrateur'

        // Si un utilisateur est connecté
        if(compte !== 0) {
          let cpt = 0

          // lance le timmer d'inactivité
          this.it = setInterval(() => {
            if(!this.activite) {
              // Si l'utilisateur est inactif pendant 10 seconde il est déconnecté, (900 pour 15 minute)
              if(cpt >= this.timeOut) {
                clearInterval(this.it)
                this.connexion.Deconnexion()
                this.route.navigate(['/connexion'])
              }
            }
            else cpt = 0

            cpt++;
            this.activite = false
          }, 1000)
        }
    })
    // Damande de récupération du compte connecté
    this.connexion.emitCompte()
  }

  // Action lors du clique sur déconnexion
  onDeconnexion() {
    clearInterval(this.it)
    this.connexion.Deconnexion()
  }

  private TestMode(bdd: CrudService, co: ConnexionService, first: boolean) {
    let test = sessionStorage.getItem('test')
    let brand = document.querySelector('.navbar-brand')
    let title = document.querySelector('title')
    let foot = document.querySelector('#footerTest')

    if(test === 'o') this.timeOut = 15
    else this.timeOut = 900

    if(test === 'o') brand.innerHTML = `${brand.innerHTML} (Mode Test)`
    else brand.innerHTML = 'Notes'

    if(test === 'o') title.innerHTML = `${title.innerHTML} (Mode Test)`
    else title.innerHTML = 'Notes'

    if(test === 'o') foot.innerHTML = 'quitter'
    else foot.innerHTML = 'lancer'

    if(!first) {
      if(test === 'o') {
        localStorage.setItem('Formation', '[{"id":1,"nom":"BTS info","anneeScolaire":"2019-2020","commentaire":"","matieres":[1,2,4],"etudiants":[1,2]},{"id":2,"nom":"bachelor commerce","anneeScolaire":"2019-2020","commentaire":"","matieres":[1,3,4],"etudiants":[3,4,5]}]')
        localStorage.setItem('Etablissement', '[{"id":1,"nom":"St-Pierre","adresse":"3 route des champs","formations":[1,2]}]')
        localStorage.setItem('Compte', '[{"id":1,"mail":"admin@admin.fr","mdp":"$2a$10$JAQS93mQWlmY6w7pjsGskOlN9IxJAYOTGrY50Y5.VMUBiyQUZ97yu"},{"id":2,"mail":"test@admin.fr","mdp":"$2a$10$mjMIEv4syBlvOlClvV.MCeM/dJQF7eRpRN8bdYA/I5f0UWFoP/g5u"},{"id":3,"mail":"michel@etudiant.fr","mdp":"$2a$10$zn0YelOjbG4gl98yfPwRVeMYBsIHkDG0GtYWXqn3G9e5vWgWIiLVK"},{"id":4,"mail":"lise@etudiant.fr","mdp":"$2a$10$RL9oV7hbJTqtcWcc1Z1btObE8CJs2gUBugl1YkgfJmvwu6OUhkEWm"},{"id":5,"mail":"jean@etudiant.fr","mdp":"$2a$10$1.7H0qJwinHvRH2x0W6TZOSW9sHSRDBNbiAn0c88y2Y9wTdoi.aZS"},{"id":6,"mail":"jeanj@etudiant.fr","mdp":"$2a$10$90DJRQXbHfBiTGsgisFuB.4XGEJdAQvaLqAyr1OtutiOQF.7IbbKe"},{"id":7,"mail":"lea@etudiant.fr","mdp":"$2a$10$QGmiDbx0D4IjEpmPqxGazuin8t4W6DTf6KlgVLvp7MjNJAllbIVdu"}]')
        localStorage.setItem('Etudiant', '[{"id":1,"nom":"Lado","prenom":"Michel","naissance":"1999-02-03","compte":3,"tel":"05.23.62.54.21"},{"id":2,"nom":"joo","prenom":"Lise","naissance":"1999-06-26","compte":4,"tel":""},{"id":3,"nom":"lagarde","prenom":"Jean","naissance":"1999-11-15","compte":5,"tel":"+33625165484"},{"id":4,"nom":"jean","prenom":"jean","naissance":"1998-12-31","compte":6,"tel":""},{"id":5,"nom":"pou","prenom":"lea","naissance":"1999-08-20","compte":7,"tel":"0695632214"}]')
        localStorage.setItem('Evaluation', '[{"id":1,"nom":"Calcul","debut":"2020-04-05","fin":"2020-04-07","type":"DM","commentaire":""},{"id":2,"nom":"fonction","debut":"2020-04-05","fin":"2020-04-05","type":"ecrit","commentaire":""},{"id":3,"nom":"Lecture","debut":"2020-04-05","fin":"2020-04-05","type":"Oral","commentaire":""},{"id":4,"nom":"Tableur","debut":"2020-04-05","fin":"2020-04-05","type":"QCM","commentaire":""},{"id":5,"nom":"Classe","debut":"2020-04-05","fin":"2020-04-05","type":"Ecrit","commentaire":""}]')
        localStorage.setItem('Matiere', '[{"id":1,"nom":"Math","nomEnseignant":"Mr. larue","commentaire":"","evaluations":[1,2]},{"id":2,"nom":"Info","nomEnseignant":"Mme ka","commentaire":"","evaluations":[5]},{"id":3,"nom":"vente","nomEnseignant":"M. brouette","commentaire":"","evaluations":[4]},{"id":4,"nom":"Français","nomEnseignant":"Mme place","commentaire":"","evaluations":[3]}]')
        localStorage.setItem('Note', '[{"id":1,"evaluation":1,"etudiant":1,"resultat":10},{"id":2,"evaluation":2,"etudiant":1,"resultat":12},{"id":3,"evaluation":3,"etudiant":1,"resultat":16},{"id":4,"evaluation":5,"etudiant":1,"resultat":18},{"id":5,"evaluation":1,"etudiant":2,"resultat":9},{"id":6,"evaluation":2,"etudiant":2,"resultat":11},{"id":7,"evaluation":3,"etudiant":2,"resultat":14},{"id":8,"evaluation":5,"etudiant":2,"resultat":13},{"id":9,"evaluation":1,"etudiant":3,"resultat":5},{"id":10,"evaluation":2,"etudiant":3,"resultat":6},{"id":11,"evaluation":3,"etudiant":3,"resultat":10},{"id":12,"evaluation":4,"etudiant":3,"resultat":15},{"id":13,"evaluation":1,"etudiant":4,"resultat":14},{"id":14,"evaluation":2,"etudiant":4,"resultat":16},{"id":15,"evaluation":3,"etudiant":4,"resultat":9},{"id":16,"evaluation":4,"etudiant":4,"resultat":12},{"id":17,"evaluation":1,"etudiant":5,"resultat":18},{"id":18,"evaluation":2,"etudiant":5,"resultat":19},{"id":19,"evaluation":3,"etudiant":5,"resultat":15},{"id":20,"evaluation":4,"etudiant":5,"resultat":16}]')
      }
      else {
        localStorage.setItem('Formation', '[]')
        localStorage.setItem('Etablissement', '[]')
        localStorage.setItem('Compte', '[]')
        localStorage.setItem('Etudiant', '[]')
        localStorage.setItem('Evaluation', '[]')
        localStorage.setItem('Matiere', '[]')
        localStorage.setItem('Note', '[]')
        bdd.save('Compte', {id:0, mail: 'admin@admin.fr', mdp: 'admin1234'})
      }
    }

    clearInterval(this.it)
    co.Deconnexion()
    this.route.navigate(['/connexion'])
  }
}

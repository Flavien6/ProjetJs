import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { ConnexionService } from '../services/connexion.service';
import { Compte } from '../services/bdd/bdd';
import { isArray, isString } from 'util';

@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.scss']
})
export class FormulaireComponent implements OnInit {

  type: any
  id: any

  param: any
  entity: any

  isEtablissemant: boolean
  isFormation: boolean
  isMatiere: boolean
  isEvaluation: boolean
  isNote: boolean
  isEtudiant: boolean
  isCompte: boolean

  ids: number[]

  crud: CrudService
  compte: Compte

  connexion: ConnexionService

  constructor(private crudService: CrudService, private router: Router, private connexionService: ConnexionService, private activRoute: ActivatedRoute) {}

  ngOnInit(): void {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false
    this.type = this.activRoute.snapshot.params['type']
    this.id = +this.activRoute.snapshot.params['id']

    this.param = { title: this.type, success: 'Valider', cancel: 'Annuler' }
    this.entity = {}

    this.crud = this.crudService
    this.connexion = this.connexionService

    this.isEtablissemant = false
    this.isFormation = false
    this.isMatiere = false
    this.isEvaluation = false
    this.isNote = false
    this.isEtudiant = false
    this.isCompte = false

    this.initEnt()
    if(this.id !== 0) {
      this.entity = this.crud.select(this.type, {id: this.id})[0]

      if(this.entity === undefined) {
        this.id = 0
        this.initEnt()
      }
      else {
        if(this.type === 'Etudiant') {
          let comptes = this.crud.select('Compte', {id: this.entity.compte})
          if(comptes[0] !== undefined) {
            this.compte = comptes[0]
            this.compte.mdp = ''
          }
        }
        if(this.type === 'Compte') {
          this.compte = this.entity
          this.compte.mdp = ''
        }
      }
    }
  }

  initEnt() {
    if(this.type === 'Etablissement')
    {
      this.isEtablissemant = true
      this.entity = {
        id : 0,
        nom: '',
        adresse: '',
        formations: []
      }
    }

    if(this.type === 'Formation') {
      this.isFormation = true
      this.entity = {
        id : 0,
        nom: '',
        anneeScolaire: '',
        commentaire: '',
        matieres: [],
        etudiants: []
      }
    }

    if(this.type === 'Matiere') {
      this.isMatiere = true
      this.param.title = 'Matière'
      this.entity = {
        id : 0,
        nom: '',
        nomEnseignant: '',
        commentaire: '',
        evaluations: []
      }
    }

    if(this.type === 'Evaluation') {
      this.isEvaluation = true
      this.entity = {
        id : 0,
        nom: '',
        debut: this.crud.formatDate(new Date(), true),
        fin: this.crud.formatDate(new Date(), true),
        type: '',
        commentaire: ''
      }
    }

    if(this.type === 'Note') {
      this.isNote = true
      this.entity = {
        id:0,
        evaluation: 0,
        etudiant: 0,
        resultat: 0
      }
    }

    if(this.type === 'Etudiant') {
      this.isEtudiant = true
      this.entity = {
        id : 0,
        nom: '',
        prenom: '',
        naissance: this.crud.formatDate(new Date(), true),
        compte: 0,
        tel: ''
      }
      this.compte = {
        id : 0,
        mail: '',
        mdp: ''
      }
    }

    if(this.type === 'Compte') {
      this.isCompte = true
      this.compte = {
        id : 0,
        mail: '',
        mdp: ''
      }
    }
  }

  async onValider() {    
    Swal.fire({
      title: 'Validation',
      text: "Voulez-vous vraiment valider ?",
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Non',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui'
    }).then((result) => {
      if (result.value) {
        let res: number | string = 'Erreur';
        let idCo: number | string = 'Erreur';

        if(this.param.success === undefined) this.param.success = 'Enregistrement réussi.'
    
        if(this.type === 'Note') {
          if(this.entity.evaluation === 0) this.entity.evaluation = this.crud.getFirstId('Evaluation')
          else if(this.entity.evaluation.length > 0) this.entity.evaluation = this.entity.evaluation[0]

          if(this.entity.etudiant === 0) this.entity.etudiant = this.crud.getFirstId('Etudiant')
          else if(this.entity.etudiant.length > 0) this.entity.etudiant = this.entity.etudiant[0]
        }
        
        if(this.type === 'Etudiant' || this.type === 'Compte') idCo = this.crud.save('Compte', this.compte)
        else idCo = 1
        
        if(!isString(idCo) && idCo > 0) {
          if(this.type === 'Etudiant') this.entity.compte = idCo
          if(this.type !== 'Compte') res = this.crud.save(this.type, this.entity)
          else res = 1
    
          if(!isString(res) && res > 0) {
            Swal.fire('', this.param.success,'success')
            this.router.navigate(['/gestion'])
          }
          else {
            if(this.type === 'Etudiant') {
              this.crud.delete('Compte', +idCo)
              this.compte.mdp = ''
            }

            if(this.type === 'Note') {          
              if(!isArray(this.entity.evaluation)) this.entity.evaluation = [this.entity.evaluation]
              if(!isArray(this.entity.etudiant)) this.entity.etudiant = [this.entity.etudiant]
            }

            Swal.fire('', 'Erreur: ' + res.toString(), 'error')
          }
        }
        else {
          this.compte.mdp = ''
          Swal.fire('', 'Erreur: ' + idCo.toString(), 'error')
        }
      }
    })
  }

  onAnnuler() {
    this.router.navigate(['gestion'])
  }
}
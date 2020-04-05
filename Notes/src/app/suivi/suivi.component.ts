import { Component, OnInit, ViewChild } from '@angular/core';
import { ConnexionService } from '../services/connexion.service';
import { CrudService } from '../services/crud.service';
import { Matiere, Note, Formation, Etudiant } from '../services/bdd/bdd';
import { SwalComponent, SwalPortalTargets } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-suivi',
  templateUrl: './suivi.component.html',
  styleUrls: ['./suivi.component.scss']
})
export class SuiviComponent implements OnInit {

  idCompte: number
  crud: CrudService
  formation: Formation
  matieres: Matiere[]
  etudiant: Etudiant
  notes: any[]
  isActive: boolean
  noteAff: any

  public radarChartType = 'line'
  public radarChartLabels = ['note']
  public radarChartData = [
    {data: [0], label: 'Moyennes de l\'élève'},
    {data: [0], label: 'Moyennes de la classe'}
  ]

  @ViewChild('noteSwal') private noteSwal: SwalComponent;
  @ViewChild('globalSwal') private globalSwal: SwalComponent;

  constructor(private connexionService: ConnexionService, private crudService: CrudService,
    public readonly swalTargets: SwalPortalTargets) { }

  ngOnInit(): void {
    this.crud = this.crudService
    this.idCompte = this.connexionService.getCompte()
    this.etudiant = this.crud.select('Etudiant', {compte: this.idCompte})[0]
    this.formation = this.crud.select('Formation', {etudiants: this.etudiant.id})[0]
    
    this.matieres = this.crud.select('Matiere', {id: this.formation.matieres})
    this.matieres = this.crud.affiche('Matiere', this.matieres)
    this.notes = []
    this.noteAff = {
      nomEval: '',
      max: 0,
      min: 20,
      moy: 0
    }
  }


  onClickMatiere(event: Event) {
    let others = event.target['parentElement'].children
    let idsEvaluation = event.target['firstElementChild'].value
    let classNote = event.target['parentElement'].parentElement.lastElementChild.classList.value
    event.target['parentElement'].parentElement.lastElementChild.classList.value = classNote.replace('invisible', ' visible')
    this.notes = []
    
    for(let other of others) {
      other.classList.value = other.classList.value.replace(' active', '')
    }
    event.target['classList'].value = event.target['classList'].value + ' active'

    idsEvaluation = JSON.parse('[' + idsEvaluation + ']')
    
    idsEvaluation.forEach(elt => {
      let note = this.crud.select('Note', {evaluation: elt})
      
      if(note.length > 0) {
        note.forEach(elt => {
          if(elt.etudiant === this.etudiant.id) this.notes.push(elt)
        })
      }
    })

    this.notes.forEach(elt => {
      elt.affD = this.crud.select('Evaluation', {id: elt.evaluation})[0].nom + ' : ' + elt.resultat + '/20'
    })
  }

  async onClickNote(event: Event) {
    let idNote = event.target['firstElementChild'].value
    let resultats
    this.noteAff = await this.crud.select('Note', {id: +idNote})[0]
    this.noteAff.nomEval = await this.crud.select('Evaluation', {id: this.noteAff.evaluation})[0].nom
    resultats = await this.getNotesEval(this.noteAff.evaluation)
    
    this.noteAff.max = Math.max(...resultats)
    this.noteAff.min = Math.min(...resultats)
    this.noteAff.moy = this.moyenne(resultats)
    this.noteAff.med = this.mediane(resultats)
    
    this.noteSwal.fire()
  }

  async onClickGlobal() {
    let notesEtudiant = await this.crud.select('Note', {etudiant: this.etudiant.id})
    let resultats = []
    let resclasse = []
    let evaluations = []
    let nomMat = []
    
    if(this.matieres.length > 0) {
      this.matieres.forEach(e => {
        nomMat.push(e.nom)
        evaluations.push(e.evaluations)
      })
    }

    evaluations.forEach(tabE => {
      let res = []
      tabE.forEach(e => {
        notesEtudiant.forEach(elt => {
          if(e === elt.evaluation) res.push(elt.resultat)
        });
      })
      resultats.push(this.moyenne(res))
    })

    evaluations.forEach(tabE => {
      let res = []
      tabE.forEach(e => {
        res = this.getNotesEval(e)
      })
      resclasse.push(this.moyenne(res))
    })

    this.radarChartLabels = nomMat
    this.radarChartData = [
      {data: resultats, label: 'Moyennes de l\'élève'},
      {data: resclasse, label: 'Moyennes de la classe'}
    ]

    this.globalSwal.fire()
  }

  private getNotesEval(idEval: number): number[] {
    let notes = []
    let promo = this.formation.etudiants

    if(promo.length > 0) {
      promo.forEach( elt => {
        let n = this.crud.select('Note', {etudiant: elt})
        if(n.length > 0) {
          n.forEach(e => {
            if(e.evaluation === idEval) {
              notes.push(e.resultat)
            }
          })
        }
      })
    }

    return notes
  }

  private moyenne(numbers: number[]): number {
    let moy = 0

    numbers.forEach(e=> {
      moy = moy + e
    })

    return moy / numbers.length
  }

  private mediane(numbers: number[]): number {
    let med: number = 0

    numbers.sort((a, b) => {
      if(a < b) return -1
      if(a > b) return 1
      return 0
    })
    
    med = Math.round(((numbers.length + 1) / 2) - 1)
    return numbers[med]
  }
}

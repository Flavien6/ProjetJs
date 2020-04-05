import { Component, OnInit, Input } from '@angular/core';
import { CrudService } from '../services/crud.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ConnexionService } from '../services/connexion.service';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {

  @Input() title: string
  @Input() type: string
  @Input() entities: any[]

  crud: CrudService

  constructor(private crudService: CrudService, private route: Router, private connexionService: ConnexionService) {}

  ngOnInit(): void {
    this.crud = this.crudService
    this.entities = this.crud.affiche(this.type, this.entities)
    
    if(this.type === 'Compte') {
      this.connexionService.getCompte()
      this.entities.forEach((elt, i) => {
        if(elt.id === this.connexionService.getCompte()) this.entities.splice(i, 1)
      })
    }
  }

  onAjouter() {
    this.route.navigate(['/form', this.type, 0])
  }

  onModifier(id: number) {
    this.route.navigate(['/form', this.type, id])
  }

  onSupprimer(id: number) {
    Swal.fire({
      title: 'Suppréssion',
      text: "Voulez-vous vraiment le supprimer ?",
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Non',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui'
    }).then((result) => {
      if (result.value) {
        this.crud.delete(this.type, id)
        Swal.fire(
          'Supprimé!',
          'Enregistrement supprimé.',
          'success'
        )
      }
    })
  }
}

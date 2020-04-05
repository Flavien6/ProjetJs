import { Component, OnInit, ViewChild } from '@angular/core';
import { SwalPortalTargets, SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { CrudService } from '../services/crud.service';
import { ConnexionService } from '../services/connexion.service';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.scss']
})
export class GestionComponent implements OnInit {

  title: string
  type: string
  entities: any[]
  crud: CrudService
  compte: number
  typeCompte: string
  @ViewChild('listeSwal') private listeSwal: SwalComponent;
  
  constructor(public readonly swalTargets: SwalPortalTargets, private crudService: CrudService, private connexionService: ConnexionService) {}

  ngOnInit(): void {
    this.compte = this.connexionService.getCompte()
    this.crud = this.crudService
    this.typeCompte = this.crud.getTypeCompte(this.compte)

    if(this.typeCompte === 'etudiant') {
      this.entities = this.crud.select('Etudiant', {compte: this.compte})
      this.entities = this.crud.select('Note', {etudiant: this.entities[0].id})
      this.entities.reverse()
    }
  }

  async onClick(title: string, type: string, param: any) {
    this.title = title
    this.type = type
    this.entities = await this.crud.select(type, param)
    this.listeSwal.fire()
  }
}

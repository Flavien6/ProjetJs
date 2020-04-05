import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service'
import { Router } from '@angular/router';
import { ConnexionService } from '../services/connexion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent implements OnInit {
  // Déclaration
  crud: CrudService
  connexion: ConnexionService
  compte: number
  mail: string = ''
  mdp: string = ''

  constructor(private crudService: CrudService, private connexionService: ConnexionService,
              private router: Router) {}

  ngOnInit(): void {
    this.connexion = this.connexionService
    this.crud = this.crudService
  }

  // Test la possibilité de connexion au clique de connexion
  onConnexion() {
    let comptes = this.crud.select('Compte', {mail: this.mail, mdp: this.mdp})
    if(comptes.length > 0) {
      this.compte = comptes[0].id
      this.connexion.Connexion(this.compte)
      this.router.navigate(['/gestion'])
    }
    else Swal.fire('', 'Erreur lors de la connexion.', 'error')
  }
}

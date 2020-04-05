import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConnexionService } from './connexion.service';

@Injectable()
export class ConnexionGuard implements CanActivate {

    constructor(private connexionService: ConnexionService, private router: Router) { }

    // Implémentation de la Méthode obligatoire de CanActivate
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {

        // Test si un utilisateur est connecté avec l'id différet de zéro pour accéder au pages protégé
        if(this.connexionService.getCompte() !== 0) {
            return true
        }
        else {
            this.router.navigate(['connexion'])
        }
    }
}
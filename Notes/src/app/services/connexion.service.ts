import { Subject } from 'rxjs'

export class ConnexionService {
    // Déclaration
    connect = new Subject<number>()
    private compte = 0

    // Récupération de l'id du compte ( pour le GUARD )
    getCompte() {
        return this.compte
    }

    // Envoie du signal de récupération de l'id du compte
    emitCompte() {
        this.connect.next(this.compte)
    }

    // Méthode de connexion, stockage de l'id de la personne connecté
    Connexion(id: number) {
        this.compte = id
        this.emitCompte()
    }

    // Déconnexion en remettant l'id du compte à zéro
    Deconnexion() {
        this.compte = 0
        this.emitCompte()
    }
}
import { Etablissement, Formation, Matiere, Evaluation, Note, Etudiant, Compte } from './bdd/bdd'
import { isObject, isArray, formatWithOptions } from 'util'
import bcrypt from 'bcryptjs';

export class CrudService {

    // Type d'entité traité
    private types: string[]

    // Fonction de trie des entitées
    private fnSort = (a,b) => {
        if(a.id < b.id) return -1
        if(a.id > b.id) return 1
        return 0
    }

    // Constructeur qui initialise les entitées si elles n'existent pas
    constructor() {
        this.types = [ 'Etablissement', 'Formation', 'Matiere', 'Evaluation', 'Note', 'Etudiant', 'Compte' ]

        if(localStorage.getItem('Etablissement') === null) localStorage.setItem('Etablissement', '[]')
        if(localStorage.getItem('Formation') === null) localStorage.setItem('Formation', '[]')
        if(localStorage.getItem('Matiere') === null) localStorage.setItem('Matiere', '[]')
        if(localStorage.getItem('Evaluation') === null) localStorage.setItem('Evaluation', '[]')
        if(localStorage.getItem('Note') === null) localStorage.setItem('Note', '[]')
        if(localStorage.getItem('Etudiant') === null) localStorage.setItem('Etudiant', '[]')
        if(localStorage.getItem('Compte') === null) {
            localStorage.setItem('Compte', '[]')
            this.save('Compte', { id:1, mail: 'admin@admin.fr', mdp: 'admin1234'})
        }
    }

    // Ajoute un enregistrement dans la bonne entitée
    save(type: string, record: any): number | string {
        if(type !== this.testType(type)) return type

        let entity = JSON.parse(localStorage.getItem(type))
        let lstId: number = 1
        record = this.test(type, record)
        
        if(isArray(entity) && isObject(record)) {
            let exist = entity.find((elt, i) => {
                if(elt.id === record.id) {
                    entity.splice(i,1)
                    entity.push(record)
                    entity.sort(this.fnSort)
                    localStorage.setItem(type, JSON.stringify(entity))
                    return true
                }
                return false
            })

            if(exist) return record.id
            else {
                entity.sort(this.fnSort)
                if(entity.length > 0) lstId = entity[(entity.length - 1)].id + 1
                record.id = lstId
                entity.push(record)
                entity.sort(this.fnSort)
                localStorage.setItem(type, JSON.stringify(entity))
    
                return lstId
            }
        }

        return record
    }
    // Supprime un enregistrement en fonction de l'id donné
    delete(type: string, id: number): boolean {
        if(type !== this.testType(type)) return false

        let entity = JSON.parse(localStorage.getItem(type))

        return entity.find((element, index) => {
            if(element.id === id) {

                if(type === 'Formation') this.deleteCascade('Etablissement', 'formations', id, false)
                if(type === 'Matiere') this.deleteCascade('Formation', 'matieres', id, false)
        
                if(type === 'Evaluation') {
                    this.deleteCascade('Matiere', 'evaluations', id, false)
                    this.deleteCascade('Note', 'evaluation', id, true)
                }
        
                if(type === 'Etudiant') {
                    this.deleteCascade('Formation', 'etudiants', id, false)
                    this.deleteCascade('Note', 'etudiant', id, true)
                    this.delete('Compte', element.compte)
                }

                entity.splice(index,1)
                entity.sort(this.fnSort)
                localStorage.setItem(type, JSON.stringify(entity))
                return true
            }
            
            return false
        })
    }

    private deleteCascade(type: string, champs: string, id: number, del: boolean) {
        let entity = JSON.parse(localStorage.getItem(type))
        let ids = []
        entity.forEach((elt) => {
            if(del) {
                if (elt[champs] === id) ids.push(elt.id)
            }
            else {
                elt[champs].find((e, i) => {
                    if(e === id) elt[champs].splice(i,1)
                })
            }
        })

        if(ids.length > 0) ids.forEach(elt => this.delete(type, elt))
        else localStorage.setItem(type, JSON.stringify(entity))
    }

    // Récupère tout les enregistrements ou les enregistrement filtré en fonction de l'objet donné
    select(type: string, objectSearch?): any[] {
        if(type !== this.testType(type)) return []

        let entity = JSON.parse(localStorage.getItem(type))
        let entOk = []

        if(isArray(entity)) {
            if(isObject(objectSearch) && Object.keys(objectSearch).length > 0) {
                if(type === 'Compte') {
                    
                    entity.forEach(elt => {
                        if(objectSearch.mail !== undefined && objectSearch.mdp !== undefined) {
                            if(elt.mail === objectSearch.mail) {
                                if(bcrypt.compareSync(objectSearch.mdp, elt.mdp)) entOk.push(elt)
                            }
                        }
                        else if(objectSearch.mail !== undefined) {
                            if(objectSearch.mail === elt.mail) entOk.push(elt)
                        }
                        else if(objectSearch.id !== undefined) {
                            if(objectSearch.id === elt.id) entOk.push(elt)
                        }
                        else if(objectSearch.admin !== undefined) {
                            if(objectSearch.admin) {
                                let type: string = this.getTypeCompte(elt.id)
                                if(type === 'admin') entOk.push(elt)
                            }
                        }
                        else entOk.push(elt)
                    })
                }
                else {
                    entity.forEach(elt => {                        
                        let topOk = false
                        for(const p in objectSearch ) {
                            if(elt[p] !== undefined) {                                    
                                if(isArray(elt[p])) {
                                    elt[p].forEach(e => {
                                        if(!topOk) topOk = this.searchVal(objectSearch[p], e)
                                    })
                                }
                                else topOk = this.searchVal(objectSearch[p], elt[p])
                            }
                        }
                        
                        if(topOk) entOk.push(elt)
                    })
                }
            }
            else {
                entOk = entity
            }
        }
        
        return entOk
    }

    // Cherche une valeur dans un objet ou un tableau d'objet
    private searchVal(obj, val): boolean {
        let topOk = false
        if(isArray(obj)) {
            obj.find(ob => {
                if(ob === val) topOk = true
            })
        }
        else if(obj === val) topOk = true

        return topOk
    }

    // Test la validité des données de l'objé donné
    private test(type: string, record: any): any | string {
        // Si l'enregistrement est bien un objet
        if(isObject(record)) {
            /* Test de la validité des données */
            if(type === 'Etablissement') {
                // Test des tailles des strings
                if(record.nom.length <= 0 || record.nom.length > 50) return 'Le nom doit être compris entre 1 et 50 charactères'
                if(record.adresse.length > 200) return 'L\'adresse ne doit pas faire plus de 200 charactères'
                // Test si les clées étrangère existes
                if(isArray(record.formations) && record.formations.length > 0) {
                    if(this.select('Formation', {id: record.formations}).length === 0) return 'Formation inexistante'
                    
                    let eta = this.select('Etablissement', {formations: record.formations})                    
                    if(eta.length > 0) {
                        if(eta[0].id !== record.id) return 'Formation déja utilisée'
                    }
                }
            }

            if(type === 'Formation') {
                // Définition d'une regex pour un test et Récupération de la donnée à valider
                let re = new RegExp('^(\\d{4})-(\\d{4})$')

                // Test des tailles des strings
                if(record.nom.length <= 0 || record.nom.length > 50) return 'Le nom doit être compris entre 1 et 50 charactères'
                if(record.commentaire.length > 200) return 'Le commentaire ne doit pas faire plus de 200 charactères'

                // Test le format et la cohérence de l'année scolaire
                if(re.test(record.anneeScolaire))
                {
                    let a = record.anneeScolaire.replace(re, '$1')
                    let b = record.anneeScolaire.replace(re, '$2')
                    if((b-a) !== 1 ) return 'Années scolaire incohérentes'
                }
                else return 'L\'année scolaire doit être au format : xxxx-xxxx'

                // Test si les clées étrangère existes
                if(isArray(record.matieres) && record.matieres.length > 0) {
                    record.matieres.forEach(elt => {
                        if(this.select('Matiere', {id: elt}).length === 0) record = null
                    })
                    if(record === null) return 'Matière inexistante'
                }

                if(isArray(record.etudiants) && record.etudiants.length > 0) {
                    record.etudiants.forEach(elt => {
                        if(this.select('Etudiant', {id: elt}).length === 0) record = null

                        if(record !== null) {
                            let form = this.select('Formation', {etudiants: elt})
                            if(form.length > 0) {
                                if(form[0].id !== record.id) record = null
                            }
                        }
                    })
                    if(record === null) return 'Etudiant inexistant ou déjà placé'
                }
            }

            if(type === 'Matiere') {
                // Test des tailles des strings
                if(record.nom.length <= 0 || record.nom.length > 50) return 'Le nom doit être compris entre 1 et 50 charactères'
                if(record.nomEnseignant.length <= 0 || record.nomEnseignant.length > 50) return 'Le nom de l\'enseignat doit être compris entre 1 et 50 charactères'
                if(record.commentaire.length > 200) return 'Le commentaire ne doit pas faire plus de 200 charactères'
                // Test si les clées étrangère existes
                if(isArray(record.evaluations) && record.evaluations.length > 0) {
                    record.evaluations.forEach(elt => {
                        if(this.select('Evaluation', {id: elt}).length === 0) record = null

                        if(record !== null) {
                            let mat = this.select('Matiere', {evaluations: elt})
                            if(mat.length > 0) {
                                if(mat[0].id !== record.id) record = null
                            }
                        }
                    })
                    if(record === null) return 'Evaluation inexistante ou déjà utilisé'
                }
            }

            if(type === 'Evaluation') {
                // Test des tailles des strings
                if(record.nom.length <= 0 || record.nom.length > 50) return 'Le nom doit être compris entre 1 et 50 charactères'
                if(record.type.length <= 0 || record.type.length > 8) return 'Le type doit être compris entre 1 et 8 charactères'
                if(record.commentaire.length > 200) return 'Le commentaire ne doit pas faire plus de 200 charactères'
                if(record.debut !== '' && record.fin !== '') {
                    // Test de la cohérence de la période
                    if(Date.parse(record.debut) > Date.parse(record.fin)) return 'Période incohérente'
                }
                else return 'La période est obligatoire'
            }

            if(type === 'Note') {
                // Test la validité de la note sur 20
                if(record.resultat < 0 || record.resultat > 20) return 'Le résultat doit être compris entre 0 et 20'

                // Test si les clées étrangère existes
                if(this.select('Evaluation', {id: record.evaluation}).length === 0) return 'Evaluation inexistante'
                if(this.select('Etudiant', {id: record.etudiant}).length === 0) return 'Etudiant inexistant'
                
                // Test si le couple de clées étrangères existe
                if(record.id === 0) {
                    let eva = this.select('Note', {evaluation: record.evaluation})
                    let etu = this.select('Note', {etudiant: record.etudiant})
                    if(eva.length > 0 && etu.length > 0) {
                        let topOk = false
                        eva.forEach(elt => {
                            etu.forEach(e => {
                                if(elt.id === e.id) topOk = true
                            })
                        })
                        if(topOk) return 'Une note existe déjà pour cet étudiant sur cette évaluation'
                    }
                }

                // Test si l'étudiant a la matiere de l'évaluation
                let mat = this.select('Matiere', {evaluations: record.evaluation})
                console.log(mat);
                
                if(mat.length > 0) {
                    let formMat = this.select('Formation', {matieres: mat[0].id})
                    let formEtu = this.select('Formation', {etudiants: record.etudiant})
                    console.log(formEtu);
                    console.log(formMat);
                    
                    if(formMat.length > 0) {
                        let topOk = 'Cet étudiant n\'a pas fait partie de cette évaluation'
                        formMat.forEach(elt => {
                            if(formEtu.length > 0) {
                                console.log(elt.id !== formEtu[0].id);
                                
                                if(elt.id === formEtu[0].id) topOk = ''
                            }
                            else topOk = 'Aucune formation pour cette étudiant'
                        })
                        if(topOk !== '') return topOk
                    }
                    else return 'Aucune formation pour la matière de cette évaluation'
                    
                    //if(this.select('Formation', {matieres: mat[0].id, etudiants: record.etudiant}).length === 0) return 'Cet étudiant n\'a pas la matière de cette évaluation'
                }
                else return 'Aucune Matière pour cette évaluation'
            }

            if(type === 'Etudiant') {
                // Définition d'une regex pour un test et Récupération de la donnée à valider
                let re = new RegExp('^(((\\+\\d{2})\\s?\\d)|(0\\d))((\\s|( ?- ?)|( ?. ?))?\\d{2}){4}$')

                // Test des tailles des strings
                if(record.nom.length <= 0 || record.nom.length > 50) return 'Le nom doit être compris entre 1 et 50 charactères'
                if(record.prenom.length <= 0 || record.prenom.length > 50) return 'Le prénom doit être compris entre 1 et 50 charactères'
                
                // Test le format et la cohérence du numéro de téléphone
                if(record.tel.length >= 10 && record.tel.length < 20) {
                    if(record.tel.length !== 0) {
                        if(!re.test(record.tel)) return 'Format incorrecte pour le numéro de téléphone'
                    }
                }
                else if(record.tel.length !== 0) return 'Le numéro de téléphone doit être compris entre 10 et 20 charactères'

                // Test si les clées étrangère existes et est présente
                if(this.select('Compte', {id: record.compte}).length === 0)  return 'Compte invalide'
            }

            if(type === 'Compte') {
                // Définition d'une regex pour un test et Récupération de la donnée à valider
                let reMail = new RegExp('^([\\w\\.\\-]*)@(\\w*(\\.|\\-)?\\w*)(\\.[a-z]{2,3})$')

                // Test le format et la cohérence du mail
                if(record.mail.length <= 0 || record.mail.length < 50) {
                    if(!reMail.test(record.mail)) return 'Format incorrect pour le mail'
                }
                else return 'L\'e-mail doit être compris entre 1 et 50 charactères'
                
                // Hashage du mot de passe
                if(record.mdp.length > 7 && record.mdp.length < 29) {                    
                    // Test si le couple mail mdp existe déjà
                    if(this.select('Compte', {mail: record.mail}).length > 0) return 'Ce compte existe déjà'

                    let salt = bcrypt.genSaltSync(10)
                    let hash = bcrypt.hashSync(record.mdp, salt)
                    record.mdp = hash
                }
                else return 'Le mot de passe doit être compris entre 8 et 28 charactères'
            }
        }

        return record
    }

    // Récupération du type de compte : Administrateur ou etudiant
    getTypeCompte(id: number): string {
        let type = ''
        let etud = JSON.parse(localStorage.getItem('Etudiant'))
        let compte = JSON.parse(localStorage.getItem('Compte'))
        if(isArray(etud) && etud.length > 0) {
            etud.forEach(e => {
                if(e.compte === id) type = 'etudiant'
            })
        }

        if(isArray(compte) && compte.length > 0 && type === '') {
            compte.forEach(e => {
                if(e.id === id) type = 'admin'
            })
        }
        return type
    }

    private testType(type: string): string {
        if(!this.types.find(elt => elt === type)) return 'Type de données traité inconnu'
        return type
    }

    // Paramètrage de l'affichage des données
    affiche(type: string, entities: any[]): any[] {
        if(type === 'Etablissement') entities.forEach( elt => elt.affD = elt.nom )
        if(type === 'Formation') entities.forEach( elt => elt.affD = elt.nom + ' - ' + elt.anneeScolaire )
        if(type === 'Matiere') entities.forEach( elt => elt.affD = elt.nom + ' - ' + elt.nomEnseignant )
        if(type === 'Evaluation') entities.forEach( elt => elt.affD = elt.nom + ' : ' + this.formatDate(elt.debut) + ' - ' + this.formatDate(elt.fin) )
    
        if(type === 'Note') {
            entities.forEach(elt => {
                let etudiants = this.select('Etudiant', {id: elt.etudiant})
                elt.affD = etudiants[0].nom + ' ' + etudiants[0].prenom + ' - ' + this.select('Evaluation', {id: elt.evaluation})[0].nom
            })
        }
    
        if(type === 'Etudiant') {
            entities.forEach(elt => {
                let etablissements
                let eta = ''
                let formations = this.select('Formation', {etudiants: elt.id})
                
                if(formations[0] !== undefined) {
                    etablissements = this.select('Etablissement', {formations: formations[0].id})
                    if(etablissements[0] !== undefined) eta = ' - ' + etablissements[0].nom
                }
        
                elt.affD = elt.nom + ' ' + elt.prenom + eta
            })
        }
    
        if(type === 'Compte') {
            entities.forEach((elt, i) => {
                let type: string = this.getTypeCompte(elt.id)
                if(type === 'admin') type = 'Administrateur'
                else type = 'Etudiant'
                elt.affD = type + ' : ' + elt.mail
            })
        }

        return entities
    }
    
    // Formate la date Donné
    formatDate(date: Date, base?: boolean): string {
        let mNumber = 0
        let mString = ''
        let dString = ''
        date = new Date(date)
    
        mNumber = date.getMonth() + 1
        if(mNumber < 10) mString = '0' + mNumber.toString()
        else mString = mNumber.toString()

        if(date.getDate() < 10) dString = '0' + date.getDate().toString()
        else dString = date.getDate().toString()

        if(base) return date.getFullYear() + '-' + mString + '-' + dString
        return dString + '/' + mString + '/' + date.getFullYear()
    }

    // Récupération du premier index d'une entité
    getFirstId(type: string): number {
        let tab: any[] = JSON.parse(localStorage.getItem(type));
        if(tab.length > 0) return tab[0].id
        else return 0
    }
}
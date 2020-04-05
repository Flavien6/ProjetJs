export interface Etablissement {
    id : number;
    nom: string;
    adresse: string;
    formations: number[];
}

export interface Formation {
    id : number;
    nom: string;
    anneeScolaire: string;
    commentaire: string;
    matieres: number[];
    etudiants: number[];
}

export interface Matiere {
    id : number;
    nom: string;
    nomEnseignant: string;
    commentaire: string;
    evaluations: number[];
}

export interface Evaluation {
    id : number;
    nom: string;
    debut: Date;
    fin: Date;
    type: string;
    commentaire: string;
}

export interface Note {
    id: number;
    evaluation: number;
    etudiant: number;
    resultat: number;
}

export interface Etudiant {
    id : number;
    nom: string;
    prenom: string;
    naissance: Date;
    compte: number;
    tel: string;
}

export interface Compte {
    id : number;
    mail: string;
    mdp: string;
}
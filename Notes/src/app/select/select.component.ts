import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CrudService } from '../services/crud.service';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {

  @Input() isMultiple: boolean
  @Input() type: string
  @Input() ids: number[]
  @Output() selIds = new EventEmitter<number | number[]>()

  label: string
  entities: any[]

  constructor(private crudService: CrudService) { }

  ngOnInit(): void {
    this.label = ''
    this.entities = this.crudService.affiche(this.type, this.crudService.select(this.type))

    if(this.type === 'Etablissement') this.label = 'Etablissement'
    if(this.type === 'Formation') this.label = 'Formation'
    if(this.type === 'Matiere') this.label = 'Matière'
    if(this.type === 'Evaluation') this.label = 'Evaluation'
    if(this.type === 'Note') this.label = 'Note'
    if(this.type === 'Etudiant') this.label = 'Etudiant'
    if(this.type === 'Compte') this.label = 'Compte'
    if(this.isMultiple) this.label = this.label + 's'
  }
}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { AppComponent } from './app.component';

import { CrudService } from './services/crud.service';
import { ConnexionComponent } from './connexion/connexion.component';
import { GestionComponent } from './gestion/gestion.component';
import { ConnexionService } from './services/connexion.service';
import { ErrorComponent } from './error/error.component';
import { ConnexionGuard } from './services/connexion-guard.service';
import { ListeComponent } from './liste/liste.component';
import { FormulaireComponent } from './formulaire/formulaire.component';
import { SelectComponent } from './select/select.component';
import { SuiviComponent } from './suivi/suivi.component';
import { ChartsModule } from 'ng2-charts'

const appRoutes: Routes = [
  { path: '', canActivate: [ConnexionGuard], component: GestionComponent },
  { path: 'gestion', canActivate: [ConnexionGuard], component: GestionComponent },
  { path: 'form/:type/:id', canActivate: [ConnexionGuard], component: FormulaireComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: '**', redirectTo: 'connexion' }
]

@NgModule({
  declarations: [
    AppComponent,
    ConnexionComponent,
    GestionComponent,
    ErrorComponent,
    ListeComponent,
    FormulaireComponent,
    SelectComponent,
    SuiviComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ChartsModule,
    RouterModule.forRoot(appRoutes),
    SweetAlert2Module.forRoot()
  ],
  providers: [
    CrudService,
    ConnexionService,
    ConnexionGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

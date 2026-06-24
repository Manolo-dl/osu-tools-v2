import { Component } from '@angular/core';
import { DatabaseTableListComponent, DatabaseStructureComponent, DatabaseResultsComponent } from '@features/database';

@Component({
  selector: 'app-database',
  imports: [DatabaseTableListComponent, DatabaseStructureComponent, DatabaseResultsComponent],
  templateUrl: './database.component.html',
  styleUrl: './database.component.css',
})
export class DatabaseComponent {}

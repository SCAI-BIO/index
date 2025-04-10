import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { Mapping } from '../interfaces/mapping';

@Component({
  selector: 'app-top-matches-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatTableModule],
  templateUrl: './top-matches-dialog.component.html',
  styleUrl: './top-matches-dialog.component.scss',
})
export class TopMatchesDialogComponent {
  variable: string;

  constructor(
    public dialogRef: MatDialogRef<TopMatchesDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { matches: Mapping[]; variable: string }
  ) {
    this.variable = data.variable;
  }

  selectMapping(mapping: Mapping): void {
    this.dialogRef.close(mapping);
  }
}

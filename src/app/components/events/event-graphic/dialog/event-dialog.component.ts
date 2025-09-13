import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Crear evento</h2>
    <mat-dialog-content>
      <p>Se creará un evento entre:</p>
      <p><strong>{{ data.start }}</strong> y <strong>{{ data.end }}</strong></p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onCreate()">Crear</button>
    </mat-dialog-actions>
  `
})
export class EventDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { start: string; end: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onCreate(): void {
    console.log(`✅ Evento creado de ${this.data.start} a ${this.data.end}`);
    this.dialogRef.close(true);
  }
}

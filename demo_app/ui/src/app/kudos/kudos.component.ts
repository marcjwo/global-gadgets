import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

// <p><strong>Team: </strong> <a href="#" target="_blank">Meet the Team</a></p>

@Component({
  selector: 'app-kudos',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Kudos & Resources</h2>
    <div mat-dialog-content>
      <p>Major shout out to <strong>Paul Ramsey</strong> and his work on the <strong>Stylesearch AlloyDB AI Demo project</strong>.<br><br>The Global Gadgets App is a spinoff of that project.<br><br>Here are some helpful resources and links:</p>
      
      <div class="links-container">
        <p><strong>Project Repository: </strong> <a href="https://github.com/paulramsey/stylesearch-alloydb-ai-demo/" target="_blank">GitHub Link</a></p>
        <p><strong>Documentation: </strong> <a href="#" target="_blank">Project Docs</a></p>
        
        
        <p style="text-align: center; margin-top: 20px;"><em>Built with ❤️ using Antigravity.</em></p>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
    </div>
  `,
  styles: [`
    .links-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }
    a {
      color: #1976d2;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `]
})
export class KudosComponent {
  constructor(public dialogRef: MatDialogRef<KudosComponent>) { }

  onClose(): void {
    this.dialogRef.close();
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { USER_GUIDE_STEPS, WalkthroughStep } from './user-guide-data';

@Component({
  selector: 'app-walkthrough-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './walkthrough-dialog.component.html',
  styleUrls: ['./walkthrough-dialog.component.scss']
})
export class WalkthroughDialogComponent {

  steps: WalkthroughStep[] = USER_GUIDE_STEPS;

  currentStepIndex = 0;

  constructor(private dialogRef: MatDialogRef<WalkthroughDialogComponent>) { }

  get currentSlide(): WalkthroughStep {
    return this.steps[this.currentStepIndex];
  }

  nextStep() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }

  close() {
    this.dialogRef.close();
  }

  onPrintDownload() {
    // Open the print view in a new window/tab
    window.open('/user-guide', '_blank');
  }
}

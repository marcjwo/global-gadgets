import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CymbalShopsServiceClient } from '../../services/cymbalshops-api';

@Component({
  selector: 'app-visualize-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Visualize in Your Room (Powered by Nano Banana 🍌)</h2>
    <div mat-dialog-content class="dialog-content">
      <p>Upload a photo of your room to see this product placed in it.</p>
      
      <div class="upload-section" *ngIf="!generatedImage">
        <div class="preview-container">
            <div class="image-wrapper">
                <p>Product</p>
                <img [src]="data.product.productImageUri" class="preview-image">
            </div>
            <div class="image-wrapper">
                <p>Your Room</p>
                <div *ngIf="!roomImagePreview" class="placeholder-image" (click)="fileInput.click()">
                    <mat-icon>add_a_photo</mat-icon>
                    <span>Upload</span>
                </div>
                <img *ngIf="roomImagePreview" [src]="roomImagePreview" class="preview-image" (click)="fileInput.click()">
            </div>
        </div>
        
        <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none;">
        
        <div *ngIf="isLoading" class="spinner-container">
            <mat-spinner diameter="40"></mat-spinner>
            <span>Generating visualization... (this may take a minute)</span>
        </div>

        <div *ngIf="error" class="error-message">
            {{ error }}
        </div>
      </div>

      <div class="result-section" *ngIf="generatedImage">
        <div class="image-container" [class.zoomed]="isZoomed" (click)="toggleZoom()" title="Click to zoom">
            <img [src]="generatedImage" class="generated-image">
        </div>
      </div>
    </div>
    
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
      <button mat-raised-button color="primary" 
        [disabled]="!selectedFile || isLoading" 
        *ngIf="!generatedImage"
        (click)="generate()">
        Generate
      </button>
      <button mat-stroked-button color="primary" *ngIf="generatedImage" (click)="reset()">Try Again</button>
    </div>
  `,
  styles: [`
    .dialog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 500px;
        min-height: 300px;
    }
    .preview-container {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        width: 100%;
        justify-content: center;
    }
    .image-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 200px;
    }
    .preview-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #ccc;
        cursor: pointer;
    }
    .placeholder-image {
        width: 100%;
        height: 150px;
        background-color: #f0f0f0;
        border: 2px dashed #ccc;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        color: #666;
    }
    .placeholder-image:hover {
        background-color: #e0e0e0;
        border-color: #999;
    }
    .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-top: 20px;
    }
    .generated-image {
        max-width: 100%;
        max-height: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        cursor: zoom-in;
        transition: all 0.3s ease;
    }
    .image-container.zoomed .generated-image {
        max-height: none;
        cursor: zoom-out;
    }
    .error-message {
        color: red;
        margin-top: 10px;
    }
  `]
})
export class VisualizeDialogComponent {
  selectedFile: File | null = null;
  roomImagePreview: string | null = null;
  generatedImage: string | null = null;
  isLoading = false;
  error: string | null = null;
  isZoomed = false;

  toggleZoom() {
    this.isZoomed = !this.isZoomed;
  }

  constructor(
    public dialogRef: MatDialogRef<VisualizeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: any },
    private cymbalShopsService: CymbalShopsServiceClient
  ) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.roomImagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
      this.error = null;
    }
  }

  generate() {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.error = null;

    this.cymbalShopsService.visualizeProduct(this.selectedFile, this.data.product.productImageUri)
      .then(response => {
        this.generatedImage = response.image;
        this.isLoading = false;
      })
      .catch(err => {
        console.error('Visualization error:', err);
        this.error = 'Failed to generate image. Please try again.';
        this.isLoading = false;
      });
  }

  reset() {
    this.generatedImage = null;
    this.selectedFile = null;
    this.roomImagePreview = null;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

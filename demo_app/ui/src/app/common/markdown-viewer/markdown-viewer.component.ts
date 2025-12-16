import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as marked from 'marked'; 

@Component({
  selector: 'app-markdown-viewer',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './markdown-viewer.component.html',
  styleUrl: './markdown-viewer.component.scss'
})
export class MarkdownViewerComponent implements OnChanges {
  @Input() data: string | null = null;
  parsedHtml: string | Promise<string> = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.render();
    }
  }

  private render() {
    if (this.data) {
      // Parse the markdown string into HTML
      // marked.parse can return a Promise or string depending on options, 
      // but strictly typing it as string | Promise<string> handles both.
      this.parsedHtml = marked.parse(this.data);
    } else {
      this.parsedHtml = '';
    }
  }
}

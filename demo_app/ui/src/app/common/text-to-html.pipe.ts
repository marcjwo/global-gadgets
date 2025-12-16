import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'textToHtml',
  standalone: true
})
export class TextToHtmlPipe implements PipeTransform {

  transform(value?: string): string {
    if (!value)
      return '';
    
    // Use marked to parse markdown
    return marked.parse(value) as string;
  }
}

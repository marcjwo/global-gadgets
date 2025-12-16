import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss'
})
export class InsightsComponent implements OnInit {
  dashboardUrl: SafeResourceUrl | undefined;
  // Raw URL: https://looker.cloud-bi-opm.com/embed/dashboards/314?tab_name=AlloyDB
  // Note: Ensure the URL is correct and allows embedding.

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    const url = 'https://looker.cloud-bi-opm.com/embed/dashboards/314?tab_name=AlloyDB';
    this.dashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

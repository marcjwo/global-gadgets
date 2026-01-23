import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GlobalGadgetsServiceClient } from '../services/globalgadgets-api';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

interface AlloyDBQuery {
  title: string;
  description: string;
  queryTemplate: string;
}

@Component({
  selector: 'app-alloydb',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './alloydb.component.html',
  styleUrls: ['./alloydb.component.scss']
})
export class AlloyDBComponent implements OnInit {

  // Configuration for queries
  queries: AlloyDBQuery[] = [
    {
      title: 'Vector Search (Embeddings)',
      description: 'Find products similar to a query using vector cosine similarity. This query converts the text "smart home devices" into an embedding and finds the closest product embeddings.',
      queryTemplate: `SELECT productname, category, unitprice, 
       product_embedding <=> embedding('gemini-embedding-001', 'smart home devices')::vector as distance
FROM d_products 
ORDER BY distance 
LIMIT 5;`
    },
    {
      title: 'Hybrid Search (Vector + SQL)',
      description: 'Combine vector search with standard SQL filters. This example finds products similar to "gaming accessories" but restricts results to the "Accessories" category and price < $50.',
      queryTemplate: `SELECT productname, category, unitprice, 
       product_embedding <=> embedding('gemini-embedding-001', 'gaming accessories')::vector as distance
FROM d_products 
WHERE category = 'Accessories' AND unitprice < 50
ORDER BY distance 
LIMIT 5;`
    },
    {
      title: 'Full-Text Search',
      description: 'Perform a traditional full-text search using PostgreSQL tsvector/tsquery.',
      queryTemplate: `SELECT productname, category, unitprice
FROM d_products
WHERE fts_document @@ websearch_to_tsquery('english', 'digital camera')
LIMIT 5;`
    },
    {
      title: 'Explain Analyze (Performance)',
      description: 'Analyze the query plan for a vector search to see how the ScaNN index is utilized.',
      queryTemplate: `EXPLAIN ANALYZE SELECT productname, 
       product_embedding <=> embedding('gemini-embedding-001', 'noise cancelling headphones')::vector as distance
FROM d_products 
ORDER BY distance 
LIMIT 10;`
    },

    //     {
    //       title: 'AI Rank (Semantic Re-ranking)',
    //       description: 'Re-rank a list of products based on their semantic relevance to a specific persona or intent, using the ai.rank function.',
    //       queryTemplate: `SELECT productname, category, 
    //        ai.rank(
    //            'gemini-1.5-flash-001', 
    //            'best for outdoor adventures', 
    //            description as product_description
    //        ) as relevance_score 
    // FROM d_products 
    // WHERE category = 'Gadgets'
    // ORDER BY relevance_score DESC 
    // LIMIT 5;`
    //     },

  ];

  // Execution state
  loading = false;
  executedQuery: AlloyDBQuery | null = null;
  queryResult: any[] = [];
  queryError: string | null = null;
  displayedColumns: string[] = [];

  constructor(
    private cymbalShopsService: GlobalGadgetsServiceClient,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  executeQuery(query: AlloyDBQuery) {
    this.loading = true;
    this.executedQuery = query;
    this.queryResult = [];
    this.queryError = null;
    this.displayedColumns = [];

    this.cymbalShopsService.runAlloyDBQuery(query.queryTemplate).subscribe({
      next: (data) => {
        this.loading = false;
        if (Array.isArray(data)) {
          this.queryResult = data;
          if (data.length > 0) {
            this.displayedColumns = Object.keys(data[0]);
          }
        } else {
          // Handle Explain Analyze which might return strings or a different structure depending on driver
          // But usually pg returns rows like [{ "QUERY PLAN": "..." }]
          this.queryResult = Array.isArray(data) ? data : [data];
          if (this.queryResult.length > 0) {
            this.displayedColumns = Object.keys(this.queryResult[0]);
          }
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error executing AlloyDB query:', err);
        this.queryError = err.error || err.message || 'An unknown error occurred.';
      }
    });
  }

  copyQuery(query: string, event: Event) {
    event.stopPropagation();
    this.clipboard.copy(query);
    this.snackBar.open('Query copied to clipboard', 'Close', {
      duration: 3000,
    });
  }

  getFormattedQuery(query: string): string {
    return query.trim();
  }
}

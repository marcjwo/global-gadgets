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

interface BigQueryQuery {
  title: string;
  description: string;
  queryTemplate: string;
}

@Component({
  selector: 'app-bigquery',
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
  templateUrl: './bigquery.component.html',
  styleUrls: ['./bigquery.component.scss']
})
export class BigQueryComponent implements OnInit {
  projectId: string = 'loading...';
  datasetId: string = 'loading...';
  location: string = 'loading...';

  // Configuration for queries
  queries: BigQueryQuery[] = [];

  // Execution state
  loading = false;
  executedQuery: BigQueryQuery | null = null;
  queryResult: any[] = [];
  queryError: string | null = null;
  displayedColumns: string[] = [];

  constructor(
    private cymbalShopsService: GlobalGadgetsServiceClient,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cymbalShopsService.getConfig().subscribe({
      next: (config) => {
        this.projectId = config.bigqueryProjectId;
        this.datasetId = config.bigqueryDatasetId;
        this.location = config.bigqueryLocation;
        this.initQueries();
      },
      error: (err) => {
        console.error('Failed to load config', err);
        this.projectId = 'ERROR';
        this.datasetId = 'ERROR';
      }
    });
  }

  initQueries() {
    // You can easily add more tiles here by adding to this array
    this.queries = [
      {
        title: 'AI rated customer reviews',
        description: 'Use AI.SCORE to rate customer reviews',
        queryTemplate: `SELECT
    AI.SCORE((
    """
    On a scale from 0 to 5, rate how much the reviewer liked the product. You can use decimal numbers.
    Review:
    """, reviewtext),
    connection_id => 'us.vertex_ai_connection') AS ai_rating,
  t.rating AS human_provided_rating,
  t.reviewtext as review
FROM
EXTERNAL_QUERY('gemini-looker-demo-dataset.us.global_gadgets_alloydb', '''
        SELECT
            pr.reviewid,
            pr.productid,
            pr.reviewername,
            pr.rating,
            pr.reviewtext,
            pr.reviewdate,
            p.productname
        FROM
            d_productreviews pr
        INNER JOIN d_products p ON pr.productid = p.productid
    ''') AS t`
      },
      {
        title: 'AI labeled customer reviews',
        description: 'Use AI.GENERATE to label customer reviews.',
        queryTemplate: `SELECT
  AI.CLASSIFY(
    ('Classify the product reviews by sentiment: ', reviewtext),
    categories => 
         [('positive', 'The review is positive.'),
          ('neutral', 'The review is neutral.'),
          ('negative', 'The review is negative.')],
    connection_id => 'us.vertex_ai_connection') AS ai_review_rating,
    t.rating as human_provided_rating,
    t.reviewtext as review
FROM
EXTERNAL_QUERY('gemini-looker-demo-dataset.us.global_gadgets_alloydb', '''
        SELECT
            pr.reviewid,
            pr.productid,
            pr.reviewername,
            pr.rating,
            pr.reviewtext,
            pr.reviewdate,
            p.productname
        FROM
            d_productreviews pr
        INNER JOIN d_products p ON pr.productid = p.productid
    ''') AS t`
      },
      //       {
      //         title: 'Sales by Category',
      //         description: 'Aggregate sales revenue by product category.',
      //         queryTemplate: `SELECT category, SUM(price) as total_revenue
      // FROM \`\${dataset}\`.products p
      // JOIN \`\${dataset}\`.sales s ON p.id = s.product_id
      // GROUP BY category
      // ORDER BY total_revenue DESC;`
      //       },
      //       {
      //         title: 'Inventory Low Stock',
      //         description: 'Identify products with inventory count below 50.',
      //         queryTemplate: `SELECT product_name, inventory_count
      // FROM \`\${dataset}\`.inventory
      // WHERE inventory_count < 50
      // ORDER BY inventory_count ASC;`
      //       },
      //       {
      //         title: 'Customer Purchase History',
      //         description: 'Recent purchases for a specific customer (e.g., ID 12345).',
      //         queryTemplate: `SELECT p.product_name, s.sale_date, s.price
      // FROM \`\${dataset}\`.sales s
      // JOIN \`\${dataset}\`.products p ON s.product_id = p.id
      // WHERE s.user_id = 12345
      // ORDER BY s.sale_date DESC
      // LIMIT 5;`
      //       },
      // Example of a BigQuery AI specific query (Placeholder)
      //       {
      //         title: 'Generate Product Description (AI)',
      //         description: 'Use BigQuery ML to generate a description for a product.',
      //         queryTemplate: `SELECT ml_generate_text_llm_result as generated_description
      // FROM ML.GENERATE_TEXT(
      //   MODEL \`\${dataset}\`.gemini_model,
      //   (SELECT 'Describe a futuristic gadget' as prompt)
      // );`
      //       }
    ];
  }

  getFormattedQuery(queryTemplate: string): string {
    const fullDatasetPath = `${this.projectId}.${this.datasetId}`;
    return queryTemplate.replace(/\${dataset}/g, fullDatasetPath);
  }

  executeQuery(queryObj: BigQueryQuery) {
    this.loading = true;
    this.executedQuery = queryObj;
    this.queryResult = [];
    this.queryError = null;
    this.displayedColumns = [];

    const sql = this.getFormattedQuery(queryObj.queryTemplate);

    this.cymbalShopsService.runBigQuery(sql).subscribe({
      next: (rows) => {
        this.loading = false;
        this.queryResult = rows;
        if (rows.length > 0) {
          this.displayedColumns = Object.keys(rows[0]);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Query execution failed', err);
        this.queryError = err.error || err.message || 'Unknown error occurred';
      }
    });
  }

  copyQuery(queryTemplate: string, event: Event) {
    event.stopPropagation(); // Prevent tile click
    const sql = this.getFormattedQuery(queryTemplate);
    this.clipboard.copy(sql);
    this.snackBar.open('Query copied to clipboard!', 'Close', {
      duration: 3000,
    });
  }
}

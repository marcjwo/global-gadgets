import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor
import { MatTableModule } from '@angular/material/table'; // Import MatTableModule
import { MatCardModule } from '@angular/material/card'; // Optional: for wrapping
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Interface for structuring the data
export interface SearchMethodComparison {
  methodName: string;
  strengths: string[];
  weaknesses: string[];
  sampleQuery?: string;
}

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [
    CommonModule, // Needed for *ngFor
    MatTableModule, // <-- Import the Angular Material Table module
    MatCardModule,   // <-- Optional card wrapper
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './architecture.component.html',
  styleUrls: ['./architecture.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ArchitectureComponent {
  // Data for the table
  comparisonData: SearchMethodComparison[] = [
    {
      methodName: 'Traditional SQL',
      strengths: [
        'Simple to implement for basic keyword checks (`=` or `ILIKE \'term%\'`).',
        'Fast for exact matches on indexed fields (e.g., SKU, exact name).',
        'Easily integrates with strict attribute filtering (price, category, brand) via `WHERE` clause.',
        'Low infrastructure overhead beyond the primary database.'
      ],
      weaknesses: [
        'No relevance ranking; no understanding of user intent, synonyms, context, or semantics.',
        'Very sensitive to typos, pluralization, and phrasing variations.',
        '`ILIKE \'%term%\'` queries are slow and don\'t scale well.', // Escaped quote
        'Struggles with matching within long descriptions or multiple fields effectively.',
        'Requires users to know specific terms.'
      ],
      sampleQuery: `SELECT product_name, sku, price
FROM products_table
WHERE product_name ILIKE '%search_term%'
   OR description ILIKE '%search_term%'
   AND price < 100;`
    },
    {
      methodName: 'Full-Text Search',
      strengths: [
        'Faster keyword search than `ILIKE \'%term%\'` using inverted indexes.', // Escaped quote
        'Handles basic linguistic variations (stemming, stop words).',
        'Provides basic relevance ranking (e.g., TF-IDF).',
        'Can search across multiple text fields efficiently.',
        'Mature technology, often built into databases (PostgreSQL, SQL Server, etc.) or search engines (Elasticsearch, OpenSearch).'
      ],
      weaknesses: [
        'Primarily keyword-based; limited understanding of semantic meaning or user intent.',
        'Relevance can be hard to tune effectively.',
        'Struggles with complex synonyms or conceptual relationships unless explicitly configured.',
        'Does not handle natural language queries well.',
        'May return irrelevant results if keywords appear out of context.'
      ],
      sampleQuery: `SELECT product_name, ts_rank(search_vector, query) as rank
FROM products_table, 
     websearch_to_tsquery('english', 'search_term') query
WHERE search_vector @@ query
ORDER BY rank DESC;`
    },
    {
      methodName: 'Text Embeddings',
      strengths: [
        'Excellent semantic understanding; finds relevant products based on meaning, even with different keywords.',
        'Handles synonyms, paraphrasing, and natural language queries effectively.',
        'Good for discovery and finding conceptually similar items.',
        'Strong zero-shot capability (handles unseen queries/products if concepts overlap).'
      ],
      weaknesses: [
        'Can struggle with precise keyword matching (e.g., finding a specific model number if semantic similarity is low).',
        'Requires generating embeddings (ML model inference - compute cost).',
        'Needs specialized vector database or index (e.g., using ANN algorithms like ScaNN, HNSW) for efficient search at scale.',
        'Can sometimes return results that are *too* broad or conceptually related but functionally wrong.'
      ],
      sampleQuery: `WITH query_embedding AS (
  SELECT embedding('model_id', 'search_term')::vector AS vector
)
SELECT product_name, 
       (product_embedding <=> vector) as distance
FROM products_table, query_embedding
WHERE (product_embedding <=> vector) < 0.5
ORDER BY distance ASC
LIMIT 10;`
    },
     {
      methodName: 'Hybrid Search',
      strengths: [
        'Combines keyword precision (SQL/FTS) with semantic understanding (Embeddings).',
        'Generally provides the highest overall relevance across diverse query types.',
        'Robust to keyword-heavy queries, natural language, typos (via FTS), and conceptual search (via embeddings).',
        'Mitigates the weaknesses of using either keyword or semantic search alone.',
        'Techniques like Reciprocal Rank Fusion (RRF) allow effective merging of results.'
      ],
      weaknesses: [
        'Most complex to implement, tune, and maintain (requires managing/scaling both FTS and Vector indexes).',
        'Higher infrastructure costs and operational overhead.',
        'Requires careful tuning of the result merging/ranking strategy (e.g., weights, fusion algorithm).',
        'Potential for slightly increased query latency if not optimized well.'
       ],
       sampleQuery: `WITH vector_results AS (
  -- Semantic Search
  SELECT id, RANK() OVER (ORDER BY distance) as v_rank 
  FROM vector_search_subquery
),
keyword_results AS (
  -- Keyword Search
  SELECT id, RANK() OVER (ORDER BY ts_rank) as k_rank 
  FROM keyword_search_subquery
)
SELECT p.product_name,
       -- Reciprocal Rank Fusion
       (1.0 / (60 + COALESCE(v.v_rank, 0)) + 
        1.0 / (60 + COALESCE(k.k_rank, 0))) as rrf_score
FROM products_table p
LEFT JOIN vector_results v ON p.id = v.id
LEFT JOIN keyword_results k ON p.id = k.id
ORDER BY rrf_score DESC;`
    },
    //      {
    //       methodName: 'Image Search',
    //       strengths: [
    //         'Enables search based on visual similarity ("shop the look", finding alternatives).',
    //         'Doesn\'t rely on text descriptions; useful for products with poor or missing text data.',
    //         'Allows users to search using an uploaded image.',
    //         'Can identify products even with variations in angle or background (depending on model robustness).',
    //         'Can potentially be combined with text using multi-modal models.'
    //       ],
    //       weaknesses: [
    //         'Relevance is purely visual; may not match user\'s functional need or textual query intent.',
    //         'Requires image embedding generation, storage, and vector search infrastructure.',
    //         'Sensitive to image quality, lighting, and obstructions.',
    //         'Difficult to combine directly with keyword search or precise attribute filters unless using advanced multi-modal models.',
    //         'Can be computationally expensive (embedding generation and search).'
    //        ],
    //        sampleQuery: `WITH input_image_embedding AS (
    //   SELECT embedding('multimodal_model', 'image_uri')::vector AS vector
    // )
    // SELECT product_name, product_image,
    //        (image_embedding <=> vector) as visual_distance
    // FROM products_table, input_image_embedding
    // ORDER BY visual_distance ASC
    // LIMIT 20;`
    //     }
  ];

  // Columns to display in the table, matching matColumnDef names
  displayedColumns: string[] = ['methodName', 'strengths', 'weaknesses'];

  // Assign the data to the dataSource input for the table
  dataSource = this.comparisonData;

  // You could wrap dataSource with MatTableDataSource for sorting/filtering features:
  // dataSource = new MatTableDataSource(this.comparisonData);

  // Get current date/time for display
  currentDateTime = new Date();

  expandedElement: SearchMethodComparison | null = null;
}

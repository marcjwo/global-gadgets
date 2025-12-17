import { BigQuery } from '@google-cloud/bigquery';

export class BigQueryService {
    private bigquery: BigQuery;
    private projectId: string;
    private location: string | undefined;

    constructor() {
        this.projectId = process.env.BIGQUERY_PROJECT_ID || '';
        this.location = process.env.BIGQUERY_LOCATION; // Optional

        if (!this.projectId) {
            console.warn('BIGQUERY_PROJECT_ID environment variable is not set. BigQuery features will not work.');
        }

        this.bigquery = new BigQuery({
            projectId: this.projectId,
            location: this.location
        });
    }

    async query(query: string, params?: any[]): Promise<any[]> {
        if (!this.projectId) {
            throw new Error('BigQuery is not configured (BIGQUERY_PROJECT_ID missing).');
        }

        try {
            const options = {
                query: query,
                params: params,
                location: this.location,
            };

            const [rows] = await this.bigquery.query(options);
            return rows;
        } catch (error) {
            console.error('Error executing BigQuery query:', error);
            throw error;
        }
    }
}

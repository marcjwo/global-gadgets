import { Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { InsightsComponent } from './insights/insights.component';
import { BigQueryComponent } from './bigquery/bigquery.component';
import { AlloyDBComponent } from './alloydb/alloydb.component';

import { UserGuidePrintComponent } from './user-guide-print/user-guide-print.component';

export const routes: Routes = [
    { path: '', redirectTo: '/products', pathMatch: 'full' },
    { path: 'products', component: ProductsComponent },
    { path: 'insights', component: InsightsComponent },
    { path: 'bigquery', component: BigQueryComponent },
    { path: 'alloydb', component: AlloyDBComponent },
    { path: 'user-guide', component: UserGuidePrintComponent },
];

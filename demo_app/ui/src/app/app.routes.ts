import { Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { InsightsComponent } from './insights/insights.component';
import { BigQueryComponent } from './bigquery/bigquery.component';

export const routes: Routes = [
    {path: 'products', component: ProductsComponent},
    { path: 'insights', component: InsightsComponent },
    { path: 'bigquery', component: BigQueryComponent },
    {path: '', redirectTo: '/products', pathMatch: 'full'}
];

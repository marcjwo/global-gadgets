import { Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { InsightsComponent } from './insights/insights.component';
import { AgentLoungeComponent } from './agent-lounge/agent-lounge.component';

export const routes: Routes = [
    {path: 'products', component: ProductsComponent},
    { path: 'insights', component: InsightsComponent },
    { path: 'agent-lounge', component: AgentLoungeComponent },
    {path: '', redirectTo: '/products', pathMatch: 'full'}
];

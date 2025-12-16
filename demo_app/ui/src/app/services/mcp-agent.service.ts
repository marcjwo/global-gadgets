import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Agent {
  id: string;
  name: string;
  avatar: string; // URL to avatar image or icon name
  description: string;
  color: string;
}

export interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  agentId?: string; // ID of the agent who sent the message
}

@Injectable({
  providedIn: 'root'
})
export class McpAgentService {

  private agents: Agent[] = [
    {
      id: 'alloydb',
      name: 'AlloyDB Agent',
      avatar: 'storage', // Material Icon
      description: 'Expert in operational data and SQL queries.',
      color: '#4285F4' // Google Blue
    },
    {
      id: 'bigquery',
      name: 'BigQuery Agent',
      avatar: 'analytics', // Material Icon
      description: 'Analyzer of historical trends and large datasets.',
      color: '#34A853' // Google Green
    },
    {
      id: 'looker',
      name: 'Looker Agent',
      avatar: 'dashboard', // Material Icon
      description: 'Visualizer of insights and dashboards.',
      color: '#EA4335' // Google Red
    }
  ];

  constructor() { }

  getAgents(): Agent[] {
    return this.agents;
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.find(a => a.id === id);
  }

  chat(agentId: string, message: string): Observable<string> {
    let response = "I'm listening...";

    // Simulating context-aware responses
    const lowerMsg = message.toLowerCase();

    switch (agentId) {
      case 'alloydb':
        if (lowerMsg.includes('sales')) response = "AlloyDB: I found 150 recent transactions. The total revenue for today is $4,200. Would you like to see the SQL query?";
        else if (lowerMsg.includes('query')) response = "AlloyDB: `SELECT * FROM sales WHERE date = CURRENT_DATE;`";
        else response = "AlloyDB Agent: I can help you query your operational database. Ask me about real-time sales or inventory.";
        break;

      case 'bigquery':
        if (lowerMsg.includes('trend')) response = "BigQuery: Analyzing Q4 trends... It seems Smart Home devices are up 20% year-over-year.";
        else if (lowerMsg.includes('history')) response = "BigQuery: Accessing historical archives from 2020-2024. Processing 5TB of data...";
        else response = "BigQuery Agent: I handle heavy analytical workloads. Ask me about long-term trends or historical data analysis.";
        break;

      case 'looker':
        if (lowerMsg.includes('dashboard')) response = "Looker: Generating dashboard link... [Sales Dashboard](https://looker.example.com/dashboards/1)";
        else if (lowerMsg.includes('chart')) response = "Looker: I can visualize that for you. 📊 *Imagine a beautiful bar chart here*";
        else response = "Looker Agent: I turn data into pretty pictures. Ask me to visualize your metrics.";
        break;

      default:
        response = "I'm not sure which agent you're trying to reach.";
    }

    // Simulate network delay
    return of(response).pipe(delay(800));
  }
}

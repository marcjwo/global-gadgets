import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MarkdownViewerComponent } from '../common/markdown-viewer/markdown-viewer.component';
import { McpAgentService, ChatMessage, Agent } from '../services/mcp-agent.service';

@Component({
  selector: 'app-agent-lounge',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MarkdownViewerComponent
  ],
  templateUrl: './agent-lounge.component.html',
  styleUrl: './agent-lounge.component.scss'
})
export class AgentLoungeComponent implements OnInit, AfterViewChecked {
  agents: Agent[] = [];
  selectedAgent: Agent | null = null;

  // Store chat history per agent
  chatHistory: { [agentId: string]: ChatMessage[] } = {};

  userInput: string = '';
  isLoading: boolean = false;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(private agentService: McpAgentService) { }

  ngOnInit() {
    this.agents = this.agentService.getAgents();
    if (this.agents.length > 0) {
      this.selectAgent(this.agents[0]);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  selectAgent(agent: Agent) {
    this.selectedAgent = agent;
    if (!this.chatHistory[agent.id]) {
      // Initialize with a welcome message for this specific agent
      this.chatHistory[agent.id] = [
        {
          sender: 'agent',
          text: `Hello! I am the ${agent.name}. ${agent.description} How can I assist you?`,
          timestamp: new Date(),
          agentId: agent.id
        }
      ];
    }
  }

  get currentMessages(): ChatMessage[] {
    return this.selectedAgent ? this.chatHistory[this.selectedAgent.id] : [];
  }

  sendMessage() {
    if (!this.userInput.trim() || !this.selectedAgent) return;

    const userMsg = this.userInput;
    const currentAgentId = this.selectedAgent.id;
    this.userInput = ''; // Clear input immediately

    this.chatHistory[currentAgentId].push({
      sender: 'user',
      text: userMsg,
      timestamp: new Date()
    });

    this.isLoading = true;

    this.agentService.chat(currentAgentId, userMsg).subscribe({
      next: (response) => {
        this.chatHistory[currentAgentId].push({
          sender: 'agent',
          text: response,
          timestamp: new Date(),
          agentId: currentAgentId
        });
        this.isLoading = false;
        // Scroll handled by ngAfterViewChecked
      },
      error: (err) => {
        this.chatHistory[currentAgentId].push({
          sender: 'agent',
          text: 'I encountered an error connecting to my tools.',
          timestamp: new Date(),
          agentId: currentAgentId
        });
        this.isLoading = false;
      }
    });
  }
}

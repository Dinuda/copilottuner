// src/instructionManager.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class InstructionManager {
    private context: vscode.ExtensionContext;
    private githubDirPath: string;
    private instructionFilePath: string;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            this.githubDirPath = path.join(workspaceFolder.uri.fsPath, '.github');
            this.instructionFilePath = path.join(this.githubDirPath, 'copilot-instructions.md');
        } else {
            // Fallback to extension directory if no workspace
            this.githubDirPath = path.join(context.extensionPath, '.github');
            this.instructionFilePath = path.join(this.githubDirPath, 'copilot-instructions.md');
        }
    }

    private async ensureGitHubDirectory(): Promise<void> {
        try {
            await fs.promises.mkdir(this.githubDirPath, { recursive: true });
        } catch (err) {
            vscode.window.showErrorMessage(`Error creating .github directory: ${err}`);
            throw err;
        }
    }

    async updateInstructions(level: string): Promise<void> {
        const instructions = this.generateInstructions(level);
        
        try {
            await this.ensureGitHubDirectory();
            await fs.promises.writeFile(this.instructionFilePath, instructions, { encoding: 'utf8' });
            vscode.window.showInformationMessage(`Updated Copilot instructions for ${level} assistance level`);
        } catch (err) {
            vscode.window.showErrorMessage(`Error updating copilot-instructions.md: ${err}`);
        }
    }

    private generateInstructions(level: string): string {
      const timestamp = new Date().toISOString();
      const header = `# GitHub Copilot Instructions
> Last updated: ${timestamp}
> Assistance Level: ${level}

## Configuration
- Assistance Level: ${level}
- Mode: Active
- Instruction Version: 1.0

`;

      let specificInstructions = '';
      switch (level) {
        case 'low':
          specificInstructions = `- Only suggest when non-trivial or unfamiliar concepts are involved.
        - Avoid suggestions for basics or commonly known patterns.
        - Limited to completing the current line.`;
          break;
      
      case 'medium':
          specificInstructions = 
          `- Provide partial guidance (e.g., part of a function or snippet).
            - Focus on core parts, leaving details for the developer to fill in.`;
          break;
      
      case 'high':
          specificInstructions = `- Provide full and detailed suggestions.
      - Include comprehensive implementations and context-aware guidance.
      - Suggest optimizations, alternatives, and best practices.
      `;
          break;
      }

      return `Copilot will adjust its suggestions based on these guidelines
` + specificInstructions;
  }
}
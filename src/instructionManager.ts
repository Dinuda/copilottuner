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
                specificInstructions = `
## Low Assistance Mode

### Coding Style
- Provide minimal inline suggestions
- Focus on completing current line or block
- Avoid complex implementations
- Suggest basic, straightforward solutions

### Documentation
- Minimal inline documentation
- Basic function headers only
- Focus on essential comments only

### Patterns
- Use simple, direct implementations
- Avoid design patterns unless explicitly requested
- Focus on readability over optimization

### Suggestions
- Line completion only
- Basic syntax help
- Simple error fixes
`;
                break;

            case 'medium':
                specificInstructions = `
## Medium Assistance Mode

### Coding Style
- Balanced code suggestions
- Complete function implementations
- Standard design patterns
- Moderate optimization

### Documentation
- Standard documentation
- Function headers with parameters
- Important implementation notes
- Basic usage examples

### Patterns
- Common design patterns
- Standard error handling
- Basic performance considerations

### Suggestions
- Complete function suggestions
- Common code patterns
- Standard best practices
- Basic refactoring suggestions
`;
                break;

            case 'high':
                specificInstructions = `
## High Assistance Mode

### Coding Style
- Comprehensive code suggestions
- Complete implementation details
- Advanced design patterns
- Performance optimizations
- Security considerations

### Documentation
- Detailed documentation
- Comprehensive function headers
- Implementation details
- Usage examples
- Edge cases
- Performance notes

### Patterns
- Advanced design patterns
- Robust error handling
- Performance optimizations
- Security best practices
- Testing suggestions

### Suggestions
- Full implementation suggestions
- Alternative approaches
- Optimization opportunities
- Security improvements
- Testing strategies
- Architecture recommendations
`;
                break;
        }

        return header + specificInstructions + `

## Usage Notes
- These instructions are automatically updated when changing assistance levels
- Copilot will adjust its suggestions based on these guidelines
- You can manually edit this file for custom instructions
- Changes take effect immediately for new suggestions

## File Location
\`\`\`
.github/copilot-instructions.md
\`\`\`
`;
    }
}
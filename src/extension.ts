  // src/extension.ts
  import * as vscode from 'vscode';
  import { InstructionManager } from './instructionManager';
  
  let statusBarItem: vscode.StatusBarItem;
  let instructionManager: InstructionManager;
  
  export function activate(context: vscode.ExtensionContext) {
	  instructionManager = new InstructionManager(context);
	  
	  // Create status bar item
	  statusBarItem = vscode.window.createStatusBarItem(
		  vscode.StatusBarAlignment.Right,
		  100
	  );
	  statusBarItem.command = 'copilot.switchAssistanceLevel';
	  context.subscriptions.push(statusBarItem);
  
	  // Register command to switch levels
	  context.subscriptions.push(
		  vscode.commands.registerCommand('copilot.switchAssistanceLevel', async () => {
			  const levels = ['low', 'medium', 'high'];
			  const selected = await vscode.window.showQuickPick(levels, {
				  placeHolder: 'Select Copilot assistance level'
			  });
  
			  if (selected) {
				  await setAssistanceLevel(selected);
				  updateStatusBarItem(selected);
				  await instructionManager.updateInstructions(selected);
			  }
		  })
	  );
  
	  // Initialize status bar
	  const currentLevel = getAssistanceLevel();
	  updateStatusBarItem(currentLevel);
	  statusBarItem.show();
  
	  // Initialize instruction file
	  instructionManager.updateInstructions(currentLevel);
  
	  // Auto-enable Copilot
	  autoEnableCopilot();
  }
  
  function updateStatusBarItem(level: string) {
	  statusBarItem.text = `$(github) Copilot: ${level}`;
	  statusBarItem.tooltip = `GitHub Copilot Assistance Level: ${level}\nClick to change`;
  }
  
  function getAssistanceLevel(): string {
	  return vscode.workspace.getConfiguration('copilot').get('assistanceLevel', 'medium');
  }
  
  async function setAssistanceLevel(level: string): Promise<void> {
	  const config = vscode.workspace.getConfiguration('copilot');
	  await config.update('assistanceLevel', level, vscode.ConfigurationTarget.Global);
  }
  
  async function autoEnableCopilot() {
	  try {
		  if (await vscode.commands.getCommands(true).then(cmds => cmds.includes('github.copilot.enable'))) {
			  await vscode.commands.executeCommand('github.copilot.enable');
			  vscode.window.showInformationMessage('GitHub Copilot auto-enabled on startup!');
		  }
	  } catch (err) {
		  vscode.window.showErrorMessage(`Error auto-enabling GitHub Copilot: ${err}`);
	  }
  }
  
  export function deactivate() {
	  if (statusBarItem) {
		  statusBarItem.dispose();
	  }
  }
  
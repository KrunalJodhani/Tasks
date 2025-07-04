/**
 * @property {Array<Command>} undoStack - Stack of commands for undo operations.
 * @property {Array<Command>} redoStack - Stack of commands for redo operations.
 * @property {number} maxHistorySize - Maximum number of commands stored in undo history.
 * 
 * @constructor Initializes the undo/redo stacks and sets the history size limit.
 * 
 * @method execute(command: Command): void  
 * Executes a command, pushes it to the undo stack, and clears the redo stack.
 * 
 * @method undo(): boolean  
 * Undoes the last executed command and moves it to the redo stack.  
 * Returns `true` if successful, `false` if no commands are available.
 * 
 * @method redo(): boolean  
 * Re-executes the last undone command and moves it back to the undo stack.  
 * Returns `true` if successful, `false` if no commands are available.
 * 
 * @method canUndo(): boolean  
 * Returns `true` if there are commands available to undo.
 * 
 * @method canRedo(): boolean  
 * Returns `true` if there are commands available to redo.
 */

export class CommandManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistorySize = 100;
    }

    /**
     * 
     * @param {*object} command key stroke command 
     */
    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }
    }

    undo() {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
            return true;
        }
        return false;
    }

    redo() {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
            return true;
        }
        return false;
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }
}

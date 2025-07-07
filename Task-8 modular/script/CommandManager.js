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
        this.clipboard = null;
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

    copy(sheetManager) {
        const selectedCells = sheetManager.selection.getSelectedCells();
        this.clipboard = {
            type: 'copy',
            data: selectedCells.map(pos => ({
                row: pos.row,
                col: pos.col,
                value: sheetManager.cellData.getCell(pos.row, pos.col).value || ''
            }))
        };
    }

    cut(sheetManager) {
        const selectedCells = sheetManager.selection.getSelectedCells();
        this.clipboard = {
            type: 'cut',
            data: selectedCells.map(pos => ({
                row: pos.row,
                col: pos.col,
                value: sheetManager.cellData.getCell(pos.row, pos.col).value || ''
            }))
        };

        // Create batch of clear commands
        const clearCommands = [];
        selectedCells.forEach(pos => {
            const oldValue = sheetManager.cellData.getCell(pos.row, pos.col).value || '';
            if (oldValue) {
                const command = new sheetManager.ClearCellCommand(sheetManager, pos.row, pos.col, oldValue);
                clearCommands.push(command);
            }
        });

        if (clearCommands.length > 0) {
            this.executeBatch(clearCommands);
        }
    }

    // Update the existing paste method
    paste(sheetManager) {
        if (!this.clipboard || !this.clipboard.data.length) return;

        const activeCell = sheetManager.selection.activeCell;
        const startRow = activeCell.row;
        const startCol = activeCell.col;

        const pasteCommands = [];

        this.clipboard.data.forEach(cellData => {
            const targetRow = startRow + (cellData.row - this.clipboard.data[0].row);
            const targetCol = startCol + (cellData.col - this.clipboard.data[0].col);

            if (targetRow >= 0 && targetRow < sheetManager.cellData.rows &&
                targetCol >= 0 && targetCol < sheetManager.cellData.cols) {

                const oldValue = sheetManager.cellData.getCell(targetRow, targetCol).value || '';
                if (cellData.value !== oldValue) {
                    const command = new sheetManager.SetCellValueCommand(
                        sheetManager, targetRow, targetCol, cellData.value, oldValue
                    );
                    pasteCommands.push(command);
                }
            }
        });

        if (pasteCommands.length > 0) {
            this.executeBatch(pasteCommands);
        }
    }

    /**
 * Executes multiple commands as a single batch operation
 * @param {Array<Command>} commands - Array of commands to execute as a batch
 */
    executeBatch(commands) {
        if (commands.length === 0) return;

        const batchCommand = {
            type: 'batch',
            commands: commands,
            execute: function () {
                this.commands.forEach(command => command.execute());
            },
            undo: function () {
                // Undo in reverse order
                for (let i = this.commands.length - 1; i >= 0; i--) {
                    this.commands[i].undo();
                }
            }
        };

        batchCommand.execute();
        this.undoStack.push(batchCommand);
        this.redoStack = [];

        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }
    }

    executeResize(type, index, newSize, oldSize, sheetManager) {
        const resizeCommand = {
            type: 'resize',
            resizeType: type, // 'row' or 'col'
            index: index,
            newSize: newSize,
            oldSize: oldSize,
            sheetManager: sheetManager,
            execute: function () {
                if (this.resizeType === 'row') {
                    this.sheetManager.cellData.setRowHeight(this.index, this.newSize);
                } else {
                    this.sheetManager.cellData.setColWidth(this.index, this.newSize);
                }
            },
            undo: function () {
                if (this.resizeType === 'row') {
                    this.sheetManager.cellData.setRowHeight(this.index, this.oldSize);
                } else {
                    this.sheetManager.cellData.setColWidth(this.index, this.oldSize);
                }
            }
        };

        this.execute(resizeCommand);
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }
}
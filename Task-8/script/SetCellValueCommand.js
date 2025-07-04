import { Command } from './Command.js';

/**
 * @method constructer take the grid reference row and column to track the cell and change the value of the cell
 * @method execute() - Clears the cell content by setting its value to an empty string.
 * @method undo() - Restores the old value of the cell (undoes the clear operation).
 * @method getDescription() - Returns a string description like "Clear B2" for logging or UI.
 */
export class SetCellValueCommand extends Command {
    /**
     * constructer which set data 
     * @param {*object} grid reference of grid or cell
     * @param {*number} row cell row index
     * @param {*number} col cell column index
     * @param {*number} newValue new value of cell
     * @param {*number} oldValue old value of cell
     */
    constructor(grid, row, col, newValue, oldValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newValue = newValue;
        this.oldValue = oldValue;
    }

    execute() {
        this.grid.setCellValueDirect(this.row, this.col, this.newValue);
    }

    undo() {
        this.grid.setCellValueDirect(this.row, this.col, this.oldValue);
    }

    getDescription() {
        const colName = this.grid.getColumnName(this.col);
        return `Set ${colName}${this.row + 1}`;
    }
}
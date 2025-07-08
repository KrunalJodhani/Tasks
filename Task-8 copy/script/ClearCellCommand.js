import { Command } from './Command.js';

/**
 * * @constructor
 * @param {object} grid - Reference to the sheetManager instance for cell manipulation.
 * @param {number} row - The row index of the cell to be cleared.
 * @param {number} col - The column index of the cell to be cleared.
 * @param {string} oldValue - The previous value of the cell before it was cleared.
 * 
 * @method execute() - Clears the cell content by setting its value to an empty string.
 * @method undo() - Restores the old value of the cell (undoes the clear operation).
 * @method getDescription() - Returns a string description like "Clear B2" for logging or UI.
 */

export class ClearCellCommand extends Command {
    /**
     * constucter which stores the value of cell's metadata
     * @param {object} grid reference f grid or cell
     * @param {*number} row row number
     * @param {*number} col column number
     * @param {*String} oldValue cell value
     */
    constructor(grid, row, col, oldValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
    }

    execute() {
        this.grid.setCellValueDirect(this.row, this.col, '');
    }

    undo() {
        this.grid.setCellValueDirect(this.row, this.col, this.oldValue);
    }

    getDescription() {
        const colName = this.grid.getColumnName(this.col);
        return `Clear ${colName}${this.row + 1}`;
    }
}
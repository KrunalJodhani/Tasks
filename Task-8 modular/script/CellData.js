import { Cell } from './Cell.js';

/**
 * @constructor create map of data size and also create an array of rows and column's height
 * @method getCell return the cell's data's key of map
 * @method setCell change the cell's value and update it into map
 * @method deleteCell delete the cell's data and also remove from the map
 * @method getRowHeight get the height of cell
 * @method setRowHeight change the height of cell also changes it in row height array
 * @method getColWidth get widht of column
 * @method setColWidth set/ change the width of column also changes it in column widht array
 * @method getAllCells return all cell data from map
 */

export class CellData {
    /**
     * 
     * @param {number} rows row number
     * @param {*number} cols column number
     */
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = new Map();
        this.rowHeights = new Array(rows).fill(30);
        this.colWidths = new Array(cols).fill(100);
        this.frozenRows = 0;
        this.frozenCols = 0;
    }

    /**
     * get the cell data from map
     * @param {*number} row 
     * @param {*number} col 
     * @returns key of map for find the cell data
     */
    getCell(row, col) {
        const key = `${row},${col}`;
        return this.data.get(key) || new Cell(row, col);
    }

    /**
     * for set cell data and store it in map
     * @param {*number} row index of row
     * @param {*number} col index of column
     * @param {*string} value cell value
     * @returns cell object
     */
    setCell(row, col, value) {
        const key = `${row},${col}`;
        const cell = new Cell(row, col, value);
        this.data.set(key, cell);
        return cell;
    }

    /**
     * for deleting the cell data
     * @param {*number} row index of row
     * @param {*number} col index of column
     */
    deleteCell(row, col) {
        const key = `${row},${col}`;
        this.data.delete(key);
    }

    /**
     * returns the height of row
     * @param {*number} row index of row 
     * @returns height of row by default returns 25 
     */
    getRowHeight(row) {
        return this.rowHeights[row] || 25;
    }

    /**
     * set the height of row
     * @param {*number} row index of row 
     * @param {*number} height new height of row 
     */
    setRowHeight(row, height) {
        this.rowHeights[row] = Math.max(15, height);
    }

    /**
     * returns the width of column
     * @param {*number} col index of column
     * @returns widhth of column by default returns 100
     */
    getColWidth(col) {
        return this.colWidths[col] || 100;
    }

    /**
     * set the widht of column
     * @param {*number} col index of column 
     * @param {*number} widhth new width of column
     */
    setColWidth(col, width) {
        this.colWidths[col] = Math.max(30, width);
    }

    getAllCells() {
        const cells = [];
        for (const [key, cell] of this.data) {
            cells.push(cell);
        }
        return cells;
    }
}
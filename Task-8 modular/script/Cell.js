/**
 * @constructor from the canvas create a cell
 * @method detectType check the type of cell
 * @method getDisplayValue check the type of value and convert it according to it
 */
export class Cell {
    /**
     * 
     * @param {number} row row number
     * @param {*number} col column number
     * @param {*String} value cell's value or inputed text
     */
    constructor(row, col, value = '') {
        this.row = row;
        this.col = col;
        this.value = value;
        this.type = this.detectType(value);
        this.formula = null;
        this.format = null;
    }

    /**
     * 
     * @param {*string/number} value cell's value
     * @returns type of data is it number string or empty cell
     */
    detectType(value) {
        if (value === '' || value == null) return 'empty';
        if (!isNaN(value) && !isNaN(parseFloat(value))) return 'number';
        return 'text';
    }

    getDisplayValue() {
        switch (this.type) {
            case 'number':
                return parseFloat(this.value).toLocaleString();
            default:
                return this.value.toString();
        }
    }
}
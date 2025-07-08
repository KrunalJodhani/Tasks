export class DoubleClickHandler {
    constructor(sheet) {
        this.sheet = sheet;
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
    }

    getRelativePosition(e) {
        const rect = this.sheet.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    handleDoubleClick(e) {
        const { x, y } = this.getRelativePosition(e);
        const cellPos = this.sheet.getCellFromPoint(x, y);
        if (cellPos) {
            this.sheet.showCellEditor(cellPos.row, cellPos.col);
        }
    }
}

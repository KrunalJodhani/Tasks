export class CursorManager {
    constructor(sheet) {
        this.sheet = sheet;
    }

    updateCursor(x, y) {
        const resizeInfo = this.sheet.getResizeInfo(x, y);
        const scrollbarInfo = this.sheet.getScrollbarInfo(x, y);
        if (resizeInfo) {
            this.sheet.canvas.style.cursor = resizeInfo.type === 'col' ? 'ew-resize' : 'ns-resize';
        } else if (scrollbarInfo) {
            this.sheet.canvas.style.cursor = 'pointer';
        } else {
            this.sheet.canvas.style.cursor = 'cell';
        }
    }
}
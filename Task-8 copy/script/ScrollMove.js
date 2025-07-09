export default class ScrollMove {
    constructor(sheet) {
        this.sheet = sheet;
        this.isDragging = false;
        this.dragType = null;
        this.startPos = 0;
        this.initialScroll = 0;
    }

    hitTest(x, y) {
        const info = this.sheet.getScrollbarInfo(x, y);
        if (info && info.part === 'thumb') {
            this.dragType = info.type; // 'horizontal' or 'vertical'
            return true;
        }
        return false;
    }

    onPointerDown(e, x, y) {
        this.isDragging = true;
        this.startPos = this.dragType === 'horizontal' ? e.clientX : e.clientY;
        this.initialScroll = this.dragType === 'horizontal' ? this.sheet.scrollX : this.sheet.scrollY;
    }

    onPointerMove(e) {
        if (!this.isDragging) return;

        const delta = this.dragType === 'horizontal'
            ? e.clientX - this.startPos
            : e.clientY - this.startPos;

        if (this.dragType === 'horizontal') {
            const contentWidth = this.sheet.viewportWidth - this.sheet.headerWidth;
            const totalWidth = this.sheet.getTotalWidth();
            const trackWidth = contentWidth - (this.sheet.getTotalHeight() > this.sheet.viewportHeight - this.sheet.headerHeight ? this.sheet.scrollbarWidth : 0);
            const maxScroll = Math.max(0, totalWidth - contentWidth);
            const scrollRatio = delta / trackWidth;
            this.sheet.scrollX = Math.max(0, Math.min(maxScroll, this.initialScroll + scrollRatio * maxScroll));
        } else {
            const contentHeight = this.sheet.viewportHeight - this.sheet.headerHeight;
            const totalHeight = this.sheet.getTotalHeight();
            const trackHeight = contentHeight - (this.sheet.getTotalWidth() > this.sheet.viewportWidth - this.sheet.headerWidth ? this.sheet.scrollbarHeight : 0);
            const maxScroll = Math.max(0, totalHeight - contentHeight);
            const scrollRatio = delta / trackHeight;
            this.sheet.scrollY = Math.max(0, Math.min(maxScroll, this.initialScroll + scrollRatio * maxScroll));
        }

        this.sheet.render();
    }

    onPointerUp() {
        this.isDragging = false;
        this.dragType = null;
    }
}

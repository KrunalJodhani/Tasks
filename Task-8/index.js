class Row {
  constructor(index, height = 30) {
    this.index = index;
    this.height = height;
    this.top = index * height;
  }

  getTop() {
    return this.top;
  }

  getHeight() {
    return this.height;
  }
}

class Column {
  constructor(index, width = 80) {
    this.index = index;
    this.width = width;
    this.left = index * width;
  }

  getLeft() {
    return this.left;
  }

  getWidth() {
    return this.width;
  }
}

class Grid {
  constructor(ctx, rowHeight, colWidth, totalRows, totalCols) {
    this.ctx = ctx;
    this.rowHeight = rowHeight;
    this.colWidth = colWidth;
    this.totalRows = totalRows;
    this.totalCols = totalCols;
  }

  render(scrollTop, scrollLeft, canvasWidth, canvasHeight) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "#ccc";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const startRow = Math.floor(scrollTop / this.rowHeight);
    const endRow = Math.min(startRow + Math.ceil(canvasHeight / this.rowHeight) + 1, this.totalRows);

    const startCol = Math.floor(scrollLeft / this.colWidth);
    const endCol = Math.min(startCol + Math.ceil(canvasWidth / this.colWidth) + 1, this.totalCols);

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const x = c * this.colWidth - scrollLeft;
        const y = r * this.rowHeight - scrollTop;

        ctx.strokeRect(x, y, this.colWidth, this.rowHeight);
        ctx.fillText(`R${r}C${c}`, x + this.colWidth / 2, y + this.rowHeight / 2);
      }
    }
  }
}

class Cell {
  static createInput(x, y, width, height, container) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "cell-input";
    input.style.position = "absolute";
    input.style.left = `${x}px`;
    input.style.top = `${y}px`;
    input.style.width = `${width - 2}px`;
    input.style.height = `${height - 2}px`;
    input.style.border = "1px solid #333";
    input.style.boxSizing = "border-box";
    input.style.fontSize = "12px";
    input.style.padding = "0 4px";
    input.style.margin = "0";
    input.style.zIndex = "100";
    input.style.backgroundColor = "#fff";
    input.style.outline = "none";

    container.appendChild(input);
    input.focus();

    input.addEventListener("blur", () => {
      container.removeChild(input);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur();
      }
    });
  }
}

class SheetManager {
  constructor(canvas, contentContainer, virtualContainer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.content = contentContainer;
    this.virtual = virtualContainer;

    this.rowHeight = 30;
    this.colWidth = 80;
    this.totalRows = 100000;
    this.totalCols = 500;

    this.grid = new Grid(this.ctx, this.rowHeight, this.colWidth, this.totalRows, this.totalCols);
  }

  init() {
    this.setVirtualSize();
    this.setCanvasSize();
    this.attachScroll();
    this.attachEditHandler();
    this.grid.render(0, 0, this.canvas.width, this.canvas.height);
  }

  setVirtualSize() {
    this.virtual.style.width = this.colWidth * this.totalCols + "px";
    this.virtual.style.height = this.rowHeight * this.totalRows + "px";
  }

  setCanvasSize() {
    this.canvas.width = this.content.clientWidth;
    this.canvas.height = this.content.clientHeight;
    this.canvas.style.width = this.canvas.width + "px";
    this.canvas.style.height = this.canvas.height + "px";
  }

  attachScroll() {
    const render = () => {
      const scrollTop = this.content.scrollTop;
      const scrollLeft = this.content.scrollLeft;
      this.grid.render(scrollTop, scrollLeft, this.canvas.width, this.canvas.height);
    };

    this.content.addEventListener("scroll", render);

    window.addEventListener("resize", () => {
      this.setCanvasSize();
      render();
    });
  }

  attachEditHandler() {
    this.canvas.addEventListener("dblclick", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scrollLeft = this.content.scrollLeft;
      const scrollTop = this.content.scrollTop;

      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top + scrollTop;

      const col = Math.floor(x / this.colWidth);
      const row = Math.floor(y / this.rowHeight);

      const inputX = col * this.colWidth - scrollLeft;
      const inputY = row * this.rowHeight - scrollTop;

      Cell.createInput(inputX, inputY, this.colWidth, this.rowHeight, this.content);
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("mainExcel");
  const content = document.getElementById("content");
  const virtualContainer = document.querySelector(".virtualContainer");

  const sheet = new SheetManager(canvas, content, virtualContainer);
  sheet.init();
});

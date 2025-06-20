class Row {
    constructor(index, height = 10) {
      this.index = index;
      this.height = height;
      this.top = 0;
    }
  
    setTop(top) {
      this.top = top;
    }
  
    getTop() {
      return this.top;
    }
  
    getHeight() {
      return this.height;
    }
  }
  
  class Column {
    constructor(index, key = "", width = 20) {
      this.index = index;
      this.width = width;
      this.left = 0;
      this.key = key;
    }
  
    setLeft(left) {
      this.left = left;
    }
  
    getLeft() {
      return this.left;
    }
  
    getWidth() {
      return this.width;
    }
  
    getKey() {
      return this.key;
    }
  
    setKey(key) {
      this.key = key;
    }
  }
  
  class Grid {
    constructor(canvas, rowNum = 20, columnNum = 20, height = 20, width = 40) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.rows = [];
      this.columns = [];
  
      for (let i = 0; i < rowNum; i++) {
        this.rows.push(new Row(i, height));
      }
  
      for (let j = 0; j < columnNum; j++) {
        this.columns.push(new Column(j, `col${j}`, width));
      }
    }
  
    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.strokeStyle = "black";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
  
      let y = 0;
      this.rows.forEach(row => {
        row.setTop(y);
        y += row.getHeight();
      });
  
      let x = 0;
      this.columns.forEach(col => {
        col.setLeft(x);
        x += col.getWidth();
      });
  
      this.rows.forEach(row => {
        this.columns.forEach(col => {
          const x = col.getLeft();
          const y = row.getTop();
          const w = col.getWidth();
          const h = row.getHeight();
  
          ctx.strokeRect(x, y, w, h);
          ctx.fillText(`R${row.index}C${col.index}`, x + w / 2, y + h / 2);
        });
      });
    }
  }
  
  class Cell {
    
  }
  
  const rowCount = 50;
  const columnCount = 50;
  const rowHeight = 20;
  const colWidth = 80;
  
  const canvas = document.getElementById("mainExcel");
  canvas.width = columnCount * colWidth;
  canvas.height = rowCount * rowHeight;
  
  const grid = new Grid(canvas, rowCount, columnCount, rowHeight, colWidth);
  grid.render();
  
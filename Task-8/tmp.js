const render = () =>{
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = "#ccc";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Calculate positions
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

    // Draw cells
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
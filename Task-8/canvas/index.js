const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const mouse = {
    x: null,
    y: null,
}

canvas.addEventListener('click', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});

canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x;
    mouse.y = e.y;
})

function drawCircle() {
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 50, 0, Math.PI * 2);
    ctx.fill();
}

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);      
    drawCircle();  
    requestAnimationFrame(animate);
}

animate();
function initDraw(){
    const canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    snap();
    ctx.fillRect(20, 20, 150, 100);
}

function line(ctx,x1,y1,x2,y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function circle(ctx,x,y,r){
    ctx.beginPath();
    ctx.arc(x,y,r,0,2 * Math.PI);
    ctx.stroke();
}

function scale(ctx,percent){
    ctx.scale(percent, percent);
}

function snap(){
    document.addEventListener("click", function(){
        document.getElementById("canvas").fillStyle = "blue";
      }
    );
}
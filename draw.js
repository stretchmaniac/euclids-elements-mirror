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

let scale = 1;
let translate = new Point(0, 0);
function graphToScreen(realPoint){
    return realPoint.scaleBy(scale).add(translate);
}
function screenToGraph(screenPt){
    return screenPt.subtract(translate).scaleBy(1/scale);
}
// panBy is a Point in pixels
function pan(panBy){
    translate = translate.add(panBy);
}
// i.e. center of zoom (in screen coords) and how much of the screen should become the full screen (so .1 is too much zoom)
function zoom(pixCenter, zoomPercent){
    let center = screenToGraph(pixCenter);
    // it is intuitive that scale should be multiplied by 1 / zoomPercent. What should 
    // happen to translate? 
    // we wish that the centerpoint not change position, so we have 
    // scale * center + translate = newScale * center + newTranslate 
    //   ==> newTranslate = center(scale - newScale) - translate
    let newScale = scale / zoomPercent;
    translate = center.scaleBy(scale - newScale).subtract(translate);
    scale = newScale;
}
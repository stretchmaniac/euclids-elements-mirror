function initDraw(){
    const canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    snap();
    ctx.fillRect(20, 20, 150, 100);

    let mousePos = undefined;
    canvas.addEventListener("mousedown", (e) => { mousePos = new Point(e.clientX, e.clientY); });
    canvas.addEventListener("mousemove", (e) => {
        let currentPt = new Point(e.clientX, e.clientY);
        if(e.buttons === 1){
            // so e.movementX and e.movementY is supposed to do this stuff for us, but 
            // it's buggy in both chrome and firefox, so no luck there.
            pan(currentPt.subtract(mousePos));
            drawGraph();
        }
        mousePos = currentPt;
    });

    canvas.addEventListener('wheel', (e) => {
        let scaleAmount = 1 + e.deltaY / 300;
        console.log(scaleAmount);
        zoom(mousePos, scaleAmount);
        drawGraph();
    });
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

/* function scale(ctx,percent){
    ctx.scale(percent, percent);
} */

function snap(){
    document.addEventListener("click", function(){
        document.getElementById("canvas").fillStyle = "blue";
      }
    );
}

function drawNode(ctx, node){
    let center = graphToScreen(node.getCoords());
    let radius = 3; // px 

    ctx.fillStyle = 'rgba(0, 255, 0, .75)';

    // draw a little filled in green circle 
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI);
    ctx.fill();
}
function drawCircle(ctx, struct){
    let center = graphToScreen(struct.centerNode.getCoords());
    let radius = graphToScreen(struct.centerNode.getCoords()).distance(graphToScreen(struct.radialNode.getCoords()));

    ctx.strokeStyle = 'rgba(0, 0, 0, .5)';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI);
    ctx.stroke();
}
function drawLine(canvas, ctx, struct){
    let p1 = graphToScreen(struct.node1.getCoords());
    let p2 = graphToScreen(struct.node2.getCoords());

    // we want to draw the line to the edges of the screen 
    let dist = Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
    // should be more than sufficient
    let factor = 2 * Math.min(canvas.clientWidth / dist, canvas.clientHeight / dist);
    let newP1 = p2.add(p1.subtract(p2).scaleBy(factor));
    let newP2 = p1.add(p2.subtract(p1).scaleBy(factor));

    ctx.strokeStyle = 'rgba(0, 0, 0, .5)';
    ctx.beginPath();
    ctx.moveTo(newP1.x, newP1.y);
    ctx.lineTo(newP2.x, newP2.y);
    ctx.stroke();
}

function drawGraph(){
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    for(let node of graph){
        drawNode(ctx, node);
    }
    for(let struct of structs){
        if(struct.type === STRUCT_TYPE.LINE){
            drawLine(canvas, ctx, struct);
        } else if(struct.type === STRUCT_TYPE.CIRCLE){
            drawCircle(ctx, struct);
        }
    }
}

let scale = 100;
let translate = new Point(250, 250);
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
    //   ==> newTranslate = center(scale - newScale) + translate
    let newScale = scale / zoomPercent;
    translate = center.scaleBy(scale - newScale).add(translate);
    scale = newScale;
}
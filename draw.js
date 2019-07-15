const NODE_RADIUS = 8; // in pixels
const INTERSECTION_DETECTION_RADIUS = 4; // in pixels

let extraStructs = [];

function initDraw(){
    
}

// returns a list of nodes within NODE_RADIUS of pixelCoords
function getNodesOnScreen(pixelCoords){
    let res = [];
    for(let node of graph){
        if(graphToScreen(node.getCoords()).distance(pixelCoords) <= NODE_RADIUS){
            res.push(node);
        }
    }
    return res;
}

// returns a pair of structs that intersect within INTERSECTION_DETECTION_RADIUS of pixelCoords, 
// if such a pair exists. Otherwise returns undefined
function getStructIntersection(pixelCoords){
    let structsInRange = [];
    let graphCoords = screenToGraph(pixelCoords);
    let tolerance = screenLengthToGraphLength(INTERSECTION_DETECTION_RADIUS); 
    for(let struct of structs){
        if(struct.incidentTo(graphCoords, tolerance)){
            structsInRange.push(struct);
        }
    }

    if(structsInRange.length < 2){
        return undefined;
    }

    // pick the "oldest" structs. Coincidentally, they are the first in the list 
    return [structsInRange[0], structsInRange[1]];
}

function drawNode(ctx, node, color){
    let center = graphToScreen(node.getCoords());
    let radius = NODE_RADIUS; 

    color = node.color ? node.color : 'rgba(0,0,255,.5)';

    ctx.fillStyle = color;

    // draw a little filled in green circle 
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI);
    ctx.fill();
}

function drawStruct(struct, canvas, ctx){
    if(struct.type === STRUCT_TYPE.CIRCLE){
        drawCircle(ctx, struct);
    } else if(struct.type === STRUCT_TYPE.LINE){
        drawLine(canvas, ctx, struct);
    }
}

function drawCircle(ctx, struct){
    struct.setCoords();
    let center = graphToScreen(struct.center);
    let radius = graphLengthToScreenLength(struct.radius);

    ctx.moveTo(center.x + radius, center.y);
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI);
}
function drawLine(canvas, ctx, struct){
    struct.setCoords();
    let p1 = graphToScreen(struct.p1);
    let p2 = graphToScreen(struct.p2);
    let dir = p2.subtract(p1);

    let screenRadius = Math.sqrt(canvas.clientHeight**2 + canvas.clientWidth**2) / 2;
    let screenCenter = new Point(canvas.clientWidth / 2, canvas.clientHeight / 2);
    let closestPt = screenCenter.subtract(p1).projectOnto(dir).add(p1);

    if(closestPt.distanceSquared(screenCenter) > screenRadius**2){
        return; 
    }

    dir = dir.normalize();

    let newP1 = closestPt.add(dir.scaleBy(screenRadius));
    let newP2 = closestPt.add(dir.scaleBy(-screenRadius));

    ctx.moveTo(newP1.x, newP1.y);
    ctx.lineTo(newP2.x, newP2.y);
}

function drawGraph(){
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    for(let node of graph){
        drawNode(ctx, node);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath();
    for(let struct of structs){
        drawStruct(struct, canvas, ctx);
    }
    for(let struct of extraStructs){
        drawStruct(struct, canvas, ctx);
    }
    console.log(extraStructs.length, structs.length);
    ctx.stroke();
}
// a little bit of a hack to get drawGraph visible to screen.js
window.drawGraph = drawGraph;
const NODE_RADIUS = 8; // in pixels

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
    if(!canvas){
        canvas = document.getElementById('canvas');
    }
    if(!ctx){
        ctx = canvas.getContext('2d');
    }
    if(struct.type === STRUCT_TYPE.CIRCLE){
        drawCircle(ctx, struct);
    } else if(struct.type === STRUCT_TYPE.LINE){
        drawLine(canvas, ctx, struct);
    }
}

function drawCircle(ctx, struct){
    let center = graphToScreen(struct.centerNode.getCoords());
    let radius = graphToScreen(struct.centerNode.getCoords()).distance(graphToScreen(struct.radialNode.getCoords()));

    ctx.strokeStyle = 'rgba(0, 0, 0, .5)';
    ctx.lineWidth = 3;
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
        drawStruct(struct, canvas, ctx);
    }
    for(let struct of extraStructs){
        drawStruct(struct, canvas, ctx);
    }
}
// a little bit of a hack to get drawGraph visible to screen.js
window.drawGraph = drawGraph;
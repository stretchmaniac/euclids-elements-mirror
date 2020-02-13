const NODE_RADIUS = 8; // in pixels
const INTERSECTION_DETECTION_RADIUS = 4; // in pixels

let extraStructs = [];

function initDraw(){
    
}

// returns a list of nodes within NODE_RADIUS of pixelCoords
function getVisibleNodesOnScreen(pixelCoords){
    let res = [];
    for(let node of graph){
        if(graphToScreen(node.getCoords()).distance(pixelCoords) <= NODE_RADIUS && !node.hidden){
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

    // order matters here if the we're talking about anything other than a line-line intersection.
    // See geo.js intersect functions 
    const s1 = structsInRange[0];
    const s2 = structsInRange[1];
    const intPt1 = s1.intersect(s2);
    const intPt2 = s2.intersect(s1);
    if(intPt1.distance(graphCoords) <= intPt2.distance(graphCoords)){
        return [s1, s2];
    }
    return [s2, s1];
}

function drawNode(ctx, node, color){
    if(node.hidden){
        return;
    }
    let center = graphToScreen(node.getCoords());
    let radius = NODE_RADIUS; 

    if(node.root && !node.color){
        node.color = 'rgba(0,160,0,.5)';
    }
    if(node.testNode && !node.color){
        node.color = 'rgba(255, 218, 10, .5)';
    }
    color = node.color ? node.color : 'rgba(0,0,255,.5)';

    ctx.fillStyle = color;

    // draw a little filled in circle 
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

// real modulus function
function mod(n, m) {
    return ((n % m) + m) % m;
  }

function drawGrid(ctx, canvas){
    let viewWidth = screenLengthToGraphLength(canvas.clientWidth);
    let viewHeight = screenLengthToGraphLength(canvas.clientHeight);

    let dominantDim = Math.max(viewWidth, viewHeight);
    let maxCellWidth = dominantDim / 10;
    
    let val = Math.log10(maxCellWidth);
    let is10 = mod(val, 1) < .5;
    let actualCellWidth = is10 ? 10**Math.floor(val) : 2 * 10**Math.floor(val);

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let minPt = screenToGraph(new Point(0, 0));
    let maxPt = screenToGraph(new Point(width, height));
    let minX = minPt.x;
    let minY = minPt.y;
    let maxX = maxPt.x;
    let maxY = maxPt.y;

    minPt.x = Math.ceil(minPt.x / actualCellWidth) * actualCellWidth;
    minPt.y = Math.ceil(minPt.y / actualCellWidth) * actualCellWidth;
    maxPt.x = Math.floor(maxPt.x / actualCellWidth) * actualCellWidth;
    maxPt.y = Math.floor(maxPt.y / actualCellWidth) * actualCellWidth;

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = .1;

    for(let x = minPt.x; x <= maxPt.x + actualCellWidth / 100; x += actualCellWidth){
        let bottom = graphToScreen(new Point(x, minY));
        let top = graphToScreen(new Point(x, maxY));
        ctx.moveTo(bottom.x, bottom.y);
        ctx.lineTo(top.x, top.y);
    }

    for(let y = minPt.y; y <= maxPt.y + actualCellWidth / 100; y += actualCellWidth){
        let left = graphToScreen(new Point(minX, y));
        let right = graphToScreen(new Point(maxX, y));
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
    }

    ctx.stroke();
}

function drawGraph(){
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    drawGrid(ctx, canvas);
    
    for(let node of graph){
        drawNode(ctx, node);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    for(let struct of structs){
        if(!struct.hidden){
            drawStruct(struct, canvas, ctx);
        }
    }
    for(let struct of extraStructs){
        if(!struct.hidden){
            drawStruct(struct, canvas, ctx);
        }
    }
    ctx.stroke();

    ctx.lineWidth = .3;
    ctx.strokeStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath();
    for(let struct of structs){
        if(struct.hidden){
            drawStruct(struct, canvas, ctx);
        }
    }
    for(let struct of extraStructs){
        if(struct.hidden){
            drawStruct(struct, canvas, ctx);
        }
    }
    ctx.stroke();

}
// a little bit of a hack to get drawGraph visible to screen.js
window.drawGraph = drawGraph;
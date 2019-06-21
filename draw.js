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

        animationOnHover(mousePos);
    });

    canvas.addEventListener('wheel', (e) => {
        let scaleAmount = 1 + e.deltaY / 300;
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
    let radius = 5; // px 

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
        if(struct.type === STRUCT_TYPE.LINE){
            drawLine(canvas, ctx, struct);
        } else if(struct.type === STRUCT_TYPE.CIRCLE){
            drawCircle(ctx, struct);
        }
    }
}

let scale = 200;
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

// called when mousemove is called for canvas
function animationOnHover(mousePos){
    const snapDist = 5; // px
    const animationDuration = 100;
    // snap to nodes if close enough
    for(let node of graph){
        if(graphToScreen(node.getCoords()).distance(mousePos) <= snapDist){
            if(!node.animationObj){
                node.animationObj = new AnimationObject(
                    (localTime, ctx) => {
                        let maxRadius = 5;
                        let duration = animationDuration;
                        let radius = localTime < duration ? maxRadius * localTime / duration : maxRadius;
                        ctx.beginPath();
                        ctx.fillStyle = 'rgb(0,0,0)';
                        let realCoords = graphToScreen(node.getCoords());
                        ctx.arc(realCoords.x, realCoords.y, radius, 0, 2*Math.PI);
                        ctx.fill();
                    },
                    (time) => false, 
                    0,
                    () => {
                        // schedule a parallel event for mouseout (i.e onkill) on the node
                        if(node.closeAnimationObj){
                            node.closeAnimationObj.kill();
                        }
                        node.closeAnimationObj = new AnimationObject(
                            (localTime, ctx) => {
                                let maxRadius = 5;
                                let duration = animationDuration;
                                let radius = maxRadius - (localTime < duration ? maxRadius * localTime / duration : maxRadius);
                                ctx.beginPath();
                                ctx.fillStyle = 'rgb(0,0,0)';
                                let realCoords = graphToScreen(node.getCoords());
                                ctx.arc(realCoords.x, realCoords.y, radius, 0, 2*Math.PI);
                                ctx.fill();
                            },
                            (time) => time > 300,
                            0,
                            () => {}
                        );

                        node.closeAnimationObj.start();
                    }
                )

                node.animationObj.start();
            }
        } else {
            if(node.animationObj){
                node.animationObj.kill();
                node.animationObj = undefined;
            }
        }
    }
}

// behold my boredom: an animation queue
// let's say you want to have a nice 300ms animation as you hover over a point. 
// You would make an animation object: 
// let animationObj = new AnimationObject( (localTime, ctx) => { --draw circle of radius r a function of localTime--} , (time) => time > 300, 0, () => {} );
// ... start it up
// animationObj.start();
// the object will get updated as it performs and you can query it's state:
// if(animationObj.finished === true) { ... }
// ... or kill it
// animationObj.kill();

let aliveAnimations = [];

function AnimationObject(animationFunc, stopFunc, delay, onFinish){
    this.animationFunc = animationFunc;
    this.stopFunc = stopFunc;
    this.delay = delay;
    this.onFinish = onFinish;

    this.finished = false;
    this.started = false;
    this.startTime = undefined;
    this.scheduledForDecommission = false;

    let aObj = this;

    this.kill = () => { aObj.scheduledForDecommission = true; };

    this.start = () => {
        setTimeout(
            () => {
                aliveAnimations.push(aObj);
                // i.e. if it was empty before
                if(aliveAnimations.length === 1){
                    window.requestAnimationFrame(animationFrame);
                }
            }
        , delay);
    }
}

function animationFrame(timestamp){
    drawGraph();
    let ctx = document.getElementById('canvas').getContext('2d');
    // backwards so we can remove elements as we go if needed
    for(let j = aliveAnimations.length - 1; j >= 0; j--){
        let animationObj = aliveAnimations[j];

        // beginning of life house keeping 
        if(!animationObj.startTime){ // mostly equivalent to animationObj.startTime === undefined
            animationObj.startTime = timestamp;
            animationObj.started = true;
        }

        // do drawing 
        let age = timestamp - animationObj.startTime;
        animationObj.animationFunc(age, ctx);

        // end of life house keeping 
        if(animationObj.stopFunc(age) || animationObj.scheduledForDecommission){
            // remove from aliveAnimations 
            aliveAnimations.splice(j, 1);
            animationObj.onFinish();
        }
    }

    if(aliveAnimations.length > 0){
        requestAnimationFrame(animationFrame);
    } else {
        // clear any remaining junk we may have on the screen
        drawGraph();
    }
}
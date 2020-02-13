function initAnimation(){
    //  initialize mouse events
    let mousePos = undefined;
    let canvas = document.getElementById('canvas');
    canvas.addEventListener("mousedown", (e) => { mousePos = new Point(e.clientX, e.clientY); });
    canvas.addEventListener("mousemove", (e) => {
        let currentPt = new Point(e.clientX, e.clientY);
        mousePos = currentPt;

        animationOnHover(mousePos);
    });
}

// called when mousemove is called for canvas
function animationOnHover(mousePos){
    const snapDist = NODE_RADIUS; // px
    const animationDuration = 100;
    let ctx = document.getElementById('canvas').getContext('2d');
    // snap to nodes if close enough
    for(let node of graph){
        if(graphToScreen(node.getCoords()).distance(mousePos) <= snapDist && !node.hidden){
            if(node.closeAnimationObj){
                node.closeAnimationObj.kill();
            }
            if(!node.animationObj){
                node.animationObj = new AnimationObject(
                    (localTime, ctx) => {
                        let maxRadius = NODE_RADIUS;
                        let duration = animationDuration;
                        let radius = localTime < duration ? maxRadius * localTime / duration : maxRadius;
                        ctx.beginPath();
                        ctx.fillStyle = 'rgb(0,0,0)';
                        let realCoords = graphToScreen(node.getCoords());
                        ctx.arc(realCoords.x, realCoords.y, radius, 0, 2*Math.PI);
                        ctx.fill();
                    },
                    (time) => time > animationDuration, 
                    0,
                    () => { }
                )

                node.animationObj.start();

                node.closeAnimationObj = undefined;
            }

            // draw node black 
            node.color = 'black';
        } else if(node.animationObj){
            // do an animation for mouse out
            node.animationObj.kill();

            node.closeAnimationObj = new AnimationObject(
                (localTime, ctx) => {
                    let maxRadius = NODE_RADIUS;
                    let duration = animationDuration;
                    let radius = maxRadius - (localTime < duration ? maxRadius * localTime / duration : maxRadius);
                    ctx.beginPath();
                    ctx.fillStyle = 'rgb(0,0,0)';
                    let realCoords = graphToScreen(node.getCoords());
                    ctx.arc(realCoords.x, realCoords.y, radius, 0, 2*Math.PI);
                    ctx.fill();
                },
                (time) => time > animationDuration,
                0,
                () => {}
            );

            node.closeAnimationObj.start();
            // put node back to default color 
            node.color = undefined;

            node.animationObj = undefined;
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
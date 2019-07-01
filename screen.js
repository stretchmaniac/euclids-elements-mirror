// for panning and scrolling 
function initScreen(){

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
        zoom(mousePos, scaleAmount);
        window.drawGraph();
    });
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
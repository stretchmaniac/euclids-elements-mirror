// used for turning mouse events into graph chunks 

let SELECTION_HOOKS = {
    CIRCLE: {
        dependencyCount: 2,
        getStruct: (completedNodeList) => {
            return new Circle(...completedNodeList);
        }
    }, 
    LINE: {
        dependencyCount: 2,
        getStruct: (completedNodeList) => {
            return new Line(...completedNodeList)
        }
    }
}
for(let hookID in SELECTION_HOOKS){
    let hook = SELECTION_HOOKS[hookID];
    hook.execute = function(nodeList){
        structs.push(hook.getStruct(nodeList));
        drawGraph();
    }
}

let selectionInfo = {
    nodeList: [],
    hook: SELECTION_HOOKS.LINE,
    // curiously an anonymous function does not expose "this" as the selectionInfo object; 
    // rather this refers to document (as far as I can tell). By writing the explicit function things 
    // seem to work.
    execute: function(){ 
        this.hook.execute(this.nodeList); 
        this.escape();
    },
    escape: function(){
        extraStructs = [];
        for(let node of this.nodeList){
            node.color = undefined;
        }
        this.nodeList = [];
    },
    incompleteOnMouseMove: function(mousePos){ 
        // highlight the nodes that have been selected so far
        for(let node of this.nodeList){
            node.color = 'rgba(255,0,0,0.7)';
        }

        // if nodeList + mousePos makes a full set of nodes, draw a profile of what the
        // struct will look like
        if(this.nodeList.length === this.hook.dependencyCount - 1){
            let ghostNode = new Node([], {}, screenToGraph(mousePos));
            let ghostList = [];
            for(let s of this.nodeList){
                ghostList.push(s);
            }
            ghostList.push(ghostNode);
            let ghostStruct = this.hook.getStruct(ghostList);
            extraStructs = [ghostStruct];
            drawGraph();
        }
    }
};

function initGraphBuilder(){
    let canvas = document.getElementById('canvas');
    // we say the user has clicked on a node iff mouseup and mousedown 
    // occur at the same position (to differentiate from panning, that is).
    let mousedownPos = undefined;
    canvas.addEventListener('mousedown', (e) => {
        mousedownPos = new Point(e.clientX, e.clientY);
    });
    canvas.addEventListener('mouseup', (e) => {
        let mouseupPos = new Point(e.clientX, e.clientY);
        if(mousedownPos && mousedownPos.x === mouseupPos.x && mousedownPos.y === mouseupPos.y){
            selection(mouseupPos);
        }
        mousedownPos = undefined;
    });
    canvas.addEventListener('mousemove', (e) => {
        if(selectionInfo.nodeList.length > 0){
            selectionInfo.incompleteOnMouseMove(new Point(e.clientX, e.clientY));
        }
    });
    document.getElementById('circle_button').addEventListener('click', () => {
        selectionInfo.hook = SELECTION_HOOKS.CIRCLE;
    });
    document.getElementById('line_button').addEventListener('click', () => {
        selectionInfo.hook = SELECTION_HOOKS.LINE;
    });
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
            selectionInfo.escape();
            drawGraph();
        }
    })
}

function selection(pos){
    // see if we managed to click on a node 
    let nodes = getNodesOnScreen(pos);

    if(nodes.length === 0) { 
        selectionInfo.escape();
        
        // check for intersection points
        let intersection = getStructIntersection(pos);
        if(intersection){
            // add a node here 
            addNode(intersection[0], intersection[1], { nearestTo: screenToGraph(pos) } );
        }

        drawGraph();
        return;
    }

    // pick the first one. If they want a different node they can zoom in
    let node = nodes[0];
    
    // make sure this node is not already in nodeList 
    if(selectionInfo.nodeList.indexOf(node) !== -1){
        return;
    }

    selectionInfo.nodeList.push(node);
    if(selectionInfo.nodeList.length === selectionInfo.hook.dependencyCount){
        selectionInfo.execute();
        selectionInfo.nodeList = [];
    }

    drawGraph();
}
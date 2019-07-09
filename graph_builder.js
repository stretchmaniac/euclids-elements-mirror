// used for turning mouse events into graph chunks 

let SELECTION_HOOKS = {
    CIRCLE: {
        dependencyCount: 2,
        getStruct: (completedNodeList) => {
            return new Circle(completedNodeList[0], completedNodeList[1]);
        },
        execute: (nodeList) => {
            structs.push(this.getStruct(nodeList));
            drawGraph();
        }
    }
}

let selectionInfo = {
    nodeList: [],
    hook: SELECTION_HOOKS.CIRCLE,
    execute: () => { this.hook.execute(this.nodeList); },
    incompleteOnMouseMove: (mousePos) => { 
        // highlight the nodes that have been selected so far
        for(let node of this.nodeList){
            node.color = 'rgba(255,0,0,0.7)';
        }

        // if nodeList + mousePos makes a full set of nodes, draw a profile of what the
        // struct will look like
        if(nodeList.length === this.hook.dependencyCount - 1){
            let ghostNode = new Node([], {}, screenToGraph(mousePos));
            let ghostList = [];
            for(let s of this.nodeList){
                ghostList.push(s);
            }
            ghostList.push(ghostNode);
            let ghostStruct = this.hook.getStruct(ghostList);
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
            selection(mouseupPs);
        }
        mousedownPos = undefined;
    });
    canvas.addEventListener('mousemove', (e) => {
        if(selectionInfo.nodeList.length > 0){
            selectionInfo.hook.incompleteOnMouseMove(selectionInfo)
        }
    });
}

function selection(pos){
    // see if we managed to click on a node 
    let nodes = getNodesOnScreen(pos);

    if(nodes.length === 0) { return; }

    // pick the first one. If they want a different node they can zoom in
    let node = nodes[0];
    
    selectionInfo.nodeList.push(node);
    if(selectionInfo.nodeList.length === selectionInfo.hook.dependencyCount){
        selectionInfo.hook.execute();
        selectionInfo.nodeList = [];
    } else {

    }
}
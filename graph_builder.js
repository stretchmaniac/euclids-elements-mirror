// used for turning mouse events into graph chunks 

let SELECTION_HOOKS = {
    CIRCLE: {
        dependencyCount: 2,
        buttonID: 'circle_button',
        constructGraph: [
            {id: 3, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.CIRCLE, dependencies: [1, 2]}
        ],
        // returns the duplicate struct if it is a duplicate, otherwise false
        isDuplicate: (completedNodeList) => {
            // it is a duplicate iff the center is the same as some existing circle and has 
            // the same radius (+/- epsilon. Note that it is perfectly possible to make circles 
            // that are technically distinct but within epsilon of each other everywhere. In this case, 
            // we would still like to mark the circle as a duplicate since we cannot tell the circles apart, 
            // intersection tests will be unreliable, etc.)
            let centerNode = completedNodeList[0];
            let radius = centerNode.getCoords().distance(completedNodeList[1].getCoords());
            for(let struct of structs){
                if(struct.type === STRUCT_TYPE.CIRCLE && struct.centerNode === centerNode && Math.abs(struct.radius - radius) <= EPSILON){
                    return struct;
                }
            }
            return false;
        }
    }, 
    LINE: {
        dependencyCount: 2,
        buttonID: 'line_button',
        constructGraph: [
            {id:3, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.LINE, dependencies: [1, 2]}
        ],
        // returns the duplicate struct if it is a duplicate, otherwise false
        isDuplicate: (completedNodeList) => {
            // we say a line is indistinguishable from another line iff 
            // the endpoints of this line lie within epsilon of the the other line. 
            // This may not be the best way to do it, but it will work for now 
            let pos1 = completedNodeList[0].getCoords();
            let pos2 = completedNodeList[1].getCoords();
            for(let struct of structs){
                if(struct.type === STRUCT_TYPE.LINE){
                    let origin = struct.p1;
                    let dir = struct.p2.subtract(struct.p1).normalize();
                    let distPos1 = pos1.subtract(origin).cross2d(dir);
                    let distPos2 = pos2.subtract(origin).cross2d(dir);
                    if(Math.abs(distPos1) <= EPSILON && Math.abs(distPos2) <= EPSILON){
                        return struct;
                    }
                }
            }
            return false;
        }
    },
    // an equilateral triangle specified by two vertices (final vertex is to the left of the selected nodes)
    EQUILATERAL_TRIANGLE: {
        dependencyCount: 2,
        buttonID: 'equilateral_triangle_button',
        constructGraph: [
            // first two ids are for dependencies
            // unit of dependencies list is id, order matters
            {id: 3, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.CIRCLE, dependencies: [1, 2], hidden: true},
            {id: 4, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.CIRCLE, dependencies: [2, 1], hidden: true},
            {id: 5, type: CONSTRUCT_TYPE.NODE, dependencies: [3, 4], directedCenterToCenter: [1, 2]},
            {id: 6, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.LINE, dependencies: [1, 2]},
            {id: 7, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.LINE, dependencies: [1, 5]},
            {id: 8, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.LINE, dependencies: [2, 5]}
        ] // this constructGraph will be turned into a createConstructs function (taking a completedNodeList as args)
    },
    PERPENDICULAR_BISECTOR: {
        dependencyCount: 2,
        buttonID: 'perp_bisector_button',
        constructGraph: [
            {id: 3, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.CIRCLE, dependencies: [1, 2], hidden: true},
            {id: 4, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.CIRCLE, dependencies: [2, 1], hidden: true},
            {id: 5, type: CONSTRUCT_TYPE.NODE, dependencies: [3, 4], directedCenterToCenter: [1, 2], hidden: true},
            {id: 6, type: CONSTRUCT_TYPE.NODE, dependencies: [3, 4], directedCenterToCenter: [2, 1], hidden: true},
            {id: 7, type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.LINE, dependencies: [5, 6]}
        ]
    }
}
for(let hookID in SELECTION_HOOKS){
    let hook = SELECTION_HOOKS[hookID];

    // generate a createConstructs function from the constructGraph field 
    // for every selection hook.
    // A constructGraph is a list [item 1, item 2, ..., item n]
    // where each item is a new node or construct to add to the graph, possibly 
    // using previous lines as dependencies (referred to by id, with the first id numbers starting with 1
    // taken up by the dependencies of the whole object)
    // createConstructs should return an array [new nodes (list), new structs (list)]
    hook.createConstructs = function(completedNodeList){
        let idMap = {};
        for(let i = 0; i < completedNodeList.length; i++){
            idMap[i + 1] = completedNodeList[i];
        }

        let newNodes = [];
        let newStructs = [];

        for(let construct of hook.constructGraph){
            let createdConstruct = undefined;
            let dependencies = construct.dependencies.map(x => idMap[x]);

            if(construct.type === CONSTRUCT_TYPE.NODE){
                let dependencyInfo = {};
                if(construct.directedCenterToCenter){
                    // when the dependencies are both circles, we need an additional piece of 
                    // information (which intersection it is)
                    // this is provided by direcVec, which is an array of two ids that  
                    // correspond to the nodes giving the circles' centers (say [n1 id, n2 id]).
                    // Then we say that this node should lie on the left side of the vector going from 
                    // n1 to n2
                    let centers = construct.directedCenterToCenter.map(x => idMap[x].getCoords());
                    dependencyInfo.nearestTo = centers[0].add(centers[1].subtract(centers[0]).perpendicular());
                }
                let newNode = new Node(dependencies, dependencyInfo, undefined);
                // check if this node is a duplicate node 
                const dupNode = isNodeDuplicate(newNode);
                if(dupNode){
                    newNode = dupNode;
                    if(!construct.hidden){
                        newNode.hidden = false;
                    }
                } else {
                    if(construct.hidden){
                        newNode.hidden = true;
                    }
                    newNodes.push(newNode);
                }

                createdConstruct = newNode;
            } else if(construct.type === CONSTRUCT_TYPE.STRUCT){
                // two options, line or circle 
                let newStruct = undefined;
                if(construct.structType === STRUCT_TYPE.CIRCLE){
                    const dup = SELECTION_HOOKS.CIRCLE.isDuplicate(dependencies);
                    if(dup){
                        newStruct = dup;
                        if(!construct.hidden){
                            newStruct.hidden = false;
                        }
                    } else {
                        newStruct = new Circle(...dependencies);
                        if(construct.hidden){
                            newStruct.hidden = true;
                        }
                        newStructs.push(newStruct);
                    }
                } else if(construct.structType === STRUCT_TYPE.LINE){
                    const dup = SELECTION_HOOKS.LINE.isDuplicate(dependencies);
                    if(dup){
                        newStruct = dup;
                        if(!construct.hidden){
                            newStruct.hidden = false;
                        }
                    } else {
                        newStruct = new Line(...dependencies);
                        if(construct.hidden){
                            newStruct.hidden = true;
                        }
                        newStructs.push(newStruct);
                    }
                }

                createdConstruct = newStruct;
            }

            idMap[construct.id] = createdConstruct;
        }

        return [newNodes, newStructs];
    }

    hook.execute = function(nodeList){
        const [newNodes, newStructs] = hook.createConstructs(nodeList);
        for(let s of newStructs){
            structs.push(s);
        }
        for(let n of newNodes){
            graph.push(n);
        }
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
            const [newNodes, newStructs] = this.hook.createConstructs(ghostList);
            for(let n of newNodes){
                ghostList.push(newNodes);
            }
            extraStructs = newStructs;
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

    for(let node of document.getElementsByClassName('struct_button')){
        node.addEventListener('click', onStructButtonClicked);
    }
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
            selectionInfo.escape();
            drawGraph();
        }
    })
}

function isNodeDuplicate(node){
    for(const testNode of graph){
        if(node.getCoords().distance(testNode.getCoords()) < EPSILON){
            return testNode;
        }
    }
    return false;
}

function onStructButtonClicked(event){
    // change button styles
    for(let element of document.getElementsByClassName('struct_button')){
        element.style.border = 'none';
    }
    event.toElement.style.border = '1px solid black';
    for(let hook in SELECTION_HOOKS){
        if(SELECTION_HOOKS[hook].buttonID === event.toElement.id){
            selectionInfo.hook = SELECTION_HOOKS[hook];
        }
    }
}

function selection(pos){
    // see if we managed to click on a node 
    let nodes = getVisibleNodesOnScreen(pos);

    if(nodes.length === 0) { 
        selectionInfo.escape();
        
        // check for intersection points
        let intersection = getStructIntersection(pos);
        if(intersection){
            // add a node here if not a duplicate
            let newNode = new Node(intersection, { nearestTo: screenToGraph(pos) }, undefined);
            let dup = isNodeDuplicate(newNode);
            if(dup){
                dup.hidden = false;
            } else {
                graph.push(newNode);
            }
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
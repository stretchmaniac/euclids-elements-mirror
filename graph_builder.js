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
    // a very special non-object used to select a number of points and then calling a function when its done
    NODE_SELECTION:{
        dependencyCount: 0, // to be set later 
        constructGraph: [],
        callback: undefined, // to be set later, argument nodeList
        escapeCallback: undefined
    },
    // an equilateral triangle specified by two vertices (final vertex is to the left of the selected nodes)
    EQUILATERAL_TRIANGLE: {
        dependencyCount: 2,
        buttonID: 'equilateral_triangle_button',
        displayArticle: 'an',
        displayNoun: 'Equilateral Triangle', // i.e. one would say "an Equilateral Triangle"
        constructionInfoHTML: '<span>Select <b>one</b> node that together with the initial nodes form an equilateral triangle.</span>',
        unlockSelectCount: 3, // the number of nodes one needs to select to unlock this struct (i.e. for equilateral triangle the three vertices)
        verify: (selectedNodes) => { // determine whether the selected nodes truly make up an equilateral triangle
            const p1 = selectedNodes[0].getCoords();
            const p2 = selectedNodes[1].getCoords();
            const p3 = selectedNodes[2].getCoords();
            const basis1 = p2.subtract(p1).normalize();
            const basis2 = basis1.perpendicular();

            const middle = p1.add(basis1.scaleBy(.5));
            const possiblePos1 =  middle.add(basis2.scaleBy(Math.sqrt(3)/2));
            const possiblePos2 = middle.add(basis2.scaleBy(-Math.sqrt(3)/2));

            return p3.distance(possiblePos1) < EPSILON || p3.distance(possiblePos2) < EPSILON;
        }
    },
    PERPENDICULAR_BISECTOR: {
        dependencyCount: 2,
        buttonID: 'perp_bisector_button',
        displayNoun: 'Perpendicular Bisector',
        displayArticle: 'a',
        constructionInfoHTML: '<span>Select <b>two</b> nodes which lie on the perpendicular bisector of the initial nodes.</span>',
        unlockSelectCount: 4,
        cosmeticStructs: [
            // no id necessary, dependencies are indexed from last id (so this one is the last two created nodes/structs. 
            // in this case they better be nodes! (they are))
            {type: CONSTRUCT_TYPE.STRUCT, structType: STRUCT_TYPE.LINE, dependencies: [-2, -1] }
        ],
        verify: (selectedNodes) => {
            // check that the final 2 nodes do bisect the original nodes 
            let p1 = selectedNodes[0].getCoords();
            let p2 = selectedNodes[1].getCoords();
            let v1 = p2.subtract(p1);

            let p3 = selectedNodes[2].getCoords();
            let p4 = selectedNodes[3].getCoords();
            let v2 = p4.subtract(p3);

            // perpendicular...
            if(Math.abs(v1.dot(v2)) > EPSILON){
                return false;
            }
            // bisector
            let line1 = new Line();
            line1.p1 = p1;
            line1.p2 = p2;
            let line2 = new Line();
            line2.p1 = p3;
            line2.p2 = p4;
            let intersection = line1.intersect(line2);
            return intersection && Math.abs(p1.distance(intersection) - p2.distance(intersection)) < EPSILON;
        }
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

    hook.implementIfImprovement = function(selectedNodes){
        // it is assumed that selectedNodes has first two elements root1 and root2
        let newGraph = getConstructFromSubgraph(selectedNodes.slice(0, hook.dependencyCount), selectedNodes.slice(hook.dependencyCount));
        let numNodes = getNumNodesInConstructGraph(newGraph);

        if(hook.cosmeticStructs){
            let maxID = newGraph.reduce((x,y) => Math.max(x, y.id), 0);
            let currentID = maxID + 1;
            for(let cosmetic of hook.cosmeticStructs){
                cosmetic.id = currentID++;
                cosmetic.dependencies = cosmetic.dependencies.map(x => x + maxID + 1);
                newGraph.push(cosmetic);
            }
        }

        // cleanse newGraph of any node references 
        for(let item of newGraph){
            item.node = undefined;
            item.hidden = true;
        }
        // only the last [unlock selection count - dependency count] nodes should be un-hidden 
        for(let i = newGraph.length - (hook.unlockSelectCount - hook.dependencyCount); i < newGraph.length; i++){
            newGraph[i].hidden = false;
        }

        // replace if better than what we had
        if(!this.constructGraph || numNodes < getNumNodesInConstructGraph(this.constructGraph)){
            this.constructGraph = newGraph;
        }
    }
}

// special case for NODE_SELECTION execute function 
SELECTION_HOOKS.NODE_SELECTION.execute = function(nodeList){
    SELECTION_HOOKS.NODE_SELECTION.callback(nodeList);
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
        if(this.hook.escapeCallback){
            this.hook.escapeCallback();
        }
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
        // we want to be able to move test points around 
        let nodes = getVisibleNodesOnScreen(mousedownPos);
        if(nodes.length === 1 && testRoots.indexOf(nodes[0]) !== -1){
            let testNode = nodes[0];
            overrideDragEvent = function(offset) {
                const graphOffset = screenToGraph(mousedownPos.add(offset)).subtract(screenToGraph(mousedownPos));
                testNode.coordinates = testNode.coordinates.add(graphOffset);
                clearCoords();
            }
        } else {
            overrideDragEvent = undefined;
        }
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
    selectionInfo.escape();
    drawGraph();
    if(event.toElement.classList.contains('locked')){
        return;
    }
    // change button styles
    for(let element of document.getElementsByClassName('struct_button')){
        element.classList.remove('struct_button_selected');
    }
    event.toElement.classList.add('struct_button_selected');
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
        // check for intersection points
        let intersection = getStructIntersection(pos);
        if(intersection){
            // add a node here if not a duplicate
            let newNode = new Node(intersection, {}, undefined);
            let dup = isNodeDuplicate(newNode);
            if(dup){
                dup.hidden = false;
            } else {
                graph.push(newNode);
            }

            nodes.push(newNode);
        } else {
            drawGraph();
            return;
        }

        drawGraph();
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

function getConstructFromSubgraph(rootNodes, requiredLeaves){
    // base case, if requiredLeaves is a subset of rootNodes 
    let isSubset = requiredLeaves.length <= rootNodes.length;
    if(isSubset){
        for(let node of requiredLeaves){
            if(rootNodes.indexOf(node) === -1){
                isSubset = false;
            }
        }
    }

    // if truly a subset, then we're done, return empty construct graph 
    if(isSubset){
        return [];
    }

    // otherwise solve this recursively
    let newReqLeaves = new Set();
    for(let node of requiredLeaves){
        for(let dep of node.dependencies){
            newReqLeaves.add(dep);
        }
    }

    // inductive hyp. 
    let smallerConstructGraph = getConstructFromSubgraph(rootNodes, [...newReqLeaves]);
    // get largest id so far (and map requiredLeaves to ids)
    let largestID = 0;
    let idMap = new WeakMap();
    // add root nodes to idMap 
    let j = 1;
    for(let rNode of rootNodes){
        idMap.set(rNode, j);
        largestID = Math.max(largestID, j);
        j++;
    }
    for(let item of smallerConstructGraph){
        largestID = Math.max(largestID, item.id);
        idMap.set(item.node, item.id);
    }

    let newestID = largestID + 1;

    // add new elements for requiredLeaves 
    for(let leaf of requiredLeaves){
        // nodes do not have the 'type' attribute
        const id = newestID;
        newestID++;
        const row = {id: id};
        row.dependencies = leaf.dependencies.map(x => idMap.get(x));
        row.node = leaf;
        if(leaf.type){
            row.type = CONSTRUCT_TYPE.STRUCT;
            row.structType = leaf.type;
        } else {
            row.type = CONSTRUCT_TYPE.NODE;
        }

        smallerConstructGraph.push(row);
    }

    return smallerConstructGraph;
}

function getNumNodesInConstructGraph(constructGraph){
    // look for CONSTRUCT_TYPE.NODE 
    let count = 0;
    for(let item of constructGraph){
        if(item.type === CONSTRUCT_TYPE.NODE){
            count++;
        }
    }
    return count;
}
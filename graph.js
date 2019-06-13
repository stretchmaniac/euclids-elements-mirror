
const root1 = { coordinates: new Point(0, 0) };
const root2 = { coordinates: new Point(1, 0) };
// the graph consists of all of the points on the screen. The only 
// way to create a node in the graph is via the intersection of two structs
const graph = [root1, root2];

// structs are lines and circles (see geo.js) that are determined by nodes in the graph
const structs = [];

// adds the intersection point between struct1 and struct2 to the graph
function addNode(struct1, struct2, dependencyInfo){
    const newNode = {
        dependencies: [struct1, struct2],
        dependencyInfo : dependencyInfo
    };

    graph.push(newNode);
}

function getCoords(node){
    // i.e. if the property "coordinates" exists in node
    if(node.coordinates){
        // this node is a root or has already cached its coordinates
        return node.coordinates;
    }

    // this node is not a root or we haven't found its coordinates yet, so 
    // recursively find coordinates
    struct1.setCoords();
    struct2.setCoords();
    
    node.coordinates = struct1.intersect(struct2, node.dependencyInfo);
}
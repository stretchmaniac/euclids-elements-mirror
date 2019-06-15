
const root1 = new Node([], {}, new Point(0, 0));
const root2 = new Node([], {}, new Point(1, 0));
// the graph consists of all of the points on the screen. The only 
// way to create a node in the graph is via the intersection of two structs
const graph = [root1, root2];

// structs are lines and circles (see geo.js) that are determined by nodes in the graph
const structs = [];

function Node(dependencies, dependencyInfo, coordinates){
    this.dependencies = dependencies;
    this.dependencyInfo = dependencyInfo;
    this.coordinates = coordinates;

    this.getCoords = () => {
        // i.e. if the property "coordinates" exists in node
        if(this.coordinates){
            // this node is a root or has already cached its coordinates
            return this.coordinates;
        }

        // this node is not a root or we haven't found its coordinates yet, so 
        // recursively find coordinates
        let [struct1, struct2] = dependencies;
        struct1.setCoords();
        struct2.setCoords();
        
        this.coordinates = struct1.intersect(struct2, this.dependencyInfo);
        return this.coordinates;
    }
}

// adds the intersection point between struct1 and struct2 to the graph
function addNode(struct1, struct2, dependencyInfo){

    const newNode = new Node([struct1, struct2], dependencyInfo, undefined);
    graph.push(newNode);

    return newNode;
}
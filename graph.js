
const root1 = new Node([], {}, new Point(0, 0));
const root2 = new Node([], {}, new Point(1, 0));
// the idea of the test roots is to provide independent roots for higher structures.
// For example, if we want to make a sub-graph that represents the projection of a point
// onto a line, we need three independent nodes -- two for the line and one for the other point. 
// These points are only used to "unlock" such larger graph structures.
const testRoots = [
    new Node([], {}, new Point(-.3, .647))
];
for(let t of testRoots){
    t.testNode = true;
}

root1.root = true;
root2.root = true;
// the graph consists of all of the points on the screen. The only 
// way to create a node in the graph is via the intersection of two structs (or the test structs)
const graph = [root1, root2].concat(testRoots);

// structs are lines and circles (see geo.js) that are determined by nodes in the graph
const structs = [];

function clearCoords(){
    for(let node of graph){
        if(node != root1 && node != root2 && testRoots.indexOf(node) === -1){
            node.coordinates = undefined;
        }
    }
    for(let struct of structs){
        struct.resetCoords();
    }
}

// listen up folks-- the order of dependencies matters most of the time, but it's a little complicated. Here's how it works:
//  - A node with two lines as dependencies is always unambiguous. The dependency order does not matter.
//  - A node with two circles as dependencies depends on the order of the dependency list most of the time. Let dependencies = [circle1, circle2]
//     - If circle1 and circle2 already have a node at the opposition intersection pt *that does not have both circle1 and circle2 as a dependencies* then 
//       the order does not matter. This node will occupy the opposite position.
//     - If circle1 and circle2 do not intersect at a node, or the intersection node has circle1 and circle2 as dependencies, then node is placed 
//       at the intersection point to the left of line from the center of circle1 directed toward the center of center2
//  - A node with a circle and a line as dependencies (say C and L) depends on the order of the dependency list most of the time in the same way as a circle-circle 
//    intersection does. As before, if there is already an intersection point which is not expressly dependent on C and L, then the node 
//    takes up the unused intersection slot. Otherwise, if the order of dependencies is [C, L], then the node is placed to the left of the line 
//    starting at the center of C and pointing perpendicular (and toward) L
function Node(dependencies, dependencyInfo, coordinates){
    this.dependencies = dependencies;
    this.dependencyInfo = dependencyInfo;
    this.coordinates = coordinates;
    this.hidden = false;

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
        
        this.coordinates = struct1.intersect(struct2);
        return this.coordinates;
    }
}
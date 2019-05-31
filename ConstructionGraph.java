
import java.util.*;

// one possibility: 

// we can represent an arbitrary compass/straightedge construction as a graph, with 
// each node in the graph representing a constructed point. Each constructed point has 
// dependencies, i.e. the older points required to construct the newer one. For example, 
// a point can have the following possible dependencies:
//   - the intersection of two lines. The point has four dependency points, the generators for the 
//     two lines
//   - the intersection of a line and a circle. Again, four dependencies: 2 for the line, 2 for the circle
//     (center + point on outside). Note we need to specify which intersection point is it: there might be two
//   - the intersection of 2 circles. 4 dependencies once again

// then macros can be represented as functions which take as arguments points in the graph and 
// return chunks of graph that depend on the arguments
class ConstructionGraph {
    List<ConstructionGraphNode> constructedPoints;
}
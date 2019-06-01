
import java.util.*;

class ConstructionGraphNode {
    List<ConstructionGraphNode> dependents = new ArrayList<>();
    List<ConstructionGraphNode> dependencies;
    public enum DependencyType {
        // point was formed by intersection of two lines
        LINE_LINE,
        // ... of a line and a circle
        LINE_CIRCLE,
        // ... of two circles
        CIRCLE_CIRCLE,
        // ... or was one of the two initial points
        ROOT
    };
    DependencyType dependencyType;
    // unfortunately, this does not (yet) completely define the node, since 
    // line-circle and circle-circle intersections have two solutions. We need 
    // another bit of information to tell us which solution it is.  
    // Let c be the center of the circle (there's always a circle involved, defined by 
    // the first node in dependencies) and e be the edge of that circle. If the 
    // intersection x has (x - c) lying to the right of (e - c), then we say 
    // that solutionClockwise = true, otherwise solutionClockwise = false. When 
    // (x + e) / 2 = c, we say that solutionClockwise = false by convention.
    boolean solutionClockwise = false;

    // note that this is generated on the fly -- one should never set the position of 
    // anything other than root nodes
    private Point position;

    // why private, you ask? 
    // until I (or you) come up with a better idea, I was planning on having the ordering 
    // of dependencies be important, i.e. for a line-line intersection the ordering would be 
    // [line1 point1, line1 point2, line2 point1, line2 point2] etc. That way the dependency type + 
    // the dependencies is enough to completely determine the position of the node. Since 
    // I would probably forget the correct ordering fow the line-circle intersection (for example),
    // I'm hiding the general constructor. See the below static constructors.
    private ConstructionGraphNode(DependencyType type, List<ConstructionGraphNode> dependencies){
        this.dependencyType = type;
        this.dependencies = dependencies;
    }

    // creates a root node
    public static ConstructionGraphNode root(){
        return new ConstructionGraphNode(DependencyType.ROOT, new ArrayList<>());
    }

    public static ConstructionGraphNode fromTwoLines(ConstructionGraphNode linePt1, ConstructionGraphNode linePt2, 
        ConstructionGraphNode linePt3, ConstructionGraphNode linePt4){
        
        ConstructionGraphNode newNode = new ConstructionGraphNode(
            DependencyType.LINE_LINE, 
            new ArrayList<>(List.of(linePt1, linePt2, linePt3, linePt4))
        );

        linePt1.dependents.add(newNode);
        linePt2.dependents.add(newNode);
        linePt3.dependents.add(newNode);
        linePt4.dependents.add(newNode);

        return newNode;
    }

    public static ConstructionGraphNode fromLineAndCircle(ConstructionGraphNode linePt1, ConstructionGraphNode linePt2, 
        ConstructionGraphNode circleCenter, ConstructionGraphNode circleEdge, boolean solutionClockwise){
        
        ConstructionGraphNode newNode = new ConstructionGraphNode(
            DependencyType.LINE_CIRCLE,
            new ArrayList<>(List.of(linePt1, linePt2, circleCenter, circleEdge))
        );
        newNode.solutionClockwise = solutionClockwise;

        linePt1.dependents.add(newNode);
        linePt2.dependents.add(newNode);
        circleCenter.dependents.add(newNode);
        circleEdge.dependents.add(newNode);

        return newNode;
    }

    public static ConstructionGraphNode fromTwoCircles(ConstructionGraphNode circle1Center, ConstructionGraphNode circle1Edge,
        ConstructionGraphNode circle2Center, ConstructionGraphNode circle2Edge, boolean solutionClockwise){
        
        ConstructionGraphNode newNode = new ConstructionGraphNode(
            DependencyType.CIRCLE_CIRCLE,
            new ArrayList<>(List.of(circle1Center, circle1Edge, circle2Center, circle2Edge))
        );
        newNode.solutionClockwise = solutionClockwise;

        circle1Center.dependents.add(newNode);
        circle1Edge.dependents.add(newNode);
        circle2Center.dependents.add(newNode);
        circle2Edge.dependents.add(newNode);

        return newNode;
    }

    // will throw error if not a root node
    public void setPosition(Point pos){
        if(dependencyType != DependencyType.ROOT){
            throw new Exception("Can only set position of root nodes!");
        }

        position = pos;
    }

    public Point getPosition(boolean regenerate){
        if(position == null && dependencyType == DependencyType.ROOT){
            throw new Exception("You must set the positions of the root nodes in order to get the position of the other nodes!");
        }
        if(position != null && (regenerate == false || dependencyType == DependencyType.ROOT)){
            return position;
        }
        // regenerate from dependencies
        Point d1 = dependencies.get(0).getPosition(regenerate);
        Point d2 = dependencies.get(1).getPosition(regenerate);
        Point d3 = dependencies.get(2).getPosition(regenerate);
        Point d4 = dependencies.get(3).getPosition(regenerate);

        if(dependencyType == DependencyType.LINE_LINE){
            // line line intersection 
        }

    }
}
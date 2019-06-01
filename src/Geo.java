import java.lang.Math;
// utility class
class Geo{
    public static final double EPSILON = 0.0000001;

    public static Point lineLineIntersection(Point lineP1, Point lineP2, Point lineP3, Point lineP4){
        // my goal is to make this a short as possible
        if(Math.abs(lineP2.minus(lineP1).cross2d(lineP4.minus(lineP3))) < EPSILON){
            // lines are parallel
            return null;
        }

        Point normal = lineP2.minus(lineP1).perp().normalize();
        double t = normal.dot(lineP4.minus(lineP3));
        return lineP3.plus(lineP4.minus(lineP3).scaleBy(1/lineP3.minus(lineP1).dot(normal)));
    }

    public static Point lineCircleIntersection(Point circleCenter, Point circleEdge, Point lineP1, Point lineP2, boolean solutionClockwise){
        Point toCenter = circleCenter.minus(lineP1);
        Point to2 = lineP2.minus(lineP1);
        double radius = circleEdge.minus(circleCenter).mag();
        double r = toCenter.minus(toCenter.projectOnto(to2)).mag();

        if(r > radius){
            return null;
        }

        double d = Math.sqrt(Math.pow(toCenter.mag(), 2) - r*r) - Math.sqrt(radius*radius - r*r);
        Point dir = lineP2.minus(lineP1);
        Point firstSol = lineP1.plus(dir.scaleBy(d/dir.mag()));
        Point secondSol = lineP1.plus(dir.scaleBy((d + 2*Math.sqrt(radius*radius - r*r))/dir.mag()));

        Point rad = circleEdge.minus(circleCenter);
        if(rad.cross2d(firstSol) >= 0 && solutionClockwise == false){
            return firstSol;
        }
        return secondSol;
    }

    public static Point circleCircleIntersection(Point circle1Center, Point circle1Edge, Point circle2Center, Point circle2Edge, boolean solutionClockwise){
        double circle1Radius = circle1Edge.minus(circle1Center).mag();
        double circle2Radius = circle2Edge.minus(circle2Center).mag();

        double d = circle2Center.minus(circle1Center).mag();
        if(d > circle1Radius + circle2Radius || d + circle1Radius < circle2Radius || d + circle2Radius < circle1Radius || d < EPSILON){
            // silently ignoring degenerate case where they are the same circle
            return null;
        }
        
        double x = (d*d + circle1Radius * circle1Radius - circle2Radius * circle2Radius) / (2 * d);
        double h = Math.sqrt(circle1Radius*circle1Radius - x*x);

        Point dir = circle2Center.minus(circle1Center).normalize();
        Point sol1 = circle1Center.plus(dir.scaleBy(x)).plus(dir.perp().scaleBy(h));
        Point sol2 = sol1.plus(dir.perp().scaleBy(-2*h));

        Point rad = circle1Edge.minus(circle1Center);
        if(rad.cross2d(sol1) >= 0 && solutionClockwise == false){
            return sol1;
        }
        return sol2;
    }
}
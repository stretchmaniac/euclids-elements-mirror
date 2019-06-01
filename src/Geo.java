import java.lang.Math;
// utility class
class Geo{
    public static final double EPSILON = 0.0000001;

    public static Point LineLineIntersection(Point lineP1, Point lineP2, Point lineP3, Point lineP4){
        // my goal is to make this a short as possible
        if(Math.abs(lineP2.minus(lineP1).cross2d(lineP4.minus(lineP3))) < EPSILON){
            // lines are parallel
            System.out.println("You forgot to check whether your lines were parallel!");
            return null;
        }
        
        Point normal = lineP2.minus(lineP1).perp().normalize();
        double t = normal.dot(lineP4.minus(lineP3));
        return lineP3.plus(lineP4.minus(lineP3).scaleBy(1/lineP3.minus(lineP1).dot(normal)));
    }
}
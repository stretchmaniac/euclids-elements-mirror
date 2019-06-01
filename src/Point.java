
import java.lang.Math;

class Point {

    // never have to worry about immutable types changing up on you
    public final double x, y;
    
    public Point(double x, double y){
        this.x = x;
        this.y = y;
    }

    public double mag(){
        return Math.sqrt(x*x + y*y);
    }

    public Point plus(Point other){
        return new Point(x + other.x, y + other.y);
    }

    public Point minus(Point other){
        return new Point(x - other.x, y - other.y);
    }

    public double dot(Point other){
        return x * other.x + y * other.y;
    }

    public Point scaleBy(double a){
        return new Point(x*a, y*a);
    }

    public Point normalize(){
        if(Math.abs(this.mag()) < Geo.EPSILON){
            throw new Exception("You forgot to check if your vector was non-zero");
        }
        return this.scaleBy(1.0 / this.mag());
    }

    // perpendicular vector
    public Point perp(){
        return new Point(-y, x);
    }

    public double cross2d(Point other){
        return this.x * other.y - this.y * other.x;
    }
}
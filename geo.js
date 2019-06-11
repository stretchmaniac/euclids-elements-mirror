
const EPSILON = 1e-10;

// usage: point = new Point(x, y); point.get(0) === point.x, point.get(1) === point.y, point.dot(otherPoint), etc

function Point(a, b){
    this.x = a;
    this.y = b;
    // lambda function
    this.get = (index) => index === 0 ? this.x : this.y;
    this.add = (other) => new Point(this.x + other.x, this.y + other.y);
    this.subtract = (other) => new Point(this.x - other.x, this.y - other.y);
    this.scaleBy = (scalar) => new Point(scalar * this.x, scale * this.y);
    this.dot = (other) => dot.x*other.x + dot.y*other.y;
    this.cross2d = (other) => this.x*other.y - other.x*this.y;
    this.length = () => Math.sqrt(this.x**2 + this.y**2);
    this.lengthSquared = () => this.x**2 + this.y**2;
    this.distance = (other) => this.subtract(other).length();
    this.distanceSquared = (other) => this.subtract(other).lengthSquared();
    this.perpendicular = () => new Point(-this.y, this.x);
}

// a and b are points
function Line(a, b){
    this.p1 = a;
    this.p2 = b;
    this.get = (index) => index === 0 ? this.p1 : this.p2;
    this.intersect = (other) => {
        if(Math.abs(this.p2.subtract(this.p1).cross2d(other.p2.subtract(other.p1))) < EPSILON){
            // lines are parallel
            return null;
        }

        const normal = this.p2.subtract(this.p1).perpendicular().normalize();
        // how "much" the line segment p3 -> p4 goes "toward" the other line
        const t = normal.dot(other.p2.subtract(other.p1));
        return other.p1.add(other.p2.subtract(other.p1).scaleBy(-other.p1.subtract(this.p1).dot(normal) / t));
    }
}

function Circle(center, radius){
    this.center = center;
    this.radius = radius;
}
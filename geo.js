
const EPSILON = 1e-10;

// example usage for Point:
// let pt = new Point(1, 1);
// let pt2 = new Point(2, 1);
// let d = pt.dot(pt2)   ( == 3 )
// let pt3 = pt2.scaleBy(4)    ( == new Point(8, 2) )
// etc...

function Point(a, b){
    this.x = a;
    this.y = b;
    // lambda function
    this.get = (index) => index === 0 ? this.x : this.y;
    this.add = (other) => new Point(this.x + other.x, this.y + other.y);
    this.subtract = (other) => new Point(this.x - other.x, this.y - other.y);
    this.scaleBy = (scalar) => new Point(scalar * this.x, scalar * this.y);
    this.dot = (other) => dot.x*other.x + dot.y*other.y;
    this.cross2d = (other) => this.x*other.y - other.x*this.y;
    this.length = () => Math.sqrt(this.x**2 + this.y**2);
    this.lengthSquared = () => this.x**2 + this.y**2;
    this.distance = (other) => this.subtract(other).length();
    this.distanceSquared = (other) => this.subtract(other).lengthSquared();
    this.perpendicular = () => new Point(-this.y, this.x);
    this.normalize = () => this.scaleBy(1 / this.length());
    this.projectOnto = (other) => other.scaleBy(this.dot(other)/other.lengthSquared());
}

// works like an enum
const STRUCT_TYPE = {
    LINE: 0,
    CIRCLE: 1
}

// a and b are graph nodes
function Line(node1, node2){
    this.node1 = node1;
    this.node2 = node2;
    this.p1 = undefined;
    this.p2 = undefined;
    this.type = STRUCT_TYPE.LINE;
    this.get = (index) => index === 0 ? this.p1 : this.p2;
    this.intersect = (otherStruct, dependencyInfo) => {
        if(otherStruct.type === STRUCT_TYPE.LINE){
            // line line intersection
            let a = this.p1, b = this.p2, c = otherStruct.p1, d = otherStruct.p2;
            let line1Dir = b.subtract(a);
            let line2Dir = d.subtract(c);
            let normal = line1Dir.perpendicular().normalize();
            if(line2Dir.dot(normal) == 0){
                console.log("Attempt to intersect parallel lines");
                return null;
            }

            let speed = line2Dir.dot(normal);
            let distance = a.subtract(c).dot(normal);
            return c.add(line2Dir.scaleBy(distance / speed));
        }else if(otherStruct.type === STRUCT_TYPE.CIRCLE){
            // line circle intersection
            let center = otherStruct.center;
            let R = otherStruct.radius;
            let lineDir = this.p2.subtract(this.p1).normalize();
            let toCenter = center.subtract(p1);
            let r = Math.abs(lineDir.cross2d(toCenter));
            if(r > R){
                console.log("Attempt to intersect line and circle where intersection does not exist");
                return null;
            }

            let nearestPt = this.p1.add(toCenter.projectOnto(lineDir));
            let a = Math.sqrt(R**2 - r**2);
            let sol1 = nearestPt.add(lineDir.scaleBy(a));
            let sol2 = nearestPt.add(lineDir.scaleBy(-1*a));
            
            let testPt = dependencyInfo.nearestTo;
            let d1 = sol1.distanceSquared(testPt), d2 = sol2.distanceSquared(testPt);
            if(d1 < d2){
                return sol1; 
            }
            return sol2;

        }else{
            console.log("The given struct is not recognized");
            return undefined;
        }
    };
    this.setCoords = () => {
        this.p1 = getCoords(this.node1);
        this.p2 = getCoords(this.node2);
    }
}

// center is a Point
function Circle(centerNode, radialNode){
    this.center = undefined;
    this.radius = undefined;
    this.radiusPt = undefined;
    this.centerNode = centerNode;
    this.radialNode = radialNode;
    this.type = STRUCT_TYPE.CIRCLE;
    this.intersect = (otherStruct, dependencyInfo) => {
        if(otherStruct.type === STRUCT_TYPE.LINE){
            return otherStruct.intersect(this, dependencyInfo);
        }else if(otherStruct.type === STRUCT_TYPE.CIRCLE){
            // circle circle intersection
            let otherCenter = otherStruct.center;
            let otherRadius = otherStruct.radius;
            let d = this.center.distance(otherCenter);
            if(d > this.radius + otherRadius || d + this.radius < otherRadius || d + otherRadius < this.radius){
                console.log("Attempt to intersect non-intersecting circles");
                return null;
            }

            // ignoring case where the two structs are actually the same circle. Please don't do that.

            let x = (d*d + this.radius**2 - otherRadius**2) / (2 * d);
            let h = Math.sqrt(this.radius**2 - x**2);
            let basis1 = otherCenter.subtract(this.center).normalize();
            let basis2 = basis1.perpendicular(); // also normalized
            let sol1 = basis1.scaleBy(x).add(basis2.scaleBy(h));
            let sol2 = basis1.scaleBy(x).add(basis2.scaleBy(-h));

            let testPt = dependencyInfo.nearestTo;
            let d1 = sol1.distanceSquared(testPt), d2 = sol2.distanceSquared(testPt);
            if(d1 < d2){
                return sol1;
            }
            return sol2;
        }
    }
    this.setCoords = () => {
        this.center = this.centerNode.getCoords();
        this.radiusPt = this.radialNode.getCoords();
        this.radius = this.center.distance(this.radiusPt);
    }
}

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
    this.scaleBy = (scalar) => new Point(scalar * this.x, scale * this.y);
    this.dot = (other) => dot.x*other.x + dot.y*other.y;
    this.cross2d = (other) => this.x*other.y - other.x*this.y;
    this.length = () => Math.sqrt(this.x**2 + this.y**2);
    this.lengthSquared = () => this.x**2 + this.y**2;
    this.distance = (other) => this.subtract(other).length();
    this.distanceSquared = (other) => this.subtract(other).lengthSquared();
    this.perpendicular = () => new Point(-this.y, this.x);
}

// works like an enum
const STRUCT_TYPE = {
    LINE: 0,
    CIRCLE: 1
}

// a and b are graph nodes
function Line(a, b){
    this.node1 = a;
    this.node2 = b;
    this.p1 = undefined;
    this.p2 = undefined;
    this.type = STRUCT_TYPE.LINE;
    this.get = (index) => index === 0 ? this.p1 : this.p2;
    this.intersect = (otherStruct, dependencyInfo) => {
        if(otherStruct.type === STRUCT_TYPE.LINE){
            // line line intersection
            // ...
        }else if(otherStruct.type === STRUCT_TYPE.CIRCLE){
            // line circle intersection
            // ... 
        }else{
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
    this.intersection = (otherStruct, dependencyInfo) => {
        if(otherStruct.type === STRUCT_TYPE.LINE){
            return otherStruct.intersect(this, dependencyInfo);
        }else if(otherStruct.type === STRUCT_TYPE.CIRCLE){
            // circle circle intersection
            // ... 
        }
    }
    this.setCoords = () => {
        this.center = getCoords(this.centerNode);
        this.radiusPt = getCoords(this.radialNode);
        this.radius = this.center.distance(this.radialPt);
    }
}
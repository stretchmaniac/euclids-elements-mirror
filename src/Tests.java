class Tests{
    public static void main(String[] args){
        intersectionTests();
    }

    static void intersectionTests(){
        // test line-line intersection 
        Point p1 = new Point(0, 0),
            p2 = new Point(2, 0),
            p3 = new Point(1, 1),
            p4 = new Point(1, 0);

        System.out.println("line line intersection tests -----------");
        Point intersection = Geo.lineLineIntersection(p1, p2, p3, p4);
        System.out.println("expected: (1, 0), got " + intersection);

        Point intersection2 = Geo.lineLineIntersection(p1, p3, p2, p4);
        System.out.println("expected: (0, 0), got " + intersection2);

        Point intersection3 = Geo.lineLineIntersection(p3, p2, p1, p4);
        System.out.println("expected: (2, 0), got " + intersection3);

        Point intersection4 = Geo.lineLineIntersection(
            new Point(-3.2, 0), 
            new Point(-4.8, 4), 
            new Point(0, 2), 
            new Point(1.2, 5.6)
        );
        System.out.println("expected: (-1.818, -3.455), got: " + intersection4);

        // line circle intersections
        System.out.println("circle line intersection tests ----------");
        Point intersection5 = Geo.lineCircleIntersection(p1, p4, new Point(-2, 1), new Point(-1,1), true);
        System.out.println("expected: (0, 1), got " + intersection5);
        Point intersection6 = Geo.lineCircleIntersection(p1, p4, new Point(-2, 1), new Point(-1,1.000001), true);
        System.out.println("expected: null, got " + intersection6);
        Point intersection7 = Geo.lineCircleIntersection(p1, p4, new Point(-2, 1), new Point(-1,.5), true);
        System.out.println("expected: (.894, -.447), got " + intersection7);
        Point intersection8 = Geo.lineCircleIntersection(p1, p4, new Point(-2, 1), new Point(-1,.5), false);
        System.out.println("expected: (-.894, .447), got " + intersection8);
        Point intersection9 = Geo.lineCircleIntersection(p1, p4, p1, p4, true);
        System.out.println("expected: (1, 0), got " + intersection9);
        Point intersection10 = Geo.lineCircleIntersection(p1, p4, p1, p4, false);
        System.out.println("expected: (-1, 0), got " + intersection10);
        Point intersection11 = Geo.lineCircleIntersection(new Point(2,1), new Point(1,0), new Point(0,3), new Point(6,0), true);
        System.out.println("expected: (1.42, 2.29), got " + intersection11);

        // circle circle intersections
        System.out.println("circle circle intersection tests ----------");
        // exterior tangents
        Point intersection12 = Geo.circleCircleIntersection(p1, p4, p2, p4, true);
        Point intersection13 = Geo.circleCircleIntersection(p1, p4, p2, p4, false);
        System.out.println("expected: (1, 0), got " + intersection12);
        System.out.println("expected: (1, 0), got " + intersection13);
        // interior tangents
        Point intersection14 = Geo.circleCircleIntersection(p1, p4, new Point(.75, 0), new Point(.75, .25), true);
        Point intersection15 = Geo.circleCircleIntersection(p1, p4, new Point(.75, 0), new Point(.75, .25), false);
        System.out.println("expected: (1, 0), got " + intersection14);
        System.out.println("expected: (1, 0), got " + intersection15);
        Point intersection16 = Geo.circleCircleIntersection(p1, p4, new Point(.75, 0), new Point(.75, .2499999), false);
        System.out.println("expected: null, got " + intersection16);
        Point intersection17 = Geo.circleCircleIntersection(new Point(2,1), new Point(3,2), new Point(3.5,2), new Point(3.5,2-Math.sqrt(3)), true);
        Point intersection18 = Geo.circleCircleIntersection(new Point(2,1), new Point(3,2), new Point(3.5,2), new Point(3.5,2-Math.sqrt(3)), false);
        System.out.println("expected: (3.223, .29), got " + intersection17);
        System.out.println("expected: (1.815, 2.4021), got " + intersection18);
    }
}
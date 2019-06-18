function init(){
    // we start with two points (root1 and root2)

    // make a circle centered at (0, 0) with radius 1 
    const circle1 = new Circle(root1, root2);
    structs.push(circle1);
    // make a circle centered at (1, 0) with radius 1 
    const circle2 = new Circle(root2, root1);
    structs.push(circle2);

    // now add the two intersection points between the circles
    const lowerNode = addNode(circle1, circle2, { nearestTo: new Point(0.5, -1) }); // the lower intersection 
    const upperNode = addNode(circle1, circle2, { nearestTo: new Point(0.5, 1) });  // the higher intersection

    // add a line between the nodes we just created
    const newLine = new Line(lowerNode, upperNode); 
    structs.push(newLine);

    // marvel at our creation 
    // (lets check the coordinates to see if we got them right)
    console.log(lowerNode.getCoords(), upperNode.getCoords());

    drawGraph();
}
"use strict";

var canvas;
var gl;

// Arrays for vertex and color data; will be fed to vertex and color buffers 
var positionArraySolid = [], positionArrayWireframe = [];
var colorArraySolid = [], colorArrayWireframe = [];

var modelPositionArray = [], modelColorArray = [];

var iBufferSolid, iBufferWireframe, iBufferAxes;

// Projection parameters
var near = 0.4;
var far = 16.0;
var fovy = 45.0;
var aspect = 1.0;

//Define the view parameters
var eyeX = 3, eyeY = 2, eyeZ = 6;
var eye = vec3(eyeX, eyeZ, eyeZ);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var modelStyle = 'solid';
var currentIndices;

// Vetex array
var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
    vec4(0, 0, 0, 1.0),  //8
    vec4(2.0, 0, 0, 1.0),
    vec4(0, 2.0, 0, 1.0),
    vec4(0, 0, 2.0, 1.0), //11
    vec4(-0.5, -0.5, 0.5, 1.0), //12
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),

];

var axesIndices = [
    8, 9, 8, 10, 8, 11
];

// Color array
var vertexColors = [
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(0.0, 1.0, 1.0, 1.0),  // purple
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(0.0, 0.0, 0.0, 1.0),  // axes
    vec4(0.0, 0.0, 0.0, 1.0),  // axes
    vec4(0.0, 0.0, 0.0, 1.0),  // axes
    vec4(0.0, 0.0, 0.0, 1.0),  // axes
    vec4(0.8, 0.8, 0.8, 1.0),  // wireframe
    vec4(0.8, 0.8, 0.8, 1.0),  // wireframe
    vec4(0.8, 0.8, 0.8, 1.0),  // wireframe
    vec4(0.8, 0.8, 0.8, 1.0),  // wireframe
    vec4(0.8, 0.8, 0.8, 1.0),  // wireframe
    vec4(0.8, 0.8, 0.8, 1.0),  // wireframe
    vec4(0.8, 0.8, 0.8, 1.0),  // wireframe
    vec4(0.8, 0.8, 0.8, 1.0),  // wireframe

];

// indices of the 12 triangles that compise the cube
var indices = [
    0, 3, 1, 3, 2, 1,// font face 
    3, 7, 2, 7, 6, 2, // right face
    0, 4, 3, 4, 7, 3, // bottom face 
    5, 1, 6, 1, 2, 6, // top face
    5, 6, 4, 6, 7, 4,  // back face
    4, 0, 5, 0, 1, 5, // left face
]

// indices of 12 edges
var edgeIndices = [
    12, 13, 12, 15, 12, 16,
    13, 17, 13, 14, 14, 15,
    14, 18, 15, 19, 16, 17,
    16, 19, 17, 18, 18, 19,
]

// indices of 12 edges
var edgeIndicesStrip = [
    0, 1, 2, 3, 255,
    4, 5, 6, 7, 255,
    0, 4, 255,
    3, 7, 255,
]

// indices of the 12 triangles that compise the cube
var indicesStrip = [ // TRIANGLE_STRIP
    0, 3, 1, 2, 255,// font face 
    3, 7, 2, 6, 255, // right face
    0, 4, 3, 7, 255, // bottom face 
    5, 1, 6, 2, 255, // top face
    5, 6, 4, 7, 255,  // back face
    4, 0, 5, 1, 255, // left face
]

// indices of the 12 triangles that compise the cube
var indicesFan = [ // TRIANGLE_FAN
    0, 3, 2, 1, 255,// font face 
    3, 7, 6, 2, 255, // right face
    0, 4, 7, 3, 255, // bottom face 
    5, 1, 2, 6, 255, // top face
    5, 6, 7, 4, 255,  // back face
    4, 0, 1, 5, 255, // left face
]

var colorLoc, program;
var modelViewMatrix;

window.onload = function init() {

    addNavigationControl();

    canvas = document.getElementById("gl-canvas");
    canvas.width = 400;  // Or any other desired width
    canvas.height = 400; // Or any other desired height


    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    iBufferSolid = gl.createBuffer();

    iBufferWireframe = gl.createBuffer();

    iBufferAxes = gl.createBuffer();


    // Create a buffer object for vertex buffer, bind it to the array buffer, and load data
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Get the pointer to the vertex variable in the shader and link 
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Create a buffer object for vertex buffer, bind it to the array buffer, and load data
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

    colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    var projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    modelViewMatrix = lookAt(eye, at, up);
    var projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    render();
}

// Function to set up responses to key and button events for navigation control 
function addNavigationControl() {

    document.addEventListener('keydown', function (event) {

        event.preventDefault(); //disable arrow keys to scroll the webpage/buttons

        if (event.ctrlKey) { //Ctrl + left/right keys to turn the view point
            switch (event.key) {
                case 'ArrowLeft':
                    turnRight(-3); // turn left
                    break;
                case 'ArrowRight':
                    turnRight(3); // turn right
                    break;
            }
        } else if (event.altKey) { // Alt + left/right keys  to orbit around  the center left and right
            switch (event.key) {
                case 'ArrowLeft':
                    orbitRight(-3); // orbit the view to right
                    break;
                case 'ArrowRight':
                    orbitRight(3); // orbit the view to left
                    break;
            }

            //Complete the following statement 
        } else if (event.shiftKey) { // Shift+ up/down keys to move the viewpoint up and down

            switch (event.key) {
                case 'ArrowUp':
                    moveUp(0.1); // Move up
                    break;
                case 'ArrowDown':
                    moveUp(-0.1); // Move down
                    break;
            }
        } else {
            switch (event.key) { // Left/right/up/down to move the viewpoing left/right/forward/backward
                case 'ArrowUp':
                    moveForward(0.1); // Move forward
                    break;
                case 'ArrowDown':

                    //Complete the following statement 
                    moveForward(-0.1); // Move backward
                    
                    break;
                case 'ArrowLeft':
                    moveRight(-0.1); // Move left
                    break;
                case 'ArrowRight':
                    moveRight(0.1); // Move right
                    break;
            }
        }
    });

    // L button to move the viewpoint to the left
    document.getElementById('leftbutton').addEventListener('click', function () {
        moveRight(-0.1);
    });

    // R button to move the viewpoint to the right 
    document.getElementById('rightbutton').addEventListener('click', function () {
        moveRight(0.1);
    });

    // U button to move up the viewpoint 
    document.getElementById('upbutton').addEventListener('click', function () {
        moveUp(0.1);
    });

    // D button to move down the viewpoint 
    document.getElementById('downbutton').addEventListener('click', function () {
        moveUp(-0.1);
    });

    // Button to move forward 
    document.getElementById('forwardbutton').addEventListener('click', function () {
        moveForward(0.5);
    });

    // Button to move backward 
    document.getElementById('backwardbutton').addEventListener('click', function () {

        //Complete the following statement 
        moveForward(-0.5);

    });

    //Left turn button to turn left
    document.getElementById('leftturnbutton').addEventListener('click', function () {
        turnRight(-3);
    });

    //Right turn button 
    document.getElementById('rightturnbutton').addEventListener('click', function () {
        turnRight(3);
    });

    //Button to orbit around the at point to the left
    document.getElementById('leftorbitbutton').addEventListener('click', function () {
        orbitRight(-15);
    });

    //Button to orbit around the at point to the right
    document.getElementById('rightorbitbutton').addEventListener('click', function () {
        orbitRight(15);
    });
}

// Draw the defined model
var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferSolid); // bind the indices for triangles
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0); // draw triangles
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferWireframe); // bind the indices for edges 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(edgeIndices), gl.STATIC_DRAW);
    gl.drawElements(gl.LINES, edgeIndices.length, gl.UNSIGNED_BYTE, 0); //draw lines

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferAxes); // bind the indices for edges 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(axesIndices), gl.STATIC_DRAW);
    gl.drawElements(gl.LINES, axesIndices.length, gl.UNSIGNED_BYTE, 0); //draw lines

}

//Function to update the view transformation matrix after navigation
function updateView() {

    var modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");

    // Update the model view transformation matrix with the new eye or at vector
    modelViewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //Complete the following statement 
    // Redraw the scene with the updated view
    //;
}

// Function to get the forward vector, the direction at which the eye is looking
function getForwardVector() {
    var forward = vec3(0.0, 0.0, 0.0);
    forward = subtract(at, eye);
    forward = normalize(forward);

    return forward;
}

// Function to get the right vector
function getRightVector() {

    var right = vec3(0.0, 0.0, 0.0);
    var forward = getForwardVector();
    right = cross(forward, up);
    right = normalize(right);

    return right;
}

// Move the viewpoint to the right with a given step size (negative to the left)
function moveRight(step) {
    //Moving distance in a step as a column vector in the eye space
    var stepVector = [[step], [0], [0], [1]]; //one step to the right (X) 
    moveView(stepVector); // process the moving
}

// Move up the viewpointwith a given step size (negative for down)
function moveUp(step) {

    //Moving distance in a step as a column vector in the eye space
    //Complete the following statement 
    var stepVector =  [[0], [step], [0], [1]]; //one step up (Y) 
    moveView(stepVector); // process the moving
}

// Move the viewpoint forward with a given step size (negative for backward)
function moveForward(step) {
    //Moving distance in a step as a column vector in the eye space
    var stepVector = [[0], [0], [-step], [1]]; //one step forward (Z) 
    moveView(stepVector); // process the moving
}

// Function to move the view based on a 4D vector (x, y, z, 0.0) 
function moveView(sVector) {

    //Transform the moving step from the eye space to the model space 
    var sVectorModelSpace = math.multiply((inverse(modelViewMatrix)), sVector);
    
    //Get the new eye position as a 3D vector in the model space
    var sVector3D = vec3(sVectorModelSpace[0][0], sVectorModelSpace[1][0], 
        sVectorModelSpace[2][0]);
    
    // Offset of the change
    var offset = subtract(sVector3D, eye);

    // Change the viewpoint as well as the at point
    eye = sVector3D;
    at = add(at, offset);

    // Update the view
    updateView();
}



// Function to generate new viewpoint position when orbiting around the at point
function orbitRight(step) {

    // vector from the at point to the viewpoint
    var dVector = subtract(eye, at);

    // homogeneous vector in 4D for transformation 
    var dVectorH = vec4(dVector[0], dVector[1], dVector[2], 1.0);

    var ry = rotateY(step);
    var displacementVector = mult(ry, dVectorH);

    // Move the viewpoint
    eye[0] = at[0] + displacementVector[0];
    eye[1] = at[1] + displacementVector[1];
    eye[2] = at[2] + displacementVector[2];

    updateView(); //Update the view

}

// Function to generate a new at position when turning the viewpoint around
function turnRight(step) {
    // vector from the at point to the viewpoint
    var dVector = subtract(at, eye);

    // homogeneous vector in 4D for transformation 
    var dVectorH = vec4(dVector[0], dVector[1], dVector[2], 1.0);

    var ry = rotateY(-step);
    var displacementVector = mult(ry, dVectorH);

    // Move the at point
    at[0] = eye[0] + displacementVector[0];
    at[1] = eye[1] + displacementVector[1];
    at[2] = eye[2] + displacementVector[2];

    updateView(); //Update the view
}


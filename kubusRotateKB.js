function main(){
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width= window.innerWidth;
    CANVAS.height = window.innerHeight;
    var drag = false;
    var x_prev = 0, y_prev = 0;
    var THETA = 0, PHI = 0;
    var dX = 0; dY = 0;
    var AMORTIZATION = 0.95;

    //KEYBOARD
    var keyPress = function(e){
        drag = true;
        if(e.key == 'a' || e.key =='A'){
          
            THETA -= 0.35;
        } 
        if(e.key == 'w' || e.key =='W'){
            
            PHI -= 0.35;
        } 
        if(e.key == 's' || e.key =='S'){
          
          PHI += 0.35;
        } 
        if(e.key == 'd' || e.key =='D'){
       
          THETA += 0.35;
        } 
        e.preventDefault();
        return false;
    }

    var keyUp = function(e){
        drag = false;
    }

    window.addEventListener("keypress", keyPress, false);
    window.addEventListener("keyup", keyUp, false);
    



var GL;
try {
    GL=CANVAS.getContext("webgl",{antialias: false})
} catch (error) {
    alert("webGL context cannot be initialized");
    return false;
}
//shaders
var shader_vertex_source=`
attribute vec3 position;
attribute vec3 color;

uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;


varying vec3 vColor;
void main(void){
gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position,1.0);
vColor =color;
}`;

var shader_fragment_source=`
precision mediump float;
varying vec3 vColor;
void main(void){
    gl_FragColor =vec4(vColor,1.0);
}`;






var compile_shader =function(source,type,typeString){
    var shader=GL.createShader(type);
    GL.shaderSource(shader,source);
    GL.compileShader(shader);
    if(!GL.getShaderParameter(shader,GL.COMPILE_STATUS)){
        alert("ERROR IN" +typeString + " SHADER: " + GL.getShaderInfoLog(shader));
        return false;
    }
return shader;
};

var shader_vertex = compile_shader(shader_vertex_source,GL.VERTEX_SHADER,"VERTEX");

var shader_fragment = compile_shader(shader_fragment_source,GL.FRAGMENT_SHADER,"FRAGMENT");

var SHADER_PROGRAM = GL.createProgram();
GL.attachShader(SHADER_PROGRAM,shader_vertex);
GL.attachShader(SHADER_PROGRAM,shader_fragment);

GL.linkProgram(SHADER_PROGRAM);

var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

var _color=GL.getAttribLocation(SHADER_PROGRAM,"color");
var _position=GL.getAttribLocation(SHADER_PROGRAM,"position");

GL.enableVertexAttribArray(_color);
GL.enableVertexAttribArray(_position);

GL.useProgram(SHADER_PROGRAM);


//TRIANGLE
//POINTS
// var triangle_vertex =[
//     -1,-1,0.0,//index 0
//     0,0,1,
//     1,-1,0.0, //index ke 1
//     0,1,0,
//     1,1,0.0,//index ke 2
//     1,0,0,
// ];
var triangle_vertex =[
    -1,-1,-1,               0,0,0,
    1,-1,-1, //index ke 1
    1,0,0,
    1,1,-1,//index ke 2
    1,1,0,
    -1,1,-1,
    0,1,0,
    -1,-1,1,
    0,0,1,
    1,-1,1,
    1,0,1,
    1,1,1,
    1,1,1,
    -1,1,1,
    0,1,1

];

var TRIANGLE_VERTEX =GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER,TRIANGLE_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(triangle_vertex),
GL.STATIC_DRAW);

//FACES
// var triangle_faces=[0,1,2];
var triangle_faces=[0,1,2,
0,2,3,
4,5,6,
4,6,7,
0,3,7,
0,4,7,
1,2,6,
1,5,6,
2,3,6,
3,7,6,
0,1,5,
0,4,5];
var TRIANGLE_FACES= GL.createBuffer();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,TRIANGLE_FACES);
GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,new Uint16Array(triangle_faces),GL.STATIC_DRAW);

//MAtrix
var PROJMATRIX = LIBS.get_projection(40,CANVAS.width/CANVAS.height, 1,100);
var MOVEMATRIX = LIBS.get_I4();
var VIEWMATRIX = LIBS.get_I4(); 

LIBS.translateZ(VIEWMATRIX,-5);

//DRAWING
GL.clearColor(0.0,0.0,0.0,0.0);
GL.enable(GL.DEPTH_TEST);
GL.depthFunc(GL.LEQUAL);

GL.clearDepth(1.0);
var time_prev = 0;
var animate = function(time){
    if(time > 0){
    var dt = time -time_prev;
    if(drag == false){
        dX *= AMORTIZATION;
        dY *= AMORTIZATION;
        THETA += dX;
        PHI += dY;
    }
    // LIBS.rotateX(MOVEMATRIX,0.003);
    // LIBS.rotateY(MOVEMATRIX,0.003);
    // LIBS.rotateZ(MOVEMATRIX,0.003);
    LIBS.set_I4(MOVEMATRIX);
    LIBS.rotateX(MOVEMATRIX,PHI);
    LIBS.rotateY(MOVEMATRIX,THETA);
    
    
    time_prev = time;

    }
    GL.viewport (0,0,CANVAS.width,CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT);

    GL.uniformMatrix4fv(_Pmatrix,false,PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix,false,VIEWMATRIX);
    GL.uniformMatrix4fv(_Mmatrix,false,MOVEMATRIX);

    //SEGITIGA
    GL.bindBuffer(GL.ARRAY_BUFFER,TRIANGLE_VERTEX);

    GL.vertexAttribPointer(_position,3, GL.FLOAT,false,4*(3+3),0);
    GL.vertexAttribPointer(_color,3, GL.FLOAT,false,4*(3+3),3*4);
    //KOTAK
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,TRIANGLE_FACES);
    GL.drawElements(GL.TRIANGLES,triangle_faces.length,GL.UNSIGNED_SHORT,0)


    GL.flush();
    window.requestAnimationFrame(animate);


}
animate();

}

window.addEventListener('load',main);
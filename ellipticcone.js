function main(){
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width= window.innerWidth;
    CANVAS.height = window.innerHeight;

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
var triangle_vertex = [];
for(var u = -180; u <= 180; u+=6){ //60
    for(var v = -90; v < 90; v+= 6){ //30
        var thetaV = (v/360)*2*Math.PI;
        var thetaU = (u/360)*2*Math.PI;
        var x = thetaV*Math.cos(thetaU);
        var y = thetaV*Math.sin(thetaU);
        var z = thetaV;
        triangle_vertex.push(x,y,z,255,0,0);
    }
}


var TRIANGLE_VERTEX =GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER,TRIANGLE_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(triangle_vertex),
GL.STATIC_DRAW);

//FACES
var triangle_faces=[];

for (var i = 0; i < triangle_vertex.length; i++){
    triangle_faces.push(i,i+1);
}

for(var j = 0; j < 30; j++){
    var indexI = 0;
    for (var i = 0; i < 60; i++){
        triangle_faces.push(indexI+j,indexI+j+30);
        indexI += 30;
    }
}



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
    var dt = time -time_prev;
    LIBS.rotateX(MOVEMATRIX,0.003);
    LIBS.rotateY(MOVEMATRIX,0.003);
    LIBS.rotateZ(MOVEMATRIX,0.003);
    time_prev = time;
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
    GL.drawElements(GL.LINES,triangle_faces.length,GL.UNSIGNED_SHORT,0)


    GL.flush();
    window.requestAnimationFrame(animate);


}
animate();

}

window.addEventListener('load',main);
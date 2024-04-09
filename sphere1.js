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

//SPHERE
var vertices = []
var normals = []
var texCoords = []
var radius = 1;
var x, y, z, xy;                              // vertex position
var nx, ny, nz, lengthInv = 1 / radius;    // vertex normal
var s, t;                                     // vertex texCoord

var sectorCount = 720;
var stackCount = 360;
var sectorStep = 2 * Math.PI / sectorCount;
var stackStep = Math.PI / stackCount;
var sectorAngle, stackAngle;

for(var i = 0; i <= stackCount; ++i)
{
    stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
    xy = radius * Math.cos(stackAngle);             // r * cos(u)
    z = radius * Math.sin(stackAngle);              // r * sin(u)

    // add (sectorCount+1) vertices per stack
    // first and last vertices have same position and normal, but different tex coords
    for(var j = 0; j <= sectorCount/2; ++j)
    {
        sectorAngle = j * sectorStep;           // starting from 0 to 2pi

        // vertex position (x, y, z)
        x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
        y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
        vertices.push(x);
        vertices.push(y);
        vertices.push(z);

        // normalized vertex normal (nx, ny, nz)
        nx = x * lengthInv;
        ny = y * lengthInv;
        nz = z * lengthInv;
        normals.push(nx);
        normals.push(ny);
        normals.push(nz);

        // vertex tex coord (s, t) range between [0, 1]
        s = j / sectorCount;
        t = i / stackCount;
        texCoords.push(s);
        texCoords.push(t);
    }
}


var indices = []
var lineIndices = []
var k1, k2;
for(var i = 0; i < stackCount; ++i)
{
    k1 = i * (sectorCount + 1);     // beginning of current stack
    k2 = k1 + sectorCount + 1;      // beginning of next stack

    for(var j = 0; j < sectorCount; ++j, ++k1, ++k2)
    {
        // 2 triangles per sector excluding first and last stacks
        // k1 => k2 => k1+1
        if(i != 0)
        {
            indices.push(k1);
            indices.push(k2);
            indices.push(k1 + 1);
        }

        // k1+1 => k2 => k2+1
        if(i != (stackCount-1))
        {
            indices.push(k1 + 1);
            indices.push(k2);
            indices.push(k2 + 1);
        }

        // store indices for lines
        // vertical lines for all stacks, k1 => k2
        lineIndices.push(k1);
        lineIndices.push(k2);
        if(i != 0)  // horizontal lines except 1st stack, k1 => k+1
        {
            lineIndices.push(k1);
            lineIndices.push(k1 + 1);
        }
    }
}

var TRIANGLE_VERTEX =GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER,TRIANGLE_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(normals),
GL.STATIC_DRAW);

var TRIANGLE_FACES= GL.createBuffer();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,TRIANGLE_FACES);
GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),GL.STATIC_DRAW);

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
    GL.drawElements(GL.TRIANGLES,indices.length,GL.UNSIGNED_SHORT,0)


    GL.flush();
    window.requestAnimationFrame(animate);


}
animate();

}

window.addEventListener('load',main);
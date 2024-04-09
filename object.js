var GL;
class MyObject{
    object_vertex =[];
    OBJECT_VERTEX = GL.createBuffer();
    object_faces = [];
    OBJECT_FACES= GL.createBuffer();
    shader_vertex_source;
    shader_fragment_source;

    child = [];

    compile_shader = function(source,type,typeString){
        var shader = GL.createShader(type);
        GL.shaderSource(shader,source);
        GL.compileShader(shader);
        if(!GL.getShaderParameter(shader,GL.COMPILE_STATUS)){
            alert("ERROR IN" +typeString + " SHADER: " + GL.getShaderInfoLog(shader));
            return false;
        }
    return shader;
    };

    shader_vertex;
    shader_fragment;
    SHADER_PROGRAM;
    _Pmatrix;
    _Vmatrix;
    _Mmatrix;
    _color;
    _position;

    MOVEMATRIX = LIBS.get_I4();

    constructor(object_vertex, object_faces, shader_vertex_source, shader_fragment_source){
        this.object_vertex = object_vertex;
        this.object_faces = object_faces;
        this.shader_vertex_source = shader_vertex_source;
        this.shader_fragment_source = shader_fragment_source;

        this.shader_vertex = this.compile_shader(this.shader_vertex_source,GL.VERTEX_SHADER,"VERTEX");
        this.shader_fragment = this.compile_shader(this.shader_fragment_source,GL.FRAGMENT_SHADER,"FRAGMENT");

        this.SHADER_PROGRAM = GL.createProgram();
        GL.attachShader(this.SHADER_PROGRAM,this.shader_vertex);
        GL.attachShader(this.SHADER_PROGRAM,this.shader_fragment);

        GL.linkProgram(this.SHADER_PROGRAM);

        this._Pmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Pmatrix");
        this._Vmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Vmatrix");
        this._Mmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Mmatrix");

        this._color=GL.getAttribLocation(this.SHADER_PROGRAM,"color");
        this._position=GL.getAttribLocation(this.SHADER_PROGRAM,"position");

        GL.enableVertexAttribArray(this._color);
        GL.enableVertexAttribArray(this._position);

        GL.useProgram(this.SHADER_PROGRAM);

        this.initializeBuffer();

    }

    initializeBuffer(){
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.object_vertex),
        GL.STATIC_DRAW);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.object_faces), GL.STATIC_DRAW);
    }

    setuniformmatrix4(PROJMATRIX, VIEWMATRIX){
        GL.useProgram(this.SHADER_PROGRAM);
        GL.uniformMatrix4fv(this._Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(this._Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(this._Mmatrix, false, this.MOVEMATRIX);
    }

    draw(){
        GL.useProgram(this.SHADER_PROGRAM);
        GL.bindBuffer(GL.ARRAY_BUFFER,this.OBJECT_VERTEX);
        GL.vertexAttribPointer(this._position,3, GL.FLOAT,false,4*(3+3),0);
        GL.vertexAttribPointer(this._color,3, GL.FLOAT,false,4*(3+3),3*4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.OBJECT_FACES);
        GL.drawElements(GL.TRIANGLES,6*2*3,GL.UNSIGNED_SHORT,0);
        for(let i = 0; i < this.child.length; i++){
            this.child[i].draw();
        }
    }

    setRotateMove(PHI, THETA, r){
        LIBS.rotateZ(this.MOVEMATRIX,r);
        LIBS.rotateY(this.MOVEMATRIX,THETA);
        LIBS.rotateX(this.MOVEMATRIX,PHI);
    }

    setTranslateMove(x,y,z){
        LIBS.translateZ(this.MOVEMATRIX,z);
        LIBS.translateY(this.MOVEMATRIX,y);
        LIBS.translateX(this.MOVEMATRIX,x);
    }

    setIdentityMove(){
        LIBS.set_I4(this.MOVEMATRIX);
    }

    addChild(child){
        this.child.push(child);
    }
}

function main(){
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width= window.innerWidth;
    CANVAS.height = window.innerHeight;

    var drag = false;
    var x_prev, y_prev;
    var THETA = 0, PHI = 0;
    var dX = 0; dY = 0;
    var AMORTIZATION = 0.95;
    var mouseDown = function(e){
        drag = true;
        x_prev = e.pageX;
        y_prev = e.pageY;
        e.preventDefault();
        return false;
    }

    var mouseUp = function(e){
        drag = false;
    }

    var mouseMove = function(e){
       if (drag == false){
        return false;
       }
       dX = (e.pageX - x_prev)* 2 * Math.PI / CANVAS.width;
       dY = (e.pageY - y_prev)* 2 * Math.PI / CANVAS.height;
       THETA += dX;
       PHI += dY;
   
        x_prev = e.pageX;
        y_prev = e.pageY;
        e.preventDefault();
    }

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);


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
    object_vertex =[
        -1, -1, -1,     1, 1, 0,
        1, -1, -1,     1, 1, 0,
        1,  1, -1,     1, 1, 0,
        -1,  1, -1,     1, 1, 0,
    
        -1, -1, 1,     0, 0, 1,
        1, -1, 1,     0, 0, 1,
        1,  1, 1,     0, 0, 1,
        -1,  1, 1,     0, 0, 1,
    
        -1, -1, -1,     0, 1, 1,
        -1,  1, -1,     0, 1, 1,
        -1,  1,  1,     0, 1, 1,
        -1, -1,  1,     0, 1, 1,
    
        1, -1, -1,     1, 0, 0,
        1,  1, -1,     1, 0, 0,
        1,  1,  1,     1, 0, 0,
        1, -1,  1,     1, 0, 0,
    
        -1, -1, -1,     1, 0, 1,
        -1, -1,  1,     1, 0, 1,
        1, -1,  1,     1, 0, 1,
        1, -1, -1,     1, 0, 1,
    
        -1, 1, -1,     0, 1, 0,
        -1, 1,  1,     0, 1, 0,
        1, 1,  1,     0, 1, 0,
        1, 1, -1,     0, 1, 0   
    
    ];

    object_faces = [    
        0, 1, 2,
        0, 2, 3,
    
        4, 5, 6,
        4, 6, 7,
    
        8, 9, 10,
        8, 10, 11,
    
        12, 13, 14,
        12, 14, 15,
    
        16, 17, 18,
        16, 18, 19,
    
        20, 21, 22,
        20, 22, 23];

    var object1 = new MyObject(object_vertex, object_faces, shader_vertex_source, shader_fragment_source);
    var object2 = new MyObject(object_vertex, object_faces, shader_vertex_source, shader_fragment_source);
    object1.addChild(object2);
    //MAtrix
    var PROJMATRIX = LIBS.get_projection(40,CANVAS.width/CANVAS.height, 1 ,100);
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
        if(!drag){
            dX *= AMORTIZATION;
            dY *= AMORTIZATION;
            THETA += dX;
            PHI += dY;
        }
        object1.setIdentityMove();
        temps = LIBS.get_I4();
        LIBS.translateX(temps,1);
        object1.MOVEMATRIX = LIBS.mul(object1.MOVEMATRIX, temps);

        temps = LIBS.get_I4();
        LIBS.rotateY(temps,THETA);
        object1.MOVEMATRIX = LIBS.mul(object1.MOVEMATRIX, temps);

        temps = LIBS.get_I4();
        LIBS.translateX(temps,-1);
        object1.MOVEMATRIX = LIBS.mul(object1.MOVEMATRIX, temps);
        // object1.setIdentityMove();
        // object1.setRotateMove(PHI,THETA,0);



        GL.viewport (0,0,CANVAS.width,CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        object1.setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        object1.child[0].setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        object1.draw();



        GL.flush();
        window.requestAnimationFrame(animate);


    }
    animate();

}

window.addEventListener('load',main);
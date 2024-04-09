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

        // Set uniform matrices for child objects recursively
		for (let i = 0; i < this.child.length; i++) {
			this.child[i].setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
		}
    }

    draw(){
        GL.useProgram(this.SHADER_PROGRAM);
        GL.bindBuffer(GL.ARRAY_BUFFER,this.OBJECT_VERTEX);
        GL.vertexAttribPointer(this._position,3, GL.FLOAT,false,4*(3+3),0);
        GL.vertexAttribPointer(this._color,3, GL.FLOAT,false,4*(3+3),3*4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.OBJECT_FACES);
        GL.drawElements(GL.TRIANGLES,this.object_faces.length,GL.UNSIGNED_SHORT,0);
        for(let i = 0; i < this.child.length; i++){
            this.child[i].draw();
        }
    }

    drawLine() {
		GL.useProgram(this.SHADER_PROGRAM);
		GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
		GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
		GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
		GL.drawElements(GL.LINES, this.object_faces.length, GL.UNSIGNED_SHORT, 0);
		for (let i = 0; i < this.child.length; i++) {
			let child = this.child[i];
			if (child.line == false) child.draw();
			else child.drawLine();
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

    setPosition(x1, y1, z1, x2, y2, z2, PHI, THETA) {
		this.setIdentityMove();
		this.setIdentityMove();
		var temps = LIBS.get_I4();
		this.setRotateMove(x1, y1, z1);
		this.setTranslateMove(x2, y2, z2);
		LIBS.rotateX(temps, PHI);
		this.MOVEMATRIX = LIBS.mul(this.MOVEMATRIX, temps);

		LIBS.rotateY(temps, THETA);
		this.MOVEMATRIX = LIBS.mul(this.MOVEMATRIX, temps);
	}
}

function sphereVertex(a, b, c, r, g, b1){
    var vertices = []
    var radius = 1;
    var x, y, z, xy;                              // vertex position
    var nx, ny, nz, lengthInv = 1 / radius;    // vertex normal                                     // vertex texCoord

    var sectorCount = 72;
    var stackCount = 36;
    var sectorStep = 2 * Math.PI / sectorCount;
    var stackStep = Math.PI / stackCount;
    var sectorAngle, stackAngle;

    object_vertex =[];
    for(var i = 0; i <= stackCount; ++i)
    {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * Math.cos(stackAngle);             // r * cos(u)
        z = radius * Math.sin(stackAngle);              // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for(var j = 0; j <= sectorCount; ++j)
        {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            // normalized vertex normal (nx, ny, nz)
            nx = a * x * lengthInv;
            ny = b * y * lengthInv;
            nz = c * z * lengthInv;
            object_vertex.push(nx, ny, nz, r, g, b1);
        }
    }

    return object_vertex;
}

function sphereFaces(){
    var sectorCount = 72;
    var stackCount = 36;
    object_faces = [];
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
                object_faces.push(k1);
                object_faces.push(k2);
                object_faces.push(k1 + 1);
            }

            // k1+1 => k2 => k2+1
            if(i != (stackCount-1))
            {
                object_faces.push(k1 + 1);
                object_faces.push(k2);
                object_faces.push(k2 + 1);
            }
        }
    }

    return object_faces;
}

function halfSphereVertex(a, b, c, r, g, b1){
    var vertices = []
    var radius = 1;
    var x, y, z, xy;                              // vertex position
    var nx, ny, nz, lengthInv = 1 / radius;    // vertex normal                                     // vertex texCoord

    var sectorCount = 720;
    var stackCount = 360;
    var sectorStep = 2 * Math.PI / sectorCount;
    var stackStep = Math.PI / stackCount;
    var sectorAngle, stackAngle;

    object_vertex =[];
    for(var i = 0; i <= stackCount; ++i)
    {
        stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
        xy = radius * Math.cos(stackAngle);             // r * cos(u)
        z = radius * Math.sin(stackAngle);              // r * sin(u)

        // add (sectorCount+1) vertices per stack
        // first and last vertices have same position and normal, but different tex coords
        for(var j = 0; j <= sectorCount; ++j)
        {
            sectorAngle = j * sectorStep;           // starting from 0 to 2pi

            // vertex position (x, y, z)
            x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
            y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            // normalized vertex normal (nx, ny, nz)
            nx = a * x * lengthInv;
            ny = b * y * lengthInv;
            nz = c * z * lengthInv;
            object_vertex.push(nx, ny, nz, r, g, b1);
        }
    }

    return object_vertex;
}

function halfSphereFaces(){
    var sectorCount = 720;
    var stackCount = 360;
    object_faces = [];
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
                object_faces.push(k1);
                object_faces.push(k2);
                object_faces.push(k1 + 1);
            }

            // k1+1 => k2 => k2+1
            if(i != (stackCount-1))
            {
                object_faces.push(k1 + 1);
                object_faces.push(k2);
                object_faces.push(k2 + 1);
            }
        }
    }

    return object_faces;
}
// lingkaran bawah (x,y), lingkaran atas(x1,y1), tinggi (x,y), rgb
function tabungVertex(a, b, a1, b1, s, e, r, g, b2){
    var tabung_vertex = [
        0,0,s, //pusat
        r,g,b1 //pink
    ];
    
    // 1 - 361 
    for(var i = 0; i <= 360; i++){
        var theta = (i/360)*2*Math.PI;
        var x = a*Math.cos(theta);
        var y = b*Math.sin(theta);
        tabung_vertex.push(x,y,s,r,g,b2);
    }
    
    // 362
    //ling2
    tabung_vertex.push(0,0,e,r,g,b1);
    //363 - 723
    for(var i = 0; i <= 360; i++){
        var theta = (i/360)*2*Math.PI;
        var x = a1*Math.cos(theta);
        var y = b1*Math.sin(theta);
        tabung_vertex.push(x,y,e,r,g,b2);
    }

    return tabung_vertex;
}

function tabungFaces(){
    var tabung_faces = []
    for(var i = 1; i <= 360; i++){
        tabung_faces.push(0,i,i+1);
    }
    tabung_faces.push(0,361,1);
    
    //gambar atas
    for(var i = 1; i <= 360; i++){
        tabung_faces.push(362,i+362,i+363);
    }
    tabung_faces.push(362,723,363);
    
    //selimut
    for(var i = 1; i <= 360; i++){
        tabung_faces.push(i,i+1,361+i);
        tabung_faces.push(i+1,361+i,362+i);
    }

    tabung_faces.push(1,2,723);
    tabung_faces.push(1,722,723);

    return tabung_faces;
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
        GL = CANVAS.getContext("webgl",{antialias: false})
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

    //CONY PUNYA MK
    //Kepala
    // BROWN PUNYA Timothy
    var kepalaBrownVertex = sphereVertex(0.55,0.5,0.5,162/255,114/255,92/255);
    var kepalaBrownFaces = sphereFaces();
    var kepalaBrown = new MyObject(kepalaBrownVertex, kepalaBrownFaces, shader_vertex_source, shader_fragment_source);

    // telinga brown
    var telingaBrown1Vertex = sphereVertex(0.155, 0.185, 0.185, 162/255,114/255,92/255);
    var telingaBrown1Faces = sphereFaces();
    var telingaBrown1 = new MyObject(telingaBrown1Vertex, telingaBrown1Faces, shader_vertex_source, shader_fragment_source);
    var telingaBrown2 = new MyObject(telingaBrown1Vertex, telingaBrown1Faces, shader_vertex_source, shader_fragment_source);
    // inner telinga brown
    var inner1Vertex = sphereVertex(0.135, 0.165, 0.165, 107/255,60/255,47/255);
    var inner1Faces = sphereFaces();
    var inner1 = new MyObject(inner1Vertex, inner1Faces, shader_vertex_source, shader_fragment_source);
    var inner2 = new MyObject(inner1Vertex, inner1Faces, shader_vertex_source, shader_fragment_source);

    // mata
    var mataBrown1Vertex = sphereVertex(0.035, 0.035, 0.035, 0, 0, 0);
    var mataBrown1Faces = sphereFaces();
    var mataBrown1 = new MyObject(mataBrown1Vertex, mataBrown1Faces, shader_vertex_source, shader_fragment_source);
    var mataBrown2 = new MyObject(mataBrown1Vertex, mataBrown1Faces, shader_vertex_source, shader_fragment_source);
    var hidungBrown = new MyObject(mataBrown1Vertex, mataBrown1Faces, shader_vertex_source, shader_fragment_source);

    // Mulut brown
    var mulutBrownVertex = sphereVertex(0.12, 0.14, 0.1, 203/255,194/255,187/255);
    var mulutBrownFaces = sphereFaces();
    var mulutBrown = new MyObject(mulutBrownVertex, mulutBrownFaces, shader_vertex_source, shader_fragment_source);
    // garis mulut
    var garisMulut1Vertex = tabungVertex(0.01,0.01,0.01,0.01,0.02,0.1,0,0,0);
    var garisMulut1Faces = tabungFaces();
    var garisMulut1 = new MyObject(garisMulut1Vertex, garisMulut1Faces, shader_vertex_source, shader_fragment_source);

    var garisMulut2Vertex = tabungVertex(0.01,0.01,0.01,0.01,0.02,0.1,0,0,0);
    var garisMulut2Faces = tabungFaces();
    var garisMulut2 = new MyObject(garisMulut2Vertex, garisMulut2Faces, shader_vertex_source, shader_fragment_source);
    // END BROWN PUNYA TIMOTHY
    var object_vertex = sphereVertex(0.55,0.5,0.5, 255, 255, 255);
    var object_faces = sphereFaces();
    var object1 = new MyObject(object_vertex, object_faces, shader_vertex_source, shader_fragment_source);

    //kuping 
    var kuping1_vertex = sphereVertex(0.145, 0.395, 0.15, 255, 255, 255);
    var kuping1_faces = sphereFaces();
    var kuping1 = new MyObject(kuping1_vertex, kuping1_faces, shader_vertex_source, shader_fragment_source);
    var kuping2 = new MyObject(kuping1_vertex, kuping1_faces, shader_vertex_source, shader_fragment_source);

    //daleman kuping 
    var innerkuping1_vertex = sphereVertex(0.125, 0.375, 0.1, 255, 153/255, 204/255);
    var innerkuping1_faces = sphereFaces();
    var innerkuping1 = new MyObject(innerkuping1_vertex, innerkuping1_faces, shader_vertex_source, shader_fragment_source);
    var innerkuping2 = new MyObject(innerkuping1_vertex, innerkuping1_faces, shader_vertex_source, shader_fragment_source);

    //eye
    var eye1_vertex = sphereVertex(0.05, 0.05, 0.05, 0, 0, 0);
    var eye1_faces = sphereFaces();
    var eye1 = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);
    var eye2 = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);

    //cheek
    var cheek1_vertex = sphereVertex(0.1, 0.05, 0.05, 255/255, 153/255, 204/255);
    var cheek1_faces = sphereFaces();
    var cheek1 = new MyObject(cheek1_vertex, cheek1_faces, shader_vertex_source, shader_fragment_source);
    var cheek2 = new MyObject(cheek1_vertex, cheek1_faces, shader_vertex_source, shader_fragment_source);

    //nose
    var nose1_vertex = sphereVertex(0.07, 0.0375, 0.05, 0, 0, 0);
    var nose1_faces = sphereFaces();
    var nose1 = new MyObject(nose1_vertex, nose1_faces, shader_vertex_source, shader_fragment_source);
    var nose2_vertex = sphereVertex(0.0675, 0.035, 0.05, 255, 255, 255);
    var nose2 = new MyObject(nose2_vertex, nose1_faces, shader_vertex_source, shader_fragment_source);

    //mouth
    var mouth_vertex = sphereVertex(0.125, 0.125, 0.125, 255, 0, 0);
    var mouth_faces = sphereFaces();
    var mouth = new MyObject(mouth_vertex, mouth_faces, shader_vertex_source, shader_fragment_source); 

    //neck
    var neck_vertex = tabungVertex(0.25,0.25,0.3,0.3,0,-0.15,102/255,178/255,255);
    var neck_faces = tabungFaces();
    var neck = new MyObject(neck_vertex, neck_faces, shader_vertex_source, shader_fragment_source); 

    //body
    var body_vertex = tabungVertex(0.3,0.3,0.3,0.3,-0.15,-0.375,102/255,178/255,255);
    var body_faces = tabungFaces();
    var body = new MyObject(body_vertex, body_faces, shader_vertex_source, shader_fragment_source);

    //ribbon
    var ribbon_vertex = tabungVertex(0.05,0.05,0.06,0.06,-0.5,-0.65,51/255,255,51/255);
    var ribbon_faces = tabungFaces();
    var ribbon1 = new MyObject(ribbon_vertex, ribbon_faces, shader_vertex_source, shader_fragment_source);
    var ribbon2 = new MyObject(ribbon_vertex, ribbon_faces, shader_vertex_source, shader_fragment_source);

    //stomach
    var stomach_vertex = tabungVertex(0.3,0.3,0.3,0.3,-0.375,-0.5,0,0,0);
    var stomach_faces = tabungFaces();
    var stomach = new MyObject(stomach_vertex, stomach_faces, shader_vertex_source, shader_fragment_source);

    //pant
    var pant_vertex = tabungVertex(0.16875,0.16875,0.175,0.175,-0.5,-0.65,255,255,255);
    var pant_faces = tabungFaces();
    var pant1 = new MyObject(pant_vertex, pant_faces, shader_vertex_source, shader_fragment_source);
    var pant2 = new MyObject(pant_vertex, pant_faces, shader_vertex_source, shader_fragment_source);

    //leg
    var leg_vertex = tabungVertex(0.16875,0.16875,0.175,0.175,-0.65,-0.75,0,76/255,153/255);
    var leg_faces = tabungFaces();
    var leg1 = new MyObject(leg_vertex, leg_faces, shader_vertex_source, shader_fragment_source);
    var leg2 = new MyObject(leg_vertex, leg_faces, shader_vertex_source, shader_fragment_source);

    //legthumb
    var legthumb_vertex = sphereVertex(0.175,0.1,0.2,0,76/255,153/255);
    var legthumb_faces = sphereFaces();
    var legthumb1 = new MyObject(legthumb_vertex, legthumb_faces, shader_vertex_source, shader_fragment_source);
    var legthumb2 = new MyObject(legthumb_vertex, legthumb_faces, shader_vertex_source, shader_fragment_source);

    //arm
    var arm1_vertex = tabungVertex(0.125,0.125,0.1,0.1,-0.15,-0.45,102/255,178/255,255);
    var arm1_faces = tabungFaces();
    var arm1 = new MyObject(arm1_vertex, arm1_faces, shader_vertex_source, shader_fragment_source);
    var arm2 = new MyObject(arm1_vertex, arm1_faces, shader_vertex_source, shader_fragment_source);

    //palm
    var palm_vertex = sphereVertex(0.08,0.12,0.08,255,255,255);
    var palm_faces = sphereFaces();
    var palm1 = new MyObject(palm_vertex, palm_faces, shader_vertex_source, shader_fragment_source);
    var palm2 = new MyObject(palm_vertex, palm_faces, shader_vertex_source, shader_fragment_source);

    //tail
    var tail_vertex = sphereVertex(0.05, 0.05, 0.05, 255, 255, 255);
    var tail_faces = sphereFaces();
    var tail = new MyObject(tail_vertex, tail_faces, shader_vertex_source, shader_fragment_source);
 
    //MAtrix
    var PROJMATRIX = LIBS.get_projection(40,CANVAS.width/CANVAS.height, 1 ,100);
    var VIEWMATRIX = LIBS.get_I4(); 

    LIBS.translateZ(VIEWMATRIX,-5);

    //ADD CHILD
    kepalaBrown.addChild(telingaBrown1);
    kepalaBrown.addChild(telingaBrown2);
    kepalaBrown.addChild(inner1);
    kepalaBrown.addChild(inner2);
    kepalaBrown.addChild(mataBrown1);
    kepalaBrown.addChild(mataBrown2);
    kepalaBrown.addChild(mulutBrown);
    kepalaBrown.addChild(hidungBrown);
    kepalaBrown.addChild(garisMulut1);
    kepalaBrown.addChild(garisMulut2);
    //kepala
    object1.addChild(kuping1);
    object1.addChild(kuping2);
    object1.addChild(innerkuping1);
    object1.addChild(innerkuping2);
    object1.addChild(eye1);
    object1.addChild(eye2);
    object1.addChild(cheek1);
    object1.addChild(cheek2);
    object1.addChild(nose1);
    object1.addChild(nose2);
    object1.addChild(mouth);
    //badan
    object1.addChild(body);
    object1.addChild(neck);
    object1.addChild(ribbon1);
    object1.addChild(ribbon2);
    object1.addChild(stomach);
    object1.addChild(pant1);
    object1.addChild(pant2);
    object1.addChild(leg1);
    object1.addChild(leg2);
    object1.addChild(legthumb1);
    object1.addChild(legthumb2);
    object1.addChild(tail);
    //tangan
    object1.addChild(arm1);
    object1.addChild(arm2);
    object1.addChild(palm1);
    object1.addChild(palm2);

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
        kepalaBrown.setPosition(0,0,0,-2,0,0,PHI,THETA);
        telingaBrown1.setPosition(0,0,0, -1.75,0.4,0,PHI,THETA);
        telingaBrown2.setPosition(0,0,0,-2.25,0.4,0,PHI,THETA);
        inner1.setPosition(0,0,0, -1.75,0.4,0.05,PHI,THETA);
        inner2.setPosition(0,0,0,-2.25,0.4,0.05,PHI,THETA);
        mataBrown1.setPosition(0,0,0,-1.925,0.1,0.55,PHI,THETA);
        mataBrown2.setPosition(0,0,0,-2.075,0.1,0.55,PHI,THETA);
        mulutBrown.setPosition(0,0,0,-2.0,-0.065,0.5,PHI,THETA);
        hidungBrown.setPosition(0,0,0,-2,0.0,0.57,PHI,THETA);
        garisMulut1.setPosition(-Math.PI / 2,0,0, -2.0,-0.1,0.6, PHI,THETA);
        // garisMulut2.setPosition(0,-Math.PI / 2,Math.PI / 6, -2.0,-0.1,0.6, PHI,THETA)


        object1.setPosition(0,0,0,0,0,0,PHI,THETA)
        kuping1.setPosition(0,0,0,0.15,0.4,0,PHI,THETA)
        kuping2.setPosition(0,0,0,-0.15,0.4,0,PHI,THETA)
        innerkuping1.setPosition(0,0,0,0.15,0.4,0.05,PHI,THETA)
        innerkuping2.setPosition(0,0,0,-0.15,0.4,0.05,PHI,THETA)
        eye1.setPosition(0,0,0,0.075,0.1,0.45,PHI,THETA)
        eye2.setPosition(0,0,0,-0.075,0.1,0.45,PHI,THETA)
        cheek1.setPosition(0,0,0,0.17,0,0.435,PHI,THETA)
        cheek2.setPosition(0,0,0,-0.17,0,0.435,PHI,THETA)
        nose1.setPosition(0,0,0,0,0,0.475,PHI,THETA)
        nose2.setPosition(0,0,0,0,0,0.477,PHI,THETA)
        mouth.setPosition(0,0,0,0,-0.175,0.375,PHI,THETA)
        
        body.setPosition(4.71239,0,0,0,-0.35,0,PHI,THETA)
        neck.setPosition(4.71239,0,0,0,-0.35,0,PHI,THETA)
        ribbon1.setPosition(-Math.PI / 2 - 0.5,-0.5,0,-0.2,-0.05,0.03,PHI,THETA)
        ribbon2.setPosition(Math.PI / 2 - 0.5,2.5,0,0.3,-0.09,0.06,PHI,THETA)
        stomach.setPosition(4.71239,0,0,0,-0.35,0,PHI,THETA)
        pant1.setPosition(4.71239,0,0,0.1,-0.35,0,PHI,THETA)
        pant2.setPosition(4.71239,0,0,-0.1,-0.35,0,PHI,THETA)
        leg1.setPosition(4.71239,0,0,0.1,-0.35,0,PHI,THETA)
        leg2.setPosition(4.71239,0,0,-0.1,-0.35,0,PHI,THETA)
        legthumb1.setPosition(0,0,0,0.1,-1.05,0.05,PHI,THETA)
        legthumb2.setPosition(0,0,0,-0.1,-1.05,0.05,PHI,THETA)
        tail.setPosition(0,0,0,0,-0.8,-0.275,PHI,THETA)

        arm1.setPosition(-Math.PI / 2 - 0.5,-0.5,0,0.125,-0.375,0,PHI,THETA)
        arm2.setPosition(Math.PI / 2 - 0.5,2.5,0,-0.125,-0.375,0,PHI,THETA)
        palm1.setPosition(0,-0.7,1,0.31,-0.7,0.175,PHI,THETA)
        palm2.setPosition(0,0.7,-1,-0.378,-0.7,0.175,PHI,THETA)

        GL.viewport (0,0,CANVAS.width,CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        object1.setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        object1.draw();

        kepalaBrown.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        kepalaBrown.draw();

        GL.flush();
        window.requestAnimationFrame(animate);


    }
    animate();

}

window.addEventListener('load',main);
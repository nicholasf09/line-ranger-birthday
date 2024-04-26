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

    rotate(PHI, THETA, r) {
        // Simpan matriks transformasi objek induk sebelum rotasi
        var parentMatrixBefore = LIBS.cloneMatrix(this.MOVEMATRIX);
        
        // Terapkan rotasi pada objek induk
        LIBS.rotateZ(this.MOVEMATRIX, r);
        LIBS.rotateY(this.MOVEMATRIX, THETA);
        LIBS.rotateX(this.MOVEMATRIX, PHI);
        
        // Iterasi melalui objek anak
        for (let i = 0; i < this.child.length; i++) {
            let child = this.child[i];
            
            // Terapkan rotasi yang sama dengan objek induk pada objek anak
            child.MOVEMATRIX = LIBS.cloneMatrix(this.MOVEMATRIX);
            
            // Hitung posisi relatif objek anak terhadap rotasi objek induk sebelum rotasi
            var relativePosition = [
                child.MOVEMATRIX[12] - parentMatrixBefore[12],
                child.MOVEMATRIX[13] - parentMatrixBefore[13],
                child.MOVEMATRIX[14] - parentMatrixBefore[14]
            ];
    
            // Terapkan posisi relatif pada posisi rotasi objek anak setelah rotasi objek induk
            child.MOVEMATRIX[12] = this.MOVEMATRIX[12] + relativePosition[0];
            child.MOVEMATRIX[13] = this.MOVEMATRIX[13] + relativePosition[1];
            child.MOVEMATRIX[14] = this.MOVEMATRIX[14] + relativePosition[2];
        }
    }

    translate(x,y,z){
        LIBS.translateZ(this.MOVEMATRIX,z);
        LIBS.translateY(this.MOVEMATRIX,y);
        LIBS.translateX(this.MOVEMATRIX,x);
        for (let i = 0; i < this.child.length; i++) {
            let child = this.child[i];
            child.translate(x,y,z)
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

    addCurve(n){
        for(var i = 0; i < n; i++){
            this.addChild(new MyObject(this.object_vertex,this.object_faces,this.shader_vertex_source,this.shader_fragment_source));
        }
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

function cubeVertex(h, d, w, r, g, b) {
    const vertices = [];
    const lengthInv = 1; // Normalization factor

    // Front face
    vertices.push(-w * lengthInv, -h * lengthInv, d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, -h * lengthInv, d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, h * lengthInv, d * lengthInv, r, g, b);
    vertices.push(-w * lengthInv, h * lengthInv, d * lengthInv, r, g, b);

    // Back face
    vertices.push(-w * lengthInv, -h * lengthInv, -d * lengthInv, r, g, b);
    vertices.push(-w * lengthInv, h * lengthInv, -d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, h * lengthInv, -d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, -h * lengthInv, -d * lengthInv, r, g, b);

    // Top face
    vertices.push(-w * lengthInv, h * lengthInv, -d * lengthInv, r, g, b);
    vertices.push(-w * lengthInv, h * lengthInv, d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, h * lengthInv, d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, h * lengthInv, -d * lengthInv, r, g, b);

    // Bottom face
    vertices.push(-w * lengthInv, -h * lengthInv, -d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, -h * lengthInv, -d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, -h * lengthInv, d * lengthInv, r, g, b);
    vertices.push(-w * lengthInv, -h * lengthInv, d * lengthInv, r, g, b);

    // Right face
    vertices.push(w * lengthInv, -h * lengthInv, -d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, h * lengthInv, -d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, h * lengthInv, d * lengthInv, r, g, b);
    vertices.push(w * lengthInv, -h * lengthInv, d * lengthInv, r, g, b);

    // Left face
    vertices.push(-w * lengthInv, -h * lengthInv, -d * lengthInv, r, g, b);
    vertices.push(-w * lengthInv, -h * lengthInv, d * lengthInv, r, g, b);
    vertices.push(-w * lengthInv, h * lengthInv, d * lengthInv, r, g, b);
    vertices.push(-w * lengthInv, h * lengthInv, -d * lengthInv, r, g, b);

    return vertices;
}

function cubeVertexColor(h, d, w, r1, g1, b1, r2,g2,b2,r3,g3,b3) {
    const vertices = [];
    const lengthInv = 1; // Normalization factor

    // Front face
    vertices.push(-w * lengthInv, -h * lengthInv, d * lengthInv, r1, g1, b1);
    vertices.push(w * lengthInv, -h * lengthInv, d * lengthInv, r1, g1, b1);
    vertices.push(w * lengthInv, h * lengthInv, d * lengthInv, r1, g1, b1);
    vertices.push(-w * lengthInv, h * lengthInv, d * lengthInv,  r1, g1, b1);

    // Back face
    vertices.push(-w * lengthInv, -h * lengthInv, -d * lengthInv,  r1, g1, b1);
    vertices.push(-w * lengthInv, h * lengthInv, -d * lengthInv,  r1, g1, b1);
    vertices.push(w * lengthInv, h * lengthInv, -d * lengthInv,  r1, g1, b1);
    vertices.push(w * lengthInv, -h * lengthInv, -d * lengthInv,  r1, g1, b1);

    // Top face
    vertices.push(-w * lengthInv, h * lengthInv, -d * lengthInv, r2,g2,b2);
    vertices.push(-w * lengthInv, h * lengthInv, d * lengthInv, r2,g2,b2);
    vertices.push(w * lengthInv, h * lengthInv, d * lengthInv, r2,g2,b2);
    vertices.push(w * lengthInv, h * lengthInv, -d * lengthInv, r2,g2,b2);

    // Bottom face
    vertices.push(-w * lengthInv, -h * lengthInv, -d * lengthInv, r2,g2,b2);
    vertices.push(w * lengthInv, -h * lengthInv, -d * lengthInv, r2,g2,b2);
    vertices.push(w * lengthInv, -h * lengthInv, d * lengthInv, r2,g2,b2);
    vertices.push(-w * lengthInv, -h * lengthInv, d * lengthInv, r2,g2,b2);

    // Right face
    vertices.push(w * lengthInv, -h * lengthInv, -d * lengthInv, r3,g3,b3);
    vertices.push(w * lengthInv, h * lengthInv, -d * lengthInv,  r3,g3,b3);
    vertices.push(w * lengthInv, h * lengthInv, d * lengthInv,  r3,g3,b3);
    vertices.push(w * lengthInv, -h * lengthInv, d * lengthInv,  r3,g3,b3);

    // Left face
    vertices.push(-w * lengthInv, -h * lengthInv, -d * lengthInv,  r3,g3,b3);
    vertices.push(-w * lengthInv, -h * lengthInv, d * lengthInv,  r3,g3,b3);
    vertices.push(-w * lengthInv, h * lengthInv, d * lengthInv,  r3,g3,b3);
    vertices.push(-w * lengthInv, h * lengthInv, -d * lengthInv,  r3,g3,b3);

    return vertices;
}


function cubeFaces() {
    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9, 10,      8, 10, 11,    // top
       12, 13, 14,     12, 14, 15,    // bottom
       16, 17, 18,     16, 18, 19,    // right
       20, 21, 22,     20, 22, 23,    // left
    ];

    return indices;
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

function generateTube(x, y, outerRad, innerRad, height, segments, r,g,b) {
    var vertices = [];

    var angleIncrement = (2 * Math.PI) / segments;

    // Vertices around the outer and inner circles for top and bottom
    for (var i = 0; i < segments; i++) {
    var angle = i * angleIncrement;
    var cosAngle = Math.cos(angle);
    var sinAngle = Math.sin(angle);

    // Bottom circle vertex
    var bottomX = outerRad * cosAngle + x;
    var bottomY = outerRad * sinAngle + y;
    var bottomZ = 0; // For the bottom circle
    vertices.push(bottomX, bottomY, bottomZ,r,g,b);

    // Top circle vertex
    var topX = innerRad * cosAngle + x;
    var topY = innerRad * sinAngle + y;
    var topZ = height; // For the top circle
    vertices.push(topX, topY, topZ,r,g,b);
    }

    // Closing vertices for the last segment
    vertices.push(vertices[0], vertices[1], 0,r,g,b);
    vertices.push(vertices[3], vertices[4], height,r,g,b);

    // Faces
    var faces = [];
    for (var i = 0; i < segments; i++) {
    var index = i * 2;
    faces.push(index, index + 1, (index + 3) % (segments * 2));
    faces.push(index, (index + 3) % (segments * 2), (index + 2) % (segments * 2));
    }

    // Faces for top and bottom circles
    for (var i = 0; i < segments; i++) {
    var bottomIndex = i * 2;
    var topIndex = bottomIndex + 1;
    var nextBottomIndex = ((i + 1) % segments) * 2;
    var nextTopIndex = nextBottomIndex + 1;

    // Bottom circle face
    faces.push(bottomIndex, nextBottomIndex, vertices.length / 3 - 2);

    // Top circle face
    faces.push(nextTopIndex, topIndex, vertices.length / 3 - 1);
    }

    return { vertices: vertices, faces: faces };
}

function segi5Faces(){
    var tabung_faces = []
    for(var i = 1; i <= 5; i++){
        tabung_faces.push(0,i,i+1);
    }
    tabung_faces.push(0,6,1);
    
    //gambar atas
    for(var i = 1; i <= 5; i++){
        tabung_faces.push(7,i+7,i+7);
    }
    tabung_faces.push(7,13,8);
    
    //selimut
    for(var i = 1; i <= 360; i++){
        tabung_faces.push(i,i+1,361+i);
        tabung_faces.push(i+1,361+i,362+i);
    }

    tabung_faces.push(1,2,723);
    tabung_faces.push(1,722,723);

    return tabung_faces;
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

function segitigaVertex(r,g,b){
    var segitiga_vertex = [
        //segitiga bawah
        0,1,0, 
        r,g,b,
        0.5,1,0,
        r,g,b,
        0.25,0,0,
        r,g,b,

        //segitiga bawah
        0,1,0.1,
        r,g,b,
        0.5,1,0.1,
        r,g,b,
        0.25,0,0.1,
        r,g,b,
    ];

    return segitiga_vertex;
}

function segitigaFaces(){
    var segitiga_faces = [
        //segitiga bawah
        0,1,2,
        3,4,5,
        0,2,3,
        0,2,4,
        1,2,5,
        2,4,5,
        0,1,3,
        0,3,5

    ];
    return segitiga_faces;
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

    // hidung
    var hidungBrownVertex = sphereVertex(0.04,0.04,0.04,244/255,39/255,61/255);
    var hidungBrown = new MyObject(hidungBrownVertex, mataBrown1Faces, shader_vertex_source, shader_fragment_source);

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

    // topi
    var topiBrownVertex = tabungVertex(0.13, 0.13, 0.005, 0.005, 0.0, 0.3, 42/255,98/255,203/255);
    var topiBrownFaces = tabungFaces();
    var topiBrown = new MyObject(topiBrownVertex, topiBrownFaces, shader_vertex_source, shader_fragment_source);
    // bawah topi
    var bawahTopiBrownVertex = tabungVertex(0.15,0.15, 0.15,0.15, 0.0, 0.1, 23/255,78/255,134/255);
    var bawahTopiBrownFaces = tabungFaces();
    var bawahTopiBrown = new MyObject(bawahTopiBrownVertex, bawahTopiBrownFaces, shader_vertex_source, shader_fragment_source);

    // badan brown
    var bodyBrownVertex = tabungVertex(0.3,0.3,0.3,0.3,-0.15,-0.575,42/255,98/255,203/255);
    var bodyBrownFaces = tabungFaces();
    var bodyBrown = new MyObject(bodyBrownVertex, bodyBrownFaces, shader_vertex_source, shader_fragment_source);
    // inner badan brown
    var innerBadanVertex = tabungVertex(0.15,0.15,0.15,0.15,-0.15,-0.575,231/255,16/255,42/255);
    var innerBadan = new MyObject(innerBadanVertex, bodyBrownFaces, shader_vertex_source, shader_fragment_source);
    // arm
    var arm1BrownVertex= tabungVertex(0.125,0.125,0.1,0.1,-0.15,-0.45,23/255,78/255,134/255);
    var arm1_faces = tabungFaces();
    var arm1Brown = new MyObject(arm1BrownVertex, arm1_faces, shader_vertex_source, shader_fragment_source);
    var arm2Brown = new MyObject(arm1BrownVertex, arm1_faces, shader_vertex_source, shader_fragment_source);
    // palm brown
    var palmBrownVertex = sphereVertex(0.08,0.12,0.08,255,255,255);
    var palm_faces = sphereFaces();
    var palm1Brown = new MyObject(palmBrownVertex, palm_faces, shader_vertex_source, shader_fragment_source);
    var palm2Brown = new MyObject(palmBrownVertex, palm_faces, shader_vertex_source, shader_fragment_source);
    // kaki brown
    var legVertexBrown = tabungVertex(0.16875,0.16875,0.175,0.175,-0.45,-0.75,231/255,16/255,42/255);
    var leg_faces = tabungFaces();
    var leg1Brown = new MyObject(legVertexBrown, leg_faces, shader_vertex_source, shader_fragment_source);
    var leg2Brown = new MyObject(legVertexBrown, leg_faces, shader_vertex_source, shader_fragment_source);

    // sepatu brown
    var sepatuVertex = sphereVertex(0.175,0.1,0.2,0,0,0);
    var sepatuFaces = sphereFaces();
    var sepatuBrown1 = new MyObject(sepatuVertex, sepatuFaces, shader_vertex_source, shader_fragment_source);
    var sepatuBrown2 = new MyObject(sepatuVertex, sepatuFaces, shader_vertex_source, shader_fragment_source);
    var innerSepatuVertex = tabungVertex(0.16875,0.16875,0.175,0.175,-0.65,-0.75,0,0,0);
    var innerSepatuFaces = tabungFaces();
    var innerSepatuBrown1 = new MyObject(innerSepatuVertex, innerSepatuFaces, shader_vertex_source, shader_fragment_source);
    var innerSepatuBrown2 = new MyObject(innerSepatuVertex, innerSepatuFaces, shader_vertex_source, shader_fragment_source);

    var garisVertex = tabungVertex(0.01,0.01,0.01,0.01,0.05,0.5,254/255,250/255,249/255);
    var garisFaces = tabungFaces();
    var garis = new MyObject(garisVertex, garisFaces, shader_vertex_source, shader_fragment_source);
    var garis2 = new MyObject(garisVertex, garisFaces, shader_vertex_source, shader_fragment_source);
    var garis3 = new MyObject(garisVertex, garisFaces, shader_vertex_source, shader_fragment_source);
    var garis4 = new MyObject(garisVertex, garisFaces, shader_vertex_source, shader_fragment_source);
    var garis5 = new MyObject(garisVertex, garisFaces, shader_vertex_source, shader_fragment_source);
    var garis6 = new MyObject(garisVertex, garisFaces, shader_vertex_source, shader_fragment_source);
    var garis7 = new MyObject(garisVertex, garisFaces, shader_vertex_source, shader_fragment_source);

    // sepeda
    var kursiVertex = halfSphereVertex(0.3,0.3,0.5,56/255,143/255,231/255);
    var kursiFaces = halfSphereFaces();
    var kursi = new MyObject(kursiVertex, kursiFaces, shader_vertex_source, shader_fragment_source);
    var tiangVertex = tabungVertex(0.1,0.1,0.1,0.1,0.05,0.5,232/255,169/255,45/255);
    var tiangFaces = tabungFaces();
    var tiang = new MyObject(tiangVertex, tiangFaces, shader_vertex_source, shader_fragment_source);
    var bottomtiangVertex = tabungVertex(0.15,0.15,0.15,0.15,0.4,0.5,255,255,255);
    var bottomtiangFaces = tabungFaces();
    var bottomtiang = new MyObject(bottomtiangVertex, bottomtiangFaces, shader_vertex_source, shader_fragment_source);
    var boxSepedaVertex = cubeVertex(0.05,0.2,0.3,232/255,169/255,45/255);
    var boxSepedaFaces = cubeFaces();
    var boxSepeda = new MyObject(boxSepedaVertex, boxSepedaFaces, shader_vertex_source, shader_fragment_source);
    var tanganRodaVertex1 = cubeVertex(0.25,0.05,0.07,105/255,105/255,104/255);
    var tanganRodaFaces1 = cubeFaces();
    var tanganRoda1 = new MyObject(tanganRodaVertex1, tanganRodaFaces1, shader_vertex_source, shader_fragment_source);
    var tanganRoda2 = new MyObject(tanganRodaVertex1, tanganRodaFaces1, shader_vertex_source, shader_fragment_source);
    var rodaVertex = tabungVertex(0.5,0.5,0.5,0.5,0.05,0.25,0,0,0);
    var rodaFaces = tabungFaces();
    var roda = new MyObject(rodaVertex, rodaFaces, shader_vertex_source, shader_fragment_source);
    var innerRodaVertex = sphereVertex(0.2,0.4,0.4,229/255,0/255,29/255);
    var innerRodaFaces = sphereFaces();
    var innerRoda = new MyObject(innerRodaVertex, innerRodaFaces, shader_vertex_source, shader_fragment_source);
    var patternRodaData = generateTube(0,0,0.3,0.3,0.4,5,10,253/255,216/255,56/255);
    var patternRodaVertex = patternRodaData.vertices;
    var patternRodaFaces = patternRodaData.faces;
    var patternRoda = new MyObject(patternRodaVertex, patternRodaFaces, shader_vertex_source, shader_fragment_source);


    // -----------------------------------------------------END BROWN PUNYA TIMOTHY-----------------------------------

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
    var smileConyVertex = tabungVertex(0.01,0.01,0.01,0.01,0,0.01,0,0,0);
    var smileConyFaces = tabungFaces();
    var smileCony = new MyObject(smileConyVertex,smileConyFaces,shader_vertex_source,shader_fragment_source);
    smileCony.addCurve(100);

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

    // -------------------------------------------------------ENVIRONMENT--------------------------------------------
    var environmentVertex = cubeVertexColor(7,7,7,155/255,213/255,254/255,11/255,144/255,227/255,197/255,38/255,0/255)
    var environmentFaces = cubeFaces();
    var environment1 = new MyObject(environmentVertex, environmentFaces, shader_vertex_source, shader_fragment_source);
    // ___________________________ START KUE TART___________________________

    //___________BALON_____________________
    var balonBottomVertex = tabungVertex(0.05,0.05,0.45,0.45,0,0.7,208/255,297/255,255);
    var balonBottomFaces = tabungFaces();
    var balonBottom = new MyObject(balonBottomVertex,balonBottomFaces,shader_vertex_source,shader_fragment_source);
    var balonUpVertex = sphereVertex(0.5,0.5,0.7,208/255,297/255,255);
    var balonUpFaces = sphereFaces();
    var balonUp = new MyObject(balonUpVertex,balonUpFaces,shader_vertex_source,shader_fragment_source);
    var balonBottom1 = new MyObject(tabungVertex(0.05,0.05,0.45,0.45,0,0.7,255,165/255,88/255),balonBottomFaces,shader_vertex_source,shader_fragment_source);
    var balonUp1 = new MyObject(sphereVertex(0.5,0.5,0.7,255,165/255,88/255),balonUpFaces,shader_vertex_source,shader_fragment_source);
    var balonBottom2 = new MyObject(tabungVertex(0.05,0.05,0.45,0.45,0,0.7,50/255,245/255,219/255),balonBottomFaces,shader_vertex_source,shader_fragment_source);
    var balonUp2 = new MyObject(sphereVertex(0.5,0.5,0.7,50/255,245/255,219/255),balonUpFaces,shader_vertex_source,shader_fragment_source);
    var balonBottom3 = new MyObject(tabungVertex(0.05,0.05,0.45,0.45,0,0.7,91/255,65/255,255),balonBottomFaces,shader_vertex_source,shader_fragment_source);
    var balonUp3 = new MyObject(sphereVertex(0.5,0.5,0.7,91/255,65/255,255),balonUpFaces,shader_vertex_source,shader_fragment_source);
    var balonBottom4 = new MyObject(tabungVertex(0.05,0.05,0.45,0.45,0,0.7,255,0,0),balonBottomFaces,shader_vertex_source,shader_fragment_source);
    var balonUp4 = new MyObject(sphereVertex(0.5,0.5,0.7,255,0,0),balonUpFaces,shader_vertex_source,shader_fragment_source);

    //_______________________________________TALI_____________________________________
    var taliVertex = tabungVertex(0.05,0.05,0.05,0.05,0,0.05,0,0,0);
    var taliFaces = tabungFaces();
    var tali = new MyObject(taliVertex,taliFaces,shader_vertex_source,shader_fragment_source);
    tali.addCurve(200);

    //_______________________BENDERA_______________
    var bendera = new MyObject(segitigaVertex(245/255,255/255,151/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera1 = new MyObject(segitigaVertex(151/255,245/255,255/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera2 = new MyObject(segitigaVertex(151/255,255/255,196/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera3 = new MyObject(segitigaVertex(255/255,217/255,151/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera4 = new MyObject(segitigaVertex(255/255,151/255,189/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera5 = new MyObject(segitigaVertex(245/255,255/255,151/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera6 = new MyObject(segitigaVertex(151/255,245/255,255/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);

 
    //MAtrix
    var PROJMATRIX = LIBS.get_projection(40,CANVAS.width/CANVAS.height, 1 ,100);
    var VIEWMATRIX = LIBS.get_I4(); 

    LIBS.translateZ(VIEWMATRIX,-8);

    //___________________________________________ADD CHILD_____________________________________
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
    kepalaBrown.addChild(topiBrown);
    kepalaBrown.addChild(bawahTopiBrown);
    kepalaBrown.addChild(bodyBrown);
    bodyBrown.addChild(innerBadan);
    bodyBrown.addChild(arm1Brown);
    bodyBrown.addChild(arm2Brown);
    arm1Brown.addChild(palm1Brown);
    arm2Brown.addChild(palm2Brown);
    bodyBrown.addChild(leg1Brown);
    bodyBrown.addChild(leg2Brown);
    leg1Brown.addChild(sepatuBrown1);
    leg2Brown.addChild(sepatuBrown2);
    sepatuBrown1.addChild(innerSepatuBrown1);
    sepatuBrown2.addChild(innerSepatuBrown2);
    bodyBrown.addChild(garis);
    bodyBrown.addChild(garis2);
    bodyBrown.addChild(garis3);
    leg1Brown.addChild(garis4);
    leg1Brown.addChild(garis5);
    leg2Brown.addChild(garis6);
    leg2Brown.addChild(garis7);
    bodyBrown.addChild(kursi);
    kursi.addChild(tiang);
    tiang.addChild(bottomtiang);
    tiang.addChild(boxSepeda);
    boxSepeda.addChild(tanganRoda1);
    boxSepeda.addChild(tanganRoda2);
    boxSepeda.addChild(roda);
    roda.addChild(innerRoda);
    innerRoda.addChild(patternRoda);
    // kepalaBrown.addChild(pitaBrown);

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
    object1.addChild(smileCony);

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

    //____________________ENV_________________
    balonBottom.addChild(balonUp);
    balonBottom1.addChild(balonUp1);
    balonBottom2.addChild(balonUp2);
    balonBottom3.addChild(balonUp3);
    balonBottom4.addChild(balonUp4);

    bendera.addChild(bendera1);
    bendera.addChild(bendera2);
    bendera.addChild(bendera3);
    bendera.addChild(bendera4);
    bendera.addChild(bendera5);
    bendera.addChild(bendera6);

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
        mataBrown1.setPosition(0,0,0,-1.925,0.1,0.50,PHI,THETA);
        mataBrown2.setPosition(0,0,0,-2.075,0.1,0.50,PHI,THETA);
        mulutBrown.setPosition(0,0,0,-2.0,-0.065,0.5,PHI,THETA);
        hidungBrown.setPosition(0,0,0,-2,0.0,0.6,PHI,THETA);
        garisMulut1.setPosition(-Math.PI / 2,0,0, -2.0,-0.11,0.6, PHI,THETA);
        // garisMulut2.setPosition(0,-Math.PI / 2,Math.PI / 6, -2.0,-0.1,0.6, PHI,THETA)
        topiBrown.setPosition(-Math.PI / 2,0,0,-2,0.45,0.0,PHI,THETA);
        bawahTopiBrown.setPosition(-Math.PI/2,0,0,-2,0.45,0,PHI,THETA);
        bodyBrown.setPosition(4.71239,0,0,-2,-0.2,0.02,PHI,THETA);
        innerBadan.setPosition(4.71239,0,0,-2,-0.2,0.2,PHI,THETA);
        arm1Brown.setPosition(-Math.PI / 2 - 0.5,-0.5,0 ,-1.875,-0.375,0,PHI,THETA);
        arm2Brown.setPosition(Math.PI / 2 - 0.5,2.5,0,-2.125,-0.375,0,PHI,THETA);
        palm1Brown.setPosition(0,-0.7,1, -1.69,-0.7,0.175,PHI,THETA);
        palm2Brown.setPosition(0,0.7,-1,-2.378,-0.7,0.175,PHI,THETA);
        leg1Brown.setPosition(4.71239,0,0,-1.9,-0.30,0.1,PHI,THETA);
        leg2Brown.setPosition(4.71239,0,0,-2.1,-0.30,0.1,PHI,THETA);
        sepatuBrown1.setPosition(0,0,0,-1.9,-1.05,0.12,PHI,THETA);
        sepatuBrown2.setPosition(0,0,0,-2.1,-1.05,0.12,PHI,THETA);
        innerSepatuBrown1.setPosition(4.71239,0,0,-1.9,-0.35,0.12,PHI,THETA);
        innerSepatuBrown2.setPosition(4.71239,0,0,-2.1,-0.35,0.12,PHI,THETA);
        // pitaBrown.setPosition(0,0,0,0,-4,0,0.8,PHI,THETA);
        garis.setPosition(4.71239,0,0,-2.05,-0.85,0.34,PHI,THETA);
        garis2.setPosition(4.71239,0,0,-1.990,-0.85,0.35,PHI,THETA);
        garis3.setPosition(4.71239,0,0,-1.930,-0.85,0.33,PHI,THETA);
        garis4.setPosition(4.71239,0,0,-1.930,-1.04,0.28,PHI,THETA);
        garis5.setPosition(4.71239,0,0,-1.83,-1.04,0.25,PHI,THETA);
        garis6.setPosition(4.71239,0,0,-2.05,-1.04,0.28,PHI,THETA);
        garis7.setPosition(4.71239,0,0,-2.15,-1.04,0.26,PHI,THETA);
        kursi.setPosition(4.71239*3,0,0,-2,-0.42,-0.2,PHI,THETA);
        tiang.setPosition(4.71239,0,0,-2,-1.4,-0.2,PHI,THETA);
        bottomtiang.setPosition(4.71239,0,0,-2,-1.8,-0.2,PHI,THETA);
        boxSepeda.setPosition(0,0,0,-2,-1.45,-0.2,PHI,THETA);
        tanganRoda1.setPosition(0,0,0,-2.2,-1.77,-0.2,PHI,THETA);
        tanganRoda2.setPosition(0,0,0,-1.8,-1.77,-0.2,PHI,THETA);
        roda.setPosition(0,4.71239,0,-1.85,-2.1,-0.2,PHI,THETA);
        innerRoda.setPosition(0,0,0,-2,-2.1,-0.2,PHI,THETA);
        patternRoda.setPosition(0,4.71239,4.71239,-1.8115,-2.1,-0.2,PHI,THETA);

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
        smileCony.setPosition(0,0,0,-0.125,2.5*0.125*0.125-0.2,0.45,PHI,THETA)
        var xtemp = -0.125;
        for(var i = 0; i < smileCony.child.length;i++){
            xtemp += 0.0025;
            var ytemp = 2.5*xtemp*xtemp-0.2;
            smileCony.child[i].setPosition(0,0,0,xtemp,ytemp,0.45,PHI,THETA)
        }
        
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

        // _____________________________ENV POS______________________________________
        environment1.setPosition(0,0,4.71239,0,3.5,0,PHI,THETA);
        balonBottom.setPosition(4.71239,0,0,1,0.1,-3,PHI,THETA);
        balonUp.setPosition(4.71239,0,0,1,0.9,-3,PHI,THETA);
        balonBottom1.setPosition(4.71239,0,0,3,-0.6,-3,PHI,THETA);
        balonUp1.setPosition(4.71239,0,0,3,0.3,-3,PHI,THETA);
        balonBottom2.setPosition(4.71239,0,0,-1,-0.7,-3,PHI,THETA);
        balonUp2.setPosition(4.71239,0,0,-1,0.2,-3,PHI,THETA);
        balonBottom3.setPosition(4.71239,0,0,-3,0.1,-3,PHI,THETA);
        balonUp3.setPosition(4.71239,0,0,-3,0.9,-3,PHI,THETA);
        balonBottom4.setPosition(4.71239,0,0,-5,-0.7,-3,PHI,THETA);
        balonUp4.setPosition(4.71239,0,0,-5,0.1,-3,PHI,THETA);
        
        tali.setPosition(0,0,0,-2.5,0.1*2.5*2.5+2,-3,PHI,THETA);
        var xtemp = -5;
        for(var i = 0; i < tali.child.length;i++){
            xtemp += 0.05;
            var ytemp = 0.1*xtemp*xtemp+2;
            tali.child[i].setPosition(0,0,0,xtemp,ytemp,-3,PHI,THETA)
        }
        bendera.setPosition(0,0,0,0,0.95,-3,PHI,THETA);
        bendera1.setPosition(0,0,0,1.5,1.2,-3,PHI,THETA);
        bendera1.rotate(0,0,0.261799)
        bendera2.setPosition(0,0,0,3,1.8,-3,PHI,THETA);
        bendera2.rotate(0,0,0.523599)
        bendera3.setPosition(0,0,0,-1.5,1.2,-3,PHI,THETA);
        bendera3.rotate(0,0,-0.261799)
        bendera4.setPosition(0,0,0,-3,1.8,-3,PHI,THETA);
        bendera4.rotate(0,0,-0.523599)
        bendera5.setPosition(0,0,0,4.2,2.5,-3,PHI,THETA);
        bendera5.rotate(0,0,0.785398)
        bendera6.setPosition(0,0,0,-4.2,2.6,-3,PHI,THETA);
        bendera6.rotate(0,0,-0.785398)


        //_______________DRAW___________________________________________
        GL.viewport (0,0,CANVAS.width,CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        object1.translate(0,-1.3,0)
        object1.setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        object1.draw();

        kepalaBrown.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        kepalaBrown.draw();

        environment1.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        // environment1.draw();

        balonBottom.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        balonBottom.draw();
        balonBottom1.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        balonBottom1.draw();
        balonBottom2.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        balonBottom2.draw();
        balonBottom3.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        balonBottom3.draw();
        balonBottom4.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        balonBottom4.draw();

        tali.setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        tali.draw();

        bendera.setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        bendera.draw();

        GL.flush();
        window.requestAnimationFrame(animate);


    }
    animate();

}

window.addEventListener('load',main);
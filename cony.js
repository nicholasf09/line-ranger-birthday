var GL;
class MyObjectTexture{
    CANVAS = document.getElementById("your_canvas");
    cube_vertex = [];
    CUBE_VERTEX;
    cube_faces = [];
    CUBE_FACES;
    shader_vertex_source = null;
    shader_fragment_source = null;
  
    MOVEMATRIX = LIBS.get_I4();
  
    child = [];
  
    compile_shader = function(source, type, typeString) {
      var shader = GL.createShader(type);
      GL.shaderSource(shader, source);
      GL.compileShader(shader);
      if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
        return false;
      }
      return shader;
    };
  
    shader_vertex;
    shader_fragment;
  
    _Pmatrix;
    _Vmatrix;
    _Mmatrix;
    _sampler;
    texture;
  
    _color;
    _position;
  
    SHADER_PROGRAM = GL.createProgram();
  
    constructor(cube_vertex,cube_faces,shader_vertex,shader_fragment){
      this.cube_vertex = cube_vertex;
      this.cube_faces = cube_faces;
      this.shader_vertex_source = shader_vertex;
      this.shader_fragment_source = shader_fragment;
    
      this.shader_vertex = this.compile_shader(this.shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
      this.shader_fragment = this.compile_shader(this.shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");
  
      this.SHADER_PROGRAM = GL.createProgram();
  
      GL.attachShader(this.SHADER_PROGRAM, this.shader_vertex);
      GL.attachShader(this.SHADER_PROGRAM, this.shader_fragment);
    
      GL.linkProgram(this.SHADER_PROGRAM);
  
      this._Pmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Pmatrix");
      this._Vmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Vmatrix");
      this._Mmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Mmatrix");
  
      this._sampler = GL.getUniformLocation(this.SHADER_PROGRAM, "sampler");
  
      this._color = GL.getAttribLocation(this.SHADER_PROGRAM, "uv");
      this._position = GL.getAttribLocation(this.SHADER_PROGRAM, "position");
  
      GL.enableVertexAttribArray(this._color);
      GL.enableVertexAttribArray(this._position);
    
      GL.useProgram(this.SHADER_PROGRAM);
      GL.uniform1i(this._sampler, 0);
  
      this.CUBE_VERTEX= GL.createBuffer();
      this.CUBE_FACES = GL.createBuffer();
      
      GL.bindBuffer(GL.ARRAY_BUFFER, this.CUBE_VERTEX);
      GL.bufferData(GL.ARRAY_BUFFER,new Float32Array(this.cube_vertex),GL.STATIC_DRAW);
      
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.CUBE_FACES);
      GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.cube_faces),
      GL.STATIC_DRAW);
  
      // this.texture = LIBS.loadTexture("wall.jpg"); //texture.png atau wall.jpg
    }
  
    setTexture(string){
      this.texture = LIBS.loadTexture(string);
    }
    
    setuniformmatrix4(PROJMATRIX,VIEWMATRIX){
      GL.useProgram(this.SHADER_PROGRAM);
      GL.uniformMatrix4fv(this._Pmatrix, false, PROJMATRIX);
      GL.uniformMatrix4fv(this._Vmatrix, false, VIEWMATRIX);
      GL.uniformMatrix4fv(this._Mmatrix, false, this.MOVEMATRIX);
      
    }
    draw(){
      GL.useProgram(this.SHADER_PROGRAM);
      GL.activeTexture(GL.TEXTURE0);
      GL.bindTexture(GL.TEXTURE_2D, this.texture);
      
      GL.bindBuffer(GL.ARRAY_BUFFER, this.CUBE_VERTEX);
      GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 4*(3+2), 0);
      GL.vertexAttribPointer(this._color, 2, GL.FLOAT, false, 4*(3+2), 3*4);
  
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.CUBE_FACES);
      GL.drawElements(GL.TRIANGLE_STRIP, this.cube_faces.length, GL.UNSIGNED_SHORT, 0);
      //  GL.drawArrays(GL.TRIANGLES, 0, this.cube_vertex.length/6);
      for(let i = 0;i<this.child.length;i++){
        this.child[i].draw();
      }
    }
    getMoveMatrix(){
      return this.MOVEMATRIX;
    }
    setRotateMove(phi,theta,r){
      LIBS.rotateZ(this.MOVEMATRIX,r);
      LIBS.rotateY(this.MOVEMATRIX, theta);
      LIBS.rotateX(this.MOVEMATRIX, phi);
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

    setPosition(x1, y1, z1, x2, y2, z2) {
		this.setIdentityMove();
		this.setRotateMove(x1, y1, z1);
		this.setTranslateMove(x2, y2, z2);
	}

    setResponsiveRotation(PHI, THETA) {
		var temps = LIBS.get_I4();
		LIBS.rotateX(temps, PHI);
		this.MOVEMATRIX = LIBS.mul(this.MOVEMATRIX, temps);

		LIBS.rotateY(temps, THETA);
		this.MOVEMATRIX = LIBS.mul(this.MOVEMATRIX, temps);
	}

    scale(m){
        var parentMatrixBefore = LIBS.cloneMatrix(this.MOVEMATRIX);
        var matM = [
            m, 0, 0, 0,
            0, m, 0, 0,
            0, 0, m, 0,
            0, 0, 0, 1
        ]
        this.MOVEMATRIX = LIBS.mul(this.MOVEMATRIX, matM);
        // LIBS.translateZ(this.MOVEMATRIX,parentMatrixBefore[14]);
        // LIBS.translateY(this.MOVEMATRIX,parentMatrixBefore[13]);
        // LIBS.translateX(this.MOVEMATRIX,parentMatrixBefore[12]);
        this.MOVEMATRIX[12] = parentMatrixBefore[12];
        this.MOVEMATRIX[13] = parentMatrixBefore[13];
        this.MOVEMATRIX[14] = parentMatrixBefore[14];
        for (let i = 0; i < this.child.length; i++) {
            let child = this.child[i];
            child.scale(m)
		}
  }
}

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
        
        //Iterasi melalui objek anak
        for (let i = 0; i < this.child.length; i++) {
            let child = this.child[i];
            
            // Hitung posisi relatif objek anak terhadap rotasi objek induk sebelum rotasi
            var relativePosition = [
                child.MOVEMATRIX[12] - parentMatrixBefore[12],
                child.MOVEMATRIX[13] - parentMatrixBefore[13],
                child.MOVEMATRIX[14] - parentMatrixBefore[14]
            ];

            // Terapkan rotasi yang sama dengan objek induk pada objek anak
            child.MOVEMATRIX = LIBS.cloneMatrix(this.MOVEMATRIX);
    
            // Terapkan posisi relatif pada posisi rotasi objek anak setelah rotasi objek induk
            child.MOVEMATRIX[12] = this.MOVEMATRIX[12] + relativePosition[0];
            child.MOVEMATRIX[13] = this.MOVEMATRIX[13] + relativePosition[1];
            child.MOVEMATRIX[14] = this.MOVEMATRIX[14] + relativePosition[2];
        }

        //______________________________NYOBA________________________
        // var parentMatrixBefore = LIBS.cloneMatrix(this.MOVEMATRIX);
        // LIBS.translateZ(this.MOVEMATRIX,parentMatrixBefore[14]);
        // LIBS.translateY(this.MOVEMATRIX,parentMatrixBefore[13]);
        // LIBS.translateX(this.MOVEMATRIX,parentMatrixBefore[12]);

        // var matRotZ = [
        //     Math.cos(r), Math.sin(r), 0, 0,
        //     -Math.sin(r), Math.cos(r), 0, 0,
        //     0, 0, 1, 0,
        //     0, 0, 0, 1
        // ]

        // this.MOVEMATRIX = LIBS.mul(this.MOVEMATRIX, matRotZ);

        // var matRotY = [
        //     Math.cos(THETA), 0, -Math.sin(THETA), 0,
        //     0, 1, 0, 0,
        //     Math.sin(THETA), 0, Math.cos(THETA), 0,
        //     0, 0, 0, 1
        // ]

        // this.MOVEMATRIX = LIBS.mul(this.MOVEMATRIX, matRotY);

        // var matRotX = [
        //     1, 0, 0, 0,
        //     0, Math.cos(PHI), Math.sin(PHI), 0,
        //     0, -Math.sin(PHI), Math.cos(PHI), 0,
        //     0, 0, 0, 1
        // ]

        // this.MOVEMATRIX = LIBS.mul(this.MOVEMATRIX, matRotX);


        // LIBS.translateZ(this.MOVEMATRIX,-parentMatrixBefore[14]);
        // LIBS.translateY(this.MOVEMATRIX,-parentMatrixBefore[13]);
        // LIBS.translateX(this.MOVEMATRIX,-parentMatrixBefore[12]);

        // for (var i = 0; i < this.child.length; i++) {
        //     var child = this.child[i];
        //     child.rotate(PHI,THETA,r);
        // }
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

    scale(m){
        var parentMatrixBefore = LIBS.cloneMatrix(this.MOVEMATRIX);
        var matM = [
            m, 0, 0, 0,
            0, m, 0, 0,
            0, 0, m, 0,
            0, 0, 0, 1
        ]
        this.MOVEMATRIX = LIBS.mul(this.MOVEMATRIX, matM);
        // LIBS.translateZ(this.MOVEMATRIX,parentMatrixBefore[14]);
        // LIBS.translateY(this.MOVEMATRIX,parentMatrixBefore[13]);
        // LIBS.translateX(this.MOVEMATRIX,parentMatrixBefore[12]);
        this.MOVEMATRIX[12] = parentMatrixBefore[12];
        this.MOVEMATRIX[13] = parentMatrixBefore[13];
        this.MOVEMATRIX[14] = parentMatrixBefore[14];
        for (let i = 0; i < this.child.length; i++) {
            let child = this.child[i];
            child.scale(m)
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

    setPosition(x1, y1, z1, x2, y2, z2) {
		this.setIdentityMove();
		this.setRotateMove(x1, y1, z1);
		this.setTranslateMove(x2, y2, z2);
	}

    setResponsiveRotation(PHI, THETA) {
		var temps = LIBS.get_I4();
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

function rotateArbitary(parent){
    var res = []
    for(var i = 0; i < 720; i+=0.1){
        var x = 1.5*Math.cos(i) + parent.MOVEMATRIX[12]
        var z = 1.5*Math.sin(i) + parent.MOVEMATRIX[14]
        res.push(x);
        res.push(z);
    }
    return res;
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

    var shader_vertex_source_texture = "\n\
    attribute vec3 position;\n\
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;\n\
    attribute vec2 uv;\n\
    varying vec2 vUV;\n\
    \n\
    void main(void) {\n\
    gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);\n\
    vUV=uv;\n\
    }";
    
      var shader_fragment_source_texture = "\n\
    precision mediump float;\n\
    uniform sampler2D sampler;\n\
    varying vec2 vUV;\n\
    \n\
    \n\
    void main(void) {\n\
    gl_FragColor = texture2D(sampler, vUV);\n\
    //gl_FragColor = vec4(1.,1.,1.,1.);\n\
    }";
  
    var cube_vertex_texture = [
        -1,-1,-1,    0,0,
        1,-1,-1,     1,0,
        1, 1,-1,     1,1,
        -1, 1,-1,    0,1,
    
        -1,-1, 1,    0,0,
        1,-1, 1,     1,0,
        1, 1, 1,     1,1,
        -1, 1, 1,    0,1,
    
        -1,-1,-1,    0,0,
        -1, 1,-1,    1,0,
        -1, 1, 1,    1,1,
        -1,-1, 1,    0,1,
    
        1,-1,-1,     0,0,
        1, 1,-1,     1,0,
        1, 1, 1,     1,1,
        1,-1, 1,     0,1,
    
        -1,-1,-1,    0,0,
        -1,-1, 1,    1,0,
        1,-1, 1,     1,1,
        1,-1,-1,     0,1,
    
        -1, 1,-1,    0,0,
        -1, 1, 1,    1,0,
        1, 1, 1,     1,1,
        1, 1,-1,     0,1
      ];
    
    var cube_faces_texture = [
        0,1,2,
        0,2,3,
    
        4,5,6,
        4,6,7,
    
        8,9,10,
        8,10,11,
    
        12,13,14,
        12,14,15,
    
        16,17,18,
        16,18,19,
    
        20,21,22,
        20,22,23
    
      ];

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
    var pitaBrownVertex = tabungVertex(0.1,0.1,0.0,0.0,0.0,0.15,253/255,216/255,56/255);
    var pitaBrownFaces = tabungFaces();
    var pitaBrown = new MyObject(pitaBrownVertex, pitaBrownFaces, shader_vertex_source, shader_fragment_source);
    var pitaBrown2 = new MyObject(pitaBrownVertex, pitaBrownFaces, shader_vertex_source, shader_fragment_source);
    var controlPoints = [-0.22968750000000004, 0.16239316239316237, -0.24375000000000002, 0.20683760683760688, -0.29218750000000004, 0.1760683760683761, -0.321875, 0.09401709401709402, -0.33906250000000004, -0.022222222222222143, -0.334375, -0.11111111111111116, -0.2953125, -0.20683760683760677, -0.24375000000000002, -0.2547008547008547, -0.15625, -0.2957264957264958, -0.109375, -0.2547008547008547, -0.06874999999999998, -0.18290598290598292, -0.051562499999999956, -0.11794871794871797, -0.028124999999999956, 0.00512820512820511, -0.026562500000000044, 0.03931623931623929, -0.018750000000000044, 0.11111111111111116, -0.015625, 0.16239316239316237, 0.0015624999999999112, 0.27521367521367524, 0.004687499999999956, 0.32307692307692304, 0.004687499999999956, 0.4290598290598291, 0.006250000000000089, 0.5042735042735043, -0.004687499999999956, 0.576068376068376, -0.025000000000000022, 0.6307692307692307, -0.043749999999999956, 0.6820512820512821, -0.06406250000000002, 0.7162393162393162, -0.10468750000000004, 0.7401709401709402, -0.15312499999999996, 0.7435897435897436, -0.18437499999999996, 0.7435897435897436, -0.23281249999999998, 0.72991452991453, -0.271875, 0.7094017094017093, -0.3203125, 0.6547008547008547, -0.353125, 0.6170940170940171, -0.4046875, 0.5111111111111111, -0.4453125, 0.4256410256410257, -0.46875, 0.36068376068376073, -0.48124999999999996, 0.31965811965811963, -0.48750000000000004, 0.2205128205128205, -0.4921875, 0.14529914529914534, -0.49687499999999996, 0.0871794871794872, -0.503125, -0.029059829059828957, -0.50625, -0.10085470085470094, -0.509375, -0.217094017094017, -0.5125, -0.2991452991452992, -0.53125, -0.37777777777777777, -0.5421875, -0.45982905982905975, -0.553125, -0.5282051282051281, -0.571875, -0.593162393162393, -0.615625, -0.6376068376068376, -0.684375, -0.6752136752136753, -0.759375, -0.6307692307692307, -0.7890625, -0.4735042735042736];
    for(var i = 0; i < controlPoints.length; i++){
        controlPoints[i] *= 0.3;
    }
    // generateTube(x, y, outerRad, innerRad, height, segments, r,g,b)
    var itemBrownData = generateTube(0.1,0.1,0.1,0.1,0.1,5,10,253/255,216/255,56/255);
    var itemBrownVertex = itemBrownData.vertices;
    var itemBrownFaces = itemBrownData.faces
    var itemBrown = new MyObject(itemBrownVertex, itemBrownFaces, shader_vertex_source,shader_fragment_source);
    itemBrown.addCurve(controlPoints.length);
    var ballVertex = sphereVertex(0.1,0.2,0.1,51/255, 148/255, 46/255);
    var ballFaces = sphereFaces();
    var ball = new MyObject(ballVertex, ballFaces, shader_vertex_source, shader_fragment_source);
    // -----------------------------------------------------END BROWN PUNYA TIMOTHY-----------------------------------

    //_______________________CONY CANTIKKKK_______________________

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

    //pita di kepala
    var headOrnamentVertex = tabungVertex(0.12,0.12,0.015,0.015,0,0.12,255,0,0);
    var headOrnamentFaces = tabungFaces();
    var headOrnament = new MyObject(headOrnamentVertex,headOrnamentFaces,shader_vertex_source,shader_fragment_source);
    var headOrnament1 = new MyObject(headOrnamentVertex,headOrnamentFaces,shader_vertex_source,shader_fragment_source);

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

    //Pita Curve
    var controlPointsCony = [-0.4078125, 0.7606837606837606, -0.4078125, 0.764102564102564, -0.41718750000000004, 0.764102564102564, -0.44843750000000004, 0.770940170940171, -0.4703125, 0.770940170940171, -0.4859375, 0.770940170940171, -0.5125, 0.7504273504273504, -0.534375, 0.7367521367521368, -0.5515625, 0.7196581196581197, -0.5625, 0.7059829059829059, -0.5828125, 0.6752136752136753, -0.6, 0.6341880341880342, -0.609375, 0.6, -0.61875, 0.558974358974359, -0.621875, 0.535042735042735, -0.6328125, 0.4837606837606837, -0.6421875, 0.44957264957264953, -0.646875, 0.4256410256410257, -0.65, 0.3914529914529915, -0.65, 0.37777777777777777, -0.6515625, 0.3025641025641026, -0.65, 0.28547008547008546, -0.6484375, 0.2581196581196581, -0.640625, 0.2170940170940171, -0.634375, 0.18632478632478633, -0.628125, 0.15555555555555556, -0.621875, 0.135042735042735, -0.6015625, 0.09401709401709402, -0.575, 0.04957264957264962, -0.565625, 0.03931623931623929, -0.5515625, 0.032478632478632474, -0.540625, 0.029059829059829068, -0.525, 0.018803418803418848, -0.50625, 0.018803418803418848, -0.475, 0.018803418803418848, -0.4390625, 0.02564102564102566, -0.40937500000000004, 0.052991452991453025, -0.38593750000000004, 0.10427350427350424, -0.38125, 0.1282051282051282, -0.37812500000000004, 0.15555555555555556, -0.375, 0.20341880341880347, -0.375, 0.2512820512820513, -0.384375, 0.28547008547008546, -0.3984375, 0.305982905982906, -0.40937500000000004, 0.3094017094017094, -0.42656249999999996, 0.305982905982906, -0.44843750000000004, 0.27863247863247864, -0.46562499999999996, 0.2547008547008547, -0.48124999999999996, 0.20683760683760688, -0.49375, 0.17948717948717952,
        -0.5,
        0.1316239316239316,
        -0.5015625,
        0.10427350427350424,
        -0.49375,
        0.03589743589743588,
        -0.4828125,
        -0.07008547008547006,
        -0.475,
        -0.135042735042735,
        -0.4625,
        -0.18974358974358974,
        -0.446875,
        -0.23418803418803424,
        -0.43437499999999996,
        -0.288888888888889
    ];
    for(var i = 0; i < controlPointsCony.length; i++){
        controlPointsCony[i] *= 0.6;
    }
    // generateTube(x, y, outerRad, innerRad, height, segments, r,g,b)
    var itemConyData = generateTube(0.1,0.1,0.1,0.1,0.1,5,10,253/255,216/255,56/255);
    var itemConyVertex = itemConyData.vertices;
    var itemConyFaces = itemConyData.faces
    var itemCony = new MyObject(itemConyVertex, itemConyFaces, shader_vertex_source,shader_fragment_source);
    itemCony.addCurve(controlPointsCony.length);

    //fan
    var fan1_vertex = sphereVertex(0.15,0.025,0.025,255,119/255,28/255);
    var fan_faces = sphereFaces();
    var fan = new MyObject(fan1_vertex, fan_faces, shader_vertex_source, shader_fragment_source);
    var fan1 = new MyObject(fan1_vertex, fan_faces, shader_vertex_source, shader_fragment_source);

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


    // ______________________________________________________ START JESSICA ______________________________________________________

    // Kepala
    var jessicaHead_vertex = sphereVertex(0.55,0.5,0.5, 255, 255, 255);
    var jessicaHead_faces = sphereFaces();
    var jessicaHead = new MyObject(jessicaHead_vertex, jessicaHead_faces, shader_vertex_source, shader_fragment_source);

    // Kepala 2
    var jessicaHead2_vertex = sphereVertex(0.45,0.5,0.5, 0, 0, 0);
    var jessicaHead2_faces = sphereFaces();
    var jessicaHead2 = new MyObject(jessicaHead2_vertex, jessicaHead2_faces, shader_vertex_source, shader_fragment_source);

    // topi
    var topiJessicaVertex = tabungVertex(0.13, 0.13, 0.005, 0.005, 0.0, 0.3,255/255,175/255,190/255);
    var topiJessicaFaces = tabungFaces();
    var topiJessica = new MyObject(topiJessicaVertex, topiJessicaFaces, shader_vertex_source, shader_fragment_source);
    // bawah topi
    var bawahTopiJessicaVertex = tabungVertex(0.15,0.15, 0.15,0.15, 0.0, 0.1, 215/255,80/255,123/255);
    var bawahTopiJessicaFaces = tabungFaces();
    var bawahTopiJessica = new MyObject(bawahTopiJessicaVertex, bawahTopiJessicaFaces, shader_vertex_source, shader_fragment_source);

    // Kuping 
    var kupingJessica1_vertex = sphereVertex(0.145, 0.395, 0.15, 0, 0, 0);
    var kupingJessica2_vertex = sphereVertex(0.145, 0.395, 0.15, 255, 255, 255);
    var kupingJessica1_faces = sphereFaces();
    var kupingJessica1 = new MyObject(kupingJessica2_vertex, kupingJessica1_faces, shader_vertex_source, shader_fragment_source);
    var kupingJessica2 = new MyObject(kupingJessica1_vertex, kupingJessica1_faces, shader_vertex_source, shader_fragment_source);

    // Eye
    var eyeJessica_vertex = sphereVertex(0.01, 0.01, 0.01, 0, 0, 0);
    var eyeJessica_faces = sphereFaces();
    var eyeJessica = new MyObject(eyeJessica_vertex, eyeJessica_faces, shader_vertex_source, shader_fragment_source);
    eyeJessica.addCurve(60);

    // Nose
    // var noseJessica_vertex = sphereVertex(0.07, 0.0375, 0.05, 0, 0, 0);
    // var noseJessica_faces = sphereFaces();
    // var noseJessica = new MyObject(noseJessica_vertex, noseJessica_faces, shader_vertex_source, shader_fragment_source);


    // garis mulut
    var garisJessica1Vertex = tabungVertex(0.007,0.007,0.007,0.007,-0.09,0.01,0,0,0);
    var garisJessica1Faces = tabungFaces();
    var garisJessica1 = new MyObject(garisJessica1Vertex, garisJessica1Faces, shader_vertex_source, shader_fragment_source);

    var garisJessica2Vertex = tabungVertex(0.01,0.01,0.01,0.01,0.02,0.1,0,0,0);
    var garisJessica2Faces = tabungFaces();
    var garisJessica2 = new MyObject(garisJessica2Vertex, garisJessica2Faces, shader_vertex_source, shader_fragment_source);

    var garisJessica3Vertex = tabungVertex(0.01,0.01,0.01,0.01,0.02,0.1,0,0,0);
    var garisJessica3Faces = tabungFaces();
    var garisJessica3 = new MyObject(garisJessica3Vertex, garisJessica3Faces, shader_vertex_source, shader_fragment_source);

    // Mouth
    var smileJessicaVertex = tabungVertex(0.01,0.01,0.01,0.01,0,0.01,139/255,0/255,0/255);
    var smileJessicaFaces = tabungFaces();
    var smileJessica = new MyObject(smileJessicaVertex,smileJessicaFaces,shader_vertex_source,shader_fragment_source);
    smileJessica.addCurve(100);

    // Neck
    var neckJessica_vertex = tabungVertex(0.35,0.35,0.25,0.3,0,-0.1,215/255,80/255,123/255);
    var neckJessica_faces = tabungFaces();
    var neckJessica = new MyObject(neckJessica_vertex, neckJessica_faces, shader_vertex_source, shader_fragment_source); 

    // Body
    var bodyJessica_vertex = tabungVertex(0.15,0.15,0.35,0.5,0.15,-0.375,255,175/255,190/255);
    var bodyJessica_faces = tabungFaces();
    var bodyJessica = new MyObject(bodyJessica_vertex, bodyJessica_faces, shader_vertex_source, shader_fragment_source);

    //ribbon
    var ribbonJessica_vertex = tabungVertex(0.05,0.05,0.06,0.06,-0.5,-0.65,255,175/255,190/255);
    var ribbonJessica_faces = tabungFaces();
    var ribbonJessica1 = new MyObject(ribbonJessica_vertex, ribbonJessica_faces, shader_vertex_source, shader_fragment_source);
    var ribbonJessica2 = new MyObject(ribbonJessica_vertex, ribbonJessica_faces, shader_vertex_source, shader_fragment_source);

    //  Pita
    var pitaJessicaVertex = tabungVertex(0.1,0.1,0.0,0.0,0.0,0.15,253/255,216/255,56/255);
    var pitaJessicaFaces = tabungFaces();
    var pitaJessica1 = new MyObject(pitaJessicaVertex, pitaJessicaFaces, shader_vertex_source, shader_fragment_source);
    var pitaJessica2 = new MyObject(pitaJessicaVertex, pitaJessicaFaces, shader_vertex_source, shader_fragment_source);

    //stomach
    var stomachJessica_vertex = tabungVertex(0.3,0.3,0.3,0.3,-0.375,-0.5,215/255,80/255,123/255);
    var stomachJessica_faces = tabungFaces();
    var stomachJessica = new MyObject(stomachJessica_vertex, stomachJessica_faces, shader_vertex_source, shader_fragment_source);



    //pant
    var pantJessica_vertex = tabungVertex(0.16875,0.16875,0.175,0.175,-0.5,-0.65,0,0,0);
    var pantJessica_faces = tabungFaces();
    var pantJessica1 = new MyObject(pantJessica_vertex, pantJessica_faces, shader_vertex_source, shader_fragment_source);
    var pantJessica2 = new MyObject(pantJessica_vertex, pantJessica_faces, shader_vertex_source, shader_fragment_source);

    //leg
    var legJessica_vertex = tabungVertex(0.16875,0.16875,0.175,0.175,-0.65,-0.75,108/255,70/255,57/255);
    var legJessica_faces = tabungFaces();
    var legJessica1 = new MyObject(legJessica_vertex, legJessica_faces, shader_vertex_source, shader_fragment_source);
    var legJessica2 = new MyObject(legJessica_vertex, legJessica_faces, shader_vertex_source, shader_fragment_source);

    //legthumb
    var legthumbJessica_vertex = sphereVertex(0.1475,0.1,0.2,108/255,70/255,57/255);
    var legthumbJessica_faces = sphereFaces();
    var legthumbJessica1 = new MyObject(legthumbJessica_vertex, legthumbJessica_faces, shader_vertex_source, shader_fragment_source);
    var legthumbJessica2 = new MyObject(legthumbJessica_vertex, legthumbJessica_faces, shader_vertex_source, shader_fragment_source);

    //arm
    var armJessica_vertex = tabungVertex(0.125,0.125,0.1,0.1,-0.15,-0.45,255,255,255);
    var armJessica_faces = tabungFaces();
    var armJessica1 = new MyObject(armJessica_vertex, armJessica_faces, shader_vertex_source, shader_fragment_source);
    var armJessica2 = new MyObject(armJessica_vertex, armJessica_faces, shader_vertex_source, shader_fragment_source);

    //palm
    var palmJessica_vertex = sphereVertex(0.08,0.12,0.08,215/255,80/255,123/255);
    var palmJessica_faces = sphereFaces();
    var palmJessica1 = new MyObject(palmJessica_vertex, palmJessica_faces, shader_vertex_source, shader_fragment_source);
    var palmJessica2 = new MyObject(palmJessica_vertex, palmJessica_faces, shader_vertex_source, shader_fragment_source);

    //tail
    var tailJessica_vertex = sphereVertex(0.145, 0.295, 0.05, 255, 255, 255);
    var tailJessica_faces = sphereFaces();
    var tailJessica = new MyObject(tailJessica_vertex, tailJessica_faces, shader_vertex_source, shader_fragment_source);

    // Wings
    var WingsJessica_vertex = sphereVertex(0.1, 0.755, 0.05, 255/255,255/255,255/255);
    var WingsJessicaShorter_vertex = sphereVertex(0.1, 0.655, 0.05, 255/255,255/255,255/255);
    var WingsJessicaShortest_vertex = sphereVertex(0.1, 0.555, 0.05, 255/255,255/255,255/255);

    var WingsJessica2_vertex = sphereVertex(0.12, 0.755, 0.05, 215/255,80/255,123/255);
    var WingsJessica2Shorter_vertex = sphereVertex(0.12, 0.655, 0.05, 215/255,80/255,123/255);
    var WingsJessica2Shortest_vertex = sphereVertex(0.12, 0.555, 0.05, 215/255,80/255,123/255);

    var WingsJessica_faces = sphereFaces();
    
    var WingJessica1 = new MyObject(WingsJessica_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessica2 = new MyObject(WingsJessica_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessica3 = new MyObject(WingsJessicaShorter_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessica4 = new MyObject(WingsJessicaShorter_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessica5 = new MyObject(WingsJessicaShortest_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessica6 = new MyObject(WingsJessicaShortest_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessicaOutline1 = new MyObject(WingsJessica2_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessicaOutline2 = new MyObject(WingsJessica2_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessicaOutline3 = new MyObject(WingsJessica2Shorter_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessicaOutline4 = new MyObject(WingsJessica2Shorter_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessicaOutline5 = new MyObject(WingsJessica2Shortest_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);
    var WingJessicaOutline6 = new MyObject(WingsJessica2Shortest_vertex, WingsJessica_faces, shader_vertex_source, shader_fragment_source);


    
    // ______________________________________________________ END JESSICA ______________________________________________________

    // -------------------------------------------------------ENVIRONMENT--------------------------------------------
    var environmentVertex = cube_vertex_texture;
    var environmentFaces = cube_faces_texture;
    var environment1 = new MyObjectTexture(environmentVertex, environmentFaces, shader_vertex_source_texture, shader_fragment_source_texture);
    environment1.setTexture("lantai.png");
    var tembok_samping = new MyObjectTexture(environmentVertex, environmentFaces, shader_vertex_source_texture, shader_fragment_source_texture);
    var tembok_samping2 = new MyObjectTexture(environmentVertex, environmentFaces, shader_vertex_source_texture, shader_fragment_source_texture);
    var tembok_belakang = new MyObjectTexture(environmentVertex, environmentFaces, shader_vertex_source_texture, shader_fragment_source_texture);
    tembok_samping.setTexture("tembok samping.png");
    tembok_samping2.setTexture("tembok samping.png");
    tembok_belakang.setTexture("tembok depan.png");
    // ___________________________ START KUE TART___________________________
    var baseTartVertex = tabungVertex(0.5,0.5,0.5,0.5,-0.15,0.45,248/255,248/255,255);
    var baseTartFaces = tabungFaces();
    var baseTart = new MyObject(baseTartVertex, baseTartFaces, shader_vertex_source, shader_fragment_source);

    var tart1Vertex = tabungVertex(0.3,0.3,0.3,0.3,-0.15,0.45,248/255,248/255,255);
    var tart1Faces = tabungFaces();
    var tart1 = new MyObject(tart1Vertex, tart1Faces, shader_vertex_source, shader_fragment_source);
    var lowerBaseTartVertex = tabungVertex(0.9,0.9,0.9,0.9,-0.15,0.45,248/255,248/255,255);
    var lowerBaseTartFaces = tabungFaces();
    var lowerBaseTart = new MyObject(lowerBaseTartVertex, lowerBaseTartFaces, shader_vertex_source, shader_fragment_source);
    var lowerBaseTartDecorVertex = tabungVertex(0.95,0.95,0.95,0.95,0.2,0.45,248/255,0,31/255);
    var lowerBaseTartDecor = new MyObject(lowerBaseTartDecorVertex, lowerBaseTartFaces, shader_vertex_source, shader_fragment_source);
    var cherryVertex = halfSphereVertex(0.1,0.1,0.4,198/255,0,23/255);
    var cherryFaces = halfSphereFaces();
    var cherry = new MyObject(cherryVertex, cherryFaces, shader_vertex_source, shader_fragment_source);
    for(var i = 0; i < 8; i++){
        cherry.addChild(new MyObject(cherryVertex, cherryFaces, shader_vertex_source, shader_fragment_source));
    }

    var lilinVertex = tabungVertex(0.05,0.05,0.05,0.05,0,0.3,127/255,87/255,181/255);
    var lilinFaces = tabungFaces();
    var lilin = new MyObject(lilinVertex, lilinFaces, shader_vertex_source, shader_fragment_source);
    for (var i = 0; i < 8; i++){
        lilin.addChild(new MyObject(lilinVertex, lilinFaces, shader_vertex_source, shader_fragment_source));
    }

    var topperData = generateTube(0,0,0.2,0.2,0.1,6,251/255,251/255,63/255);
    var topper2Data = generateTube(0,0,0.1,0.1,0.1,6,250/255,157/255,46/255);
    var topper = new MyObject(topperData.vertices, topperData.faces, shader_vertex_source, shader_fragment_source);
    var topper2 = new MyObject(topper2Data.vertices, topper2Data.faces, shader_vertex_source, shader_fragment_source);

    var plateVertex = tabungVertex(0.5,0.5,1.2,1.2,0,0.3,124/255,136/255,242/255);
    var plateFaces = tabungFaces();
    var plate = new MyObject(plateVertex, plateFaces, shader_vertex_source, shader_fragment_source);

    var tableVertex = cubeVertex(1,0.5,1,143/255, 81/255, 43/255);
    var tableFaces = cubeFaces();
    var table = new MyObject(tableVertex, tableFaces, shader_vertex_source, shader_fragment_source);
    var drawerVertex = cubeVertex(0.3,0.3,0.7,92/255, 48/255, 21/255);
    var drawer1 = new MyObject(drawerVertex, tableFaces, shader_vertex_source, shader_fragment_source);
    var drawer2 = new MyObject(drawerVertex, tableFaces, shader_vertex_source, shader_fragment_source);
    

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
    var balonBottom4 = new MyObject(tabungVertex(0.05,0.05,0.45,0.45,0,0.7,48/255, 120/255, 87/255),balonBottomFaces,shader_vertex_source,shader_fragment_source);
    var balonUp4 = new MyObject(sphereVertex(0.5,0.5,0.7,48/255, 120/255, 87/255),balonUpFaces,shader_vertex_source,shader_fragment_source);
    var balonBottom5 = new MyObject(tabungVertex(0.05,0.05,0.45,0.45,0,0.7,160/255, 121/255, 176/255),balonBottomFaces,shader_vertex_source,shader_fragment_source);
    var balonUp5 = new MyObject(sphereVertex(0.5,0.5,0.7,160/255, 121/255, 176/255),balonUpFaces,shader_vertex_source,shader_fragment_source);
    var balonBottom6 = new MyObject(tabungVertex(0.05,0.05,0.45,0.45,0,0.7,50/255,245/255,219/255),balonBottomFaces,shader_vertex_source,shader_fragment_source);
    var balonUp6 = new MyObject(sphereVertex(0.5,0.5,0.7,50/255,245/255,219/255),balonUpFaces,shader_vertex_source,shader_fragment_source);

    //_______________________________________TALI_____________________________________
    var taliVertex = tabungVertex(0.05,0.05,0.05,0.05,0,0.05,0,0,0);
    var taliFaces = tabungFaces();
    var tali = new MyObject(taliVertex,taliFaces,shader_vertex_source,shader_fragment_source);
    tali.addCurve(350);

    //_______________________BENDERA_______________
    var bendera = new MyObject(segitigaVertex(245/255,255/255,151/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera1 = new MyObject(segitigaVertex(151/255,245/255,255/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera2 = new MyObject(segitigaVertex(151/255,255/255,196/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera3 = new MyObject(segitigaVertex(255/255,217/255,151/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera4 = new MyObject(segitigaVertex(255/255,151/255,189/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera5 = new MyObject(segitigaVertex(245/255,255/255,151/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);
    var bendera6 = new MyObject(segitigaVertex(151/255,245/255,255/255),segitigaFaces(),shader_vertex_source,shader_fragment_source);

    // ___________________________ START square ___________________________
    var square = new MyObject(cubeVertex(0.1,3,3, 245/255,255/255,151/255),cubeFaces(),shader_vertex_source,shader_fragment_source);
    var square1 = new MyObject(cubeVertex(0.1,0.5,5, 129/255,133/255,129/255),cubeFaces(),shader_vertex_source,shader_fragment_source);

    // ___________________________ START GIFT ___________________________
    var gift = new MyObjectTexture(environmentVertex, environmentFaces, shader_vertex_source_texture, shader_fragment_source_texture);
    gift.setTexture("gift-texture.jpg");
    var pitaGiftVertex = tabungVertex(0.3,0.3,0.0,0.0,0.0,0.75, 139/255,0/255,0/255);
    var pitaGiftFaces = tabungFaces();
    var pitaGift1 = new MyObject(pitaGiftVertex, pitaGiftFaces, shader_vertex_source, shader_fragment_source);
    var pitaGift2 = new MyObject(pitaGiftVertex, pitaGiftFaces, shader_vertex_source, shader_fragment_source);
    var pita1 = new MyObject(cubeVertex(1.05,0.3,1.01, 0/255,135/255,62/255),cubeFaces(),shader_vertex_source,shader_fragment_source);
    var pita2 = new MyObject(cubeVertex(1.05,1.01,0.3, 0/255,135/255,62/255),cubeFaces(),shader_vertex_source,shader_fragment_source);
    // var square23 = new MyObject(cubeVertex(0.4,0.9,1.3, 255,255,189/255),cubeFaces(),shader_vertex_source,shader_fragment_source);

    // ____________________________START GIFT W LEONARD____________________________
    var giftLeonard = new MyObjectTexture(environmentVertex, environmentFaces, shader_vertex_source_texture, shader_fragment_source_texture);
    giftLeonard.setTexture("gift2.png");

    var leonardHeadVertex = sphereVertex(0.6,0.5,0.5,36/255,153/255,59/255);
    var kepalaBrownFaces = sphereFaces();
    var leonardHead = new MyObject(leonardHeadVertex, kepalaBrownFaces, shader_vertex_source, shader_fragment_source);

    var mataLeonardVertex = sphereVertex(0.2,0.3,0.3,36/255,153/255,59/255);
    var mataLeonardFaces = sphereFaces();
    var mataLeonard1 = new MyObject(mataLeonardVertex, mataLeonardFaces, shader_vertex_source, shader_fragment_source); 
    var mataLeonard2 = new MyObject(mataLeonardVertex, mataLeonardFaces, shader_vertex_source, shader_fragment_source); 

    var korneaLeonardVertex = sphereVertex(0.15,0.25,0.25,255,255,255);
    var korneaLeonardFaces = sphereFaces();
    var korneaLeonard1 = new MyObject(korneaLeonardVertex, korneaLeonardFaces, shader_vertex_source, shader_fragment_source);
    var korneaLeonard2 = new MyObject(korneaLeonardVertex, korneaLeonardFaces, shader_vertex_source, shader_fragment_source);

    var pupilVertex = sphereVertex(0.1,0.2,0.15,0,0,0);
    var pupil1 = new MyObject(pupilVertex, korneaLeonardFaces, shader_vertex_source, shader_fragment_source);
    var pupil2 = new MyObject(pupilVertex, korneaLeonardFaces, shader_vertex_source, shader_fragment_source);

    var hidung1 = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);
    var hidung2 = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);

    var mulutLeonardVertex = sphereVertex(0.3,0.15,0.1,143/255, 36/255, 14/255);
    var mulutLeonardFaces = sphereFaces();
    var smileLeonard = new MyObject(mulutLeonardVertex, mulutLeonardFaces, shader_vertex_source, shader_fragment_source);



    // ________________________________BEANS_____________________________________
    var beansVertex = sphereVertex(0.2,0.2,0.2,91/255,180/255,84/255);
    var beansFaces = sphereFaces();
    var beans1 = new MyObject(beansVertex, beansFaces, shader_vertex_source, shader_fragment_source);
    var beans2 = new MyObject(beansVertex, beansFaces, shader_vertex_source, shader_fragment_source);
    var beans3 = new MyObject(beansVertex, beansFaces, shader_vertex_source, shader_fragment_source);
    var eye1_vertex = sphereVertex(0.025, 0.025, 0.025, 0, 0, 0);
    var eye1_faces = sphereFaces();
    var eye1Beans = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);
    var eye2Beans = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);
    var eye3Beans = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);
    var eye4Beans = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);
    var eye5Beans = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);
    var eye6Beans = new MyObject(eye1_vertex, eye1_faces, shader_vertex_source, shader_fragment_source);  
    
    var mulutBeansVertex = sphereVertex(0.05,0.05,0.02,254/255,249/255,64/255);
    var mulutBeansFaces = sphereFaces();
    var mulutBeans1 = new MyObject(mulutBeansVertex, mulutBeansFaces, shader_vertex_source, shader_fragment_source);
    var mulutBeans2 = new MyObject(mulutBeansVertex, mulutBeansFaces, shader_vertex_source, shader_fragment_source);
    var mulutBeans3 = new MyObject(mulutBeansVertex, mulutBeansFaces, shader_vertex_source, shader_fragment_source);
    
    // ___________________________ END square ___________________________
    //MAtrix
    var PROJMATRIX = LIBS.get_projection(40,CANVAS.width/CANVAS.height, 1 ,100);
    var VIEWMATRIX = LIBS.get_I4(); 
    controlPointsTail = [-0.2882758620689655, 0.2547008547008547, -0.20827586206896553, 0.052991452991453025, -0.02344827586206899, -0.1384615384615384, 0.2744827586206897, -0.14529914529914523, 0.36275862068965514, 0.14871794871794874, 0.4565517241379311, 0.3948717948717949, 0.6468965517241378, 0.535042735042735, 0.8262068965517242, 0.3538461538461538];

    LIBS.translateZ(VIEWMATRIX,-10);

    //___________________________________________ADD CHILD_____________________________________
    kepalaBrown.addChild(telingaBrown1);
    kepalaBrown.addChild(itemBrown);
    kepalaBrown.addChild(ball);
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
    bodyBrown.addChild(pitaBrown);
    bodyBrown.addChild(pitaBrown2);

    //kepala
    object1.addChild(kuping1);
    kuping1.addChild(innerkuping1);
    object1.addChild(kuping2);
    kuping2.addChild(innerkuping2);
    object1.addChild(eye1);
    object1.addChild(eye2);
    object1.addChild(cheek1);
    object1.addChild(cheek2);
    object1.addChild(nose1);
    object1.addChild(nose2);
    object1.addChild(smileCony);
    object1.addChild(headOrnament);
    object1.addChild(headOrnament1);

    //badan
    object1.addChild(body);
    object1.addChild(neck);
    object1.addChild(ribbon1);
    object1.addChild(ribbon2);
    object1.addChild(itemCony);
    object1.addChild(fan);
    object1.addChild(fan1);
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
    arm1.addChild(palm1);
    object1.addChild(arm2);
    arm2.addChild(palm2);

    // ________________________________________ START JESSICA ADD CHILD _____________________________________

    jessicaHead.addChild(jessicaHead2);
    jessicaHead.addChild(topiJessica);
    jessicaHead.addChild(bawahTopiJessica);
    jessicaHead.addChild(kupingJessica1);
    jessicaHead.addChild(kupingJessica2);
    jessicaHead.addChild(eyeJessica);
    // jessicaHead.addChild(noseJessica);
    jessicaHead.addChild(garisJessica1);
    jessicaHead.addChild(garisJessica2);
    jessicaHead.addChild(garisJessica3);
    jessicaHead.addChild(smileJessica);
    jessicaHead.addChild(neckJessica);
    jessicaHead.addChild(bodyJessica);
    jessicaHead.addChild(ribbonJessica1);
    jessicaHead.addChild(ribbonJessica2);
    jessicaHead.addChild(pitaJessica1);
    jessicaHead.addChild(pitaJessica2);
    jessicaHead.addChild(stomachJessica);
    jessicaHead.addChild(pantJessica1);
    jessicaHead.addChild(pantJessica2);
    jessicaHead.addChild(legJessica1);
    jessicaHead.addChild(legJessica2);
    jessicaHead.addChild(legthumbJessica1);
    jessicaHead.addChild(legthumbJessica2);
    jessicaHead.addChild(armJessica1);
    jessicaHead.addChild(armJessica2);
    jessicaHead.addChild(palmJessica1);
    jessicaHead.addChild(palmJessica2);
    jessicaHead.addChild(tailJessica);
    jessicaHead.addChild(WingJessica1);
    jessicaHead.addChild(WingJessica2);
    jessicaHead.addChild(WingJessica3);
    jessicaHead.addChild(WingJessica4);
    jessicaHead.addChild(WingJessica5);
    jessicaHead.addChild(WingJessica6);
    jessicaHead.addChild(WingJessicaOutline1);
    jessicaHead.addChild(WingJessicaOutline2);
    jessicaHead.addChild(WingJessicaOutline3);
    jessicaHead.addChild(WingJessicaOutline4);
    jessicaHead.addChild(WingJessicaOutline5);
    jessicaHead.addChild(WingJessicaOutline6);
    // ________________________________________ END JESSICA ADD CHILD _____________________________________
    
    //____________________ENV_________________
    balonBottom.addChild(balonUp);
    balonBottom1.addChild(balonUp1);
    balonBottom2.addChild(balonUp2);
    balonBottom3.addChild(balonUp3);
    balonBottom4.addChild(balonUp4);
    balonBottom5.addChild(balonUp5);
    balonBottom6.addChild(balonUp6);

    bendera.addChild(bendera1);
    bendera.addChild(bendera2);
    bendera.addChild(bendera3);
    bendera.addChild(bendera4);
    bendera.addChild(bendera5);
    bendera.addChild(bendera6);

    square.addChild(square1);
    square.addChild(gift);
    square.addChild(pitaGift1);
    square.addChild(pitaGift2);
    square.addChild(pita1);
    square.addChild(pita2);
    // square.addChild(square23);

    baseTart.addChild(tart1);
    baseTart.addChild(lowerBaseTart);
    lowerBaseTart.addChild(cherry);
    lowerBaseTart.addChild(lowerBaseTartDecor);
    tart1.addChild(topper);
    topper.addChild(topper2);
    lowerBaseTart.addChild(plate);
    lowerBaseTart.addChild(table);
    tart1.addChild(lilin);
    table.addChild(drawer1);
    table.addChild(drawer2);
    beans1.addChild(beans2);
    beans1.addChild(beans3);

    beans1.addChild(eye1Beans);
    beans1.addChild(eye2Beans);
    beans2.addChild(eye3Beans);
    beans2.addChild(eye4Beans);
    beans3.addChild(eye5Beans);
    beans3.addChild(eye6Beans);

    beans1.addChild(mulutBeans1);
    beans2.addChild(mulutBeans2);
    beans3.addChild(mulutBeans3);

    leonardHead.addChild(mataLeonard1);
    leonardHead.addChild(mataLeonard2);
    mataLeonard1.addChild(korneaLeonard1);
    mataLeonard2.addChild(korneaLeonard2);
    korneaLeonard1.addChild(pupil1);
    korneaLeonard2.addChild(pupil2);

    leonardHead.addChild(hidung1);
    leonardHead.addChild(hidung2);
    leonardHead.addChild(smileLeonard);
    //______________________________ANIMASI___________________
    var conyJump = 0; //var utk translate Y
    var counter = 0;
    var conyUp = true;
    var jessicaFly = 0;
    var jessicaCanFly = true;
    var balonJump = 0;
    var balonJump1 = 0;
    var balonGeser = 0;
    var jugglingReverse = false;
    var juggling = 0.155;
    var jugglingY = 0;
    var fanRotate = 0;
    var pt = 0;
    var pupilup = true;
    var dummy = 0;
  
    //_____________________________________DRAWING_____________________________________
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
        kepalaBrown.setPosition(0,0,0,-2,0,0);
        telingaBrown1.setPosition(0,0,0, -1.75,0.4,0);
        telingaBrown2.setPosition(0,0,0,-2.25,0.4,0);
        inner1.setPosition(0,0,0, -1.75,0.4,0.05);
        inner2.setPosition(0,0,0,-2.25,0.4,0.05);
        mataBrown1.setPosition(0,0,0,-1.925,0.1,0.50);
        mataBrown2.setPosition(0,0,0,-2.075,0.1,0.50);
        mulutBrown.setPosition(0,0,0,-2.0,-0.065,0.5);
        hidungBrown.setPosition(0,0,0,-2,0.0,0.6);
        garisMulut1.setPosition(-Math.PI / 2,0,0, -2.0,-0.11,0.6);
        // garisMulut2.setPosition(0,-Math.PI / 2,Math.PI / 6, -2.0,-0.1,0.6)
        topiBrown.setPosition(-Math.PI / 2,0,0,-2,0.45,0.0);
        bawahTopiBrown.setPosition(-Math.PI/2,0,0,-2,0.45,0);
        bodyBrown.setPosition(4.71239,0,0,-2,-0.2,0.02);
        innerBadan.setPosition(4.71239,0,0,-2,-0.2,0.2);
        arm1Brown.setPosition(-Math.PI / 2 - 0.5,-0.5,0 ,-1.875,-0.375,0);
        arm2Brown.setPosition(Math.PI / 2 - 0.5,2.5,0,-2.125,-0.375,0);
        palm1Brown.setPosition(0,-0.7,1, -1.69,-0.7,0.175);
        palm2Brown.setPosition(0,0.7,-1,-2.378,-0.7,0.175);
        leg1Brown.setPosition(4.71239,0,0,-1.9,-0.30,0.1);
        leg2Brown.setPosition(4.71239,0,0,-2.1,-0.30,0.1);
        sepatuBrown1.setPosition(0,0,0,-1.9,-1.05,0.12);
        sepatuBrown2.setPosition(0,0,0,-2.1,-1.05,0.12);
        innerSepatuBrown1.setPosition(4.71239,0,0,-1.9,-0.35,0.12);
        innerSepatuBrown2.setPosition(4.71239,0,0,-2.1,-0.35,0.12);
        garis.setPosition(4.71239,0,0,-2.05,-0.85,0.34);
        garis2.setPosition(4.71239,0,0,-1.990,-0.85,0.35);
        garis3.setPosition(4.71239,0,0,-1.930,-0.85,0.33);
        garis4.setPosition(4.71239,0,0,-1.930,-1.04,0.28);
        garis5.setPosition(4.71239,0,0,-1.83,-1.04,0.25);
        garis6.setPosition(4.71239,0,0,-2.05,-1.04,0.28);
        garis7.setPosition(4.71239,0,0,-2.15,-1.04,0.26);
        kursi.setPosition(4.71239*3,0,0,-2,-0.42,-0.2);
        tiang.setPosition(4.71239,0,0,-2,-1.4,-0.2);
        bottomtiang.setPosition(4.71239,0,0,-2,-1.8,-0.2);
        boxSepeda.setPosition(0,0,0,-2,-1.45,-0.2);
        tanganRoda1.setPosition(0,0,0,-2.2,-1.77,-0.2);
        tanganRoda2.setPosition(0,0,0,-1.8,-1.77,-0.2);
        roda.setPosition(0,4.71239,0,-1.85,-2.1,-0.2);
        innerRoda.setPosition(0,0,0,-2,-2.1,-0.2);
        patternRoda.setPosition(0,4.71239,4.71239,-1.8115,-2.1,-0.2);
        pitaBrown2.setPosition(4.71239,4.71239,0,-1.9,-0.4,0.4);
        pitaBrown.setPosition(4.71239,-4.71239,0,-2.1,-0.4,0.4);
        itemBrown.setPosition(4.71239,0,0,controlPoints[i],controlPoints[i+1],0.9)
        for(var i = 0; i < itemBrown.child.length;i+=2){
            var xtemp = controlPoints[i];
            var ytemp = controlPoints[i+1];
            itemBrown.child[i].setPosition(4.71239,0,0,xtemp,ytemp,0.9);
        }
        itemBrown.scale(0.3);
        itemBrown.translate(-2.5,0.5,0);
        ball.setPosition(0,0,0,-2.5,0.5,0.5);


        object1.setPosition(0,0,0,0,0,0)
        kuping1.setPosition(0,0,0,0.15,0.4,0)
        kuping2.setPosition(0,0,0,-0.15,0.4,0)
        innerkuping1.setPosition(0,0,0,0.15,0.4,0.05)
        innerkuping2.setPosition(0,0,0,-0.15,0.4,0.05)
        eye1.setPosition(0,0,0,0.075,0.1,0.45)
        eye2.setPosition(0,0,0,-0.075,0.1,0.45)
        cheek1.setPosition(0,0,0,0.17,0,0.435)
        cheek2.setPosition(0,0,0,-0.17,0,0.435)
        headOrnament.setPosition(0,-1.5708,0,0.32,0.35,0.4);
        headOrnament1.setPosition(0,1.5708,0,0.1,0.35,0.4);
        nose1.setPosition(0,0,0,0,0,0.475)
        nose2.setPosition(0,0,0,0,0,0.477)
        smileCony.setPosition(0,0,0,-0.125,2.5*0.125*0.125-0.2,0.45)
        var xtemp = -0.125;
        for(var i = 0; i < smileCony.child.length;i++){
            xtemp += 0.0025;
            var ytemp = 2.5*xtemp*xtemp-0.2;
            smileCony.child[i].setPosition(0,0,0,xtemp,ytemp,0.45)
        }
        
        body.setPosition(4.71239,0,0,0,-0.35,0)
        neck.setPosition(4.71239,0,0,0,-0.35,0)
        ribbon1.setPosition(-Math.PI / 2 - 0.5,-0.5,0,-0.2,-0.05,0.03)
        ribbon2.setPosition(Math.PI / 2 - 0.5,2.5,0,0.3,-0.09,0.06)
        itemCony.setPosition(4.71239,0,0,controlPointsCony[i],controlPointsCony[i+1],0.5)
        for(var i = 0; i < itemCony.child.length;i+=2){
            var xtemp = controlPointsCony[i];
            var ytemp = controlPointsCony[i+1];
            itemCony.child[i].setPosition(4.71239,0,0,xtemp,ytemp,0.5);
        }
        itemCony.translate(-0.1,-0.75,-0.15);
        itemCony.scale(0.3);
        fan.setPosition(0,0,0,-0.4,-0.25,0.35);
        fan1.setPosition(0,0,1.5708,-0.4,-0.25,0.35);
        stomach.setPosition(4.71239,0,0,0,-0.35,0)
        pant1.setPosition(4.71239,0,0,0.1,-0.35,0)
        pant2.setPosition(4.71239,0,0,-0.1,-0.35,0)
        leg1.setPosition(4.71239,0,0,0.1,-0.35,0)
        leg2.setPosition(4.71239,0,0,-0.1,-0.35,0)
        legthumb1.setPosition(0,0,0,0.1,-1.05,0.05)
        legthumb2.setPosition(0,0,0,-0.1,-1.05,0.05)
        tail.setPosition(0,0,0,0,-0.8,-0.275)

        arm1.setPosition(-Math.PI / 2 - 0.5,-0.5,0,0.125,-0.375,0)
        arm2.setPosition(Math.PI / 2 - 0.5,2.5,0,-0.125,-0.375,0)
        palm1.setPosition(0,-0.7,1,0.31,-0.7,0.175)
        palm2.setPosition(0,0.7,-1,-0.378,-0.7,0.175)

        beans1.setPosition(0,0,0,-4.2,-2.2,0.5);
        beans2.setPosition(0,0,0,-4.2,-2.6,0.5);
        beans3.setPosition(0,0,0,-4.2,-3.0,0.5);

        eye1Beans.setPosition(0,0,0,-4.2,-2.1,0.7);
        eye2Beans.setPosition(0,0,0,-4.1,-2.1,0.7);
        eye3Beans.setPosition(0,0,0,-4.2,-2.5,0.7);
        eye4Beans.setPosition(0,0,0,-4.1,-2.5,0.7);
        eye5Beans.setPosition(0,0,0,-4.2,-2.9,0.7);
        eye6Beans.setPosition(0,0,0,-4.1,-2.9,0.7);

        mulutBeans1.setPosition(4.71239,0,0,-4.15,-2.225,0.7);
        mulutBeans2.setPosition(4.71239,0,0,-4.15,-2.625,0.7);
        mulutBeans3.setPosition(4.71239,0,0,-4.15,-3.025,0.7);

        beans1.translate(0,0,-0.25);
        beans2.translate(-0.1,0,0);

        giftLeonard.setPosition(0,0,0,5,-2.8,-0.3);
        leonardHead.setPosition(0,0,0,5,-1.5,-0.3);
        mataLeonard1.setPosition(0,0,0,4.7,-1.0,-0.3);
        mataLeonard2.setPosition(0,0,0,5.3,-1.0,-0.3);
        korneaLeonard1.setPosition(0.5,0,0,4.65,-1.0,-0.24);
        korneaLeonard2.setPosition(0,0,0,5.27,-1.0,-0.2);
        pupil1.setPosition(0.5,0,0,4.65,-1.0,-0.1);
        pupil2.setPosition(0,0,0,5.27,-1.0,-0.05);
        hidung1.setPosition(0,0,0,4.9,-1.1,-0.01);
        hidung2.setPosition(0,0,0,5,-1.1,-0.01);
        hidung1.scale(0.5);
        hidung2.scale(0.5);
        mataLeonard1.translate(0,-0.05,0);
        mataLeonard2.translate(0,-0.05,0);
        smileLeonard.setPosition(0,0,0,4.97,-1.5,0.1);
        //_________________________ROTATE BEAN________________________
        
        var controlBean = rotateArbitary(kepalaBrown);
        dummy += 2
        beans1.translate((controlBean[dummy%controlBean.length]-beans1.MOVEMATRIX[12]),0,(controlBean[(dummy+1)%controlBean.length]-beans1.MOVEMATRIX[14]))
        
        //_________________CONY LOMPAT______________________
        if (conyUp) {
            //Lompat ke atas
            conyJump += 0.02;
            if (conyJump >= 0.3) { //Batas Loncat
                conyUp = false;
            }
        } else {
            //Turun
            conyJump -= 0.02;
            if (conyJump <= 0) { //Kalau sudah sampai tanah
                conyJump = 0; 
                conyUp = true; //Naik
            }
        }

        if(!jugglingReverse){
            juggling += 0.02;
            jugglingY = -15*(juggling-0.5) * (juggling-0.5)+0.5; 
            if (juggling >= 0.8){
                jugglingReverse = true;
            }
        } else{
            juggling -= 0.02;
            if (juggling <= 0.155){
                juggling = 0.155;
                jugglingReverse = false;
            }
            jugglingY = -15*(juggling-0.5) * (juggling-0.5)+0.5; 
        }

        if (pupilup) {
            //Lompat ke atas
            pt += 0.002;
            if (pt >= 0.04) { //Batas Loncat
                pupilup = false;
            }
        } else {
            //Turun
            pt -= 0.002;
            if (pt <= -0.1) { //Kalau sudah sampai tanah
                pupilup = true; //Naik
            }
        }

        fanRotate += 0.174533

        itemBrown.translate(juggling, jugglingY, 0);
        ball.translate(-juggling+1, jugglingY,0);
        object1.translate(0, conyJump, 0);
        kepalaBrown.translate(0,0,conyJump*2);
        patternRoda.rotate(conyJump*10,0,0);
        fan.rotate(0,0,fanRotate);
        fan1.rotate(0,0,fanRotate);
        ball.rotate(0,0,fanRotate);

        //_________________CONY SENYUM MELEBAR______________________
        //BESARAN SCALING AGAR SMOOTH
        var scaleFactor = (1.2 - 0.85) * (conyJump / 0.3) + 0.85;
        beans1.scale(scaleFactor);
        cheek1.scale(scaleFactor);
        cheek2.scale(scaleFactor);
        smileCony.scale(scaleFactor);
        palm1Brown.scale(scaleFactor);
        palm2Brown.scale(scaleFactor);
        hidungBrown.scale(scaleFactor);
        arm1Brown.translate(0,conyJump*0.2,0);
        arm2Brown.translate(0,conyJump*0.2,0);
        pupil1.translate(pt,0,0);
        pupil2.translate(pt,0,0);
        leonardHead.translate(0,(conyJump*1.3)-0.4,0);



        
        // _____________________________ START JESSICA SET POSITION ______________________________________
        jessicaHead.setPosition(0,0,0,2,0,0);
        jessicaHead2.setPosition(-3,-2.55,-2,1.91,0.1,0);
        topiJessica.setPosition(-Math.PI / 2,0,0,2,0.5,0.1);
        bawahTopiJessica.setPosition(-Math.PI / 2,0,0,2,0.5,0.1);
        kupingJessica1.setPosition(0,0,3.1,2.3,0.2,0);
        kupingJessica2.setPosition(0,0,0.1,1.7,0.25,0);
        eyeJessica.setPosition(0,0,0,2.1,2.1*0.125*0.125+0.1,0.5);
        var xtemp = 2.1;
        for(var i = 0; i < eyeJessica.child.length;i++){
            xtemp += 0.0025;
            var ytemp = 2.1*(xtemp-2.1025)*(xtemp-2.1025)+0.12;
            eyeJessica.child[i].setPosition(0,0,0,xtemp,ytemp,0.5)
        }
        // noseJessica.setPosition(0,0,0,2,0.0,0.6);
        smileJessica.setPosition(0,0,0,1.875,2.5*0.125*0.125-0.2,0.45);
        var xtemp = 1.875;
        for(var i = 0; i < smileJessica.child.length;i++){
            xtemp += 0.0025;
            var ytemp = 2.5*(xtemp-2)*(xtemp-2)-0.2;
            smileJessica.child[i].setPosition(0,0,0,xtemp,ytemp,0.45)
        }
        garisJessica1.setPosition(-Math.PI / 2,0,0,2,-0.11,0.5);
        garisJessica2.setPosition(-Math.PI / 2,-2,0,2.09,-0.07,0.5);
        garisJessica3.setPosition(Math.PI / 2,-2,0,2.02,-0.12,0.5);
        neckJessica.setPosition(4.71239,0,0,2,-0.38,0.02);
        bodyJessica.setPosition(4.71239,0,0,2,-0.38,0);
        ribbonJessica1.setPosition(4.71239,0,0,2,-0.2,0.3);
        ribbonJessica2.setPosition(4.71239,0,0,2,-0.2,0.1);
        pitaJessica1.setPosition(4.71239,0,0,2,-0.5,0.32);
        pitaJessica2.setPosition(4.71239,0,0,2,-0.5,0.32);
        stomachJessica.setPosition(4.71239,0,0,2,-0.35,0);
        pantJessica1.setPosition(4.71239,0,0,2.08,-0.35,0);
        pantJessica2.setPosition(4.71239,0,0,1.9,-0.35,0);
        legJessica1.setPosition(4.71239,0,0,1.9,-0.35,0);
        legJessica2.setPosition(4.71239,0,0,2.08,-0.35,0);
        legthumbJessica1.setPosition(0,0,0,1.87,-1.1,0.05);
        legthumbJessica2.setPosition(0,0,0,2.11,-1.1,0.05);
        armJessica1.setPosition(-Math.PI / 2 - 0.5,-0.5,0,2.125,-0.375,0);
        armJessica2.setPosition(Math.PI / 2 - 0.5,2.5,0,1.875,-0.375,0);
        palmJessica1.setPosition(0,0,0.5,2.34,-0.73,0.175);
        palmJessica2.setPosition(0,0,-0.5,1.61,-0.7,0.175);
        tailJessica.setPosition(0,2,0,2,-0.8,-0.275);

        WingJessica1.setPosition(0,0        ,1   ,1.6   ,-0.3   ,-0.38);
        WingJessica2.setPosition(0,0        ,-1  ,2.4  ,-0.3   ,-0.38);
        WingJessica3.setPosition(0,0        ,1   ,1.65  ,-0.5   ,-0.36);
        WingJessica4.setPosition(0,0        ,-1  ,2.35   ,-0.5   ,-0.36);
        WingJessica5.setPosition(0,0        ,1   ,1.7   ,-0.7   ,-0.34);
        WingJessica6.setPosition(0,0        ,-1  ,2.3   ,-0.7   ,-0.34);
        WingJessicaOutline1.setPosition(0,0 ,1   ,1.6   ,-0.3  ,-0.39);
        WingJessicaOutline2.setPosition(0,0 ,-1  ,2.4  ,-0.3  ,-0.39);
        WingJessicaOutline3.setPosition(0,0 ,1   ,1.65  ,-0.49  ,-0.37);
        WingJessicaOutline4.setPosition(0,0 ,-1  ,2.35   ,-0.49  ,-0.37);
        WingJessicaOutline5.setPosition(0,0 ,1   ,1.7   ,-0.69  ,-0.35);
        WingJessicaOutline6.setPosition(0,0 ,-1  ,2.3   ,-0.69  ,-0.35);

        jessicaHead.translate(conyJump,jessicaFly,conyJump);

        var scaleFactor = (1.2 - 0.85) * (conyJump / 0.3) + 0.85;
        WingJessica1.scale(scaleFactor);
        WingJessica2.scale(scaleFactor);
        WingJessica3.scale(scaleFactor);
        WingJessica4.scale(scaleFactor);
        WingJessica5.scale(scaleFactor);
        WingJessica6.scale(scaleFactor);
        WingJessicaOutline1.scale(scaleFactor);
        WingJessicaOutline2.scale(scaleFactor);
        WingJessicaOutline3.scale(scaleFactor);
        WingJessicaOutline4.scale(scaleFactor);
        WingJessicaOutline5.scale(scaleFactor);
        WingJessicaOutline6.scale(scaleFactor);

        // _____________________________ END JESSICA SET POSITION ______________________________________
        
        // _____________________________ENV POS______________________________________
        environment1.setPosition(0,0,0,0,0,0,PHI,THETA);
        environment1.setTranslateMove(-1,-13.3,-3);
        environment1.scale(10);

        tembok_samping.setPosition(0,0,0,0,0,0,PHI,THETA);
        tembok_samping.setTranslateMove(-19.3,0,-6);
        tembok_samping.scale(10);
        tembok_samping2.setPosition(0,0,0,0,0,0,PHI,THETA);
        tembok_samping2.setTranslateMove(18.3,0,-6);
        tembok_samping2.scale(10);
        tembok_belakang.setPosition(0,0,0,0,0,0,PHI,THETA);
        tembok_belakang.setTranslateMove(0,0,-17);
        tembok_belakang.scale(10);
        balonBottom.setPosition(4.71239,0,0,1,0.1,-6);
        balonUp.setPosition(4.71239,0,0,1,0.9,-6);
        balonBottom1.setPosition(4.71239,0,0,3,-0.6,-6);
        balonUp1.setPosition(4.71239,0,0,3,0.3,-6);
        balonBottom2.setPosition(4.71239,0,0,-1,-0.7,-6);
        balonUp2.setPosition(4.71239,0,0,-1,0.2,-6);
        balonBottom3.setPosition(4.71239,0,0,-3,0.1,-6);
        balonUp3.setPosition(4.71239,0,0,-3,0.9,-6);
        balonBottom4.setPosition(4.71239,0,0,-5,-0.7,-6);
        balonUp4.setPosition(4.71239,0,0,-5,0.1,-6);
        balonBottom5.setPosition(4.71239,0,0,-5,-3,-1);
        balonUp5.setPosition(4.71239,0,0,-5,-2.2,-1);
        balonBottom6.setPosition(4.71239,0,0,5,0.2,-2);
        balonUp6.setPosition(4.71239,0,0,5,1,-2);

        var scaleFactor1 = (1.1 - 0.95) * (conyJump / 0.3) + 0.95;
        balonBottom5.scale(scaleFactor1);
        balonBottom6.scale(scaleFactor1);

        
        
        tali.setPosition(0,0,0,-2.5,0.1*2.5*2.5+2,-6);
        var xtemp = -8;
        for(var i = 0; i < tali.child.length;i++){
            xtemp += 0.05;
            var ytemp = 0.1*xtemp*xtemp+2;
            tali.child[i].setPosition(0,0,0,xtemp,ytemp,-6)
        }

        bendera.setPosition(0,0,0,0,0.95,-6);
        bendera1.setPosition(0,0,0.261799,1.5,1.2,-6);
        bendera2.setPosition(0,0,0.523599,3,1.8,-6);
        bendera3.setPosition(0,0,-0.261799,-1.5,1.2,-6);
        bendera4.setPosition(0,0,-0.523599,-3,1.8,-6);
        bendera5.setPosition(0,0,0.785398,4.2,2.5,-6);
        bendera6.setPosition(0,0,-0.785398,-4.2,2.6,-6);

        square.setPosition(0,0,0,0,5,0);
        square1.setPosition(0,0,0,0,-2,-7);
        gift.setPosition(0,0,0,3,-2.2,-3);
        pita1.setPosition(0,0,0,3,-2.2,-3);
        pita2.setPosition(0,0,0,3,-2.2,-3);
        pitaGift1.setPosition(4.71239,-4.71239,0,2.4,-1.05,-3);
        pitaGift2.setPosition(4.71239,4.71239,0,3.6,-1.05,-3);
        // square23.setPosition(0,0,0,3,-1.5,-3);

        baseTart.setPosition(-2*0.785398,0,0,-4.2,-2.6,-3);
        // // baseTart.translate(-4,-1.5,0.5);
        tart1.setPosition(-2*0.785398,0,0,-4.2,-2.2,-3);
        // // tart1.translate(-4,-1,0.5);
        lowerBaseTart.setPosition(-2*0.785398,0,0,-4.2,-3.0,-3);
        plate.setPosition(-2*0.785398,0,0,-4.2,-3.5,-3);
        lowerBaseTartDecor.setPosition(-2*0.785398,0,0,-4.2,-3.2,-3);
        cherry.setPosition(-2*0.785398,0,0,-4.2,-2.8,-2.3);

        for(var i = 0; i < cherry.child.length; i++){
            let cherrychild = cherry.child[i];
            var theta = (i/8)*2*Math.PI;
            var x = 0.68*Math.cos(theta) -4.2;
            var y = 0.68*Math.sin(theta)-3;
            cherrychild.setPosition(-2*0.785398,0,0,x,-2.8,y);
        }

        lilin.setPosition(-2*0.785398,0,0,-4.2,-2.2,-2.6);
        for(var i = 0; i < lilin.child.length; i++){
            let lilinchild = lilin.child[i];
            var theta = (i/8)*2*Math.PI;
            var x = 0.4*Math.cos(theta) -4.2;
            var y = 0.4*Math.sin(theta)-3;
            lilinchild.setPosition(-2*0.785398,0,0,x,-2.2,y);
        }

        topper.setPosition(0,0,0,-4.2,-1.6,-3);
        topper2.setPosition(0,0,0,-4.2,-1.6,-3);

        table.setPosition(0,0,0,-4.2,-4.5,-3);
        drawer1.setPosition(0,0,0,-4.2,-4,-2.5);
        drawer2.setPosition(0,0,0,-4.2,-5,-2.5);

        baseTart.translate(0,2.5,0.5);

        //_____________________ANIMASI BALON TERBANG_____________________
        if (conyUp) {
            //Lompat ke atas
            balonGeser += 0.02;
            if (conyJump >= 0.3) { //Batas Loncat
                conyUp = false;
            }
        } else {
            //Turun
            balonGeser -= 0.02;
            if (conyJump <= 0) { //Kalau sudah sampai tanah
                conyJump = 0; 
                conyUp = true; //Naik
            }
        }

        balonJump += 0.02;
        balonBottom5.translate(balonGeser, balonJump, 0);
        if(balonJump >= 8){
            balonJump = 0;
        }

        balonJump1 += 0.02;
        balonBottom6.translate(balonGeser, balonJump1, 0);
        if(balonJump1 >= 5){
            balonJump1 = -3;
        }
        
        object1.translate(0,-1.9,0)
        jessicaHead.translate(0,-1.9,0)
        kepalaBrown.translate(0,-0.45,0)


        // ANIMASI JESSICA
        if (jessicaCanFly && counter < 3) { // TERBANG
            //Lompat ke atas
            if ((jessicaFly >= 1.5 && jessicaFly <= 2.5) && counter != 0 ) {
                jessicaFly += 0.015;
            } else { // Sampe max
                jessicaFly += 0.03;
            }
              // Sampe max
            if (jessicaFly >= 2.5) { // Sampe max
                counter++;
                jessicaCanFly = false;
            }
        } else if (!jessicaCanFly && counter < 3) {

            if (jessicaFly <= 2.5 || jessicaFly >= 2.3) {
                jessicaFly -= 0.01;
            } else {
                jessicaFly -= 0.03;
            }
            if (jessicaFly <= 1.5) { //Kalau sudah sampai tanah
                jessicaFly = 1.5;
                jessicaCanFly = true; //Naik
            }
        } else if (counter = 3) {
            //Turun
            if (jessicaFly <= 0.2) {
                jessicaFly -= 0.01;
            } else {
                jessicaFly -= 0.03;
            }
            if (jessicaFly <= 0) { //Kalau sudah sampai tanah
                counter = 0;
                jessicaFly = 0; 
                jessicaCanFly = true; //Naik
            }
        }

        //_________________________RESPONSIVE ROTATE_____________________
        object1.setResponsiveRotation(PHI,THETA);
        kuping1.setResponsiveRotation(PHI,THETA);
        kuping2.setResponsiveRotation(PHI,THETA);
        innerkuping1.setResponsiveRotation(PHI,THETA);
        innerkuping2.setResponsiveRotation(PHI,THETA);
        eye1.setResponsiveRotation(PHI,THETA);
        eye2.setResponsiveRotation(PHI,THETA);
        cheek1.setResponsiveRotation(PHI,THETA);
        cheek2.setResponsiveRotation(PHI,THETA);
        headOrnament.setResponsiveRotation(PHI,THETA);
        headOrnament1.setResponsiveRotation(PHI,THETA);
        nose1.setResponsiveRotation(PHI,THETA);
        nose2.setResponsiveRotation(PHI,THETA);
        smileCony.setResponsiveRotation(PHI,THETA);
        for(var i = 0; i < smileCony.child.length;i++){
            smileCony.child[i].setResponsiveRotation(PHI,THETA);
        }
        
        body.setResponsiveRotation(PHI,THETA);
        neck.setResponsiveRotation(PHI,THETA);
        ribbon1.setResponsiveRotation(PHI,THETA);
        ribbon2.setResponsiveRotation(PHI,THETA);
        itemCony.setResponsiveRotation(PHI,THETA);
        for(var i = 0; i < itemCony.child.length;i++){
            itemCony.child[i].setResponsiveRotation(PHI,THETA);
        }
        fan.setResponsiveRotation(PHI,THETA);
        fan1.setResponsiveRotation(PHI,THETA);
        itemBrown.setResponsiveRotation(PHI,THETA);
        stomach.setResponsiveRotation(PHI,THETA);
        pant1.setResponsiveRotation(PHI,THETA);
        pant2.setResponsiveRotation(PHI,THETA);
        leg1.setResponsiveRotation(PHI,THETA);
        leg2.setResponsiveRotation(PHI,THETA);
        legthumb1.setResponsiveRotation(PHI,THETA);
        legthumb2.setResponsiveRotation(PHI,THETA);
        tail.setResponsiveRotation(PHI,THETA);

        arm1.setResponsiveRotation(PHI,THETA);
        arm2.setResponsiveRotation(PHI,THETA);
        palm1.setResponsiveRotation(PHI,THETA);
        palm2.setResponsiveRotation(PHI,THETA);

        //BROWN
        kepalaBrown.setResponsiveRotation(PHI,THETA);
        telingaBrown1.setResponsiveRotation(PHI,THETA);
        telingaBrown2.setResponsiveRotation(PHI,THETA);
        inner1.setResponsiveRotation(PHI,THETA);
        inner2.setResponsiveRotation(PHI,THETA);
        mataBrown1.setResponsiveRotation(PHI,THETA);
        mataBrown2.setResponsiveRotation(PHI,THETA);
        mulutBrown.setResponsiveRotation(PHI,THETA);
        hidungBrown.setResponsiveRotation(PHI,THETA);
        garisMulut1.setResponsiveRotation(PHI,THETA);
        ball.setResponsiveRotation(PHI,THETA);
        topiBrown.setResponsiveRotation(PHI,THETA);
        bawahTopiBrown.setResponsiveRotation(PHI,THETA);
        bodyBrown.setResponsiveRotation(PHI,THETA);
        innerBadan.setResponsiveRotation(PHI,THETA);
        arm1Brown.setResponsiveRotation(PHI,THETA);
        arm2Brown.setResponsiveRotation(PHI,THETA);
        palm1Brown.setResponsiveRotation(PHI,THETA);
        palm2Brown.setResponsiveRotation(PHI,THETA);
        leg1Brown.setResponsiveRotation(PHI,THETA);
        leg2Brown.setResponsiveRotation(PHI,THETA);
        sepatuBrown1.setResponsiveRotation(PHI,THETA);
        sepatuBrown2.setResponsiveRotation(PHI,THETA);
        innerSepatuBrown1.setResponsiveRotation(PHI,THETA);
        innerSepatuBrown2.setResponsiveRotation(PHI,THETA);
        garis.setResponsiveRotation(PHI,THETA);
        garis2.setResponsiveRotation(PHI,THETA);
        garis3.setResponsiveRotation(PHI,THETA);
        garis4.setResponsiveRotation(PHI,THETA);
        garis5.setResponsiveRotation(PHI,THETA);
        garis6.setResponsiveRotation(PHI,THETA);
        garis7.setResponsiveRotation(PHI,THETA);
        kursi.setResponsiveRotation(PHI,THETA);
        tiang.setResponsiveRotation(PHI,THETA);
        bottomtiang.setResponsiveRotation(PHI,THETA);
        boxSepeda.setResponsiveRotation(PHI,THETA);
        tanganRoda1.setResponsiveRotation(PHI,THETA);
        tanganRoda2.setResponsiveRotation(PHI,THETA);
        roda.setResponsiveRotation(PHI,THETA);
        innerRoda.setResponsiveRotation(PHI,THETA);
        patternRoda.setResponsiveRotation(PHI,THETA);
        pitaBrown2.setResponsiveRotation(PHI,THETA);
        pitaBrown.setResponsiveRotation(PHI,THETA);
        for(var i = 0; i < itemBrown.child.length;i++){
            itemBrown.child[i].setResponsiveRotation(PHI,THETA);
        }
        itemBrown.setResponsiveRotation(PHI,THETA);
    

        //JESSICA
        jessicaHead.setResponsiveRotation(PHI,THETA);
        jessicaHead2.setResponsiveRotation(PHI,THETA);
        topiJessica.setResponsiveRotation(PHI,THETA);
        bawahTopiJessica.setResponsiveRotation(PHI,THETA);
        kupingJessica1.setResponsiveRotation(PHI,THETA);
        kupingJessica2.setResponsiveRotation(PHI,THETA);
        eyeJessica.setResponsiveRotation(PHI,THETA);
        for(var i = 0; i < eyeJessica.child.length;i++){
            eyeJessica.child[i].setResponsiveRotation(PHI,THETA);
        }
        // noseJessica.setResponsiveRotation(PHI,THETA);
        garisJessica1.setResponsiveRotation(PHI,THETA);
        garisJessica2.setResponsiveRotation(PHI,THETA);
        garisJessica3.setResponsiveRotation(PHI,THETA);
        smileJessica.setResponsiveRotation(PHI,THETA);
        for(var i = 0; i < smileJessica.child.length;i++){
            smileJessica.child[i].setResponsiveRotation(PHI,THETA);
        }
        neckJessica.setResponsiveRotation(PHI,THETA);
        bodyJessica.setResponsiveRotation(PHI,THETA);
        ribbonJessica1.setResponsiveRotation(PHI,THETA);
        ribbonJessica2.setResponsiveRotation(PHI,THETA);
        pitaJessica1.setResponsiveRotation(PHI,THETA);
        pitaJessica2.setResponsiveRotation(PHI,THETA);
        stomachJessica.setResponsiveRotation(PHI,THETA);
        pantJessica1.setResponsiveRotation(PHI,THETA);
        pantJessica2.setResponsiveRotation(PHI,THETA);
        legJessica1.setResponsiveRotation(PHI,THETA);
        legJessica2.setResponsiveRotation(PHI,THETA);
        legthumbJessica1.setResponsiveRotation(PHI,THETA);
        legthumbJessica2.setResponsiveRotation(PHI,THETA);
        armJessica1.setResponsiveRotation(PHI,THETA);
        armJessica2.setResponsiveRotation(PHI,THETA);
        palmJessica1.setResponsiveRotation(PHI,THETA);
        palmJessica2.setResponsiveRotation(PHI,THETA);
        tailJessica.setResponsiveRotation(PHI,THETA);
        WingJessica1.setResponsiveRotation(PHI,THETA);
        WingJessica2.setResponsiveRotation(PHI,THETA);
        WingJessica3.setResponsiveRotation(PHI,THETA);
        WingJessica4.setResponsiveRotation(PHI,THETA);
        WingJessica5.setResponsiveRotation(PHI,THETA);
        WingJessica6.setResponsiveRotation(PHI,THETA);
        WingJessicaOutline1.setResponsiveRotation(PHI,THETA);
        WingJessicaOutline2.setResponsiveRotation(PHI,THETA);
        WingJessicaOutline3.setResponsiveRotation(PHI,THETA);
        WingJessicaOutline4.setResponsiveRotation(PHI,THETA);
        WingJessicaOutline5.setResponsiveRotation(PHI,THETA);
        WingJessicaOutline6.setResponsiveRotation(PHI,THETA);

        //ENV
        environment1.setResponsiveRotation(PHI,THETA);
        tembok_samping.setResponsiveRotation(PHI,THETA);
        tembok_samping2.setResponsiveRotation(PHI,THETA);
        tembok_belakang.setResponsiveRotation(PHI,THETA);
        balonBottom.setResponsiveRotation(PHI,THETA);
        balonUp.setResponsiveRotation(PHI,THETA);
        balonBottom1.setResponsiveRotation(PHI,THETA);
        balonUp1.setResponsiveRotation(PHI,THETA);
        balonBottom2.setResponsiveRotation(PHI,THETA);
        balonUp2.setResponsiveRotation(PHI,THETA);
        balonBottom3.setResponsiveRotation(PHI,THETA);
        balonUp3.setResponsiveRotation(PHI,THETA);
        balonBottom4.setResponsiveRotation(PHI,THETA);
        balonUp4.setResponsiveRotation(PHI,THETA);
        balonBottom5.setResponsiveRotation(PHI,THETA);
        balonUp5.setResponsiveRotation(PHI,THETA);
        balonBottom6.setResponsiveRotation(PHI,THETA);
        balonUp6.setResponsiveRotation(PHI,THETA);
        mataLeonard1.setResponsiveRotation(PHI,THETA);
        mataLeonard2.setResponsiveRotation(PHI,THETA);
        korneaLeonard1.setResponsiveRotation(PHI,THETA);
        korneaLeonard2.setResponsiveRotation(PHI,THETA);
        pupil1.setResponsiveRotation(PHI,THETA);
        pupil2.setResponsiveRotation(PHI,THETA);
        hidung1.setResponsiveRotation(PHI,THETA);
        hidung2.setResponsiveRotation(PHI,THETA);
        
        tali.setResponsiveRotation(PHI,THETA);
        for(var i = 0; i < tali.child.length;i++){
            tali.child[i].setResponsiveRotation(PHI,THETA)
        }
        bendera.setResponsiveRotation(PHI,THETA);
        bendera1.setResponsiveRotation(PHI,THETA);
        bendera2.setResponsiveRotation(PHI,THETA);
        bendera3.setResponsiveRotation(PHI,THETA);
        bendera4.setResponsiveRotation(PHI,THETA);
        bendera5.setResponsiveRotation(PHI,THETA);
        bendera6.setResponsiveRotation(PHI,THETA);
        beans1.setResponsiveRotation(PHI,THETA);
        beans2.setResponsiveRotation(PHI,THETA);
        beans3.setResponsiveRotation(PHI,THETA);
        eye1Beans.setResponsiveRotation(PHI,THETA);
        eye2Beans.setResponsiveRotation(PHI,THETA);
        eye3Beans.setResponsiveRotation(PHI,THETA);
        eye4Beans.setResponsiveRotation(PHI,THETA);
        eye5Beans.setResponsiveRotation(PHI,THETA);
        eye6Beans.setResponsiveRotation(PHI,THETA);
        mulutBeans1.setResponsiveRotation(PHI,THETA);
        mulutBeans2.setResponsiveRotation(PHI,THETA);
        mulutBeans3.setResponsiveRotation(PHI,THETA);


        square.setResponsiveRotation(PHI,THETA);
        square1.setResponsiveRotation(PHI,THETA);
        gift.setResponsiveRotation(PHI,THETA);
        pita1.setResponsiveRotation(PHI,THETA);
        pita2.setResponsiveRotation(PHI,THETA);
        pitaGift1.setResponsiveRotation(PHI,THETA);
        pitaGift2.setResponsiveRotation(PHI,THETA);

        leonardHead.setResponsiveRotation(PHI,THETA);
        // square23.setResponsiveRotation(PHI,THETA);

        giftLeonard.setResponsiveRotation(PHI,THETA);
        smileLeonard.setResponsiveRotation(PHI,THETA);


        baseTart.setResponsiveRotation(PHI,THETA);
        tart1.setResponsiveRotation(PHI,THETA);
        lowerBaseTart.setResponsiveRotation(PHI,THETA);
        plate.setResponsiveRotation(PHI,THETA);
        lowerBaseTartDecor.setResponsiveRotation(PHI,THETA);
        cherry.setResponsiveRotation(PHI,THETA);

        for(var i = 0; i < cherry.child.length; i++){
            let cherrychild = cherry.child[i];
            cherrychild.setResponsiveRotation(PHI,THETA);
        }

        lilin.setResponsiveRotation(PHI,THETA);
        for(var i = 0; i < lilin.child.length; i++){
            let lilinchild = lilin.child[i];
            lilinchild.setResponsiveRotation(PHI,THETA);
        }

        topper.setResponsiveRotation(PHI,THETA);
        topper2.setResponsiveRotation(PHI,THETA);

        table.setResponsiveRotation(PHI,THETA);
        drawer1.setResponsiveRotation(PHI,THETA);
        drawer2.setResponsiveRotation(PHI,THETA);

        //_______________DRAW___________________________________________
        GL.viewport (0,0,CANVAS.width,CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        object1.setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        object1.draw();

        kepalaBrown.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        kepalaBrown.draw();

        jessicaHead.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        jessicaHead.draw();

        environment1.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        environment1.draw();

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
        balonBottom5.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        balonBottom5.draw();
        balonBottom6.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        balonBottom6.draw();

        tali.setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        tali.draw();

        bendera.setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        bendera.draw();

        square.setuniformmatrix4(PROJMATRIX,VIEWMATRIX);
        square.draw();

        baseTart.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        baseTart.draw();
        itemBrown.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        itemBrown.draw();

        tembok_samping.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        tembok_samping.draw();

        tembok_samping2.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        tembok_samping2.draw();

        tembok_belakang.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        tembok_belakang.draw();

        beans1.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        beans1.draw();

        giftLeonard.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        giftLeonard.draw();

        leonardHead.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        leonardHead.draw();

        GL.flush();
        window.requestAnimationFrame(animate);


    }
    animate();

}

window.addEventListener('load',main);
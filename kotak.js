function main(){
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    var GL;
    try{
        GL = CANVAS.getContext("webgl", {antialias: false});
    } catch(error){
        alert("Hai ngab");
        return false;
    }
    
    //shader
    var shader_vertex_source = `
    attribute vec2 position;
    attribute vec3 color;
    
    varying vec3 vColor;
    void main(void){
        gl_Position = vec4(position, 0.0, 1.0);
        vColor = color;
    }`

    var shader_fragment_source =`
    precision mediump float;
    varying vec3 vColor;
    void main(void){
        gl_FragColor = vec4(vColor,1.0);
    }`

    
    var compiler_shader = function(source, type, typeString){
        var shader = GL.createShader(type);
        GL.shaderSource(shader,source);
        GL.compileShader(shader);
        if(!GL.getShaderParameter(shader, GL.COMPILE_STATUS)){
            alert("ERROR IN "+typeString+" SHADER: "+GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    }

    var shader_vertex = compiler_shader(shader_vertex_source,GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = compiler_shader(shader_fragment_source,GL.FRAGMENT_SHADER,"FRAGMENT");
    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM,shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);
    GL.linkProgram(SHADER_PROGRAM);
    
    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_position);
    GL.useProgram(SHADER_PROGRAM);

    //KOTAK
    var rectangle_vertex = [
        -1,-1, //bot left
        0,0,1, //biru
        1,-1, //bot right
        0,1,0, // ijo
        1,1, //atas KANAN
        1,0,0, // merah
        -1,1, //ATAS KIRI
        1,1,1 //pink
    ];

    var RECTANGLE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, RECTANGLE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(rectangle_vertex),GL.STATIC_DRAW);

    //FACES
    var rectangle_faces = [0,1,2,0,2,3]; //segitiga 1 = 0 1 2, segitiga 2 = 0 2 3
    var RECTANGLE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(rectangle_faces),GL.STATIC_DRAW);

    //drawing
    var animate = function(){
        GL.viewport(0,0,CANVAS.width,CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        //draw KOTAK
        GL.bindBuffer(GL.ARRAY_BUFFER, RECTANGLE_VERTEX);
        GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RECTANGLE_FACES);
        GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT,0);


        GL.flush();
        window.requestAnimationFrame(animate);
    }
    animate();
}

window.addEventListener('load',main);
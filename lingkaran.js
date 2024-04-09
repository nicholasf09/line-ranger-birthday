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

    //lingkaran 
    var circle_vertex = [
        0,0, //pusat
        0,255,0 //pink
    ];
    for(var i = 0; i <= 360; i++){
        var theta = (i/360)*2*Math.PI;
        var x = Math.cos(theta);
        var y = Math.sin(theta);
        circle_vertex.push(x,y,0,255,0);
    }

    var CIRCLE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circle_vertex),GL.STATIC_DRAW);

    //FACES 
    var circle_faces = [];
    for(var i = 1; i <= 360; i++){
        circle_faces.push(0,i,i+1);
    }
    circle_faces.push(0,361,1);
    
    var CIRCLE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces),GL.STATIC_DRAW);

    //drawing
    var animate = function(){
        GL.viewport(0,0,CANVAS.width,CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

        //draw lingkaran 
        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
        GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
        GL.drawElements(GL.TRIANGLES, 360*3, GL.UNSIGNED_SHORT,0);

        GL.flush();
        window.requestAnimationFrame(animate);
    }
    animate();
}

window.addEventListener('load',main);
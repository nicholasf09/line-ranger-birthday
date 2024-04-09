function normalizeScreen(x,y,width,height){
    var nx = 2*x/width - 1
    var ny = -2*y/height + 1
   
    return [nx,ny]
  }
   
  function generateBSpline(controlPoint, m, degree){
    var curves = [];
    var knotVector = []
   
    var n = controlPoint.length/2;
   
   
    // Calculate the knot values based on the degree and number of control points
    for (var i = 0; i < n + degree+1; i++) {
      if (i < degree + 1) {
        knotVector.push(0);
      } else if (i >= n) {
        knotVector.push(n - degree);
      } else {
        knotVector.push(i - degree);
      }
    }
   
   
   
    var basisFunc = function(i,j,t){
        if (j == 0){
          if(knotVector[i] <= t && t<(knotVector[(i+1)])){ 
            return 1;
          }else{
            return 0;
          }
        }
   
        var den1 = knotVector[i + j] - knotVector[i];
        var den2 = knotVector[i + j + 1] - knotVector[i + 1];
   
        var term1 = 0;
        var term2 = 0;
   
   
        if (den1 != 0 && !isNaN(den1)) {
          term1 = ((t - knotVector[i]) / den1) * basisFunc(i,j-1,t);
        }
   
        if (den2 != 0 && !isNaN(den2)) {
          term2 = ((knotVector[i + j + 1] - t) / den2) * basisFunc(i+1,j-1,t);
        }
   
        return term1 + term2;
    }
   
   
    for(var t=0;t<m;t++){
      var x=0;
      var y=0;
   
      var u = (t/m * (knotVector[controlPoint.length/2] - knotVector[degree]) ) + knotVector[degree] ;
   
      //C(t)
      for(var key =0;key<n;key++){
   
        var C = basisFunc(key,degree,u);
        x+=(controlPoint[key*2] * C);
        y+=(controlPoint[key*2+1] * C);
      }
      curves.push(x);
      curves.push(y);
   
    }
    return curves;
}

function main(){
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width= window.innerWidth;
    CANVAS.height = window.innerHeight;
    var drag = false;
    var xp, yp;

    var controlPoints = []; // Array to store control points

    var mouseDown = function(e){
        drag = true;
        xp = 2*e.pageX/CANVAS.width - 1;
        yp = -2*e.pageY/CANVAS.height + 1;
        controlPoints.push(xp, yp);
        console.log(controlPoints)
        e.preventDefault();
        return false;
    }

    var circle_vertex =[];
    var circle_faces = [];
    var circle = 0;

    var curve_vertex = [];
    var curve_faces = [];

    var line_vertex = [];
    var line_faces = [];
   
    var mouseUp = function(){
        //GAMBAR TITIK
        circle++;
        //Lingkaran
        //POINTS
        circle_vertex.push(xp,yp,255,0,255);
        line_vertex.push(xp,yp,255,0,0);

        for(var i = 0; i <= 360; i++){
            var theta = (i/360)*2*Math.PI;
            var x = 0.03*Math.cos(theta);
            var y = 0.03*Math.sin(theta);
            circle_vertex.push(x+xp,y+yp,255,0,255);
        }

        var CIRCLE_VERTEX = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circle_vertex),GL.STATIC_DRAW);

        //FACES 
        var pusat = 0;
        for (var i = 0; i < circle; i++){
            for(var j = 1; j <= 360; j++){
                circle_faces.push(pusat,j+pusat,j+1+pusat);
            }
            circle_faces.push(pusat,pusat+361,pusat+1);
            pusat = pusat + 362;
        }

        var CIRCLE_FACES = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces),GL.STATIC_DRAW);

        //Gambar curve
        var numPoints = 100; // Number of points to approximate the curve
        var degree = 2; // Degree of the B-spline curve
        curve_faces = []
        var curveVertices = generateBSpline(controlPoints, numPoints, degree);

        curve_vertex = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex.push(curveVertices[count],curveVertices[count+1],255,0,255);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex),GL.STATIC_DRAW);

        //face curve
        curve_faces = [];
        for(var i = 0; i < curve_vertex.length/5-1; i++){
            curve_faces.push(i,i+1);
        }
        console.log(curve_faces)

        var CURVE_FACES = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces),GL.STATIC_DRAW);

        //vertex line
        var LINE_VERTEX = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, LINE_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(line_vertex),GL.STATIC_DRAW);

        //face line
        for(var i = 0; i < circle-1; i++){
          line_faces.push(i,i+1);
        }

        var LINE_FACES = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(line_faces),GL.STATIC_DRAW);
    


        //drawing
        var animate = function(){
            GL.viewport(0,0,CANVAS.width,CANVAS.height);
            GL.clear(GL.COLOR_BUFFER_BIT);

            //draw lingkaran 
            GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
            GL.drawElements(GL.TRIANGLES, circle_faces.length, GL.UNSIGNED_SHORT,0);


            //draw curve
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES);
            GL.drawElements(GL.LINE_STRIP, curve_faces.length, GL.UNSIGNED_SHORT,0);

            //draw line
            GL.bindBuffer(GL.ARRAY_BUFFER, LINE_VERTEX);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE_FACES);
            GL.drawElements(GL.LINES, line_faces.length, GL.UNSIGNED_SHORT,0);

            GL.flush();
            window.requestAnimationFrame(animate);
        }
            animate();
            drag = false;
    }

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);

    var GL;
    try {
        GL=CANVAS.getContext("webgl",{antialias: false})
    } catch (error) {
        alert("webGL context cannot be initialized");
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

    var _color=GL.getAttribLocation(SHADER_PROGRAM,"color");
    var _position=GL.getAttribLocation(SHADER_PROGRAM,"position");

    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_position);

    GL.useProgram(SHADER_PROGRAM);

}

window.addEventListener('load',main);
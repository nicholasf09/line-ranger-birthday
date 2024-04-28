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

    var control = []; // Array to store control points

    var GL;
    try {
        GL=CANVAS.getContext("webgl",{antialias: false})
    } catch (error) {
        alert("webGL context cannot be initialized");
        return false;
    }

    var circle = 0;
    var mouseDown = function(e){
        drag = true;
        xp = 2*e.pageX/CANVAS.width - 1;
        yp = -2*e.pageY/CANVAS.height + 1;
        control.push(xp, yp);
        console.log(control)
        e.preventDefault();
        return false;
    }

    var curve_vertexM = [];
    var curve_facesM = [];

    var CURVE_VERTEXM;
    var CURVE_FACESM;
    var LINE_VERTEX;
    var LINE_FACES;
    var mouseUp = function(){
        //GAMBAR TITIK
        circle++;

        //Gambar curve
        var numPoints = 100; // Number of points to approximate the curve
        var degree = 2; // Degree of the B-spline curve
        var curveVerticesM = generateBSpline(control, numPoints, degree);

        curve_vertexM = [];
        var count = 0;
        for(var i = 0; i < numPoints; i++){
            curve_vertexM.push(curveVerticesM[count],curveVerticesM[count+1],0,0,0);
            count+=2;
        }

        //vertex curve
        CURVE_VERTEXM = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEXM);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertexM),GL.STATIC_DRAW);

        //face curve
        curve_facesM = [];
        for(var i = 0; i < curve_vertexM.length/5-1; i++){
            curve_facesM.push(i,i+1);
        }

        CURVE_FACESM = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACESM);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_facesM),GL.STATIC_DRAW);

        //vertex line
        //POINTS
        line_vertex.push(xp,yp,255,0,0);

        //line face
         //vertex line
        LINE_VERTEX = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, LINE_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(line_vertex),GL.STATIC_DRAW);

        //face line
        for(var i = 0; i < circle-1; i++){
          line_faces.push(i,i+1);
        }

        LINE_FACES = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(line_faces),GL.STATIC_DRAW);
    


        drag = false;
    }

    //ARRAY GAMBAR

    var controlPoints = []; // Array to store control points
    controlPoints.push(0.1645833333333333, 0.27562642369020496, 0.44999999999999996, -0.02733485193621865, 0.19062500000000004, -0.7380410022779043);

    var controlPoints1 = []; // Array to store control points
    controlPoints1.push(-0.3666666666666667, -0.0546697038724373, -0.3447916666666667, 0.5102505694760819, -0.15729166666666672, 0.4396355353075171);

    var controlPoints2 = []; // Array to store control points
    controlPoints2.push(-0.08125000000000004, 0.021857923497267784, -0.08374999999999999, -0.002732240437158362, -0.08625000000000005, -0.030054644808743092, -0.10250000000000004, -0.14754098360655732, -0.11375000000000002, -0.2732240437158471, -0.12, -0.3825136612021858);

    var controlPoints3 = []; // Array to store control points
    controlPoints3.push(-0.24124999999999996, 0.0901639344262295, -0.255, 0.1202185792349727, -0.27375000000000005, 0.15573770491803274, -0.3075, 0.1584699453551912, -0.32999999999999996, 0.1202185792349727, -0.3425, 0.07103825136612019, -0.35250000000000004, -0.010928961748633892, -0.3375, -0.08469945355191255, -0.31625000000000003, -0.1584699453551912, -0.27875000000000005, -0.22404371584699456, -0.24250000000000005, -0.2814207650273224, -0.20499999999999996, -0.32513661202185795, -0.12624999999999997, -0.38524590163934436, -0.09375, -0.401639344262295, -0.015000000000000013, -0.41256830601092886, 0.022499999999999964, -0.39344262295081966, 0.07499999999999996, -0.3688524590163935, 0.12749999999999995, -0.3306010928961749, 0.15625, -0.2978142076502732, 0.18999999999999995, -0.2622950819672132, 0.22124999999999995, -0.22131147540983598, 0.23750000000000004, -0.1693989071038251, 0.2549999999999999, -0.11202185792349728, 0.26875000000000004, -0.0710382513661203, 0.27249999999999996, -0.030054644808743092);

    var controlPoints4 = []; // Array to store control points
    controlPoints4.push(-0.2875, -0.2103825136612021, -0.28374999999999995, -0.27595628415300544, -0.26875000000000004, -0.3497267759562841, -0.24750000000000005, -0.43442622950819665, -0.20999999999999996, -0.53551912568306, -0.17500000000000004, -0.6038251366120218, -0.11750000000000005, -0.6693989071038251, -0.07874999999999999, -0.6939890710382515, -0.030000000000000027, -0.7076502732240437, 0.01750000000000007, -0.6885245901639345, 0.050000000000000044, -0.6557377049180328, 0.08374999999999999, -0.6174863387978142, 0.1200000000000001, -0.5601092896174864, 0.14250000000000007, -0.5163934426229508, 0.16874999999999996, -0.44535519125683054, 0.1937500000000001, -0.3688524590163935, 0.21500000000000008, -0.2978142076502732, 0.22625000000000006, -0.24590163934426235, 0.2337499999999999, -0.21584699453551903, 0.23750000000000004, -0.16393442622950816);

    var controlPoints5 = []; // Array to store control points
    controlPoints5.push(-0.19270833333333337, -0.5671981776765376, -0.03125, -0.32801822323462404, 0.13645833333333335, -0.560364464692483);
    
    var controlPoints6 = []; // Array to store control points
    controlPoints6.push(-0.10833333333333328, 0.23006833712984054, -0.16666666666666663, 0.25284738041002275, -0.171875, 0.4214123006833713, -0.15208333333333335, 0.5558086560364465, -0.09479166666666672, 0.662870159453303, -0.05625000000000002, 0.6970387243735763, -0.014583333333333282, 0.6492027334851936, 0.002083333333333437, 0.5580865603644647, -0.006249999999999978, 0.43735763097949887, -0.03229166666666672, 0.2482915717539863);

    var controlPoints7 = []; // Array to store control points
    controlPoints7.push(0.008333333333333304, 0.19589977220956722, -0.007499999999999951, 0.28688524590163933, -0.007499999999999951, 0.35519125683060104, -0.003750000000000031, 0.4316939890710383, 0.006250000000000089, 0.4918032786885246, 0.03499999999999992, 0.5601092896174864, 0.06000000000000005, 0.5956284153005464, 0.09375, 0.5983606557377049, 0.12125000000000008, 0.5683060109289617, 0.14375000000000004, 0.5327868852459017, 0.15500000000000003, 0.4699453551912568, 0.1625000000000001, 0.40710382513661203, 0.15874999999999995, 0.2923497267759563, 0.14625, 0.21584699453551914, 0.12375000000000003, 0.1502732240437158, 0.08499999999999996, 0.1202185792349727, 0.05249999999999999, 0.12295081967213117, 0.020000000000000018, 0.15573770491803274, 0.004999999999999893, 0.1994535519125683, -0.0024999999999999467, 0.21857923497267762);

    var controlPoints8 = []; // Array to store control points
    controlPoints8.push(0.043749999999999956, 0, 0.12083333333333335, 0.006833712984054663, 0.26354166666666656, 0.006833712984054663);
    
    var controlPoints9 = []; // Array to store control points
    controlPoints9.push(-0.2895833333333333, 0.4214123006833713, -0.23750000000000004, 0.3143507972665148, -0.16874999999999996, 0.17995444191343968);

    var controlPoints10 = []; // Array to store control points
    controlPoints10.push(-0.36250000000000004, 0.2710706150341685, -0.28541666666666665, 0.19589977220956722, -0.19270833333333337, 0.10022779043280183);

    var controlPoints11 = []; // Array to store control points
    controlPoints11.push(0.04685212298682284, -0.08580343213728558, 0.15373352855051237, -0.13572542901716078, 0.28550512445095166, -0.19812792511700472);
    
    var controlPoints12 = []; // Array to store control points
    controlPoints12.push(-0.376281112737921, 0.04212168486739465, -0.30453879941434847, 0.020280811232449292, -0.21669106881405564, -0.007800312012480548);

    var controlPoints13 = []; // Array to store control points
    controlPoints13.push(0.040995607613469875, -0.17628705148205936, 0.16105417276720346, -0.29173166926677063, 0.253294289897511, -0.3822152886115444);

    var curve_vertex = [];
    var curve_faces = [];

    var curve_vertex1 = [];
    var curve_faces1 = [];

    var curve_vertex2 = [];
    var curve_faces2 = [];

    var curve_vertex3 = [];
    var curve_faces3 = [];

    var curve_vertex4 = [];
    var curve_faces4 = [];

    var curve_vertex5 = [];
    var curve_faces5 = [];

    var curve_vertex6 = [];
    var curve_faces6 = [];

    var curve_vertex7 = [];
    var curve_faces7 = [];

    var curve_vertex8 = [];
    var curve_faces8 = [];

    var curve_vertex9 = [];
    var curve_faces9 = [];

    var curve_vertex10 = [];
    var curve_faces10 = [];

    var curve_vertex11 = [];
    var curve_faces11 = [];

    var curve_vertex12 = [];
    var curve_faces12 = [];

    var curve_vertex13 = [];
    var curve_faces13 = [];


    var line_vertex = [];
    var line_faces = [];
    
    //gambar kepala 
    var circle_vertex = [];
    // 0 - 361
    for(var i = 0; i <= 360; i++){
        var theta = (i/360)*2*Math.PI;
        var x = 0.375*Math.cos(theta)+0.01;
        var y = 0.82*Math.sin(theta);
        circle_vertex.push(x,y,0,0,0);
    }

    var CIRCLE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circle_vertex),GL.STATIC_DRAW);

    //FACES 
    var circle_faces = [];
    for(var i = 0; i < 360; i++){
        circle_faces.push(i,i+1);
    }
    circle_faces.push(360,0);
    
    var CIRCLE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces),GL.STATIC_DRAW);

    //gambar hidung 
    var circle_vertex1 = [];
    // 0 - 361
    for(var i = 0; i <= 360; i++){
        var theta = (i/360)*2*Math.PI;
        var x = 0.055*Math.cos(theta)-0.0675;
        var y = 0.12*Math.sin(theta)+0.17;
        circle_vertex1.push(x,y,0,0,0);
    }

    var CIRCLE_VERTEX1 = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX1);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circle_vertex1),GL.STATIC_DRAW);

    //FACES 
    var circle_faces1 = [];
    for(var i = 0; i < 360; i++){
        circle_faces1.push(i,i+1);
    }
    circle_faces1.push(360,0);
    
    var CIRCLE_FACES1 = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES1);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces1),GL.STATIC_DRAW);

    //gambar mata
    var circle_vertex2 = [];
    circle_vertex2.push(-0.04685212298682284, 0.3478939157566303,0,0,0);
    // 0 - 361
    for(var i = 0; i <= 360; i++){
        var theta = (i/360)*2*Math.PI;
        var x = 0.025*Math.cos(theta)-0.02;
        var y = 0.075*Math.sin(theta)+0.05;
        circle_vertex2.push(x+-0.04685212298682284,y+0.3478939157566303,0,0,0);
    }

    var CIRCLE_VERTEX2 = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circle_vertex2),GL.STATIC_DRAW);

    //FACES 
    var circle_faces2 = [];
    for(var i = 0; i < 360; i++){
        circle_faces2.push(0,i,i+1);
    }
    circle_faces2.push(360,361,0);

    var CIRCLE_FACES2 = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces2),GL.STATIC_DRAW);

    //gambar mata 2
    var circle_vertex3 = [];
    circle_vertex3.push(0.08931185944363107, 0.24804992199687992,0,0,0);
    // 0 - 361
    for(var i = 0; i <= 360; i++){
        var theta = (i/360)*2*Math.PI;
        var x = 0.025*Math.cos(theta)-0.02;
        var y = 0.075*Math.sin(theta)+0.05;
        circle_vertex3.push(x+0.08931185944363107,y+0.24804992199687992,0,0,0);
    }

    var CIRCLE_VERTEX3 = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX3);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circle_vertex3),GL.STATIC_DRAW);

    //FACES 
    var circle_faces3 = [];
    for(var i = 0; i < 360; i++){
        circle_faces3.push(0,i,i+1);
    }
    circle_faces3.push(360,361,0);

    var CIRCLE_FACES3 = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES3);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces3),GL.STATIC_DRAW);


        //Gambar curve 0
        var numPoints = 100; // Number of points to approximate the curve
        var degree = 2; // Degree of the B-spline curve
        curve_faces = []
        var curveVertices = generateBSpline(controlPoints, numPoints, degree);

        curve_vertex = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex.push(curveVertices[count],curveVertices[count+1],0,0,0);
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

        //gambar curve 1
        curve_faces1 = []
        var curveVertices1 = generateBSpline(controlPoints1, numPoints, degree);

        curve_vertex1 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex1.push(curveVertices1[count],curveVertices1[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX1 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX1);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex1),GL.STATIC_DRAW);

        //face curve
        curve_faces1 = [];
        for(var i = 0; i < curve_vertex1.length/5-1; i++){
            curve_faces1.push(i,i+1);
        }

        //gambar curve 2
        curve_faces2 = []
        var curveVertices2 = generateBSpline(controlPoints2, numPoints, degree);

        curve_vertex2 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex2.push(curveVertices2[count],curveVertices2[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX2 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX2);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex2),GL.STATIC_DRAW);

        //face curve
        curve_faces2 = [];
        for(var i = 0; i < curve_vertex2.length/5-1; i++){
            curve_faces2.push(i,i+1);
        }

        //gambar curve 3
        curve_faces3 = []
        var curveVertices3 = generateBSpline(controlPoints3, numPoints, degree);

        curve_vertex3 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex3.push(curveVertices3[count],curveVertices3[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX3 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX3);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex3),GL.STATIC_DRAW);

        //face curve
        curve_faces3 = [];
        for(var i = 0; i < curve_vertex3.length/5-1; i++){
            curve_faces3.push(i,i+1);
        }
        
        //gambar curve 4
        curve_faces4 = []
        var curveVertices4 = generateBSpline(controlPoints4, numPoints, degree);

        curve_vertex4 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex4.push(curveVertices4[count],curveVertices4[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX4 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX4);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex4),GL.STATIC_DRAW);

        //face curve
        curve_faces4 = [];
        for(var i = 0; i < curve_vertex4.length/5-1; i++){
            curve_faces4.push(i,i+1);
        }
        
        //gambar curve 5
        curve_faces5 = []
        var curveVertices5 = generateBSpline(controlPoints5, numPoints, degree);

        curve_vertex5 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex5.push(curveVertices5[count],curveVertices5[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX5 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX5);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex5),GL.STATIC_DRAW);

        //face curve
        curve_faces5 = [];
        for(var i = 0; i < curve_vertex5.length/5-1; i++){
            curve_faces5.push(i,i+1);
        }

        //gambar curve 6
        curve_faces6 = []
        var curveVertices6 = generateBSpline(controlPoints6, numPoints, degree);

        curve_vertex6 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex6.push(curveVertices6[count],curveVertices6[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX6 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX6);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex6),GL.STATIC_DRAW);

        //face curve
        curve_faces6 = [];
        for(var i = 0; i < curve_vertex6.length/5-1; i++){
            curve_faces6.push(i,i+1);
        }
        
        //gambar curve 7
        curve_faces7 = []
        var curveVertices7 = generateBSpline(controlPoints7, numPoints, degree);

        curve_vertex7 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex7.push(curveVertices7[count],curveVertices7[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX7 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX7);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex7),GL.STATIC_DRAW);

        //face curve
        curve_faces7 = [];
        for(var i = 0; i < curve_vertex7.length/5-1; i++){
            curve_faces7.push(i,i+1);
        }

        //gambar curve 8
        curve_faces8 = []
        var curveVertices8 = generateBSpline(controlPoints8, numPoints, degree);

        curve_vertex8 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex8.push(curveVertices8[count],curveVertices8[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX8 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX8);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex8),GL.STATIC_DRAW);

        //face curve
        curve_faces8 = [];
        for(var i = 0; i < curve_vertex8.length/5-1; i++){
            curve_faces8.push(i,i+1);
        }

        //gambar curve 9
        curve_faces9 = []
        var curveVertices9 = generateBSpline(controlPoints9, numPoints, degree);

        curve_vertex9 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex9.push(curveVertices9[count],curveVertices9[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX9 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX9);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex9),GL.STATIC_DRAW);

        //face curve
        curve_faces9 = [];
        for(var i = 0; i < curve_vertex9.length/5-1; i++){
            curve_faces9.push(i,i+1);
        }
        
        //gambar curve 10
        curve_faces10 = []
        var curveVertices10 = generateBSpline(controlPoints10, numPoints, degree);

        curve_vertex10 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex10.push(curveVertices10[count],curveVertices10[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX10 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX10);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex10),GL.STATIC_DRAW);

        //face curve
        curve_faces10 = [];
        for(var i = 0; i < curve_vertex10.length/5-1; i++){
            curve_faces10.push(i,i+1);
        }

        //gambar curve 11
        curve_faces11 = []
        var curveVertices11 = generateBSpline(controlPoints11, numPoints, degree);

        curve_vertex11 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex11.push(curveVertices11[count],curveVertices11[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX11 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX11);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex11),GL.STATIC_DRAW);

        //face curve
        curve_faces11 = [];
        for(var i = 0; i < curve_vertex11.length/5-1; i++){
            curve_faces11.push(i,i+1);
        }

        //gambar curve 12
        curve_faces12 = []
        var curveVertices12 = generateBSpline(controlPoints12, numPoints, degree);

        curve_vertex12 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex12.push(curveVertices12[count],curveVertices12[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX12 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX12);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex12),GL.STATIC_DRAW);

        //face curve
        curve_faces12 = [];
        for(var i = 0; i < curve_vertex12.length/5-1; i++){
            curve_faces12.push(i,i+1);
        }
        
        //gambar curve 13
        curve_faces13 = []
        var curveVertices13 = generateBSpline(controlPoints13, numPoints, degree);

        curve_vertex13 = [];
        var count = 0
        for(var i = 0; i < numPoints; i++){
            curve_vertex13.push(curveVertices13[count],curveVertices13[count+1],0,0,0);
            count = count+2;
        }
        

        //vertex curve
        var CURVE_VERTEX13 = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX13);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(curve_vertex13),GL.STATIC_DRAW);

        //face curve
        curve_faces13 = [];
        for(var i = 0; i < curve_vertex13.length/5-1; i++){
            curve_faces13.push(i,i+1);
        }
        

        //draw curve 0
        var CURVE_FACES = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces),GL.STATIC_DRAW);

        //draw curve 1
        var CURVE_FACES1 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES1);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces1),GL.STATIC_DRAW);

        //draw curve 2
        var CURVE_FACES2 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES2);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces2),GL.STATIC_DRAW);

        //draw curve 3
        var CURVE_FACES3 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES3);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces3),GL.STATIC_DRAW);

        //draw curve 4
        var CURVE_FACES4 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES4);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces4),GL.STATIC_DRAW);

        //draw curve 5
        var CURVE_FACES5 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES5);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces5),GL.STATIC_DRAW);

        //draw curve 6
        var CURVE_FACES6 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES6);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces6),GL.STATIC_DRAW);

        //draw curve 7
        var CURVE_FACES7 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES7);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces7),GL.STATIC_DRAW);

        //draw curve 8
        var CURVE_FACES8 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES8);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces8),GL.STATIC_DRAW);

        //draw curve 9
        var CURVE_FACES9 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES9);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces9),GL.STATIC_DRAW);

        //draw curve 10
        var CURVE_FACES10 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES10);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces10),GL.STATIC_DRAW);

        //draw curve 11
        var CURVE_FACES11 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES11);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces11),GL.STATIC_DRAW);

        //draw curve 12
        var CURVE_FACES12 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES12);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces12),GL.STATIC_DRAW);

        //draw curve 13
        var CURVE_FACES13 = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES13);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(curve_faces13),GL.STATIC_DRAW);

        //drawing
        var animate = function(){
            GL.viewport(0,0,CANVAS.width,CANVAS.height);
            GL.clear(GL.COLOR_BUFFER_BIT);

            //draw kepala
            GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
        GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
        GL.drawElements(GL.LINE_STRIP, circle_faces.length, GL.UNSIGNED_SHORT,0);

        //draw hidung
        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX1);
        GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES1);
        GL.drawElements(GL.LINE_STRIP, circle_faces1.length, GL.UNSIGNED_SHORT,0);

        //draw mata
        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2);
        GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);
        GL.drawElements(GL.TRIANGLES, circle_faces2.length, GL.UNSIGNED_SHORT,0);

        //draw mata 2
        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX3);
        GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES3);
        GL.drawElements(GL.TRIANGLES, circle_faces3.length, GL.UNSIGNED_SHORT,0);

            //draw curve 0
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES);
            GL.drawElements(GL.LINE_STRIP, curve_faces.length, GL.UNSIGNED_SHORT,0);

            //draw curve 1
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX1);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES1);
            GL.drawElements(GL.LINE_STRIP, curve_faces1.length, GL.UNSIGNED_SHORT,0);

            //draw curve 2
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX2);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES2);
            GL.drawElements(GL.LINE_STRIP, curve_faces2.length, GL.UNSIGNED_SHORT,0);

            //draw curve 3
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX3);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES3);
            GL.drawElements(GL.LINE_STRIP, curve_faces3.length, GL.UNSIGNED_SHORT,0);

            //draw curve 4
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX4);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES4);
            GL.drawElements(GL.LINE_STRIP, curve_faces4.length, GL.UNSIGNED_SHORT,0);

            //draw curve 5
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX5);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES5);
            GL.drawElements(GL.LINE_STRIP, curve_faces5.length, GL.UNSIGNED_SHORT,0);

            //draw curve 6
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX6);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES6);
            GL.drawElements(GL.LINE_STRIP, curve_faces6.length, GL.UNSIGNED_SHORT,0);

            //draw curve 7
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX7);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES7);
            GL.drawElements(GL.LINE_STRIP, curve_faces7.length, GL.UNSIGNED_SHORT,0);

            //draw curve 8
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX8);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES8);
            GL.drawElements(GL.LINE_STRIP, curve_faces8.length, GL.UNSIGNED_SHORT,0);

            //draw curve 9
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX9);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES9);
            GL.drawElements(GL.LINE_STRIP, curve_faces9.length, GL.UNSIGNED_SHORT,0);

            //draw curve 10
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX10);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES10);
            GL.drawElements(GL.LINE_STRIP, curve_faces10.length, GL.UNSIGNED_SHORT,0);

            //draw curve 11
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX11);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES11);
            GL.drawElements(GL.LINE_STRIP, curve_faces11.length, GL.UNSIGNED_SHORT,0);

            //draw curve 12
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX12);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES12);
            GL.drawElements(GL.LINE_STRIP, curve_faces12.length, GL.UNSIGNED_SHORT,0);

            //draw curve 13
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX13);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACES13);
            GL.drawElements(GL.LINE_STRIP, curve_faces13.length, GL.UNSIGNED_SHORT,0);


            //draw line
            GL.bindBuffer(GL.ARRAY_BUFFER, LINE_VERTEX);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, LINE_FACES);
            GL.drawElements(GL.LINES, line_faces.length, GL.UNSIGNED_SHORT,0);

            //draw curve master
            GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEXM);
            GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CURVE_FACESM);
            GL.drawElements(GL.LINE_STRIP, curve_facesM.length, GL.UNSIGNED_SHORT,0);

            GL.flush();
            window.requestAnimationFrame(animate);
        }
            animate();
            drag = false;
    

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);


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
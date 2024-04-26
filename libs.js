var LIBS = {

    degToRad: function(angle){

      return(angle*Math.PI/180);

    },

  

    get_projection: function(angle, a, zMin, zMax) {

      var tan = Math.tan(LIBS.degToRad(0.5*angle)),

          A = -(zMax+zMin)/(zMax-zMin),

          B = (-2*zMax*zMin)/(zMax-zMin);

  

      return [

        0.5/tan, 0 ,   0, 0,

        0, 0.5*a/tan,  0, 0,

        0, 0,         A, -1,

        0, 0,         B, 0

      ];

    },

    set_I4: function(m) {

      m[0] = 1,  m[1] = 0,  m[2] = 0,  m[3] = 0,
      m[4] = 0,  m[5] = 1,  m[6] = 0,  m[7] = 0,  
      m[8] = 0,  m[9] = 0,  m[10] = 1,  m[11] = 0,  
      m[12] = 0,  m[13] = 0,  m[14] = 0,  m[15] = 1;  

    },

    get_I4: function() {

        return [1,0,0,0,

                0,1,0,0,

                0,0,1,0,

                0,0,0,1];

      },

    

      rotateX: function(m, angle) {

        var c = Math.cos(angle);

        var s = Math.sin(angle);

        var mv1=m[1], mv5=m[5], mv9=m[9];

        m[1]=m[1]*c-m[2]*s;

        m[5]=m[5]*c-m[6]*s;

        m[9]=m[9]*c-m[10]*s;

    

        m[2]=m[2]*c+mv1*s;

        m[6]=m[6]*c+mv5*s;

        m[10]=m[10]*c+mv9*s;

      },

    

      rotateY: function(m, angle) {

        var c = Math.cos(angle);

        var s = Math.sin(angle);

        var mv0=m[0], mv4=m[4], mv8=m[8];

        m[0]=c*m[0]+s*m[2];

        m[4]=c*m[4]+s*m[6];

        m[8]=c*m[8]+s*m[10];

    

        m[2]=c*m[2]-s*mv0;

        m[6]=c*m[6]-s*mv4;

        m[10]=c*m[10]-s*mv8;

      },

    

      rotateZ: function(m, angle) {

        var c = Math.cos(angle);

        var s = Math.sin(angle);

        var mv0=m[0], mv4=m[4], mv8=m[8];

        m[0]=c*m[0]-s*m[1];

        m[4]=c*m[4]-s*m[5];

        m[8]=c*m[8]-s*m[9];

    

        m[1]=c*m[1]+s*mv0;

        m[5]=c*m[5]+s*mv4;

        m[9]=c*m[9]+s*mv8;

      },

      translateZ: function(m, t){

        m[14]+=t;

      },

      translateY: function(m, t){

        m[13]+=t;

      },

      translateX: function(m, t){

        m[12]+=t;

      },

      mul: function(mat1, mat2) 
    {
      let i,j,k;
      var res = this.get_I4();
      var N = 4;
      for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++) {
          res[i*N+j] = 0;
          for (k = 0; k < N; k++) {
            res [i*N+j] += mat1[i*N+k] * mat2[k*N+j];
          }
        }
      }
      return res;
    },

    sub: function(mat1, mat2) 
    {
      let i,j,k;
      var res = this.get_I4();
      var N = 4;
      for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++) {
          res[i*N+j] = mat1[i*N+j] - mat2[i*N+j];
        }
      }
      return res;
    },

    cloneMatrix: function (matrix) {
      var clone = [];
      for (var i = 0; i < matrix.length; i++) {
          clone[i] = matrix[i];
      }
      return clone;
  },

  invert: function(matrix) {
    var result = [];
    var m = matrix;
    var det = m[0][0] * m[1][1] * m[2][2] +
              m[0][1] * m[1][2] * m[2][0] +
              m[0][2] * m[1][0] * m[2][1] -
              m[0][0] * m[1][2] * m[2][1] -
              m[0][1] * m[1][0] * m[2][2] -
              m[0][2] * m[1][1] * m[2][0];
    
    if (det == 0) {
        throw "Matriks tidak dapat diinvert, determinan adalah 0";
    }

    var invDet = 1 / det;

    result[0] = [];
    result[1] = [];
    result[2] = [];

    result[0][0] = (m[1][1] * m[2][2] - m[1][2] * m[2][1]) * invDet;
    result[0][1] = (m[0][2] * m[2][1] - m[0][1] * m[2][2]) * invDet;
    result[0][2] = (m[0][1] * m[1][2] - m[0][2] * m[1][1]) * invDet;
    result[0][3] = 0;

    result[1][0] = (m[1][2] * m[2][0] - m[1][0] * m[2][2]) * invDet;
    result[1][1] = (m[0][0] * m[2][2] - m[0][2] * m[2][0]) * invDet;
    result[1][2] = (m[0][2] * m[1][0] - m[0][0] * m[1][2]) * invDet;
    result[1][3] = 0;

    result[2][0] = (m[1][0] * m[2][1] - m[1][1] * m[2][0]) * invDet;
    result[2][1] = (m[0][1] * m[2][0] - m[0][0] * m[2][1]) * invDet;
    result[2][2] = (m[0][0] * m[1][1] - m[0][1] * m[1][0]) * invDet;
    result[2][3] = 0;

    result[3] = [];
    result[3][0] = 0;
    result[3][1] = 0;
    result[3][2] = 0;
    result[3][3] = 1;

    return result;
}
  };
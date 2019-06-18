      attribute vec2 a_positionCord;
      attribute vec2 a_textCord;

      uniform vec2 u_resolution;
      uniform float u_flipY;

      varying vec2 v_textCord;

      void main(){
        // convert to clipSpace
        vec2 zeroToOne = a_positionCord / u_resolution;
        vec2 clipSpace = (zeroToOne * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, u_flipY), 0.0, 1.0);

        v_textCord = a_textCord;
}

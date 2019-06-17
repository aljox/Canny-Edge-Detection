precision mediump float;

      uniform sampler2D u_sampler;
      uniform vec2 u_textureSize;

      varying vec2 v_textCord;

      void main(){
        vec2 distanceOnePixel = vec2(1.0, 1.0) / u_textureSize;
        vec4 pixelDoubleThreshold = texture2D(u_sampler, v_textCord);
        vec4 edge = vec4(1.0, 1.0, 1.0, 1.0);

        //if low threshold pixel check surrounding for high threshold pixel
        if(pixelDoubleThreshold.y != 0.0){
          if(texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(-1, -1)).x == 1.0 ||
             texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(0, -1)).x == 1.0 ||
             texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(1, -1)).x == 1.0 ||
             texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(-1, 0)).x == 1.0 ||
             texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(1, 0)).x == 1.0 ||
             texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(-1, 1)).x == 1.0 ||
             texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(0, 1)).x == 1.0 ||
             texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(1, 1)).x == 1.0){
               pixelDoubleThreshold.y = 1.0;
             } else {
               pixelDoubleThreshold.y = 0.0;
             }
        }

        if(pixelDoubleThreshold.x == 1.0 || pixelDoubleThreshold.y == 1.0){
          pixelDoubleThreshold.z = 1.0;
        } else {
          pixelDoubleThreshold.z = 0.0;
        }

        gl_FragColor = vec4(pixelDoubleThreshold.z, pixelDoubleThreshold.z, pixelDoubleThreshold.z, 1.0);
      }
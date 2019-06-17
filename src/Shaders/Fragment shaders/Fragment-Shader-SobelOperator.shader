precision mediump float;

      uniform sampler2D u_sampler;
      uniform vec2 u_textureSize;
      uniform float u_kernelX[9];
      uniform float u_kernelY[9];

      varying vec2 v_textCord;

      void main(){
        vec2 distanceOnePixel = vec2(1.0, 1.0) / u_textureSize;
        vec4 dX = vec4(0.0, 0.0, 0.0, 0.0);
        vec4 dY = vec4(0.0, 0.0, 0.0, 0.0);
        int x = -1;
        int y = -1;

        //loop je tako napisan, ker sem imel problem z dostopanjem do tabele z nekonstantnim indexom
        for(int i = 0; i < 9; i++){
          dX += texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(x, y)) * u_kernelX[i];
          dY += texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(x, y)) * u_kernelY[i];
          if(x == 1){
            x = 0;
            y++;
            continue;
          }

          x++;
        }

        //smer gradienta
        float theta = atan(dY.r, dX.r);
        float magnitude = abs(dX.r) + abs(dY.r);

        //intensify edges for easier recognition
        if(magnitude > 0.01) {
          magnitude += 0.25;
        }

        gl_FragColor = vec4(magnitude, 0.0, theta, 1.0);
        //gl_FragColor = vec4(magnitude, magnitude, magnitude, 1.0);
      }

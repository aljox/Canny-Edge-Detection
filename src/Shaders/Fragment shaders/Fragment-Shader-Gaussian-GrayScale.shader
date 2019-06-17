precision mediump float;

      uniform sampler2D u_sampler;
      uniform vec2 u_textureSize;
      uniform float u_kernel[25];
      uniform float u_kernelWeight;

      varying vec2 v_textCord;

      void main(){
        vec2 distanceOnePixel = vec2(1.0, 1.0) / u_textureSize;
        vec4 sumOfColor = vec4(0.0, 0.0, 0.0, 0.0);
        int x = -2;
        int y = -2;

        //loop je tako napisan, ker sem imel problem z dostopanjem do tabele z nekonstantnim indexom
        for(int i = 0; i < 25; i++){
          sumOfColor += texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(x, y)) * u_kernel[i];
          if(x == 2){
            x = 0;
            y++;
            continue;
          }

          x++;
        }

        sumOfColor /= u_kernelWeight;

        //convert to grayscale
        float gray = sumOfColor.r * 0.3 + sumOfColor.g * 0.59 + sumOfColor.b * 0.07;
        gl_FragColor = vec4(gray, gray, gray, sumOfColor.a);
      }
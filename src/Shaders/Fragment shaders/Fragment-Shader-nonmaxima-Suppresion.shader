precision mediump float;

      uniform sampler2D u_sampler;
      uniform vec2 u_textureSize;

      varying vec2 v_textCord;

      void main(){

        vec2 distanceOnePixel = vec2(1.0, 1.0) / u_textureSize;
        vec4 gradientIntensity = texture2D(u_sampler, v_textCord);
        float theta = gradientIntensity.z;
        int neighburX = 0;
        int neighburY = 0;

        if ((theta >= 337.5) || (theta < 22.5)) { neighburX  = 1; neighburY = 0; }
      	else if ((theta >= 22.5) && (theta < 67.5)) { neighburX  = 1; neighburY = 1; }
      	else if ((theta >= 67.5) && (theta < 112.5)) { neighburX  = 0; neighburY = 1; }
      	else if ((theta >= 112.5) && (theta < 157.5)) { neighburX  =-1; neighburY = 1; }
      	else if ((theta >= 157.5) && (theta < 202.5)) { neighburX  =-1; neighburY = 0; }
      	else if ((theta >=202.5) && (theta < 247.5)) { neighburX  =-1; neighburY =-1; }
      	else if ((theta >=247.5) && (theta < 292.5)) { neighburX  = 0; neighburY =-1; }
      	else if ((theta >= 292.5) && (theta < 337.5)) { neighburX  = 1; neighburY =-1; }

        vec4 neighbur1 = texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(neighburX, neighburY));
        vec4 neighbur2 = texture2D(u_sampler, v_textCord + distanceOnePixel * vec2(-neighburX, -neighburY));
        if(gradientIntensity.x < neighbur1.x || gradientIntensity.x < neighbur2.x){
          gradientIntensity.x = 0.0;
        }

        //Set therhold
        //Set low threshold to y colour component
        if(gradientIntensity.x > 0.1 && gradientIntensity.x < 0.3){
          gradientIntensity.y = gradientIntensity.x;
        } else {
          gradientIntensity.y = 0.0;
        }

        //Set high threshold to x colour component
        if(gradientIntensity.x < 0.5){
          gradientIntensity.x = 0.0;
        } else {
          gradientIntensity.x = 1.0;
        }

        gl_FragColor = vec4(gradientIntensity.x, gradientIntensity.y, 0.0, 1.0);

        //gl_FragColor = vec4(gradientIntensity.x, gradientIntensity.x, gradientIntensity.x, 1.0);
        //gl_FragColor = vec4(gradientIntensity.y, gradientIntensity.y, gradientIntensity.y, 1.0);
      }

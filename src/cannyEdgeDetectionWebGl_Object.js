//Set webGL context
let canvas = document.getElementById("canvas");
let gl = canvas.getContext("webgl")
if(!gl){
  throw Error("Browser might not support WebGl");
}

const IMAGE_SRC = "cat.jpg";
//const IMAGE_SRC = "tip.jpg";
//const IMAGE_SRC = "metulj.jpg";
//const IMAGE_SRC = "heart.jpg";

//Opis programov;
const programSource = ["Vertex-Shader", "Fragment-Shader-Gaussian-GrayScale",
                       "Vertex-Shader", "Fragment-Shader-SobelOperator",
                       "Vertex-Shader", "Fragment-Shader-nonmaxima-Suppresion",
                       "Vertex-Shader", "Fragment-Shader-Edge-Linking"];
const numOfPrograms = programSource.length / 2;

let shaderSource = [];
let programs = [];


function main(){
  loadShaderSource(programSource[0], 0, programSource.length);
}

//Load .shader files
function loadShaderSource(shaderUrl, currrentNum, numOfshaders){
  fetch("/" + shaderUrl + ".shader")
  .then(response => response.text())
  .then((data) => {
    shaderSource.push(data);
    currrentNum++;

    if(currrentNum < numOfshaders){
      loadShaderSource(programSource[currrentNum], currrentNum, numOfshaders);
    } else {
      initialsePrograms();
    }
  });
}

function initialsePrograms(){
  for(i = 0; i < numOfPrograms; i++){
    programs.push(new Program(shaderSource[i * 2], shaderSource[i * 2 + 1]));
  }

  loadImage(IMAGE_SRC, renderImage);
}

function loadImage(imageSrc, callback){
  let image = new Image();
  image.onload = function() {
    console.log("Image loaded\n");
    resizeCanvasToPictureSize(image.width, image.height);
    callback(image);
  }

  image.onerror = function() {
    throw Error("Image error");
  }
  image.src = imageSrc;
}

function renderImage(image){

  //Create original image texture
  let originalImage = createAndSetupTexture();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  //Set textures to apply effects
  let textures = [];
  let frameBuffers = [];
  for(i = 0; i < 2; i++){
    setUpFrameBufferAndAttachTexture();
  }

  //Set object for settng programs attributes and uniforms
  let programAttributesValues = setProgramAttributeValues();
  let programUniformValues = setProgramUniformValues(image);

  //Ping pong between textures
  gl.bindTexture(gl.TEXTURE_2D, originalImage);

  for(i = 0; i < numOfPrograms; i++){
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(programs[i].getProgram());
    programs[i].setAttributes(programAttributesValues, programUniformValues[i]);

    if(i == numOfPrograms - 1){
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      break;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[i % 2]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindTexture(gl.TEXTURE_2D, textures[i % 2]);
  }

  function setUpFrameBufferAndAttachTexture(){
    let texture = createAndSetupTexture();
    textures.push(texture);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null);

        let frameBufferObject = gl.createFramebuffer();
        frameBuffers.push(frameBufferObject);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferObject);

    // Attach a texture to it.
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }
}

function setProgramAttributeValues(){
  let atribBuffersSet = {
    a_positionCord: {buffer: createAndSetBuffer(setRectanlge()),
                         numOfComponents: 2,
                         typeValue: "FLOAT",
                         normalisation: false,
                         stride: 0,
                         offset: 0,
                       },
    a_textCord: {buffer: createAndSetBuffer(setTextCord()),
                       numOfComponents: 2,
                       typeValue: "FLOAT",
                       normalisation: false,
                       stride: 0,
                       offset: 0,
                    },
  };

  return atribBuffersSet;
}

function setProgramUniformValues(image){
  let uniformSetArray = [];

  let uniformSetGaussianGrayScale = {
    u_resolution: {property: "2f", value: [canvas.width, canvas.height]},
    u_flipY: {property: "1f", value: 1},
    u_textureSize: {property: "2f", value: [image.width, image.height]},
    u_kernel: {property: "1fv", value: setGaussianKernel()},
    u_kernelWeight: {property: "1f", value: setKernelWeight(setGaussianKernel())},
  };
  uniformSetArray.push(uniformSetGaussianGrayScale);

  let uniformSetSobelOperator = {
    u_resolution: {property: "2f", value: [canvas.width, canvas.height]},
    u_flipY: {property: "1f", value: 1},
    u_textureSize: {property: "2f", value: [image.width, image.height]},
    u_kernelX: {property: "1fv", value: setSobelXKernel()},
    u_kernelY: {property: "1fv", value: setSobelYKernel()},
  };
  uniformSetArray.push(uniformSetSobelOperator);

  let uniformSetNonmaximaSuppresion = {
    u_resolution: {property: "2f", value: [canvas.width, canvas.height]},
    u_flipY: {property: "1f", value: 1},
    u_textureSize: {property: "2f", value: [image.width, image.height]},
  };
  uniformSetArray.push(uniformSetNonmaximaSuppresion);

  let uniformSetEdgeLinking = {
    u_resolution: {property: "2f", value: [canvas.width, canvas.height]},
    u_flipY: {property: "1f", value: -1},
    u_textureSize: {property: "2f", value: [image.width, image.height]},
  };
  uniformSetArray.push(uniformSetEdgeLinking);

  return uniformSetArray;
}

function createAndSetBuffer(data){
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  return buffer;
}

function createAndSetupTexture() {
   let texture = gl.createTexture();
   gl.bindTexture(gl.TEXTURE_2D, texture);

   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

   return texture;
 }

 function resizeCanvasToPictureSize(width, height){
   canvas.width = width;
   canvas.height = height;

   console.log("Canvas width: " + canvas.width + "\n");
   console.log("Canvas height: " + canvas.height + "\n");
 }

function setRectanlge(){
  let position = [
    0, 0,
    0, canvas.height,
    canvas.width, 0,

    0, canvas.height,
    canvas.width, 0,
    canvas.width, canvas.height
  ];

  return position;
}

function setTextCord(){
  let textCord = [
    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,

    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
  ];

  return textCord;
}

function setGaussianKernel(){
  let kernel = [
    1, 4, 7, 4, 1,
    4, 16, 26, 16, 4,
    7, 26, 41, 26, 7,
    4, 16, 26, 16, 4,
    1, 4, 7, 4, 1
  ];

  return kernel;
}

function setSobelXKernel(){
  let kernel = [
    1, 0, -1,
    2, 0, -2,
    1, 0, -1,
  ];

  return kernel;
}

function setSobelYKernel(){
  let kernel = [
    1, 2, 1,
    0, 0, 0,
    -1, -2, -1,
  ];

  return kernel;
}

function setKernelWeight(kernel){
  let kernelSum = 0;
  kernel.forEach(function(item){
    kernelSum += item;
  });
  console.log("KernelSum: " + kernelSum + "\n");

  if(kernelSum > 1.0) return kernelSum;

  return 1.0;
}

main();

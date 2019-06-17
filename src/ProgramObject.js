class Program{
  constructor(vertexShaderSource, fragmentShaderSource){
        this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);

        this.attributeNamesVertex = this.getLocationNames(vertexShaderSource);
        this.attributeNamesFragment = this.getLocationNames(fragmentShaderSource);

        this.attributeLocation = this.setLocations(this.attributeNamesVertex.concat(this.attributeNamesFragment));
  }

  //Parse shader source
  //Attributes are specified by: a_name
  //Uniforms are specified by: u_name
  getLocationNames(source){
    let attributeNames = [];
    let indexMain = -1;
    let index = 0;
    let indexSemicoln = -1;
    let indexBracket = -1

    let searchKeyWords = [" a_", " u_"];

    for(let i = 0; i < searchKeyWords.length; i++){
      let tempString = source;
      index = tempString.search(searchKeyWords[i]);
      indexMain = tempString.search("main");

      while(index != -1 && index < indexMain){
        tempString = tempString.slice(index + 1);
        indexSemicoln = tempString.search(";");
        indexBracket = tempString.search("\\[");
        if(indexBracket != -1){
            if(indexBracket < indexSemicoln) indexSemicoln = indexBracket;
        }

        attributeNames.push(tempString.slice(0, indexSemicoln));
        tempString = tempString.slice(indexSemicoln);

        index = tempString.search(searchKeyWords[i]);
        indexMain = tempString.search("main");
      }
    }

    return attributeNames;
  }

  //Set webGl location for attrinutes and uniforms
  setLocations(attributeNames){
    let locations = {};

    for(let i = 0; i < attributeNames.length; i++){
      if(attributeNames[i].search("a_") > -1){
        locations[attributeNames[i] + "Loc"] = gl.getAttribLocation(this.program, attributeNames[i]);
      } else {
        locations[attributeNames[i] + "Loc"] = gl.getUniformLocation(this.program, attributeNames[i]);
      }
    }

    return locations;
  }

  //Parameter 1: Object of attribute objects named a_nameOfAttribute and having a form: buffer:webGl buffer objects,
  //numOfComponents, typeValue, normalisation, stride, offset
  //Parameter 2: Object of uniform objects named u_nameOfUniform and having a form:  property: setting corect gl.uniform command,
  //value: depending on property
  setAttributes(attribiteSetters, uniformSetters){
    let attributeNames = this.attributeNamesVertex.concat(this.attributeNamesFragment);

    for(let name of attributeNames){
      if(name.search("a_") != -1){
        if(!(attribiteSetters.hasOwnProperty(name))){
            throw Error("Property " + name + " not found in attribiteSetters object");
        }

        gl.enableVertexAttribArray(this.attributeLocation[name + "Loc"]);
        gl.bindBuffer(gl.ARRAY_BUFFER, attribiteSetters[name].buffer);
        gl.vertexAttribPointer(this.attributeLocation[name + "Loc"], attribiteSetters[name].numOfComponents,
                                gl[attribiteSetters[name].typeValue],attribiteSetters[name].normalisation,
                                 attribiteSetters[name].stride, attribiteSetters[name].offset);
      } else {
        //Not complete for all gl.uniform commands

        if(name === "u_sampler") continue;

        if(!(uniformSetters.hasOwnProperty(name))){
            throw Error("Property " + name + " not found in uniformSetters object");
        }

        if(uniformSetters[name].property.search("1f") != -1){
          gl["uniform" + uniformSetters[name].property](this.attributeLocation[name + "Loc"], uniformSetters[name].value);

        } else if(uniformSetters[name].property.search("2f") != -1){
          let valueArray =  uniformSetters[name].value;

          gl["uniform" + uniformSetters[name].property](this.attributeLocation[name + "Loc"], valueArray[0], valueArray[1]);

        } else if(uniformSetters[name].property.search("1fv") != -1){
          gl["uniform" + uniformSetters[name].property](this.attributeLocation[name + "Loc"], uniformSetters[name].value);
        }
      }
    }
  }

  createShaderProgram(vertexShaderSource, fragmentShaderSource){
    let fragmentShader = this.createAndCompileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    let vertexShader = this.createAndCompileShader(vertexShaderSource, gl.VERTEX_SHADER);

    return this.crateAndCompileProgram(vertexShader, fragmentShader);
  }

  createAndCompileShader(shaderSource, shaderType){
    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    // Check if compiled
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      throw "could not compile shader " + shaderSource + " : " + gl.getShaderInfoLog(shader);
    }

    return shader;
  }

  crateAndCompileProgram(vertexShader, fragmentShader){
    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    // Check if it linked.
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw ("program filed to link:" + gl.getProgramInfoLog (program));
    }

    console.log("Program initialise complete!");
    return program;
  }

  getProgram(){
    return this.program;
  }

  getAttributeLocation(){
    return this.attributeLocation;
  }
}

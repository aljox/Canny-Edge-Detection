
function selectImageEvent(event){
  let imageFile = event.target.files;

  let imageReader = new FileReader();
  imageReader.onload = function() {
    getImageData(imageReader.result);
  }

  imageReader.onerror = function() {
    throw Error("imageReader error.");
  }

  imageReader.readAsDataURL(imageFile[0]);
}

function getImageData(urlData){
  image = new Image();
  image.onload = function() {
    console.log("Image loaded\n");

    let imageApectRatio = image.width/image.height;
    image.width = 1280;
    image.height = image.width / imageApectRatio;

    resizeCanvasToPictureSize(image.width, image.height);
    renderImage(image);
  }

  image.onerror = function() {
    throw Error("Image error.");
  }
  image.src = urlData;
}

function getHighSliderEvent(event){
  let value = event.target.value / 100;
  if(value < threshold[0]){
    value = threshold[0];
  }
  threshold[1] = value;

  renderImage(image);
}

function getLowSliderEvent(event){
  let value = event.target.value / 100;
  if(value > threshold[1]){
    value = threshold[1];
  }
  threshold[0] = value;

  renderImage(image);
}

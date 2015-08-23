var easyimg = require('easyimage');

var ImageObject = {"scale": 1.77777, "angle": 0, "x": 0, "y": 0, "w": 640, "h": 480};

easyimg.crop({
  src:'testimage.png', dst:'cropped-test.png',
  width: 640, height: 480,
  cropwidth: (ImageObject["w"] / ImageObject["scale"]), cropheight: (ImageObject["h"] / ImageObject["scale"]),
  gravity:'North',
  x: (ImageObject["x"] / ImageObject["scale"]), y: (ImageObject["h"] / ImageObject["scale"])
}).then(
function(image) 
{
   console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
},
function (err) 
{
  console.log(err);
});
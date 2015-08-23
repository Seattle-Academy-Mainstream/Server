var easyimg = require('easyimage');

var ImageObject = {"scale": 1.77777, "angle": 0, "x": 0, "y": 0, "w": 360, "h": 640};

easyimg.crop({
  src:'testimage.png', dst:'/var/local/mainstreamd/cropped-test.png',
  width: ImageObject["w"], height: ImageObject["h"],
  cropwidth: (640 / ImageObject["scale"]), cropheight: (480 / ImageObject["scale"]),
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
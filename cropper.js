var easyimg = require('easyimage');

var ImageObject = {"scale": 1.77777, "angle": 0, "x": 0, "y": 256, "w": 360, "h": 640};

console.log(ImageObject["x"] / ImageObject["scale"])
console.log(ImageObject["y"] / ImageObject["scale"])


easyimg.crop({
  src:'testimage.png', dst:'/var/local/mainstreamd/Images/cropped-test.png',
  cropwidth: (640 / ImageObject["scale"]), cropheight: (480 / ImageObject["scale"]),
  gravity:'North',
  x: (ImageObject["x"] / ImageObject["scale"]), y: (ImageObject["y"] / ImageObject["scale"])
}).then(
function(image) 
{
   console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
},
function (err) 
{
  console.log(err);
});
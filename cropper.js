var easyimg = require('easyimage');

var exports = module.exports = {};

//this is a sample of a valid image object
//{"scale": 1.77777, "angle": 0, "x": 0, "y": 256, "w": 360, "h": 640}
exports.Crop = function(ImageObject, ImageName, Callback)
{
  easyimg.crop({
    src: "/var/local/mainstreamd/UnscaledImages/" + ImageName, dst:"/var/local/mainstreamd/Images/" + ImageName,
    cropwidth: (640 / ImageObject["scale"]), cropheight: (480 / ImageObject["scale"]),
    gravity:'North',
    x: (ImageObject["x"] / ImageObject["scale"]), y: (ImageObject["y"] / ImageObject["scale"])
  }).then(
  function(image) 
  {
     console.log("Resized and Cropped Image.");
  },
  function (err) 
  {
    console.log(err);
  });
}
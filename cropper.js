var easyimg = require('easyimage');

var exports = module.exports = {};

//this is a sample of a valid image object
//{"scale": 1.77777, "angle": 0, "x": 0, "y": 256, "w": 360, "h": 640}
exports.Crop = function(ImageObject, ImageName, Callback)
{
  console.log("CropSize = " + 640 / ImageObject["scale"] + "x" + 480 / ImageObject["scale"]);
  console.log("CropStart = " + ImageObject["x"] / ImageObject["scale"] + ", " + ImageObject["y"] / ImageObject["scale"]);

  //the example:
  //convert flower.jpg -crop 128×128+50+50 flower_crop.jpg

  var exec = require('child_process').exec;
  var Command = "convert " + "/var/local/mainstreamd/RawImages/" + ImageName + " -crop " + Math.floor(640 / ImageObject["scale"]) + "×" + Math.floor(480 / ImageObject["scale"]) + "+" + Math.floor(ImageObject["x"] / ImageObject["scale"]) +"+" + Math.floor(ImageObject["y"] / ImageObject["scale"]) + " /var/local/mainstreamd/Images/" + ImageName;

  console.log(Command);

  exec(Command, function(error, stdout, stderr) {
    console.log(error);
    
    Callback();
  });

  // easyimg.crop({
  //   src: "/var/local/mainstreamd/RawImages/" + ImageName, dst:"/var/local/mainstreamd/Images/" + ImageName,
  //   cropwidth: (640 / ImageObject["scale"]), cropheight: (480 / ImageObject["scale"]),
  //   gravity:'North',
  //   x: (ImageObject["x"] / ImageObject["scale"]), y: (ImageObject["y"] / ImageObject["scale"])
  // }).then(
  // function(image) 
  // {
  //    console.log("Resized and Cropped Image.");
  // },
  // function (err) 
  // {
  //   console.log(err);
  // });
}
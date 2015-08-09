var easyimg = require('easyimage');

easyimg.crop({
     src:'test.png', dst:'cropped-test.png',
     width:500, height:500,
     cropwidth:128, cropheight:128,
      gravity:'North',
     x:0, y:0
  }).then(
  function(image) {
     console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
  },
  function (err) {
    console.log(err);
  }
);
/**
 * Give Canvas "save as..." functionality!
 */
function saveImageAs(sketch) {

  // get image data from canvas!
  var cv = sketch.externals.canvas,
      bbox = cv.getBoundingClientRect(),
      bindata = cv.toDataURL("png");

  // create overlay image element!
  var img = new Image();
  // FIXME: not the best way to position =)
  img.style.position = "absolute";
  img.style.top = "7px";

  img.style.border = cv.style.border;
  img.style.margin = cv.style.margin;
  img.style.padding = cv.style.padding;

  // if we right click on this image, and
  // then mouse out of the image (into the
  // menu) and then mouse back in, remove
  // the image from the DOM again. The
  // browser will still be able to save it.
  img.oncontextmenu = function() {
    img.onmouseout = function() {
      img.onmouseover = img.parentNode.removeChild(img);
    }
  }

  // make the magic happen:
  img.src = bindata;
  cv.parentNode.appendChild(img);
}
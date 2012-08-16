abstract class Console {
  abstract void log(String s); 
}

abstract class Window {
  Console console; 
}

abstract class JavaScript {
  Window window;
  Console console; 
  abstract void sketchLoaded(PApplet sketch);
  abstract void plotFinished(PApplet sketch);
  abstract void saveImageAs(PApplet sketch);
}

JavaScript js = null;

void bindJavaScript(JavaScript _js) {
  js=_js; 
  if(tx!=null) { js.plotFinished(this); }
}

/**
 * add "save as..." functionality to the sketch
 */
void mousePressed() {
  if(mouseButton==RIGHT && js!=null) {
    js.saveImageAs(this);
  }
}
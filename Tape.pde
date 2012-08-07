/**
  Simple turing tape class
**/
class Tape {
  // the data on the tape.
  char[] data;
  // the tape length.
  int length;
  /// the position of the read head on the tape.
  int position = 0;

  // create a new tape with data
  Tape(String data) {
    this.data = data.replaceAll("[ \\t\\n\\s]","").toCharArray();
    this.length = this.data.length; }

  // read the next character on the tape.
  char next() { return data[position++]; }

  // look at the next character without forwarding the read head.
  char peek() { return data[position+1]; }

  // skip over a grouped expression, including any possible
  // nested groups inside this grouped expression.
  String skipGroup(char opener, char closer) {
    String buffer = "";
    char _tmp;
    while(position<length) {
      _tmp = data[position++];
      if(_tmp==opener) {
        buffer += skipGroup(opener, closer); }
      else if(_tmp==closer) { break; }
      else { buffer += _tmp; }
    }
    return opener + buffer + closer;
  }
  
  // end of data?
  boolean eod() { return position>=length; }
  
  // string representation of the tape.
  String toString() { 
    String s = new String(data); 
    s = s.substring(0,position) + " "+data[position]+" "+s.substring(position+1);
    return s;
  }
}

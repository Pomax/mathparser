/**
  Simple turing tape class
**/
class Tape {
  // the data on the tape.
  String[] data;
  // the tape length.
  int length;
  /// the position of the read head on the tape.
  int position = 0;

  // create a new tape with data
  Tape(String data) {
    this.data = data.replaceAll("[ \\t\\n\\s]","").split("");
    this.length = this.data.length; }

  // read the next character on the tape.
  String next() { return data[position++]; }

  // look at the next character without forwarding the read head.
  String peek() { return data[position+1]; }

  // skip over a grouped expression, including any possible
  // nested groups inside this grouped expression.
  String skipGroup(String opener, String closer) {
    String buffer = "", _tmp;
    while(position<length) {
      _tmp = data[position++];
      if(is(_tmp, opener)) {
        buffer += skipGroup(opener, closer); }
      else if(is(_tmp, closer)) { break; }
      else { buffer += _tmp; }
    }
    return opener + buffer + closer;
  }
  
  // end of data?
  boolean eod() { return position>=length; }
  
  // string representation of the tape.
  String toString() { 
    String s = join(data, ""); 
    s = s.substring(0,position) + " "+data[position]+" "+s.substring(position+1);
    return s;
  }
}

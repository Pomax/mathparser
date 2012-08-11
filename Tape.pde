/**
 * This class models a simple data tape.
 * Unlike the theoretical Turing tape, this
 * one has a fixed length, based on the data
 * that is used to create the tape.
 */
class Tape {

  // the data on the tape.
  String[] data;

  // the tape length. 
  int length;

  /// the position of the read head on the tape.
  int position = 0;

  /**
   * Create a new tape based on a data string.
   * In order to ensure we don't screw up Unicode
   * strings, this splits the data into an array
   * of String, emphatically NOT a char array.
   *
   * If stripWhitespace is true, all whitespace
   * in the data will be removed. This can be
   * useful for things like math functions.
   */
  Tape(String _data, boolean stripWhitespace) {
    if(stripWhitespace) {
      _data = _data.replaceAll("[ \\t\\n\\s]","");
    }
    data = _data.split("");
    length = data.length; }

  /**
   * read the current character on the tape.
   */
  String read() { return data[position]; }

  /**
   * checks whether there are more characters that can be read.
   */
  boolean more() { return position<length; }

  /**
   * advance the tape by one spot
   */
  void advance() { if(position<length-1) position++; }

  /**
   * read the next unread character on the tape.
   */
  String next() { return data[position++]; }

  /**
   * look at the next character without forwarding the read head.
   */
  String peek() { return data[position+1]; }

  /**
   * Recursively skip over a grouped expression.
   * This is important for skipping over bracketed
   * strings such as '', "", (), {}, [] and <> groups
   */
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

  /**
   * Generate the String representation of this tape.
   */
  String toString() { 
    String s = join(data, ""); 
    s = s.substring(0,position) + " "+data[position]+" "+s.substring(position+1);
    return s;
  }
}

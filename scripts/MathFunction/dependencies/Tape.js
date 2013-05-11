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
var Tape  = function(data, stripWhiteSpace) {
  stripWhiteSpace = stripWhiteSpace || false;
  if(stripWhiteSpace) {
    data = data.replace(/[ \t\n\s]/g,'');
  }
  this.data = data.split("");
  this.length = data.length;
  this.position = 0;
};


Tape.prototype = {
  /**
   * read the current character on the tape.
   */
  read: function() { return this.data[this.position]; },
  /**
   * checks whether there are more characters that can be read.
   */
  more: function() { return this.position<this.length; },
  /**
   * advance the tape by one spot
   */
  advance: function() { if(this.position<this.length-1) this.position++; },
  /**
   * read the next unread character on the tape.
   */
  next: function() { return this.data[this.position++]; },
  /**
   * look at the next character without forwarding the read head.
   */
  peek: function() { return this.data[this.position+1]; },
  /**
   * Recursively skip over a grouped expression.
   * This is important for skipping over bracketed
   * strings such as '', "", (), {}, [] and <> groups
   */
  skipGroup: function(opener, closer) {
    var buffer = "",
        _tmp;
    while(this.position<this.length) {
      _tmp = this.data[this.position++];
      if(_tmp == opener) {
        buffer += this.skipGroup(opener, closer);
      }
      else if(_tmp == closer) { break; }
      else { buffer += _tmp; }
    }
    return opener + buffer + closer;
  },
  /**
   * Generate the String representation of this tape.
   */
  toString: function() { 
    var s = join(this.data, ''); 
    s = s.substring(0,this.position)+" "+this.data[this.position]+" "+s.substring(this.position+1);
    return s;
  }
};

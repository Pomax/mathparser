/**
  Integer object. Or rather, only the API used in this sketch
**/

Integer = {
  parseInt: function(str) {
    var v = parseInt(str);
    if(v==str) {
      return v;
    }
    throw "ERROR: string does not represent a number";
  }
};
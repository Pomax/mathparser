/**
  Double object. Or rather, only the API used in this sketch
**/

Double = {
  parseDouble: function(str) {
    var v = parseFloat(str);
    if(v==str) { return v; }
    throw "error";
  }
};
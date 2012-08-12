/**
 * extend HTML elements with a few useful (chainable) functions
 */
window["extend"] = function(e) {
  if(!e) return undefined;

  // css properties
  if(!e.ccs)
    e.css = function(prop,val) {
      if(val) { e.style[prop] = val; return e; }
      return document.defaultView.getComputedStyle(e,null).getPropertyValue(prop) || e.style[prop];
    };

  // getting/setting html
  if(!e.html)
    e.html = function(html) {
      if(html) {
        e.innerHTML = html;
        return e;
      }
      return e.innerHTML; 
    };


  // adding/removing children
  if(!e.add)
    e.add = function() {
      for(var i=0, last=arguments.length; i<last; i++) {
        if(arguments[i]) {
          e.appendChild(arguments[i]);
        }
      }
      return e;
    };

  if(!e.remove)
    e.remove = function(a) {
      e.removeChild(a);
      return e;
    };

  if(!e.clear)
    e.clear = function() {
      while(e.children.length>0) {
        e.remove(e.get(0));
      }
      return e;
    };

  // getting/setting properties
  if(!e.get)
    e.get = function(a) {
      if(a == parseInt(a)) {
        return extend(e.children[a]);
      }
      return e.getAttribute(a); 
    };

  if(!e.set)
    e.set = function(a,b) {
      if(!b) {
        for(prop in a) {
          if(!Object.hasOwnProperty(a,prop)) {
            e.setAttribute(prop,a[prop]);
          }
        }
      } else { e.setAttribute(a,b); }
      return e;
    };
  
  // event listening (with automatic cleanup)
  if(!e.listenOnce)
    e.listenOnce = function(s, f, b) {
      var _ = function() { 
        e.removeEventListener(s, _, b|false);
        f.call(arguments);
      };
      e.addEventListener(s, _, b|false);
      return e;
    };

  // event handling
  if(!e.listen)
    e.listen = function(s, f, b) {
      e.addEventListener(s, f, b|false);
      return e;
    };

  return e;
};

/**
 * quick and dirty element selector
 */
window["find"] = function(s) { return extend(document.querySelector(s)); };

/**
 * I hate typing document.createElement()
 */
window["create"] = function(e) { return extend(document.createElement(e)); };


// because document and body are just as HTML-elementy as everything else:
extend(document).listenOnce("DOMContentLoaded", function() { extend(document.body); });

/**

  This is a quick and dirty toolkit for HTLM element manipulation.
  While it might look like a jQuery-a-like, it has nothing that
  makes jQuery so powerful, so if you're already using jQuery
  on a site: you have no reason to use this toolkit.

  That said, it is pretty damn small... then again, it does hijack
  several global variables... So, use your best judgement.

  - Pomax

**/

(function(window, document, body){

  /**
   * extend HTML elements with a few useful (chainable) functions
   */
  window["extend"] = function(e) {
    // 'does e exist?' evaluation function
    var exists = (function(X) { return function(t) { return (t!==X) && (t!==null); }}());

    // shortcut: don't extend if element is nothing
    if(!exists(e)) return;

    // shorthand "try to bind" function
    var bind = function(e, name, func) { if(!exists(e[name])) { e[name] = func; }};

    /**
     * get/set css properties
     */
    bind(e, "css", function(prop, val) {
      if(exists(val)) { e.style[prop] = val; return e; }
      return document.defaultView.getComputedStyle(e,null).getPropertyValue(prop) || e.style[prop];
    });

    /**
     * get/set inner HTML
     */
    bind(e, "html", function(html) {
      if(exists(html)) {
        e.innerHTML = html;
        return e;
      }
      return e.innerHTML;
    });


    /**
     * add a child element
     */
    bind(e, "add", function() {
      for(var i=0, last=arguments.length; i<last; i++) {
        if(exists(arguments[i])) {
          e.appendChild(arguments[i]);
        }
      }
      return e;
    });

    /**
     * remove a child element
     */
    bind(e, "remove", function(a) {
      if(parseInt(a)==a) {
        e.removeChild(e.children[a]);
      }
      else{ e.removeChild(a); }
      return e;
    });

    /**
     * clear all children
     */
    bind(e, "clear", function() {
      while(e.children.length>0) {
        e.remove(e.get(0));
      }
      return e;
    });

    /**
     * get object property values
     */
    bind(e, "get", function(a) {
      if(a == parseInt(a)) {
        return extend(e.children[a]);
      }
      return e.getAttribute(a);
    });

    /**
     * set object property values
     */
    bind(e, "set", function(a,b) {
      if(!b) {
        for(prop in a) {
          if(!Object.hasOwnProperty(a,prop)) {
            e.setAttribute(prop,a[prop]);
          }
        }
      } else { e.setAttribute(a,b); }
      return e;
    });

    /**
     * One-time event listening
     * (with automatic cleanup)
     */
    bind(e, "listenOnce", function(s, f, b) {
      var _ = function() {
        e.removeEventListener(s, _, b|false);
        f.call(arguments);
      };
      e.addEventListener(s, _, b|false);
      return e;
    });

    /**
     * Permanent event listening
     */
    bind(e, "listen", function(s, f, b) {
      e.addEventListener(s, f, b|false);
      return e;
    });

    return e;
  };

  /**
   * quick and dirty element selector
   */
  window["find"] = function(s) { return extend(document.querySelector(s)); };

  /**
   * quick and dirty document.createElement()
   */
  window["create"] = function(e) { return extend(document.createElement(e)); };

  /**
   * extend document and body, since they're just as HTML-elementy as everything else
   */
  extend(document).listenOnce("DOMContentLoaded", function() { extend(body); });

}(window,document,document.body));
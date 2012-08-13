/**

  This is a quick and dirty toolkit for HTLM element manipulation.
  While it might look like a jQuery-a-like, it has nothing that
  makes jQuery so powerful, so if you're already using jQuery
  on a site: you have no reason to use this toolkit.

  That said, it is pretty damn small... then again, it does hijack
  several global variables... So, use your best judgement.

  - Pomax

**/
(function(window,document,body){window["extend"]=function(e){var exists=(function(X){return function(t){return(t!==X)&&(t!==null);}}());if(!exists(e))return;var bind=function(e,name,func){if(!exists(e[name])){e[name]=func;}};bind(e,"css",function(prop,val){if(exists(val)){e.style[prop]=val;return e;}return document.defaultView.getComputedStyle(e,null).getPropertyValue(prop)||e.style[prop];});bind(e,"html",function(html){if(exists(html)){e.innerHTML=html;return e;}return e.innerHTML;});bind(e,"add",function(){for(var i=0,last=arguments.length;i<last;i++){if(exists(arguments[i])){e.appendChild(arguments[i]);}}return e;});bind(e,"remove",function(a){if(parseInt(a)==a){e.removeChild(e.children[a]);}else{e.removeChild(a);}return e;});bind(e,"clear",function(){while(e.children.length>0){e.remove(e.get(0));}return e;});bind(e,"get",function(a){if(a==parseInt(a)){return extend(e.children[a]);}return e.getAttribute(a);});bind(e,"set",function(a,b){if(!b){for(prop in a){if(!Object.hasOwnProperty(a,prop)){e.setAttribute(prop,a[prop]);}}}else{e.setAttribute(a,b);}return e;});bind(e,"listenOnce",function(s,f,b){var _=function(){e.removeEventListener(s,_,b|false);f.call(arguments);};e.addEventListener(s,_,b|false);return e;});bind(e,"listen",function(s,f,b){e.addEventListener(s,f,b|false);return e;});return e;};window["find"]=function(s){return extend(document.querySelector(s));};window["create"]=function(e){return extend(document.createElement(e));};extend(document).listenOnce("DOMContentLoaded",function(){extend(body);});}(window,document,document.body));
(function(){
  function tab() {
    document.removeEventListener("DOMContentLoaded",tab,false);
    var tabs = document.querySelectorAll("section.tabbed");
    titles = document.createElement("div");
    titles.setAttribute("class","tabtitles");
    tabs.forEach(function(tab) {
      var title = tab.getAttribute("data-title");
      var telement = document.createElement("span");
      telement.innerHTML = title;
      telement.onclick = function() {
        tabs.forEach(function(t) {
          t.style.display = "none";
          t.removeAttribute("data-visible");
          if(t.onhide) t.onhide();
        });
        titles.children.forEach(function(c) {
          c.setAttribute("class","");
        });
        tab.style.display = "block";
        tab.setAttribute("data-visible",true);
        if(tab.onreveal) tab.onreveal();
        telement.setAttribute("class","selected");
      };
      telement.style.display = "inline-block";
      titles.appendChild(telement);
    });
    var ratio = Math.floor(100/titles.children.length) - (titles.children.length-1);
    titles.children.forEach(function(child){
      child.style.width = ratio + "%";
    });
    tabs[0].parentNode.insertBefore(titles, tabs[0]);
    titles.children[0].onclick();
  }
  document.addEventListener("DOMContentLoaded",tab,false);
}());

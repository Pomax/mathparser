function setupTabs() {
  var tabs = find("section.tabbed");
  titles = create("div", {"class": "tabtitles"});
  tabs.forEach(function(tab) {
    var title = tab.get("data-title");
    var telement = create("span",title);
    telement.onclick = function() {
      tabs.forEach(function(t) {
        t.css("display","none").set("data-visible",false);
        if(t.onhide) t.onhide();
      });
      titles.children.forEach(function(c) {
        c.set("class","");
      });
      tab.css("display","block").set("data-visible","true");
      if(tab.onreveal) tab.onreveal();
      telement.set("class","selected");
    };
    telement.css("display","inline-block");
    titles.add(telement);
  });
  var ratio = Math.floor(100/titles.children.length) - (titles.children.length-1);
  titles.children.forEach(function(child){
    child.css("width", ratio + "%");
  });
  tabs[0].parent().insertBefore(titles, tabs[0]);
  titles.children[0].onclick();
}

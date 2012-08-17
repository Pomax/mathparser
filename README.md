                                                           .
Making math actually useful on the web
======================================

Sometimes you make something without setting out to do so.
I have a web page up that explains Bezier curve math, and
various things that you need to know if you're implementing
Bezier curves yourself. That page has lovely interactive
graphics, because interaction instills intuition. But not
everything's interactive, and I wanted something to do nice
plots while letting people play with the function parameters.

I needed that for one, maybe two graphs.

So as these things go, I sat down, and then wrote a math
parser in Processing, a language I like as a prototyping
language because it's type-safe and throws up errors all
over the place unless both your code and syntax is solid.

Also because it's easy, and works on the web thanks to
Processing.js (it helps that I'm one of the devs for that
particular project, too, I realise).

Still, long story short, in order to solve my small
problem, I wrote something that can make the lives of
many people much, much better so I polished it up and now
you're reading up on how to use it. It's an amazing world
that we live in today.

Anyway, you came here to learn how to put this on your
own web page, so enough with the musing, it's business time:

Putting MathParser on your web page
-----------------------------------

The mathparser has two dependencies, namely [MathJax](http://mathjax.org)
and [Processing.js](http://processingjs.org). I had to patch Pjs because
there's a small thing in 1.4.1 that doesn't work right, which will be
fixed in 1.4.2 - so in a few weeks this will just work, for now you'll
need to actually patch Pjs. That's super inconvenient, I know. The
actual bug is discussed [here](https://processing-js.lighthouseapp.com/projects/41284/tickets/1889).

In the mean time, you can either grab the copy that is included
in the github repository, or you can checkout the fixed Pjs
branch and then build that yourself. I don't recommend, for
obvious reasons (i.e., way too much work for a temporary fix).

**Note that I'm still in the process of cleaning up the packaging here
(if you want to help making it use [Require.js](http://requirejs.org/)
and making it literally a drop-in thing, please, fork. Do it. Send me
a pull request. Oh my dog, we're going to make the web so much better)**

With MathJax and Processing.js in hand, you can set up a basic page
by just copy-pasting the following code (No, I know this isn't clean
boilerplate with Modernizr, etc. Do you think that's a quick and easy
thing to do? Seriously, do a quick fork, fix it, do a pull request back
and I will merge it in without question):

``` html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My wonderfully mathy page</title>

    <!-- styles -->
    <link rel="stylesheet" href="css/mathparser.css">

    <!-- mathparser library. For now, this must be <head> -->
    <script src="js/mathparser.js"></script>    
  </head>
  
  <body>
    <article>
      <header><h1>Check out this awesome page</h1></header>
      <p>Looking pretty good!</p>
      
      <!-- This will contain the mathparser code: -->
      <aside id="my_mathparser_aside">
        <!-- And then we inject the mathparser to the article. This is why we load mathparser.js in <head> -->
        <script>MathParser.loadBlock("my_mathparser_aside", {...});</script>      
      </aside>
    </article>
  </body>
</html>
```

The {...} there indicates that we can pass along an init object,
containing the initial graph information. You don't have to
pass it along, but it helps, and here's what you can stick in it:

Anyway, the mathparser block:

``` javascript
{
  fx: "valid math string for f(t), or f(t)_x if parametric",
  fy: "valid math string for f(t)_y (forces parametric)",
  variables: [
    variable,
    ...
  ]
}
```

Each variable should consist of:

``` javascript
{
  label: "name of the variable",
  start: <start value for variable's domain>,
  end: <endvalue for variable's domain>,
  resolution: <stepping value>,
  value: <preassigned value>
}
```

If you're passing in a function, you also usually
want to pass at least one variable in the variables
array, namely the variable with label "t". This will
always be treated as the controll (graphing) variable.


Making MathParser do something
------------------------------

Making the math parser show a new (set of) function(S)
with associated variable(s) is as easy as initial setup:

```
  MathParser.setNewData({...});
```

Wait, what's "toolkit.js" that this uses?
-----------------------------------------

A quick and dirty toolkit for html element things. It's
basically a chaining shorthand function lib. It adds:

  window.extend(e) - toolkit-extend element
  window.find(selector) - CSS selector finding
  window.create(tag) - short for window.extend(document.createElement(tag));

extended elements have these extra functions:

  e.css(prop,val) - set property
  e.css(prop) - if prop is a string, get value. if object, set multiple CSS props
  e.toggle() - show/hide
  e.show(boolean) - explitic toggle
  e.html() - get inner html
  e.html(code) - set inner html
  e.add(element) - shorthand for appendChild
  e.remove(element) - shorthand for removeChild
  e.clear() - remove all children
  e.get(prop) - get an attribute value
  e.set(prop) - set an attribute
  e.listenOnce(eventname, function) - one-time event listening
  e.listen(eventname, function) - continuous event listening  

Why not use jQuery!?! Because what I need to do doesn't use
the power of jQuery, so I don't want to load 100k of JS that
I'm not going to use. This is less than 4kb.

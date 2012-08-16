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
by just copy-pasting the following code:

``` html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My wonderfully mathy page</title>

    <!-- styles -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/slider.css">

    <!-- resource scripts -->
    <script src="js/resource/toolkit.js"></script>
    <script src="js/resource/processing-1.4.1-patched.js"></script>
    <script src="js/resource/jquery/jquery.js"></script>
    <script src="js/resource/jquery/jquery-ui.js"></script>

    <!-- we want to convert LaTeX source into html+css -->
    <script type="text/x-mathjax-config">
      MathJax.Hub.Config({
        extensions: ["tex2jax.js"],
        inlineMath: [['\\(','\\)']],
        jax: ["input/TeX", "output/HTML-CSS"],
        "HTML-CSS": { availableFonts: ["TeX"] },
        displayAlign: "left",
        displayIndent: "0.5em"}
      );
    </script>
    <script src="js/resource/mathjax/MathJax.js"></script>

    <!-- content scripts -->
    <script src="js/Double.js"></script>
    <script src="js/Integer.js"></script>
    <script src="js/bindsketch.js"></script>
    <script src="js/saveAs.js"></script>
    <script src="js/mathparser.js"></script>

  </head>
  
  <body style="vertical-align: top; height: 90%;">
    <article>
      <header><h1>Check out this awesome page</h1></header>
      <p>Looking pretty good!</p>
    </article>
  </body>
</html>
```

Making MathParser do something
------------------------------


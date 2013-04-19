/**
 * An arithmetic fragment models a piece of a function.
 */
var ArithmeticFragment = function(fragment) {
  this.setup(fragment);
};

// uid counter
ArithmeticFragment.afCount = 1;

// prototype
ArithmeticFragment.prototype = {
  setup: function(fragment) {
    this.uid = ArithmeticFragment.afCount++;
    // only used for summation
    this.sumarguments = [],
    // As an object, there is either a simple string
    // descriptor for this fragment, or a set of
    // children describing the fragment as a compound.
    this.fragment = fragment,
    // array of ArithmeticFragment:
    this.children = [],
    // If this fragment represents a function,
    // it will have a functor and a set of
    // children.
    this.functor = "";
    // tells us whether to wrap our fragment
    this.wrapped = false;
    // tells us whether we're already expanded
    this.expanded = false;
  },
  /**
   * balanced parentheses?
   */
  isBalanced: function() {
    var toks = this.fragment.split(""),
        pCount =0,
        i, last;
    for(i=0, last=toks.length; i<last; i++) {
      if(toks[i] == "(") pCount++;
      if(toks[i] == ")") pCount--; }
    return pCount==0;
  },
  // functor(...) fragment?
  isFunctionWrapped: function(fragment) {
    if(!fragment.match(/^\w+\(.+\)/)) return false;
    fragment = fragment.replace(/^\w+/g,'');
    return this.isParensWrapped(fragment);
  },
  // (...) fragment?
  isParensWrapped: function(fragment) {
    if(!fragment.match(/^\(.*\)$/)) return false;
    var tokens = fragment.split(""),
        groupCount = 0,
        last, i;
    for(i=0, last=tokens.length; i<last; i++) {
      if(tokens[i] == "") continue;
      if(tokens[i] == "(") groupCount++;
      if(tokens[i] == ")") groupCount--;
      if(groupCount==0 && i<last-1) return false;
    }
    return groupCount==0;
  },
  // does a char represent a mathematical operator?
  isArithmeticOperator: function(t) {
    return t=="+" || t=="-" || t=="*" || t=="/" || t=="^" || t=="!";
  },
  /**
   * Expand this fragment, if possible
   */  
  expand: function() {
    if(this.expanded) return;
    var compound = false,
        unwrapped = false;

// WAY TOO MANY [this.] ENTRIES HERE:

    // is this a function? if so, unwrap it
    if (this.isFunctionWrapped(this.fragment)) {
      unwrapped = true;
      this.functor = this.fragment.substring(0,this.fragment.indexOf("("));
      this.fragment = this.fragment.replace(new RegExp("^"+this.functor),'');
    }
    if (this.isParensWrapped(this.fragment)) {
      if(!unwrapped) { this.wrapped = true; }
      unwrapped = true;
      this.fragment = this.fragment.substring(1,this.fragment.length-1);
    }
    // is this a summation?
    if(isAggregateNode(this.functor) && this.fragment.trim()!="") {
      var pos = this.fragment.indexOf(","),
          capPos = this.fragment.indexOf("(");
      if(capPos==-1) { capPos = this.fragment.length(); }
      var arg = "";
      while(pos>-1 && pos<capPos) {
        arg = this.fragment.substring(0,pos);
        this.fragment = this.fragment.replace(new RegExp("^"+arg+",",'g'),'');
        capPos--;
        this.sumarguments.push(arg);
        pos = this.fragment.indexOf(",");
      }
    }

    // expand the fragment
    var tape = new Tape(this.fragment, true),
        buffer = "",
        token,
        just_inserted = false;

    while(tape.more()) {
      token = tape.next();
      
      // If we encounter an arithmetic operator, split up the fragment
      if(this.isArithmeticOperator(token)) {
        compound = true;
        if (buffer.trim() != "" || just_inserted) {
          // content
          if(buffer.trim() != "") {
            this.fragment = "";
            this.children.push(new ArithmeticFragment(buffer)); }
          // operator
          if(token == "!") { this.children.add(new UnaryOperator(token)); }
          else { this.children.push(new Operator(token)); }
          buffer = "";
        } else if(token == "-") {
          this.children.push(new UnaryOperator("-"));
        }
        just_inserted = true;
      }
      // If we encounter a grouping token,
      // skip over the group content.
      else if (token == "(") {
        buffer += tape.skipGroup("(",")");
      }
      // Otherwise, move token to buffer
      else { 
        just_inserted = false;
        buffer += token;
      }
    }

    // If we have a non-empty buffer after expanding
    // we need to create a "final" fragment.
    if ((compound || unwrapped) && buffer!="") {
      this.children.push(new ArithmeticFragment(buffer)); 
      compound = true;
    }

    // If we went from plain fragment to compound,
    // make sure to expand all children.
    if (compound) {
      this.children.forEach(function(c) {
        c.expand();
      });
    }

    this.expanded = true;
  },
  /**
   * form the function tree that maps to this fragment
   */
  formFunctionTree: function() {
    var finalNode,
        nodes = [];

    if(!this.expanded) { this.expand(); }

    if(this.children.length>0) {
      // bottom-up conversion
      for(var i=0, last=this.children.length; i<last; i++) {
        var af = this.children[i];
        if(af instanceof UnaryOperator) { 
          nodes.push(getUnaryOperatorNode(af.operator));
        }
        else if(af instanceof Operator) { 
          nodes.push(getOperatorNode(af.operator));
        }
        else { nodes.push(af.formFunctionTree()); }
      }

      // assemble these nodes into a tree.
      var rhs = false, lhs = false,
          tn, right, left;
      for(var s=6; s>=0; s--) {
        for(var i=nodes.length-1; i>=0; i--) {
          tn = nodes[i];
          if(tn.getStrength) {
            if(tn.getStrength()==s) {
              if (!tn.hasLeaves()) {
                // right sibling
                rhs = tn.hasRight();
                right = (rhs ? false: nodes.splice(i+1,1)[0]);

                // left sibling
                lhs = tn.hasLeft();
                left = (lhs ? false : nodes.splice(i-1,1)[0]);

                // set node content
                tn.setLeaves(left, right);
              }
            }
          }
        }
      }

      finalNode = nodes[0];
    }
    // no children: simple content
    else { finalNode = getSimpleNode(this.fragment); }

    // if this is function-wrapped, wrap it.
    if(this.functor) {
      var aggregator = getAggregateNode(this.functor, this.sumarguments, finalNode);
      finalNode = (aggregator ? aggregator : getFunctionNode(this.functor, finalNode));
    }
  
    // do we need to wrap?
    if(this.wrapped) { finalNode = new WrapperNode(finalNode); }

    return finalNode;
  },
  /**
   * toString - always useful
   */  
  toString: function(pad) {
    if(!pad) return this.toString(" ");
    var s = "["+this.uid+"] ";
    s = (this.functor ? this.functor+"[" : '');
    if(this.children.length>0) {
      var cstrings = [];
      for(var i=0, last=this.children.length; i<last; i++) {
        cstrings[i] = this.children[i].toString(pad+" ");
      }
      s += cstrings.join('');
    }
    else { s += this.fragment; }
    return "{" + s + (this.functor? "]" : '') + "}";
  }
};


// operators are either +, -, *, / or ^ -- no op is represented as a space
var Operator = function(op) { this.setup(""); this.operator = op; };
Operator.prototype = new ArithmeticFragment("");
Operator.prototype.toString = function(pad) { return ''+this.operator; }

// special operator class
var UnaryOperator = function(op) { this.setup(""); this.operator = op; };
UnaryOperator.prototype = new Operator("");

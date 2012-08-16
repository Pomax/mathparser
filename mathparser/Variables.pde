/**
 * We want to avoid directly using a hashmap.
 * Instead, we create a collection that uses
 * one internally, with a non-hashmap API.
 */
class Variables {
  Variable controlled = null;
  
  // track all variables ever seen, for Variable recycling
  private HashMap<String, Variable> varpool = new HashMap<String,Variable>();

  // actual "in use" hashmap
  private HashMap<String, Variable> active = new HashMap<String,Variable>();

  /**
   * Get a variable
   */
  Variable get(String label) {
    return active.get(label);
  }
  
  /**
   * Add a variable, but only if its label is non-whitespace.
   */
  Variable add(Variable variable) {
    String label = variable.label;
    if(!label.matches("^[a-zA-Z0-9]+$")) return null;
    // already in the varpool? recycle
    Variable _tmp = varpool.get(label);
    if(_tmp!=null) { variable = _tmp; }
    else { varpool.put(label, variable); }
    return active.put(label, variable);
  }

  /**
   * More convenient than the keySet() method.
   */
  ArrayList<String> getKeys() {
    return new ArrayList<String>(active.keySet());
  }

  /**
   * More convenient than the values() method.
   */
  ArrayList<Variable> getValues() {
    return new ArrayList<Variable>(active.values());
  }

  /**
   * Make this variable for the indicated label
   * the control variable. Every other variable
   * will be treated as a clamped value.
   */
  void setControlled(String label) {
    if(controlled!=null) { 
      controlled.setControlled(false);
    }
    controlled = active.get(label);
    controlled.setControlled(true);
  }
  
  /**
   * Get the name/value set for these variables
   */
  NameValueSet getNameValueSet() {
    return new NameValueSet(this,getKeys());
  }
  
  /**
   * Check whether this variable is known
   */
  boolean contains(String label) {
    return (active.get(label)!= null);
  }

  /**
   * Update a variable's properties
   */
  void update(String label, double min, double max, double resolution, double value) {
    Variable v = active.get(label);
    if(v==null) {
      v = new Variable(label);
      add(v);
    }
    v.setDomain(min, max, resolution);
    v.value = value;
  }
  
  /**
   * Create and add new variables for any entry in
   * the passed list not already in the set.
   */
  void allocate(ArrayList<String> allocate) {
    for(String s: allocate) {
      if(active.get(s)==null) {
        add(new Variable(s));
      }
    }
  }
  
  /**
   * Remove all variables that match the prune list
   */
  void prune(ArrayList<String> prune) {
    for(String s: prune) {
      active.remove(s);
    }
  }
}

/**
 * model a variable, which as a label and a domain
 *
 */
class Variable {
  String label="";
  double start=0, end=100, resolution=1, value=0;
  boolean clamped=false, controlled=false;

  /**
   * fairly plain constructor
   */
  Variable(String _label) { label = _label; }

  /**
   * set the domain for this variable, plus the
   * resolution at which it should be traversed.
   */
  void setDomain(double _start, double _end, double _resolution) {
    start = _start;
    end = _end;
    resolution = _resolution;
  }
  
  /**
   * mark this variable as control variable (or not)
   */
  void setControlled(boolean c) {
    controlled = c;
    clamped = !controlled;
  }

  /**
   * clamp the value for this variable
   */
  void clamp(double v) { clamped = true; value = v; }
  
  /**
   * release this variable
   */
  void unclamp() { clamped = false; }
}

/**
 *
 */
class NameValueSet {
  String[] names;
  double[] values;
  int controlPosition;
  NameValueSet(Variables variables, ArrayList<String> keys) {
    names = new String[keys.size()];
    values = new double[keys.size()];
    for(int i=0, last=keys.size(); i<last; i++) {
      Variable v = variables.get(keys.get(i));
      if(v.controlled) { controlPosition = i; }
      names[i] = v.label;
      values[i] = v.value;
    }
  }
  String[] getNames() { return names; }
  double[] getValues() { return values; }
  int getControlPosition() { return controlPosition; }
}

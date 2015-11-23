var escapeHTML = require('./sanitize').escapeHTML;

module.exports = function(write) {

  /**
   * Builds an array of arguments for use with elementOpenStart, attr and
   * elementOpenEnd.
   * @const {Array<*>}
   */
  var argsBuilder = [];

  if (process.env.NODE_ENV !== 'production') {

    /**
     * Keeps track whether or not we are in an attributes declaration (after
     * elementOpenStart, but before elementOpenEnd).
     * @type {boolean}
     */
    var inAttributes = false;

    /** Makes sure that the caller is not where attributes are expected. */
    var assertNotInAttributes = function() {
      if (inAttributes) {
        throw new Error('Was not expecting a call to attr or elementOpenEnd, ' +
            'they must follow a call to elementOpenStart.');
      }
    };


    /** Makes sure that the caller is where attributes are expected. */
    var assertInAttributes = function() {
      if (!inAttributes) {
        throw new Error('Was expecting a call to attr or elementOpenEnd. ' +
            'elementOpenStart must be followed by zero or more calls to attr, ' +
            'then one call to elementOpenEnd.');
      }
    };

    // /**
    //  * Makes sure that tags are correctly nested.
    //  * @param {string} tag
    //  */
    // var assertCloseMatchesOpenTag = function(tag) {
    //   var context = getContext();
    //   var walker = context.walker;
    //   var closingNode = walker.getCurrentParent();
    //   var data = getData(closingNode);
    //
    //   if (tag !== data.nodeName) {
    //     throw new Error('Received a call to close ' + tag + ' but ' +
    //           data.nodeName + ' was open.');
    //   }
    // };

    /** Updates the state to being in an attribute declaration. */
    var setInAttributes = function() {
      inAttributes = true;
    };


    /** Updates the state to not being in an attribute declaration. */
    var setNotInAttributes = function() {
      inAttributes = false;
    };
  }

  var attr = function(name, value) {
    if (process.env.NODE_ENV !== 'production') {
      assertInAttributes();
    }

    argsBuilder.push(name, value);
  };

  var elementOpen = function(tag, key, statics, var_args) {
    if (process.env.NODE_ENV !== 'production') {
      assertNotInAttributes();
    }
    write("<"); write(tag);
    if (key) {
      write(" key='")
      write(key.replace(/'/g, '&quot;'))
      write("'")
    }

    var i;
    if (statics && statics.length > 0) {
      for (i = 0; i < statics.length; i += 2) {
        write(" ")
        write(String(statics[i]))
        write("='")
        write(String(statics[i+1]).replace(/'/g, '&quot;'))
        write("'")
      }
    }
    // add any dynamic values
    for (i = 4; i < arguments.length; i += 2) {
      write(" ")
      write(String(arguments[i]))
      write("='")
      write(String(arguments[i+1]).replace(/'/g, '&quot;'))
      write("'")
    }

    write(">")

    // todo should return something?
  }

  var elementOpenStart = function(tag, key, statics) {
    if (process.env.NODE_ENV !== 'production') {
      assertNotInAttributes();
      setInAttributes();
    }

    argsBuilder[0] = tag;
    argsBuilder[1] = key;
    argsBuilder[2] = statics;
  };


  var attr = function(name, value) {
    if (process.env.NODE_ENV !== 'production') {
      assertInAttributes();
    }

    argsBuilder.push(name, value);
  };

  var elementOpenEnd = function(ctx) {
    if (process.env.NODE_ENV !== 'production') {
      assertInAttributes();
      setNotInAttributes();
    }

    var node = elementOpen.apply(null, argsBuilder);
    argsBuilder.length = 0;
    return node;
  };

  var elementClose = function(tag) {
    if (process.env.NODE_ENV !== 'production') {
      assertNotInAttributes();
  //    assertCloseMatchesOpenTag(tag);
    }

    write("</"+tag+">");
  }

  var elementVoid = function(tag, key, statics, var_args) {
    if (process.env.NODE_ENV !== 'production') {
      assertNotInAttributes();
    }

    write("<"); write(tag);
    if (key) {
      write(" key='")
      write(key.replace(/'/g, '&quot;'))
      write("'")
    }

    var i;
    if (statics && statics.length > 0) {
      for (i = 0; i < statics.length; i += 2) {
        write(" ")
        write(String(statics[i]))
        write("='")
        write(String(statics[i+1]).replace(/'/g, '&quot;'))
        write("'")
      }
    }
    for (i = 3; i < arguments.length; i += 2) {
      write(" ")
      write(String(arguments[i]))
      write("='")
      write(String(arguments[i+1]).replace(/'/g, '&quot;'))
      write("'")
    }

    var selfClosing = new RegExp('^area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|web$|-', 'i');

    if (selfClosing.test(tag)) {
      write(" />");
    } else {
      write("></"+tag+">");
    }
    return;
  }

  var text = function(value, var_args) {
    if (process.env.NODE_ENV !== 'production') {
      assertNotInAttributes();
    }
    var formatted = value;
    for (var i = 1; i < arguments.length; i += 1) {
      formatted = arguments[i](formatted);
    }
    write(escapeHTML(formatted));
  }

  var patch = function(node, fn, data) {
    throw Error("patch unsupported");
  }

  var symbols = {
    all: '__all'
  };

  var notifications = {
    nodesCreated: null,
    nodesDeleted: null
  };

  return {
    patch: patch,

    elementVoid: elementVoid,
    elementOpenStart: elementOpenStart,
    elementOpenEnd: elementOpenEnd,
    elementOpen: elementOpen,
    elementClose: elementClose,
    text: text,
    attr: attr,

    symbols: symbols,
    notifications: notifications
  };
}

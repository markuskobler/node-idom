//import writer from 'idom/writer';

var argsBuilder = [];

function attr(name, value) {
  argsBuilder.push(name, value);
};

function elementOpen(tag, key, statics, var_args) {
  var i;

  writer$write("<", tag);

  if (key)
    writer$write(" key='", key.replace(/'/g, '&quot;'), "'")

  if (statics)
    for (i = 0; i < statics.length; i += 2)
      writer$write(" ", String(statics[i]), "='", _escapeAttribute(statics[i+1]), "'")

  for (i = 3; i < arguments.length; i += 2)
    writer$write(" ", String(arguments[i]), "='", _escapeAttribute(arguments[i+1]), "'")

  writer$write(">")

  // todo should return something?
}

function elementOpenStart(tag, key, statics) {
  argsBuilder[0] = tag;
  argsBuilder[1] = key;
  argsBuilder[2] = statics;
};


function elementOpenEnd(ctx) {
  var node = elementOpen.apply(null, argsBuilder);
  argsBuilder.length = 0;
  return node;
};

function elementClose(tag) {
  writer$write("</", tag, ">");
}

function elementVoid(tag, key, statics, var_args) {
  var i;
  writer$write("<", tag);
  if (key) {
    writer$write(" key='", key.replace(/'/g, '&quot;'), "'")
  }

  if (statics && statics.length > 0)
    for (i = 0; i < statics.length; i += 2)
      writer$write(" ", String(statics[i]), "='", _escapeAttribute(statics[i+1]), "'")

  for (i = 3; i < arguments.length; i += 2)
    writer$write(" ", String(arguments[i]), "='", _escapeAttribute(arguments[i+1]), "'")

  // safe self-closing tags
  if (/^area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|web$|-/i.test(tag)) {
    writer$write(" />");
  } else {
    writer$write("></", tag, ">");
  }
  return;
}

function text(value, var_args) {
  for (var i = 1; i < arguments.length; i += 1) {
    value = arguments[i](value);
  }
  writer$write(_escapeHTML(value));
}

function patch(node, fn, data) {
  throw Error("patch unsupported");
}

var symbols = {
  all: '__all'
};

var notifications = {
  nodesCreated: null,
  nodesDeleted: null
};

export  {
  patch,

  elementVoid,
  elementOpenStart,
  elementOpenEnd,
  elementOpen,
  elementClose,
  text,
  attr,

  symbols,
  notifications
}


// TODO improve escaping
function _escapeAttribute(value) {
  return String(value).replace(/'/g, '&quot;')
}

function _escapeHTML(value) {
  return !value ? '' : String(value).replace(/[&<>"']/g, function(match) {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
    }
  })
}

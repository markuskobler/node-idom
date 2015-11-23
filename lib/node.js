var Writer      = require('./writer').Writer;
var vm          = require('vm');
var fs          = require('fs');
var path        = require('path');
var Console     = require('console').Console;
var parse       = require('espree').parse;
var visit       = require('ast-types').visit;
var MagicString = require('magic-string');

module.exports = {
  Context: Context
}

function Module(id, source) {
  this.id = id;
  this.source = new MagicString(source);
  this.inports = {};
  this.exports = {};
}


function Context(ctx) {
  this._ctx     = vm.createContext(new Sandbox(ctx));
  this._source  = new MagicString.Bundle();
  this._vars    = {};
  this._run     = [];
  this._modules = {};
}

Context.prototype.loadModule = function(id, path) {
  var source = fs.readFileSync(path);
  console.log( source );
  this.transform( source, path );
}

Context.prototype.setModule = function(id, path) {

}

Context.prototype.loadFile = function(path, id) {
  var source = fs.readFileSync(path);
  this.transform(source, id);
}

Context.prototype.transform = function(original, prefix) {
  var source = new MagicString(original.toString());

  var ast = parse(original, {
    range: true,
    ecmaFeatures: {
      arrowFunctions: true,
      binaryLiterals: true,
      blockBindings: true,
      classes: true,
      defaultParams: true,
      destructuring: true,
      forOf: true,
      generators: true,
      modules: true,
      octalLiterals: true,
      templateStrings: true,
      unicodeCodePointEscapes: true,
  }} );

  var vars = {};
  var imports = {};
  var exports = {};

  function normalizeImport(prefix) {
    return "$$"+prefix.replace(/^\.\//, "").replace(/\$|\-|\//g, function(v) {
      switch (v) {
        case "-": return "_";
        case "$": return "$$";
        default:  return "$";
      }
    })+"$";
  }

  prefix = normalizeImport(prefix);

  source.prepend("function "+prefix+"() {").append("\n}");

  visit(ast, {

    visitImportDeclaration: function(path) {
      var node = path.node
      var id = normalizeImport(node.source.value); // TODO normalize all names
      var specifiers = node.specifiers;

      imports[id] = specifiers.reduce(function(imports, node) {
        var name = node.local.name;
        var f = id+name;
        vars[node.local.name] = f;
        imports.push({name: name});
        return imports;
      }, imports[id] || []);

      // TODO on import * from 'foo'; ?

      var range = node.range;
      source.remove(range[0], range[1]);

      return false;
    },

    visitExportDefaultDeclaration: function(path) {
      var name = "default";
      exports[name];
      source.overwrite(path.node.range[0], path.node.declaration.range[0], prefix+name+" = ");
      this.traverse(path);
    },

    visitExportNamedDeclaration: function(path) {
      if (path.node.declaration) {

        var name;
        var declaration = path.node.declaration;
        switch (declaration.type) {
          case "VariableDeclaration":
            name = declaration.declarations[0].id.name;
            source.remove(path.node.range[0], declaration.range[0]);
            source.insert(declaration.declarations[0].id.range[1], " = "+prefix+name);
            break;
          case "ClassDeclaration":
          case "FunctionDeclaration":
            name = declaration.id.name;
            source.overwrite(path.node.range[0], declaration.range[0], prefix+name+" = ")
            break;
          default:
            throw new Error("unexpected type declaration "+ declaration.type);
        }

        exports[name] = prefix+name;

      } else {
        var range = path.node.range;
        source.overwrite(range[0], range[1], path.node.specifiers.reduce(function(replace, e) {
          exports[e.exported.name] = prefix+e.exported.name;
          return replace + "\n;" + prefix + e.exported.name + " = " + e.local.name + ";\n"
        }, ""))
      }

      this.traverse(path);
    },

    visitFunctionDeclaration: function(path) {
      var node = path.node;

      // todo ignore params and name
      // console.log( path.node.params );

      this.traverse(path);

      // cleanup scope after we know all vars
    },

    visitIdentifier: function(path) {
      var node = path.node;
      var replace = vars[node.name];
      if (replace) {
        source.overwrite(node.range[0], node.range[1], replace);
      }
      return true;
    }
  });

  for (var v in exports) {
    this._vars[exports[v]] = true;
  }

  this._source.addSource({content: source});

  this._run.push(prefix); // TODO should figure out execute order
}

Context.prototype.build = function(name) {
  var prefix = 'function $$run(writer$write) {\n';

  var values = Object.keys(this._vars);
  if ( values.length > 0 ) {
    prefix += "var ";
    for (var i in values) {
      if (i > 0)
        prefix += ",\n    ";
      prefix += values[i];
    }
    prefix += ";\n";
  }

  var suffix = '\n';
  for (var i in this._run) {
    suffix += this._run[i]+"();\n"
  }
  suffix += '\n}';

  this._source.
    prepend(prefix).
    append(suffix);

  // console.log(">>>>\n", this._source.toString(), "\n<<<<" );

  vm.runInContext(this._source.toString(), this._ctx, "[view]");
}

Context.prototype.render = function(name) {
  var w  = new Writer();
  this._ctx['$$run'](w.getWriter());
  return w.output;
}


function Sandbox(ctx) {
  for (var key in ctx)
    if (ctx.hasOwnProperty(key))
      this[key] = ctx[key];

  this.console = new Console(process.stdout, process.stderr);
}


Sandbox.prototype.setTimeout = function(cb, ms) {
  // TODO keep track until rendered
}

Sandbox.prototype.clearTimeout = function(t) {
  // TODO keep track until rendered
}

Sandbox.prototype.setInterval = function(cb, ms) {
  // TODO keep track until rendered?
}

Sandbox.prototype.clearInterval = function(t) {
  // TODO keep track until rendered?
}

var idom      = require('../');
var expect    = require('chai').expect;

var join      = require("path").join;
var fs        = require("fs");

describe("idom render", () => {

  it("simple template", () => {
    var ctx = new idom.Context();

    ctx.loadFile(path("fixtures/idom/index.js"), 'idom');
    ctx.loadFile(path("fixtures/simple.js"), "simple");
    ctx.build();

    expect(ctx.render()).to.equal(loadFile("fixtures/simple.html"));
  })

  it("view template", () => {
    var ctx = new idom.Context();

    ctx.loadFile(path("fixtures/idom/index.js"), 'idom');
    ctx.loadFile(path("fixtures/component/hello.js"), "component/hello");
    ctx.loadFile(path("fixtures/view.js"), 'view');
    ctx.build();

    expect(ctx.render()).to.equal(loadFile("fixtures/view.html"));
  })

  function loadFile(name) {
    return String(fs.readFileSync(path(name))).trim()
  }

  function path(name) {
    return join(__dirname, name)
  }

});

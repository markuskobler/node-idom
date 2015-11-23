import { elementVoid, elementOpen, elementClose, text } from 'idom';

var myClass = "my-class";

elementOpen("div");
  text("Hello World!");
  elementOpen("div");text("Hiya!");elementClose("div");
  elementVoid("div", null, ["class", "my-class"]);
  elementVoid("div", null, null, "class", "my-class");
  elementVoid("div", null, null, "class", myClass);
  elementVoid("input", null, ["disabled", true]);
  elementVoid("input", null, ["disabled", false]);
elementClose("div");

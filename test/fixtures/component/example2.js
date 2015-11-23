import { elementVoid, elementOpen, elementClose, text } from 'idom';

var remap = elementVoid;

export var   foo1 = "foo1";
//export let   foo2 = "foo2";
//export const FOO3 = "FOO3";

export default function defaultHello(world) {
  elementOpen("span");
    text("Hello ");
    text(world);
  elementClose("span");
}

export function hello(world) {
  elementOpen("span");
    text("Hello ");
    text(world);
  elementClose("span");
}

function hello2(world, elementVoid) {

}

export function* generator() {

}

// export class MyClass {
//
// }

export {
  hello2,
  hello2 as hello3,
}

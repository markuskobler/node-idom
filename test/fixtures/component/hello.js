import {elementOpen, elementClose, text} from 'idom';

function hello(world) {
  elementOpen("span");
    text("Hello ");
    text(world);
  elementClose("span");
}

export {
  hello
};

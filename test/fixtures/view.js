import { elementVoid, elementOpen, elementClose, text } from 'idom';
import { hello } from './component/hello';

elementOpen("div");
  hello("World1");
  hello("World2");
elementClose("div");

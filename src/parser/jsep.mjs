import regex from '@jsep-plugin/regex';
import ternary from '@jsep-plugin/ternary';
import { Jsep } from 'jsep';

Jsep.addIdentifierChar('@');
Jsep.addUnaryOp('void');
Jsep.addBinaryOp('in', 12);
Jsep.addBinaryOp('~=', 20);
Jsep.plugins.register(regex, ternary);

export default a => {
  const jsep = new Jsep(a);
  return jsep.parse();
};

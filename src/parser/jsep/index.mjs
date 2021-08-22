// Add default plugins:
import parse, { Jsep } from './jsep.mjs';
// import comment from '@jsep/plugin-comment';
// import regex from '@jsep/plugin-regex';
// import ternary from '@jsep/plugin-ternary';
import regexp from './plugins/regexp.mjs';
import ternary from './plugins/ternary.mjs';

Jsep.plugins.register(regexp, ternary);

export default parse;

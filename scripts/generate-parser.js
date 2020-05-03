'use strict';
const path = require('path');
const fs = require('fs');
const { Parser } = require('jison');

const grammar = require('../src/parser/grammar');

const parser = new Parser(grammar);

fs.writeFileSync(path.join(__dirname, '../src/parser/parser.mjs'), `${parser.generate({
  moduleType: 'js',
})}
;export default parser.Parser;`);

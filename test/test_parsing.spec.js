const { expect } = require('chai');
const self = require('../dist/main');
const fs = require('fs');

const str = fs.readFileSync('README.limp', 'utf-8');
console.log(JSON.stringify(self.parseDocument(str), null, 2));


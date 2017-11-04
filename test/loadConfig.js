/*globals describe,it*/
const Path = require('path');
const { expect } = require('chai');

const loadConfig = require('../context.js').loadConfig;

const TEST5_ROOT = Path.join(__dirname, '..', 'testdata', 'p5');

//==============================================================================
describe(`loadConfig,`, () => {
  describe(`when called with a "package.json",`, () => {
    it('loads the config correctly from "requireRewrite".', () => {
      const path = Path.join(TEST5_ROOT, 'package.json');
      const pck = require(path);
      const requireRewrite = pck.requireRewrite;
      const result = loadConfig(path);
      expect(result).to.be.eql({ config: requireRewrite, name: pck.name });
    });
  });

  describe(`when called with a ".require-rewrite.json",`, () => {
    it('loads the config correctly from the root.', () => {
      const path = Path.join(TEST5_ROOT, '.require-rewrite.json');
      const requireRewrite = require(path);
      const result = loadConfig(path);
      expect(result).to.be.eql({ config: requireRewrite, name: null });
    });
  });
});

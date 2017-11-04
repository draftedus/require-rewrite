/*globals describe,it,before*/
const Path = require('path');
const { expect } = require('chai');

const findConfigfile = require('../context.js').findConfigfile;

const TEST1_ROOT = Path.join(__dirname, '..', 'testdata', 'p1');
const TEST2_ROOT = Path.join(__dirname, '..', 'testdata', 'p2');
const TEST3_ROOT = Path.join(__dirname, '..', 'testdata', 'p3');
const TEST4_ROOT = Path.join(__dirname, '..', 'testdata', 'p4');
const TEST5_ROOT = Path.join(__dirname, '..', 'testdata', 'p5');

//==============================================================================
describe(`findConfigfile,`, () => {
  describe(`when called with a path containing a "package.json",`, () => {
    it('returns the path to package.json.', () => {
      const result = findConfigfile(TEST1_ROOT);
      expect(result).to.be.equal(Path.join(TEST1_ROOT, 'package.json'));
    });
  });

  describe(`when called with a path containing a "require-rewrite.json",`, () => {
    it('returns the path to require-rewrite.json.', () => {
      const result = findConfigfile(TEST2_ROOT);
      expect(result).to.be.equal(Path.join(TEST2_ROOT, 'require-rewrite.json'));
    });
  });

  describe(`when called with a path containing a ".require-rewrite.json",`, () => {
    it('returns the path to .require-rewrite.json.', () => {
      const result = findConfigfile(TEST3_ROOT);
      expect(result).to.be.equal(Path.join(TEST3_ROOT, '.require-rewrite.json'));
    });
  });

  describe(`when called with a path below a config file,`, () => {
    it('returns the path to the closest package.json.', () => {
      const result = findConfigfile(Path.join(TEST1_ROOT, 'src', 'b', 'd'));
      expect(result).to.be.equal(Path.join(TEST1_ROOT, 'package.json'));
    });
  });

  describe(`when called with a module-path in node_modules,`, () => {
    it(`returns the path to module's package.json.`, () => {
      const result = findConfigfile(Path.join(TEST1_ROOT, 'node_modules', 'module1', 'src'));
      expect(result).to.be.equal(Path.join(TEST1_ROOT, 'node_modules', 'module1', 'package.json'));
    });
  });

  describe(`when multiple config files are present,`, () => {
    it(`chooses "require-rewrite.json" over ".require-rewrite.json" and "package.json".`, () => {
      const result = findConfigfile(TEST4_ROOT);
      expect(result).to.be.equal(Path.join(TEST4_ROOT, 'require-rewrite.json'));
    });
    it(`chooses ".require-rewrite.json" over "package.json".`, () => {
      const result = findConfigfile(TEST5_ROOT);
      expect(result).to.be.equal(Path.join(TEST5_ROOT, '.require-rewrite.json'));
    });
  });
});

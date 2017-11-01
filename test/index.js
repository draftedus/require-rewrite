/*globals describe,it,before,after,beforeEach,afterEach*/
const Path = require('path');
const { expect } = require('chai');

const TEST_ROOT = Path.join(__dirname, 'project');

//------------------------------------------------------------------------------
const load = () => {
  return require('../context.js').Context;
};

//------------------------------------------------------------------------------
const unload = () => {
  try {
    const name = require.resolve('../context.js');
    delete require.cache[name];
  } catch (error) {
  }
  return null;
};

//------------------------------------------------------------------------------
describe(`require-rewrite's`, () => {
  describe(`Context's`, () => {
    let Context = null;

    beforeEach(() => {
      Context = load();
    });

    afterEach(() => {
      Context = unload();
    });

    describe(`static "get" function`, () => {
      it('does not return a new context when "create" is false', () => {
        expect(Context.get(TEST_ROOT)).to.be.undefined;
      });

      it('does return a new context when "create" is true', () => {
        expect(Context.get(TEST_ROOT, true)).to.be.an.instanceof(Context);
      });

      it('returns the same context when called for subfolders', () => {
        const rootContext = Context.get(TEST_ROOT, true);
        const otherContext = Context.get(Path.join(TEST_ROOT, 'src', 'b', 'd'), true);
        expect(otherContext).to.be.equal(rootContext);
      });
    });
  });
});

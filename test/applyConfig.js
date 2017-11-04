/*globals describe,it*/
const Path = require('path');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);
const { expect } = chai;

const applyConfig = require('../context.js').applyConfig;

const TEST1_ROOT = Path.join(__dirname, '..', 'testdata', 'p1');

//------------------------------------------------------------------------------
const mockResolver = () => ({
  path: TEST1_ROOT,
  resolver: [],
  preIncludes: [],
  postIncludes: [],
  use: sinon.spy(),
  resolvePath: (path) => Path.resolve(TEST1_ROOT, path),
});

//==============================================================================
describe(`applyConfig,`, () => {
  describe(`when config contains a section "before",`, () => {
    it('throws if "before" is not an array.', () => {
      const config = {
        before: {}
      };
      const resolver = mockResolver();
      expect(() => {
        applyConfig(config, resolver);
      }).to.throw();
    });
    it('all entries are added to resolver.preIncludes and resolved.', () => {
      const config = {
        before: [Path.join(TEST1_ROOT, 'src'), Path.join(TEST1_ROOT, 'lib')]
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.preIncludes).to.be.eql(config.before);
    });
  });

  describe(`when config contains a section "after",`, () => {
    it('throws if "after" is not an array.', () => {
      const config = {
        after: {}
      };
      const resolver = mockResolver();
      expect(() => {
        applyConfig(config, resolver);
      }).to.throw();
    });
    it('all entries are added to resolver.preIncludes and resolved.', () => {
      const config = {
        after: [Path.join(TEST1_ROOT, 'src'), Path.join(TEST1_ROOT, 'lib')]
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.postIncludes).to.be.eql(config.after);
    });
  });

  describe(`when config contains a section "include",`, () => {
    it('throws if "include" is not an array.', () => {
      const config = {
        include: {}
      };
      const resolver = mockResolver();
      expect(() => {
        applyConfig(config, resolver);
      }).to.throw();
    });
    it(`['src', '%', 'lib'] is split ['src']:['lib'] and resolved.`, () => {
      const config = {
        include: ['src', '%', 'lib']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.preIncludes).to.be.eql([Path.join(TEST1_ROOT, 'src')]);
      expect(resolver.postIncludes).to.be.eql([Path.join(TEST1_ROOT, 'lib')]);
    });

    it(`['%', 'lib'] is split []:['lib'] and resolved.`, () => {
      const config = {
        include: ['%', 'lib']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.preIncludes).to.be.eql([]);
      expect(resolver.postIncludes).to.be.eql([Path.join(TEST1_ROOT, 'lib')]);
    });

    it(`['src', '%'] is split ['src']:[] and resolved.`, () => {
      const config = {
        include: ['src', '%']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.preIncludes).to.be.eql([Path.join(TEST1_ROOT, 'src')]);
      expect(resolver.postIncludes).to.be.eql([]);
    });

    it(`['src', 'lib'] is split ['src', 'lib']:[] and resolved.`, () => {
      const config = {
        include: ['src', 'lib']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.preIncludes).to.be.eql([Path.join(TEST1_ROOT, 'src'), Path.join(TEST1_ROOT, 'lib')]);
      expect(resolver.postIncludes).to.be.eql([]);
    });
  });

  describe(`when config contains a section "map",`, () => {
    it(`resolver.use() is called for every entry.`, () => {
      const config = {
        map: ['src', 'lib']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      resolver.use.should.have.callCount(config.map.length);
    });
  });
});

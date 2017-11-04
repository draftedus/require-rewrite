/*globals describe,it,before*/
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);
const { expect } = chai;

const applyConfig = require('../context.js').applyConfig;

//------------------------------------------------------------------------------
const mockResolver = () => ({
  resolver: [],
  pathsBefore: [],
  pathsAfter: [],
  use: sinon.spy(),
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
    it('all entries are added to resolver.pathsBefore.', () => {
      const config = {
        before: ['src', 'lib']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.pathsBefore).to.be.eql(config.before);
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
    it('all entries are added to resolver.pathsBefore.', () => {
      const config = {
        after: ['src', 'lib']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.pathsAfter).to.be.eql(config.after);
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
    it(`['src', '%', 'lib'] is split ['src']:['lib'].`, () => {
      const config = {
        include: ['src', '%', 'lib']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.pathsBefore).to.be.eql(['src']);
      expect(resolver.pathsAfter).to.be.eql(['lib']);
    });

    it(`['%', 'lib'] is split []:['lib'].`, () => {
      const config = {
        include: ['%', 'lib']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.pathsBefore).to.be.eql([]);
      expect(resolver.pathsAfter).to.be.eql(['lib']);
    });

    it(`['src', '%'] is split ['src']:[].`, () => {
      const config = {
        include: ['src', '%']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.pathsBefore).to.be.eql(['src']);
      expect(resolver.pathsAfter).to.be.eql([]);
    });

    it(`['src', 'lib'] is split ['src', 'lib']:[].`, () => {
      const config = {
        include: ['src', 'lib']
      };
      const resolver = mockResolver();
      applyConfig(config, resolver);
      expect(resolver.pathsBefore).to.be.eql(['src', 'lib']);
      expect(resolver.pathsAfter).to.be.eql([]);
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

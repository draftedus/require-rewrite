/*globals describe,it,afterEach*/
const Path = require('path');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);
const { expect } = chai;

const TEST1_ROOT = Path.join(__dirname, '..', 'testdata', 'p1');
const TEST6_ROOT = Path.join(__dirname, '..', 'testdata', 'p6');

const { Context, packages } = require('../context.js');

//==============================================================================
describe(`Context`, () => {
  afterEach(() => {
    packages.clear();
  });

  describe(`.get()`, () => {
    it('does not return a new context when "create" is false', () => {
      expect(Context.get(TEST1_ROOT)).to.be.undefined;
    });

    it('does return a new context when "create" is true', () => {
      expect(Context.get(TEST1_ROOT, true)).to.be.an.instanceof(Context);
    });

    it('returns the same context when called for subfolders', () => {
      const rootContext = Context.get(TEST1_ROOT, true);
      const otherContext = Context.get(Path.join(TEST1_ROOT, 'src', 'b', 'd'), true);
      expect(otherContext).to.be.equal(rootContext);
    });
  });
});

//------------------------------------------------------------------------------
describe(`A Context's`, () => {
  afterEach(() => {
    packages.clear();
  });

  describe(`constructor`, () => {
    it('will throw for an invalid config file', () => {
      expect(() => new Context(TEST6_ROOT, Path.join(TEST6_ROOT, 'package.json'))).to.throw();
    });
    describe(`will add the Context to the global map`, () => {
      it('when no error occurs', () => {
        const context = new Context('/foo');
        expect(packages.size).to.equal(1);
        expect(packages.get('/foo')).to.equal(context);
      });
      it('even when an error occurs', () => {
        try {
          new Context(TEST6_ROOT, Path.join(TEST6_ROOT, 'package.json'));//eslint-disable-line
        } catch (error) {//eslint-disable-line
        }
        expect(packages.size).to.equal(1);
      });
    });
  });

  describe(`reset`, () => {
    it('will empty resolver, preIncludes and postIncludes', () => {
      const context = new Context();
      context.resolver.push(() => {});
      context.preIncludes.push('src');
      context.postIncludes.push('lib');
      context.reset();
      expect(context.resolver.length).to.be.equal(0);
      expect(context.preIncludes.length).to.be.equal(0);
      expect(context.postIncludes.length).to.be.equal(0);
    });
  });

  describe(`resolve`, () => {
    it('will call "resolve" on every resolver until one returns non-falsy', () => {
      const context = new Context();
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      context.resolver.push(spy1, spy2, () => 'ok');
      context.resolve('test');
      spy1.should.have.been.called;
      spy2.should.have.been.called;
    });

    it('will not call "resolve" resolver after the one found', () => {
      const context = new Context();
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      context.resolver.push(spy1, () => 'ok', spy2);
      context.resolve('test');
      spy1.should.have.been.called;
      spy2.should.not.have.been.called;
    });

    describe(`, when called with a relative path,`, () => {
      it('will resolve to a path relative to its root', () => {
        const context = new Context();
        context.path = TEST1_ROOT;
        context.resolver.push((request) => request);
        const result = context.resolve('test');
        expect(result).to.be.equal(Path.join(TEST1_ROOT, 'test'));
      });
    });

    describe(`, when called with an absolute path,`, () => {
      it('will return that path', () => {
        const context = new Context();
        context.path = TEST1_ROOT;
        context.resolver.push((request) => request);
        const result = context.resolve('/foo/bar/test');
        expect(result).to.be.equal('/foo/bar/test');
      });
    });

    describe(`, when it can't resolve the path,`, () => {
      it('will return false', () => {
        const context = new Context();
        context.path = TEST1_ROOT;
        context.resolver.push(() => false);
        const result = context.resolve('test');
        expect(result).to.be.false;
      });
    });
  });

  describe(`use`, () => {
    it(`will throw for an unknown type.`, () => {
      const context = new Context();
      expect(() => {
        context.use('src', 'dst', 'foo');
      }).to.throw();
    });

    describe(`, when called with one argument,`, () => {
      it(`will add a function-resolver.`, () => {
        const context = new Context();
        const fn = () => {};
        context.use(fn);
        expect(context.resolver[0]).to.be.equal(fn);
      });

      it(`will add an alias-resolver.`, () => {
        const context = new Context();
        context.path = TEST1_ROOT;
        context.use('src');
        const resolver = context.resolver[0];
        expect(resolver.type).to.be.equal('alias');
        expect(resolver('src/a')).to.be.equal('src/a');
      });
    });

    describe(`, when called with two arguments,`, () => {
      it(`will add an alias-resolver.`, () => {
        const context = new Context();
        context.path = TEST1_ROOT;
        context.use('src', 'dst');
        const resolver = context.resolver[0];
        expect(resolver.type).to.be.equal('alias');
        expect(resolver('src/a')).to.be.equal('dst/a');
      });
    });

    describe(`, when called with three arguments,`, () => {
      describe(`and type "alias",`, () => {
        it(`will add an alias-resolver.`, () => {
          const context = new Context();
          context.path = TEST1_ROOT;
          context.use('src', 'dst', 'alias');
          const resolver = context.resolver[0];
          expect(resolver.type).to.be.equal('alias');
          expect(resolver('src/a')).to.be.equal('dst/a');
        });
      });

      describe(`and type "match",`, () => {
        it(`will add an regexp-resolver.`, () => {
          const context = new Context();
          context.path = TEST1_ROOT;
          context.use('src/(\\d+)/(\\d+)/(.*)', 'dst/$2/$1/$3', 'match');
          const resolver = context.resolver[0];
          expect(resolver.type).to.be.equal('match');
          expect(resolver('src/1/2/3')).to.be.equal('dst/2/1/3');
        });
      });
    });

    describe(`, when called multiple times,`, () => {
      it(`will add resolver in reversed order.`, () => {
        const context = new Context();
        const fn1 = () => {};
        const fn2 = () => {};
        const fn3 = () => {};
        context.use(fn1);
        context.use(fn2);
        context.use(fn3);
        expect(context.resolver[0]).to.be.equal(fn3);
        expect(context.resolver[1]).to.be.equal(fn2);
        expect(context.resolver[2]).to.be.equal(fn1);
      });
    });
  });
});

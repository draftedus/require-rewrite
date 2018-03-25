/*globals describe,it*/
const chai = require('chai');
const { regexpResolver, substrResolver } = require('../context.js');

const { expect } = chai;


//==============================================================================
describe(`substrResolver`, () => {
  it('returns a function', () => {
    const result = substrResolver('src', 'dst');
    expect(result).to.be.a('function');
  });

  it('rewrites a matching request with trailing slash', () => {
    const resolver = substrResolver('src/', 'dst/');
    expect(resolver('src/a')).to.equal('dst/a');
    expect(resolver('src')).to.equal('dst');
  });

  it('rewrites a matching request without trailing slash', () => {
    const resolver = substrResolver('src', 'dst');
    expect(resolver('src/a')).to.equal('dst/a');
    expect(resolver('src')).to.equal('dst');
  });

  it('does not rewrite a partial match', () => {
    const resolver = substrResolver('src', 'dst');
    expect(resolver('srcother/a')).to.be.false;
    expect(resolver('srcother')).to.be.false;
  });

  it('returns false for a non-match', () => {
    const resolver = substrResolver('src/', 'dst/');
    expect(resolver('dst/a')).to.be.false;
  });
});

//==============================================================================
describe(`regexpResolver`, () => {
  it('returns a function', () => {
    const result = regexpResolver('src', 'dst');
    expect(result).to.be.a('function');
  });

  it('rewrites a matching request', () => {
    const resolver = regexpResolver('src/(\\d+)/(\\d+)/(.*)', 'dst/$2/$1/$3');
    const result = resolver('src/1/2/3');
    expect(result).to.equal('dst/2/1/3');
  });

  it('returns false for a non-match', () => {
    const resolver = regexpResolver('src/(\\d+)/(\\d+)/(.*)', 'dst/$2/$1/$3');
    const result = resolver('src/1/a2/3');
    expect(result).to.be.false;
  });
});

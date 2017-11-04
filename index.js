//------------------------------------------------------------------------------
const { Context } = require('./context');

// Global resolver: Whatever is defined here is resolved for all modules!
let globalResolver = null;

const Module = module.constructor;

//------------------------------------------------------------------------------
const isNoPath = (path) => ((path[0] !== '.') && (path[0] !== '/'));

//==============================================================================
// Hooks

//------------------------------------------------------------------------------
// Module._resolveFilename
Module._resolveFilename = (_super => (request, parent, isMain, options) => {
  if (isNoPath) {
    const resolverAr = [globalResolver];
    const packageResolver = Context.get(parent.filename);
    if (packageResolver) {
      resolverAr.push(packageResolver);
    }
    for (const resolver of resolverAr) {
      const newRequest = resolver.resolve(request, parent);
      if (newRequest) {
      //console.log(`resolve ${request} from ${resolver.path}`);
        return _super(newRequest, parent, isMain, options);
      }
    }
  }

  return _super(request, parent, isMain, options);
})(Module._resolveFilename);

//------------------------------------------------------------------------------
// Module._resolveLookupPaths
Module._resolveLookupPaths = (_super => (request, parent, newReturn) => {
  const paths = _super(request, parent, newReturn);
  const packageResolver = Context.get(parent.filename);
  if (packageResolver) {
    return [
      ...packageResolver.pathsBefore,
      ...paths,
      ...packageResolver.pathsAfter,
    ];
  }
  return paths;
})(Module._resolveLookupPaths);

//------------------------------------------------------------------------------
// Module.prototype.load
Module.prototype.load = (_super => function (filename) {
  Context.get(filename, true);
  return _super.call(this, filename);
})(Module.prototype.load);

//==============================================================================
// API

//------------------------------------------------------------------------------
const use = (useGlobal, src, dst, type = 'alias') => {
  const resolver = useGlobal
    ? globalResolver
    : Context.get(module.parent.filename, true);
  resolver.use(src, dst, type);
};

//------------------------------------------------------------------------------
module.exports = {
  use: use.bind(null, false),
  useGlobal: use.bind(null, true),
};

//==============================================================================
// main

// Initialize the global resolver.
// Note that the global resolver is NOT the same as the resolver created for
// '/' when no config file was found.
// This one has an EMPTY path!
globalResolver = new Context();

// initialize resolver for parent module
Context.get(module.parent.filename, true);

var webfinger = require('webfinger').webfinger;
var ProtoNoSupportError = require('./errors/protonosupporterror');
var NoDataError = require('./errors/nodataerror');


function Resolver() {
}

Resolver.prototype.resolve = function(identifier, type, cb) {
  if (typeof type == 'function') {
    cb = type;
    type = undefined;
  }
  
  webfinger(identifier, type, { webfingerOnly: true }, function(err, jrd) {
    if (err) { return cb(new ProtoNoSupportError(err.message)); }
    var rec = {}
      , services = {}
      , links = jrd.links
      , link, i, len;
    if (jrd.subject) { rec.subject = jrd.subject; }
    if (jrd.aliases) {
      rec.aliases = jrd.aliases;
    }
    if (jrd.properties) {
      rec.attributes = jrd.properties;
    }
    if (links) {
      for (i = 0, len = links.length; i < len; ++i) {
        link = links[i];
        services[link.rel] = (services[link.rel] || []).concat({
          location: link.href,
          mediaType: link.type
        });
      }
      rec.services = services;
    }
    
    return cb(null, rec);
  });
}

Resolver.prototype.resolveAliases = function(identifier, cb) {
  this.resolve(identifier, function(err, rec) {
    if (err) { return cb(err); }
    if (!rec.aliases || rec.aliases.length == 0) {
      return cb(new NoDataError('No aliases in resource descriptor'));
    }
    
    return cb(null, rec.aliases);
  });
}

Resolver.prototype.resolveAttributes = function(identifier, cb) {
  this.resolve(identifier, function(err, rec) {
    if (err) { return cb(err); }
    if (!rec.attributes) {
      return cb(new NoDataError('No properties in resource descriptor'));
    }
    
    return cb(null, rec.attributes);
  });
}

Resolver.prototype.resolveServices = function(identifier, type, cb) {
  if (typeof type == 'function') {
    cb = type;
    type = undefined;
  }
  
  this.resolve(identifier, type, function(err, rec) {
    if (err) { return cb(err); }
    if (!rec.services || rec.services.length == 0) {
      return cb(new NoDataError('No link relations in resource descriptor'));
    }
    
    var services = rec.services
      , instances;
    if (type) {
      instances = services[type];
      if (!instances) { return cb(new NoDataError('Link relation not found: ' + type)); }
      return cb(null, instances);
    }
    return cb(null, rec.services);
  });
}


/**
 * Creates a WebFinger resolver.
 *
 * For compatibility purposes, it is important to note that up to [draft-02](https://tools.ietf.org/html/draft-ietf-appsawg-webfinger-02)
 * of WebFinger, the specification utilized [Web Host Metadata](https://tools.ietf.org/html/rfc6415)
 * and `lrdd` relations for resource-based discovery.  As of [draft-03](https://tools.ietf.org/html/draft-ietf-appsawg-webfinger-03),
 * the specification diverged significantly and moved away from Web Host
 * Metadata, simplifying the protocol to use a well-known WebFinger endpoint.
 * If compatibility with the Web Host Metadata is desired, please install the
 * `fingro-lrdd` package.
 *
 * References:
 *  - [WebFinger](https://tools.ietf.org/html/rfc7033)
 *
 * @api public
 */
module.exports = function() {
  return new Resolver();
}

var webfinger = require('webfinger').webfinger;
var ProtoNoSupportError = require('./errors/protonosupporterror');
var NoDataError = require('./errors/nodataerror');


module.exports = function() {
  
  var plugin = {};
  
  plugin.resolve = function(identifier, type, cb) {
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
      if (jrd.aliases) {
        rec.aliases = jrd.aliases;
      }
      if (jrd.properties) {
        rec.properties = jrd.properties;
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
  
  plugin.resolveAliases = function(identifier, cb) {
    webfinger(identifier, { webfingerOnly: true }, function(err, jrd) {
      if (err) { return cb(new ProtoNoSupportError(err.message)); }
      if (!jrd.aliases || jrd.aliases.length == 0) {
        return cb(new NoDataError('No aliases in resource descriptor'));
      }
      
      return cb(null, jrd.aliases);
    });
  }
  
  plugin.resolveProperties = function(identifier, cb) {
    webfinger(identifier, { webfingerOnly: true }, function(err, jrd) {
      if (err) { return cb(new ProtoNoSupportError(err.message)); }
      if (!jrd.properties) {
        return cb(new NoDataError('No properties in resource descriptor'));
      }
      
      return cb(null, jrd.properties);
    });
  }
  
  plugin.resolveServices = function(identifier, type, cb) {
    if (typeof type == 'function') {
      cb = type;
      type = undefined;
    }
    
    
    webfinger(identifier, type, { webfingerOnly: true }, function(err, jrd) {
      if (err) { return cb(new ProtoNoSupportError(err.message)); }
      if (!jrd.links || jrd.links.length == 0) {
        return cb(new NoDataError('No link relations in resource descriptor'));
      }
      
      var services = {}
        , links = jrd.links
        , link, i, len
        , instances;
      for (i = 0, len = links.length; i < len; ++i) {
        link = links[i];
        services[link.rel] = (services[link.rel] || []).concat({
          location: link.href,
          mediaType: link.type
        });
      }
      
      if (type) {
        instances = services[type];
        if (!instances) { return cb(new NoDataError('Link relation not found: ' + type)); }
        return cb(null, instances);
      }
      return cb(null, services);
    });
  }
  
  return plugin;
}

var webfinger = require('webfinger').webfinger;


module.exports = function() {
  
  var plugin = {};
  
  plugin.resolveServices = function(identifier, type, cb) {
    if (typeof type == 'function') {
      cb = type;
      type = undefined;
    }
    
    console.log('RESOLVE WITH WEBFINGER: ' + identifier);
    console.log(type);
    
    webfinger(identifier, type, { webfingerOnly: true }, function(err, jrd) {
      if (err) {
        // Ignore the error under the assumption that Webfinger is not
        // implemented by the host.  The expectation is that other discovery
        // mechanisms are registered with `fingro` that will be used as
        // alternatives.
        return cb(null);
      }
      // TODO: Normalize the results and pass back.
      return cb(null, jrd.links);
    });
  }
  
  return plugin;
}

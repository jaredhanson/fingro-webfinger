var webfinger = require('webfinger').webfinger;


module.exports = function() {
  
  return function(identifier, type, cb) {
    if (typeof type == 'function') {
      cb = type;
      type = undefined;
    }
    
    console.log('RESOLVE WITH WEBFINGER: ' + identifier);
    console.log(type);
    
    webfinger(identifier, type, { webfingerOnly: true }, function(err, jrd) {
      if (err) { return cb(err); }
      // TODO: Normalize the results and pass back.
      return cb(null, jrd.links);
    });
  }
}

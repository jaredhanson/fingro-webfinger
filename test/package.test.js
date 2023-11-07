/* global describe, it, expect */

var $require = require('proxyquire');
var factory = require('..');
var expect = require('chai').expect;
var sinon = require('sinon');


describe('fingro-webfinger', function() {
  
  it('should export function', function() {
    expect(factory).to.be.an('function');
  });
  
  describe('resolve', function() {
    
    it('should yield record when called without type argument', function(done) {
      var webfinger = sinon.stub().yields(null, {
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        aliases: [ 'h323:paulej@packetizer.com' ],
        links: [
          { type: 'image/jpeg',
            href: 'http://www.packetizer.com/people/paulej/images/paulej.jpg',
            rel: 'http://webfinger.net/rel/avatar' },
          { href: 'https://openid.packetizer.com/paulej',
            rel: 'http://specs.openid.net/auth/2.0/provider' }
        ],
        subject: 'acct:paulej@packetizer.com'
      });
      
      var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
      resolver.resolve('acct:paulej@packetizer.com', function(err, record) {
        if (err) { return done(err); }
        
        expect(webfinger).to.have.been.calledOnce;
        expect(webfinger).to.have.been.calledWith(
          'acct:paulej@packetizer.com', undefined, { webfingerOnly: true }
        );
        expect(record).to.be.an('object');
        expect(record).to.deep.equal({
          subject: 'acct:paulej@packetizer.com',
          aliases: [ 'h323:paulej@packetizer.com' ],
          attributes: {
            'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
            'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
            'http://packetizer.com/ns/name': 'Paul E. Jones'
          },
          services: {
            'http://webfinger.net/rel/avatar': [
              { location: 'http://www.packetizer.com/people/paulej/images/paulej.jpg', mediaType: 'image/jpeg' }
            ],
            'http://specs.openid.net/auth/2.0/provider': [
              { location: 'https://openid.packetizer.com/paulej', mediaType: undefined }
            ]
          }
        });
        
        done();
      });
    }); // should yield record when called without type argument
    
  }); // resolve
  
  describe('resolveAliases', function() {
    
    it('should yield aliases', function(done) {
      var webfinger = sinon.stub().yields(null, {
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        aliases: [ 'h323:paulej@packetizer.com' ],
        links: [
          { href: 'https://openid.packetizer.com/paulej',
            rel: 'http://specs.openid.net/auth/2.0/provider' }
        ],
        subject: 'acct:paulej@packetizer.com'
      });
      
      var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
      resolver.resolveAliases('acct:paulej@packetizer.com', function(err, aliases) {
        if (err) { return done(err); }
        
        expect(webfinger).to.have.been.calledOnce;
        expect(webfinger).to.have.been.calledWith(
          'acct:paulej@packetizer.com', undefined, { webfingerOnly: true }
        );
        expect(aliases).to.be.an('array');
        expect(aliases).to.have.length(1);
        expect(aliases).to.deep.equal([ 'h323:paulej@packetizer.com' ]);
        done();
      });
    }); // should yield aliases
    
    describe('without aliases', function() {
      var webfinger = sinon.stub().yields(null, {
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        links: [
          { href: 'https://openid.packetizer.com/paulej',
            rel: 'http://specs.openid.net/auth/2.0/provider' }
        ],
        subject: 'acct:paulej@packetizer.com'
      });
      
      var aliases, error;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveAliases('acct:paulej@packetizer.com', function(err, a) {
          error = err;
          aliases = a;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('No aliases in resource descriptor');
        expect(error.code).to.equal('ENODATA');
      });
      
      it('should not yeild aliases', function() {
        expect(aliases).to.be.undefined;
      });
    });
    
    describe('error due to WebFinger not supported', function() {
      var webfinger = sinon.stub().yields(new Error("Unable to find webfinger"));
      
      var aliases, error;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveAliases('acct:paulej@packetizer.com', function(err, a) {
          error = err;
          aliases = a;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Unable to find webfinger');
        expect(error.code).to.equal('EPROTONOSUPPORT');
      });
      
      it('should not yeild aliases', function() {
        expect(aliases).to.be.undefined;
      });
    });
    
  }); // resolveAliases
  
  describe('resolveAttributes', function() {
    
    describe('with properties', function() {
      var webfinger = sinon.stub().yields(null, {
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        aliases: [ 'h323:paulej@packetizer.com' ],
        links: [
          { href: 'https://openid.packetizer.com/paulej',
            rel: 'http://specs.openid.net/auth/2.0/provider' }
        ],
        subject: 'acct:paulej@packetizer.com'
      });
      
      var attributes;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveAttributes('acct:paulej@packetizer.com', function(err, p) {
          if (err) { return done(err); }
          attributes = p;
          done();
        })
      });
      
      it('should call webfinger', function() {
        expect(webfinger).to.have.been.calledOnce;
        expect(webfinger).to.have.been.calledWith(
          'acct:paulej@packetizer.com', undefined, { webfingerOnly: true }
        );
      });
      
      it('should yeild attributes', function() {
        expect(attributes).to.be.an('object');
        expect(attributes).to.deep.equal({
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        });
      });
    });
    
    describe('without properties', function() {
      var webfinger = sinon.stub().yields(null, {
        aliases: [ 'h323:paulej@packetizer.com' ],
        links: [
          { href: 'https://openid.packetizer.com/paulej',
            rel: 'http://specs.openid.net/auth/2.0/provider' }
        ],
        subject: 'acct:paulej@packetizer.com'
      });
      
      var attributes, error;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveAttributes('acct:paulej@packetizer.com', function(err, p) {
          error = err;
          attributes = p;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('No properties in resource descriptor');
        expect(error.code).to.equal('ENODATA');
      });
      
      it('should not yeild attributes', function() {
        expect(attributes).to.be.undefined;
      });
    });
    
    describe('error due to WebFinger not supported', function() {
      var webfinger = sinon.stub().yields(new Error("Unable to find webfinger"));
      
      var attributes, error;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveAttributes('acct:paulej@packetizer.com', function(err, p) {
          error = err;
          aliases = p;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Unable to find webfinger');
        expect(error.code).to.equal('EPROTONOSUPPORT');
      });
      
      it('should not yeild attributes', function() {
        expect(attributes).to.be.undefined;
      });
    });
    
  });
  
  describe('resolveServices', function() {
    
    describe('without type', function() {
      var webfinger = sinon.stub().yields(null, {
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        aliases: [ 'h323:paulej@packetizer.com' ],
        links: [
          { type: 'image/jpeg',
            href: 'http://www.packetizer.com/people/paulej/images/paulej.jpg',
            rel: 'http://webfinger.net/rel/avatar' },
          { href: 'https://openid.packetizer.com/paulej',
            rel: 'http://specs.openid.net/auth/2.0/provider' },
          { type: 'text/html',
            href: 'http://hive.packetizer.com/users/paulej/',
            rel: 'http://packetizer.com/rel/share' },
          { rel: 'http://webfinger.net/rel/profile-page',
            href: 'http://www.packetizer.com/people/paulej/',
            type: 'text/html' },
          { type: 'text/html',
            href: 'http://www.packetizer.com/people/paulej/blog/',
            titles: {
              'en-us': "Paul E. Jones' Blog"
            },
            rel: 'http://packetizer.com/rel/blog' },
          { rel: 'http://packetizer.com/rel/businesscard',
            href: 'http://www.packetizer.com/people/paulej/paulej.vcf',
            type: 'text/vcard' },
          { type: 'application/atom+xml',
            href: 'http://www.packetizer.com/people/paulej/blog/blog.xml',
            rel: 'http://schemas.google.com/g/2010#updates-from' },
          { href: 'http://www.packetizer.com/people/paulej/',
            rel: 'http://microformats.org/profile/hcard',
            type: 'text/html' },
          { rel: 'http://bitcoin.org/rel/address',
            href: 'bitcoin:17XoqvUCrf12H7Vc7c7uDxib8FDMXFx2p6' },
          { rel: 'http://bitcoin.org/rel/payments',
            href: 'https://secure.packetizer.com/bitcoin_address/?account=paulej',
            type: 'text/plain' }
        ],
        subject: 'acct:paulej@packetizer.com'
      });
      
      var services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveServices('acct:paulej@packetizer.com', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call webfinger', function() {
        expect(webfinger).to.have.been.calledOnce;
        expect(webfinger).to.have.been.calledWith(
          'acct:paulej@packetizer.com', undefined, { webfingerOnly: true }
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('object');
        expect(Object.keys(services)).to.have.length(10);
        expect(services['http://webfinger.net/rel/avatar']).to.deep.equal([
          { location: 'http://www.packetizer.com/people/paulej/images/paulej.jpg', mediaType: 'image/jpeg' }
        ]);
      });
    });
    
    describe('with type, to service that filters link relations', function() {
      var webfinger = sinon.stub().yields(null, {
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        aliases: [ 'h323:paulej@packetizer.com' ],
        links: [
          { href: 'https://openid.packetizer.com/paulej',
            rel: 'http://specs.openid.net/auth/2.0/provider' }
        ],
        subject: 'acct:paulej@packetizer.com'
      });
      
      var services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveServices('acct:paulej@packetizer.com', 'http://specs.openid.net/auth/2.0/provider', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call webfinger', function() {
        expect(webfinger).to.have.been.calledOnce;
        expect(webfinger).to.have.been.calledWith(
          'acct:paulej@packetizer.com', 'http://specs.openid.net/auth/2.0/provider', { webfingerOnly: true }
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('array');
        expect(services).to.have.length(1);
        expect(services[0]).to.deep.equal(
          { location: 'https://openid.packetizer.com/paulej', mediaType: undefined }
        );
      });
    });
    
    describe('with unsupported type, to service that filters link relations', function() {
      var webfinger = sinon.stub().yields(null, {
        properties: {
          'http://packetizer.com/ns/name#zh-CN': '保罗‧琼斯',
          'http://packetizer.com/ns/activated': '2000-02-17T03:00:00Z',
          'http://packetizer.com/ns/name': 'Paul E. Jones'
        },
        aliases: [ 'h323:paulej@packetizer.com' ],
        subject: 'acct:paulej@packetizer.com'
      });
      
      var error, services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveServices('acct:paulej@packetizer.com', 'http://specs.openid.net/auth/2.0/x-provider', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('No link relations in resource descriptor');
        expect(error.code).to.equal('ENODATA');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
    describe('with type, to service that does not filter link relations', function() {
      var webfinger = sinon.stub().yields(null, {
        subject: 'acct:will@willnorris.com',
        aliases: [ 'mailto:will@willnorris.com', 'https://willnorris.com/' ],
        links: [
          { rel: 'http://webfinger.net/rel/avatar',
            href: 'https://willnorris.com/logo.jpg',
            type: 'image/jpeg' },
          { rel: 'http://webfinger.net/rel/profile-page',
            href: 'https://willnorris.com/',
            type: 'text/html' }
        ]
      });
      
      var services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveServices('acct:will@willnorris.com', 'http://webfinger.net/rel/avatar', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call webfinger', function() {
        expect(webfinger).to.have.been.calledOnce;
        expect(webfinger).to.have.been.calledWith(
          'acct:will@willnorris.com', 'http://webfinger.net/rel/avatar', { webfingerOnly: true }
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('array');
        expect(services).to.have.length(1);
        expect(services[0]).to.deep.equal(
          { location: 'https://willnorris.com/logo.jpg', mediaType: 'image/jpeg' }
        );
      });
    });
    
    describe('with unsupported type, to service that does not filter link relations', function() {
      var webfinger = sinon.stub().yields(null, {
        subject: 'acct:will@willnorris.com',
        aliases: [ 'mailto:will@willnorris.com', 'https://willnorris.com/' ],
        links: [
          { rel: 'http://webfinger.net/rel/avatar',
            href: 'https://willnorris.com/logo.jpg',
            type: 'image/jpeg' },
          { rel: 'http://webfinger.net/rel/profile-page',
            href: 'https://willnorris.com/',
            type: 'text/html' }
        ]
      });
      
      var error, services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveServices('acct:will@willnorris.com', 'http://webfinger.net/rel/x-avatar', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Link relation not found: http://webfinger.net/rel/x-avatar');
        expect(error.code).to.equal('ENODATA');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
    describe('error due to WebFinger not supported', function() {
      var webfinger = sinon.stub().yields(new Error("Unable to find webfinger"));
      
      var error, services;
      before(function(done) {
        var resolver = $require('..', { webfinger: { webfinger: webfinger } })();
        
        resolver.resolveServices('acct:joe@example.com', 'http://specs.openid.net/auth/2.0/provider', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Unable to find webfinger');
        expect(error.code).to.equal('EPROTONOSUPPORT');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
  });
  
});

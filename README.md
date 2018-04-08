# fingro-webfinger

Status:
[![Version](https://img.shields.io/npm/v/fingro-webfinger.svg?label=version)](https://www.npmjs.com/package/fingro-webfinger)
[![Build](https://img.shields.io/travis/jaredhanson/fingro-webfinger.svg)](https://travis-ci.org/jaredhanson/fingro-webfinger)
[![Quality](https://img.shields.io/codeclimate/github/jaredhanson/fingro-webfinger.svg?label=quality)](https://codeclimate.com/github/jaredhanson/fingro-webfinger)
[![Coverage](https://img.shields.io/coveralls/jaredhanson/fingro-webfinger.svg)](https://coveralls.io/r/jaredhanson/fingro-webfinger)
[![Dependencies](https://img.shields.io/david/jaredhanson/fingro-webfinger.svg)](https://david-dm.org/jaredhanson/fingro-webfinger)

## Sponsorship

Fingro is open source software.  Ongoing development is made possible by
generous contributions from [individuals and corporations](https://github.com/jaredhanson/fingro/blob/master/SPONSORS.md).
To learn more about how you can help keep this project financially sustainable,
please visit Jared Hanson's page on [Patreon](https://www.patreon.com/jaredhanson).

## Install

```bash
$ npm install fingro-webfinger
```

## Usage

#### Register Protocol

Register the WebFinger protocol with the `fingro` resolver.

```js
resolver.use(require('fingro-webfinger')());
```

#### Resolve an Identity

With the WebFinger protocol registered, the resolver can now resolve identifiers
that support the protocol.

```js
resolver.resolve('acct:paulej@packetizer.com', function(err, entity) {
  console.log(entity);
});
```

## Considerations

#### Implementation

Note that the WebFinger protocol is, unfortunately, not widely implemented by
popular mainstream online services like Google, Facebook, and Twitter.  The
grassroots [IndieWeb](https://indieweb.org/) movement is building a people-
focused alternative to such networks, and they provide more [information](https://indieweb.org/WebFinger)
about the protocol, including services that implement support.

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015-2018 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>

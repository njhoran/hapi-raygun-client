const Joi = require('@hapi/joi');
const Hoek = require('@hapi/hoek');
const Raygun = require('raygun');
const pkg = require('../package.json');

const optionsSchema = Joi.object({
  apiKey: Joi.string(),
  tags: Joi.array(),
  log: Joi.boolean(),
  user: Joi.func(),
  filters: Joi.array().items(Joi.string()),
  version: Joi.string().regex(/^(\d+\.){2,3}\d+$/)
});

const defaults = {
  apiKey: process.env.RAYGUN_API_KEY || process.env.RAYGUN_API_TOKEN,
  log: false,
  filters: ['password']
};

const internals = {};

internals.sendError = function (client, config) {

  return function (request, error) {

    client.send(error, {}, function (response) {

      const status = response.statusCode;

      if (status === 202) {

        if (!config.log) {
          return;
        }

        server.log(['debug', pkg.name], {
          message: 'request-error reported to raygun',
          status: status,
          payload: error
        });

      } else {

        switch (status) {

          case 401: // bad api keys
            server.log(['warn', pkg.name], {
              message: 'Invalid Raygun API key',
              status: status
            });
            break;

          case 403: // API limit exceeded
            server.log(['warn', pkg.name], {
              message: 'Raygun API limits exceeded',
              status: status
            });
            break;

          default:  // something else
            server.log(['warn', pkg.name], {
              message: 'Internal Raygun error',
              status: status
            });
        }
      }
    }, request, config.tags);
  }
};

exports.plugin = {
  name: pkg.name,
  version: pkg.version,
  pkg,
  register: (server, options, next) => {

    Joi.assert(options, optionsSchema);
    const config = Hoek.applyToDefaults(defaults, options);

    if (!config.apiKey) {
      // if apiKey not set, don't register plugin
      return next();
    }

    const client = new Raygun.Client().init({
      apiKey: config.apiKey
    });

    if (config.version) {
      client.setVersion(config.version);
    }

    if (config.user) {
      client.user = config.user;
    }

    // eslint-disable-next-line no-console
    console.log({ server });

    server.events.on({ name: 'request', channels: 'error' }, internals.sendError(client, config));

    server.log(['info', 'plugins'], 'Hapi-Raygun initialized');
  }
};

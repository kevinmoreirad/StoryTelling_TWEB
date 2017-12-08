'use strict';

var url = require('url');

var Country = require('./CountryService');

module.exports.co2CountryGET = function co2CountryGET (req, res, next) {
  Country.co2CountryGET(req.swagger.params, res, next);
};

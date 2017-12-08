'use strict';

var url = require('url');

var Year = require('./YearService');

module.exports.co2YearGET = function co2YearGET (req, res, next) {
  Year.co2YearGET(req.swagger.params, res, next);
};

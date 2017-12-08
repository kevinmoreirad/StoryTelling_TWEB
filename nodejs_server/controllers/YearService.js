'use strict';

exports.co2YearGET = function(args, res, next) {
  /**
   * Co2 By Year
   * Co2/year endpoint returns the list of all countries and the co2 from the selected year 
   *
   * year Double year to analyse
   * returns List
   **/
  var examples = {};
  examples['application/json'] = [ {
  "country" : "aeiou",
  "year" : "aeiou",
  "value" : "aeiou"
} ];
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}


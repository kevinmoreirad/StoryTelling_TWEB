'use strict';

exports.co2CountryGET = function(args, res, next) {
  /**
   * Co2 by Country
   * Co2/country endpoint returns the list of all years and the co2 from the  selected country 
   *
   * country Double country to analyse
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


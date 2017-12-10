'use strict';

exports.co2CountryGET = function(args, res, next) {
  /**
   * Co2 by Country
   * Co2/country endpoint returns the list of all years and the co2 from the  selected country 
   *
   * country String country to analyse
   * returns List
   **/
  var request = require('request-promise');
  var MongoClient = require('mongodb').MongoClient;
  connectDbAndGetCo2Emissions()
      .then(function(context) {
        console.log("getting "+context.result.length+" infos");
          var response = [];
          for(var i=0; i< context.result.length;i++){
            var country = context.result[i].country.value;
            var year = context.result[i].date;
            var value = context.result[i].value;
            var countryCode = context.result[i].countryiso3code;
            response[i] = {
            "country" : country ,
            "year" : year,
            "value" : value,
            "countryCode" : countryCode
            };
          }
         
          if (Object.keys(response).length > 0) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(response), null, 2);
          } else {
            res.end();
          }

      })
      .catch(function(error){
          console.log("an error occured!");
          console.log(error);
      });
  function connectDbAndGetCo2Emissions() {
  
      var context = {};
      context.db_url = "mongodb://localhost:27017/bdEnvironment";
  
      return openDBConnection(context)
          .then(getAllCo2EmissionsOfCountry)
          .then(closeDb);
  }
  
  function openDBConnection(context) {
      return MongoClient.connect(context.db_url)
          .then(function(dataB) {
              context.db = dataB;
              return context;
          });
  }
  function getAllCo2EmissionsOfCountry(context) {
    return context.db.collection('co2Emissions').find({'country.value' : args.country.value}, {'country.value':1, date:1, value:1, countryiso3code:1}).toArray()
        .then(function(result) {
          context.result = result;
          console.log(context.result[0]);
          return context;  
        });                                                                                                
  }
  
  function closeDb(context) {
      return context.db.close()
          .then(function() {
              console.log("db connection closed after getting co2 of country!");
              return context;
          });
  }
}


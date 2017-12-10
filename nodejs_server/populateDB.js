'use strict';

//first part we fill our MongoDb with the info of the worldbank api
var request = require('request-promise');
var MongoClient = require('mongodb').MongoClient;
fetchAndSaveCo2Emissions()
    .then(function(result) {
        console.log("finished");
    })
    .catch(function(error){
        console.log("an error occured!");
        console.log(error);
    });
function fetchAndSaveCo2Emissions() {

    var context = {};
    context.apiOptions = {
        uri: 'http://api.worldbank.org/v2/countries/all/indicators/EN.ATM.CO2E.KT?format=json&page=1',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    context.db_url = "mongodb://localhost:27017/bdEnvironment";

    return openDBConnection(context)
        .then(fetchAllPagesCo2Emissions)
        .then(closeDb);
}

function openDBConnection(context) {
    return MongoClient.connect(context.db_url)
        .then(function(dataB) {
            context.db = dataB;
            return context;
        });
}
function fetchAllPagesCo2Emissions(context) {

    function fetchOnePageCo2Emissions(context, pageNumb) {
        context.apiOptions.uri = 'http://api.worldbank.org/v2/countries/all/indicators/EN.ATM.CO2E.KT?format=json&page='+pageNumb;
        return request(context.apiOptions)
            .then(function(co2){
                context.co2 = co2;
                return context;
            })
            .then(function(context) {
                if(context.co2[0].pages >= pageNumb) {
                    var collection = context.db.collection('co2Emissions');
                    return collection.insertMany(context.co2[1]);
                }
            })
            .then(function(coll) {
                pageNumb++;
                if(pageNumb <= context.co2[0].pages) {
                    return fetchOnePageCo2Emissions(context, pageNumb);
                }
                else {
                    return context;
                }
            });  
    }
    return fetchOnePageCo2Emissions(context, 1)
}

function closeDb(context) {
    return context.db.close()
        .then(function() {
            console.log("db connectiom closed!");
            return context;
        });
}


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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// second part of the index.js, the swagger to create the API ///////////////////////////
var fs = require('fs'),
    path = require('path'),
    http = require('http');

var app = require('connect')();
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var serverPort = 8080;

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });

});

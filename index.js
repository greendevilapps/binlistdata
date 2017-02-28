var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

function findResults(params){
    var jr = {
        success  : true
        , query  : params.bin
    };
    var results = [];

    if ( jr.query ) {
        try {
            var fs = require('fs');
            var parse = require('csv-parse/lib/sync');
            var t1, t2, q1;
            q1 = parseInt(jr.query);
            var records = parse(fs.readFileSync('ranges.csv'), {delimiter: ','});

            records.forEach(function(card){
                t1 = parseInt(card[0]);
                t2 = parseInt(card[1]);
                // if ( q1 >= t1 ) {
                //     if ( (!t2 || isNaN(t2)) || (t2 && !isNaN(t2) && t2 > 0 && q1 <= t2) ) {
                //         jr.results.push(card);
                //     }
                // }
                if ( q1 === t1 ) {
                    results.push({
                        iin_start      : card[0]
                        , iin_end      : card[1]
                        , number_length: card[2]
                        , scheme       : card[3]
                        , brand        : card[4]
                        , type         : card[5]
                        , prepaid      : card[6]
                        , country      : card[7]
                        , bank_name    : card[8]
                        , bank_logo    : card[9]
                        , bank_url     : card[10]
                        , bank_phone   : card[11]
                        , bank_city    : card[12]
                    });
                }
            });

            if ( results.length > 0 ) {
                jr.scheme = results[0].scheme;
                jr.number = {
                    length: results[0].number_length
                    , prefix: results[0].iin_start
                };
                jr.type = results[0].type;
                jr.brand = results[0].brand;
                jr.prepaid = !!results[0].prepaid;
                jr.bank = {
                    name: results[0].bank_name
                    , logo: results[0].bank_logo
                    , url: results[0].bank_url
                    , city: results[0].bank_city
                    , phone: results[0].bank_url
                };
                jr.country = {
                    alpha2: results[0].country
                    , name: null
                    , numeric: null
                    , latitude: null
                    , longitude: null
                };

                var countries = parse(fs.readFileSync('countries.csv'), {delimiter: ','});
                countries.forEach(function(row){
                    if ( (row[0] + '') === (jr.country.alpha2 + '') ) {
                        jr.country.name = row[1];
                        jr.country.numeric = row[2];
                        jr.country.latitude = row[3];
                        jr.country.longitude = row[4];
                    }
                });
            }
        }
        catch(E){
            jr.success = false;
            jr.message = "Server error.";
            // jr._debug = E.message;
        }
    }
    else {
        jr.success = false;
        jr.message = "No bin was requested.";
    }

    return jr;
}

app.get('/q/:bin', function(request, response){
    var jr = findResults(request.params);
    response.render('pages/query_response', {
        jr: jr
    });
});

app.get('/api/v1/:bin', function(req, res){
    var jr = findResults(req.params);
    res.json(jr);
});

app.listen(app.get('port'), function() {
  // console.log('Node app is running on port', app.get('port'));
});

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/q', function(request, response){
    var jr = {
        success  : true
        , query  : request.query.bin
        , results: []
    };

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
                    jr.results.push({
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

    response.format({
        html: function(){
            response.render('pages/query_response', {
                jr: jr
            });
        },
        json: function(){
            response.json(jr);
        }
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

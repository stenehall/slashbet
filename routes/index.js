//var fs = require('fs');
var sh = require("shorthash");
var mysql = require('mysql');


var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'slashbet'
});
db.connect();


function ipTohex (ip) {
  var parts = ip.split('.');
  var hex = '';
  hex = hex + lpad(parseInt(parts[0]).toString(16), 2);
  hex = hex + lpad(parseInt(parts[1]).toString(16), 2);
  hex = hex + lpad(parseInt(parts[2]).toString(16), 2);
  return hex;
}

function lpad (str, length) {
  while (str.length < length)
      str = "0" + str;
  return str;
}

/*
 * GET home page.
 */

exports.index = function index(req, res){
  db.query('SELECT bets.*, COUNT(CASE WHEN vote IS NOT NULL THEN 1 END) as votes FROM bets LEFT JOIN votes on bets.id = votes.bet_id GROUP BY bet_id ORDER BY votes DESC', function(err, results) {
    res.render('index', { title: 'Slashbet', bets: results });
  });
};

exports.single = function single(req, res){

  db.query('SELECT bets.*, COUNT(CASE WHEN vote = 0 THEN 1 END) as no, COUNT(CASE WHEN vote = 1 THEN 1 END) as yes FROM bets LEFT JOIN votes on bets.id = votes.bet_id WHERE hash = ?', [req.params.hash], function(err, results) {
    if(results.length !== 1)
    {
      res.redirect('/');
    }
    else
    {
      var bet = results[0];
      var percent;
      if (bet.yes || bet.no)
      {
        percent = Math.round((bet.yes / (bet.yes+bet.no))*100);
      }
      res.render('single', { title: bet.bet+" <small>("+bet.date+")</small>", bet: bet, percent: percent, hex: bet.color });
    }
  });
};

exports.vote = function vote(req, res){

  if(req.params.hash === undefined || req.params.vote === undefined)
  {
    console.log('undefined');
    res.redirect('/');
  }

  db.query('SELECT * FROM bets WHERE hash = ?', [req.params.hash], function(err, results) {
    if(results.length !== 1)
    {
      console.log('no matching hash');
      res.redirect('/');
    }
    else
    {
      var bet = results[0];
      db.query('SELECT * FROM votes WHERE bet_id = ? AND ip = ?', [bet.id, req.connection.remoteAddress], function(err, results) {
        if(results.length !== 0)
        {
          res.redirect('/'+req.params.hash);
        } else {
          var post  = {'bet_id': bet.id, 'ip': req.connection.remoteAddress, 'vote': req.params.vote};
          var query = db.query('INSERT INTO votes SET ?', post, function(err, result) {
            // Let's just hope it worked.
            // At least for now :)
            res.redirect('/'+req.params.hash);
          });
        }
      });
    }
  });
};

exports.post = function post(req, res) {

  var hash = sh.unique(req.body.bet);
  var hex = ipTohex(req.connection.remoteAddress);

  var post  = {'bet': req.body.bet, 'hash': hash, 'date': req.body.date, 'color': hex};
  var query = db.query('INSERT INTO bets SET ?', post, function(err, result) {
    // Let's just hope it worked.
    // At least for now :)
    res.redirect('/');
  });

}


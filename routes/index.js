var fs = require('fs');
var sh = require("shorthash");



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

  var bets = global.bets;

  var arr = [];
  for (var prop in bets) {
      if (bets.hasOwnProperty(prop)) {
          arr.push(bets[prop]);
      }
  }

  arr.sort(function(a, b) { return a.yes - b.yes; });
  console.log(arr);


  res.render('index', { title: 'Slashbet', bets: arr });
};

exports.single = function single(req, res){

  var bets = global.bets;
  bet = bets[req.params.hash];
  if (bet === undefined)
  {
    res.redirect('/');
  }

  var percent;
  if (bet.yes || bet.no)
  {
    percent = Math.round((bet.yes / (bet.yes+bet.no))*100);
  }

  console.log(bet);

  res.render('single', { title: bet.bet, bet: bet, percent: percent, hex: bet.color });
};

exports.vote = function vote(req, res){
  var bets = global.bets;
  bet = bets[req.params.hash];
  if (bet === undefined)
  {
    res.redirect('/');
  }

  if(bet.ips.indexOf(req.connection.remoteAddress) === -1)
  {
    if(bet[req.params.vote] !== undefined)
    {
      bets[req.params.hash][req.params.vote]++;
      bets[req.params.hash].ips.push(req.connection.remoteAddress);

      fs.writeFile(global.betsFile, JSON.stringify(global.bets), function (err) {
        if (err) throw err;
      });
    }
  }

  res.redirect('/'+req.params.hash);
};

exports.post = function post(req, res) {

  var hash = sh.unique(req.body.bet);
  var hex = ipTohex(req.connection.remoteAddress);

  global.bets[hash] = {'bet': req.body.bet, 'color': hex, 'yes': 0, 'no': 0, 'hash': hash, 'ips': []};

  fs.writeFile(global.betsFile, JSON.stringify(global.bets), function (err) {
      if (err) throw err;
    });
  res.redirect('/');
}


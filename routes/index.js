var fs = require('fs');
var sh = require("shorthash");

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

  res.render('single', { title: 'Slashbet', bet: bet });
};

exports.vote = function vote(req, res){

  var bets = global.bets;
  bet = bets[req.params.hash];
  if (bet === undefined)
  {
    res.redirect('/');
  }

  console.log(req.connection.remoteAddress);
  if(bet.ips.indexOf(req.connection.remoteAddress) === -1)
  {
    bet.ips.push(req.connection.remoteAddress);
    if(bet[req.params.vote] !== undefined)
    {
      console.log('fount vore');
      bet[req.params.vote]++;
    }
  }

  res.redirect('/'+req.params.hash);
};

exports.post = function post(req, res) {

  var hash = sh.unique(req.body.bet);
  console.log('--------');
  console.log(hash);
  console.log('--------');

  global.bets[hash] = {'bet': req.body.bet, 'yes': 0, 'no': 0, 'hash': hash, 'ips': []};

  fs.writeFile(global.betsFile, JSON.stringify(global.bets), function (err) {
      if (err) throw err;
    });
  res.redirect('/');
}
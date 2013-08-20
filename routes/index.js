
var fs = require('fs');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Slashbet', bets: global.bets });
};

exports.post = function(req, res) {

  global.bets.push({'bet': req.body.bet});

  fs.writeFile(global.betsFile, JSON.stringify(global.bets), function (err) {
      if (err) throw err;
    });
  res.redirect('/');
}
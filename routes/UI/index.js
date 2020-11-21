var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/customer', function(req, res, next) {
  res.render('customer');
});

module.exports = router;

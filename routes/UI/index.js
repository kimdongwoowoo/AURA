var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


router.post('/customer', function(req, res, next) {
  res.render('customer');
});
router.post('/product', function(req, res, next) {
  res.render('product');
});
router.post('/sales', function(req, res, next) {
  res.render('sales');
});


module.exports = router;

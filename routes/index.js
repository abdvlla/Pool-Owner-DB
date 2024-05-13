const express = require('express')
const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {
  res.render('index')
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/login');
}

module.exports = router;
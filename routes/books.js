const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller  = require('../controllers/books');

router.get('/getBook', passport.authenticate('jwt', {session: false}), controller.getBook);
router.post('/buyABook', passport.authenticate('jwt', {session: false}), controller.buyABook);

module.exports = router;
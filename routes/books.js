const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller  = require('../controllers/books');

router.get('/getBook', passport.authenticate('jwt', {session: false}), controller.getBook);
router.get('/getLibBooks', passport.authenticate('jwt', {session: false}), controller.getLibBooks);
router.post('/buyABook', passport.authenticate('jwt', {session: false}), controller.buyABook);
router.post('/downloadBook', passport.authenticate('jwt', {session: false}), controller.downloadBook);

module.exports = router;
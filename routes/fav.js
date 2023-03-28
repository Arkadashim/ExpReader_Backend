const express = require('express');
const router = express.Router();
const controller = require('../controllers/fav');
const passport = require('passport');

router.post('/switchFav', passport.authenticate('jwt', {session: false}), controller.switchFav);
router.get('/showFav', passport.authenticate('jwt', {session: false}), controller.showFav);

module.exports = router;
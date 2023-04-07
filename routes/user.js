const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller  = require('../controllers/user');

router.get('/getUserData', passport.authenticate('jwt', {session: false}), controller.getUserData);

module.exports = router;
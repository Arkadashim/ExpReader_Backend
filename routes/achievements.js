const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller  = require('../controllers/achievements');

router.get('/getAllAchievements', passport.authenticate('jwt', {session: false}), controller.getAllAchievements);
router.get('/getUserAchievements', passport.authenticate('jwt', {session: false}), controller.getUserAchievements);
router.post('/completeAchievement', passport.authenticate('jwt', {session: false}), controller.completeAchievement);

module.exports = router;
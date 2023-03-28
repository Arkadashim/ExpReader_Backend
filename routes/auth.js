const express = require('express');
const router = express.Router();
const {login, resgister} = require('../controllers/auth');

router.post('/login', login);
router.post('/register', resgister);

module.exports = router;
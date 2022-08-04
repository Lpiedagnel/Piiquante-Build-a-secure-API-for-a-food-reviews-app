const express = require('express')
const router = express.Router()

const passwordValidator = require('../middlewares/password-validator');
const userCtrl = require('../controllers/user');

router.post('/signup', passwordValidator, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
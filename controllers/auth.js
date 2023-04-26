const eH = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, UserStat } = require('../models');

// in body - login, password
module.exports.login = async function (req, res) {
    try {
        const candidate = await User.findOne({ raw: true, where: { login: req.body.login } });
        if (candidate) {
            // compare pass
            const pw = bcrypt.compareSync(req.body?.password, candidate.password);
            
            if (pw) {
                const token = jwt.sign({
                    login: candidate.login,
                    userId: candidate.id,
                }, require("../config/config.json").jwt, {  });

                res.status(200).json({
                    token: `Bearer ${token}`,
                });
            } else {
                return res.status(401).send(`Логин и пароль не совпадают`);
            }
        } else {
            return res.status(404).send('Пользователь не найден!');
        }
    } catch (err) {
        eH(res, err);
    }
}

// should contain in req: in body - login, password, nickname
module.exports.resgister = async function (req, res) {
    try {
        // check on existing
        const candidate = await User.findOne({ raw: true, where: { login: req.body.login } });
        if (candidate) {
            return res.status(409).send(`Пользователь уже зарегистрирован!`);
        }

        const salt = bcrypt.genSaltSync(10);
        const pw = req.body?.password;

        // build new record
        const _user = User.build({
            login: req.body?.login,
            password: bcrypt.hashSync(pw, salt),
            nickname: req.body?.nickname
        });

        // save and create stat for user
        await _user.save().then(() => {
            UserStat.create({
                id: _user.id,
                readBooks: 0,
                readPages: 0,
                UserId: _user.id,
            });
            res.status(200).send(`Регистрация прошла успешно!`);

        });
    } catch (err) {
        eH(res, err);
    }
}
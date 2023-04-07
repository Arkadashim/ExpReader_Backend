const eH = require('../middleware/errorHandler');
const { Sequelize } = require('../models');

const UserStat = require('../models/userstat').Model;
const UserAchieves = require('../models/userachieves').Model;
const UserBookStat = require('../models/userbookstat').Model;
const User = require('../models/user').Model;
const Book = require('../models/book').Model;
const BookAuthor = require('../models/bookauthor').Model;
const Author = require('../models/author').Model;
const Achievement = require('../models/achievement').Model;

// auth in header
module.exports.getUserData = async function (req, res) {
    try {
        let userId = req.user.id;

        const _userData = await UserStat.findOne({
            raw: true,
            where: { UserId: userId },
            include: {
                model: User,
                attributes: []
            },
            attributes: [
                [Sequelize.col('User.nickname'), 'nickname'],
                ['readPages', 'readPagesNum'],
                ['readBooks', 'readBooksNum']
            ]
        });

        _userData.achievesImg = await UserAchieves.findAll({
            raw: true,
            where: { UserId: userId },
            include: { model: Achievement, attributes: [] },
            attributes: [
                [Sequelize.col('Achievement.image'), 'image']
            ]
        }).then(achievesImg => achievesImg.map(achievesImg => achievesImg.image));

        _userData.userBooks = await UserBookStat.findAll({
            raw: true,
            where: { UserId: userId },
            include: { model: Book, attributes: [] },
            attributes: [
                [Sequelize.col('Book.id'), 'id'],
                [Sequelize.col('Book.cover'), 'cover'],
                [Sequelize.col('Book.title'), 'title'],
                [Sequelize.col('Book.pages'), 'bookPages'],
                'readPages'
            ]
        });

        for (const i in _userData.userBooks) {
            _userData.userBooks[i].authors = await BookAuthor.findAll({
                raw: true,
                where: { BookId: _userData.userBooks[i].id },
                include: { model: Author, attributes: [] },
                attributes: [
                    [Sequelize.col('Author.name'), 'name']
                ]
            }).then(authors => authors.map(authors => authors.name));
        }

        res.status(200).json(_userData);
    } catch (err) {
        eH(res, err);
    }
}
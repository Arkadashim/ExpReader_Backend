const { where } = require('sequelize');
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

/* should contain: auth in header + "UBStat" - array of objects. 
example: 

    {
        "UBStat": [
            {
                "bookID": 1,
                "readPages": 23,
                "currentPage": 23,
                "isRead": false,
                "readDate": ""
            },
            {
                "bookID": 3,
                "readPages": 10,
                "currentPage": 12,
                "isRead": false,
                "readDate": ""
            }
        ]
    }

*/
module.exports.updateUserBookStat = async function (req, res) {
    try {
        const data = req.body.UBStat;
        const uID = req.user.id;

        for (const i in data) {
            try {
                const bID = data[i].bookID;
                delete data[i].bookID;

                const currentData = await UserBookStat.findOne({ where: { BookId: bID, UserId: uID } });
                if (currentData.readPages <= data[i].readPages && currentData.currentPage <= data[i].currentPage && currentData.isRead <= data[i].isRead) {
                    let aDate = new Date(data[i].readDate);
                    data[i].readDate = isNaN(aDate) ? Date.now() : aDate;
                    await UserBookStat.update(data[i], { where: { UserId: uID, BookId: bID } });
                }
            } catch (e) {
                console.log(e);
                continue;
            }
        }

        res.status(200).send(`Updated successfully!`);
    } catch (err) {
        eH(res, err);
    }
}
const eH = require('../middleware/errorHandler');
const { Sequelize } = require('../models');
const fs = require('node:fs');
const path = require('node:path');

const Book = require('../models/book').Model;
const Author = require('../models/author').Model;
const Genre = require('../models/genre').Model;
const Favorite = require('../models/favorite').Model;
const UserBookStat = require('../models/userbookstat').Model;
const BookAuthor = require('../models/bookauthor').Model;
const BookGenre = require('../models/bookgenre').Model;

// Auth + bookId in body
module.exports.buyABook = async function (req, res) {
    try {
        let userId = req.user.id;
        let bookId = req.body.bookId;

        const [book, created] = await UserBookStat.findOrCreate({
            where: {
                UserId: userId,
                BookId: bookId,
            },
            defaults: {
                isRead: false,
                readPages: 0,
                currentPage: 1,
                readDate: Date.now()
            }
        });

        if (created) {
            res.status(200).send(`Книга успешно добавлена`);
        } else {
            res.status(200).send(`Книга уже добавлена`);
        }
    } catch (err) {
        eH(res, err);
    }
}

// param //api/getBook?id=*id of book*
module.exports.getBook = async function (req, res) {
    try {
        let bId = req.query.id;
        let uId = req.user.id;

        const aBook = await Book.findOne({
            raw: true,
            where: { id: bId },
            attributes: [
                'id', 'title', 'cover', 'description', 'fragment',
                ['cost', 'price'], ['pages', 'bookPages'],
            ]
        });

        if (!aBook)
            return res.send(`Книга не найдена`);

        const authors = await BookAuthor.findAll({
            raw: true,
            where: { BookId: bId },
            include: [{
                model: Author,
                attributes: []
            }],
            attributes: [
                [Sequelize.col('Author.name'), 'name']
            ]
        });

        aBook.authors = [];
        for (var i in authors) {
            aBook.authors.push(authors[i].name);
        }

        const genres = await BookGenre.findAll({
            raw: true,
            where: { BookId: bId },
            include: [{
                model: Genre,
                attributes: []
            }],
            attributes: [
                [Sequelize.col('Genre.genre'), 'genre']
            ]
        });

        aBook.genres = [];
        for (var i in genres) {
            aBook.genres.push(genres[i].genre);
        }

        aBook.isFavorite = await Favorite.findOne({ raw: true, where: { UserId: uId, BookId: bId } }) !== null;

        res.status(200).json(aBook);
    } catch (err) {
        eH(res, err);
    }
}


// auth in header + bookId in body
module.exports.downloadBook = async function (req, res) {
    try {
        let bId = req.body.bookId;
        let uId = req.user.id;

        // does user have the book?
        _ubs = await UserBookStat.findOne({
            raw: true, where: { BookId: bId, UserId: uId },
            include: { model: Book, attributes: [] }, attributes: [[Sequelize.col('Book.fileName'), 'fileName']]
        });

        // if it has - search file and send
        if (_ubs) {
            const dir = path.join(__dirname, `../storage/books`, _ubs.fileName);

            fs.access(dir, (error) => {
                if (error) {
                    return res.status(500).send(`Файл не найден`);
                }
                return res.status(200).sendFile(dir);
            });
        } else {
            // if it doesnt have - just drop 
            res.status(401).end();
        }
    } catch (err) {
        eH(res, err);
    }

}

// auth in header
module.exports.getLibBooks = async function (req, res) {
    try {
        let uId = req.user.id;

        const _books = await UserBookStat.findAll({
            raw: true,
            where: { UserId: uId },
            include: { model: Book, attributes: [] },
            attributes: [
                [Sequelize.col('Book.id'), 'id'],
                [Sequelize.col('Book.title'), 'title'],
                [Sequelize.col('Book.cover'), 'cover'],
                [Sequelize.col('Book.pages'), 'bookPages'],
                'currentPage', 'readPages', 'readDate', 'isRead'
            ]
        });

        for (const i in _books) {
            const authors = await BookAuthor.findAll({
                raw: true,
                where: { BookId: _books[i].id },
                include: [{
                    model: Author,
                    attributes: []
                }],
                attributes: [
                    [Sequelize.col('Author.name'), 'name']
                ]
            });

            _books[i].authors = [];
            for (var j in authors) {
                _books[i].authors.push(authors[j].name);
            }
        }

        res.status(200).json(_books);
    } catch (err) {
        eH(res, err);
    }

}
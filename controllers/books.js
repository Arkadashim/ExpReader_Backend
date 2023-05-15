const eH = require('../middleware/errorHandler');
const { Sequelize } = require('../models');
const { Op } = require("sequelize");
const { insensitiveLike } = require('../middleware/comparer');
const fs = require('node:fs');
const path = require('node:path');

const Book = require('../models/book').Model;
const User = require('../models/user').Model;
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
            res.status(400).send(`Книга уже добавлена`);
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
        aBook.isBought = await UserBookStat.findOne({ raw: true, where: { UserId: uId, BookId: bId } }) !== null;

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
                [Sequelize.col('Book.fileName'), 'fileName'],
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

module.exports.getFilteredBooks = async function (req, res) {
    try {
        // function for define a sort type
        const ordering = () => {
            switch (req.body.sortID) {
                case 1: return ['price'];
                case 2: return [['price', 'DESC']];
                case 3: return ['title'];
                case 4: return [['title', 'DESC']];
                default: return null;
            }
        }

        const where = {}; // decalre where block
        const rarity = req.body.rarity;
        if (rarity || rarity === 0) {
            switch (rarity) {
                case 0: where.pages = { [Op.lte]: 900 }; break;
                case 1: where.pages = { [Op.gte]: 901, [Op.lte]: 1800 }; break;
                case 2: where.pages = { [Op.gte]: 1801, [Op.lte]: 2700 }; break;
                case 3: where.pages = { [Op.gte]: 2701 }; break;
            }
        }

        // search books
        const _books = await Book.findAll({
            raw: true,
            order: ordering(),
            where: where,
            attributes: ['id', 'title', 'pages', 'cover', ['cost', 'price']]
        });

        const _booksToSend = []; //  indexes for removing items
        for (const i in _books) {
            // get authors of book
            _books[i].authors = await BookAuthor.findAll({
                raw: true,
                where: { BookId: _books[i]?.id },
                include: { model: Author, attributes: [] },
                attributes: [
                    [Sequelize.col('Author.name'), 'name']
                ]
            }).then(authors => authors.map(authors => authors.name));


            let authorCheck = false;
            let titleCheck = false;
            let genres = null;

            // if there is searchValue in body
            if (req.body.searchValue?.length) {
                let searchValue = req.body.searchValue;
                titleCheck = insensitiveLike(searchValue, _books[i].title); // search by title

                for (const j in _books[i].authors) {
                    let author = _books[i].authors[j];
                    // check by authors
                    if (insensitiveLike(searchValue, author)) {
                        authorCheck = true;
                        break;
                    }
                }
            } else {
                authorCheck = true;
                titleCheck = true;
            }

            if (req.body.genres?.length) {
                genres = await BookGenre.findOne({
                    raw: true,
                    where: { BookId: _books[i]?.id, GenreId: { [Op.or]: req.body.genres } }
                });
            } else {
                genres = true;
            }

            if ((authorCheck || titleCheck) && genres) {
                _booksToSend.push(_books[i]);
            }
        }

        res.status(200).json(_booksToSend);
    } catch (err) {
        eH(res, err);
    }

}

module.exports.getRecommendedBooks = async function (req, res) {
    try {
        const uID = req.user?.id;

        const _favs = await User.findOne({ where: { id: uID }, attributes: ['favAuthor', 'favGenre'] });
        if (!_favs.favAuthor && !_favs.favGenre) {
            return res.status(404).send(null);
        }
        var byAuth = {};
        var byGenre = {};
        var notUsedIds = [];
        if (_favs.favAuthor) {
            byAuth = await BookAuthor.findAll({
                raw: true,
                where: { AuthorId: _favs.favAuthor },
                include: { model: Book, attributes: [] },
                attributes: [
                    [Sequelize.col('Book.id'), 'id'],
                    [Sequelize.col('Book.title'), 'title'],
                    [Sequelize.col('Book.cover'), 'cover'],
                    [Sequelize.col('Book.cost'), 'price'],
                ]
            });

            byAuth.forEach(element => {
                notUsedIds.push(element.id);
            });
        }

        if (_favs.favGenre) {
            byGenre = await BookGenre.findAll({
                raw: true,
                where: { [Op.and]: [{ GenreId: _favs.favGenre }, { BookId: { [Op.notIn]: notUsedIds } }] },
                include: { model: Book, attributes: [] },
                attributes: [
                    [Sequelize.col('Book.id'), 'id'],
                    [Sequelize.col('Book.title'), 'title'],
                    [Sequelize.col('Book.cover'), 'cover'],
                    [Sequelize.col('Book.cost'), 'price'],
                ]
            });
        }

        const data = byAuth.concat(byGenre);
        for (const i in data) {
            data[i].authors = await BookAuthor.findAll({
                raw: true,
                where: { BookId: data[i]?.id },
                include: { model: Author, attributes: [] },
                attributes: [
                    [Sequelize.col('Author.name'), 'name']
                ]
            }).then(authors => authors.map(authors => authors.name));
        }

        res.status(200).json(data);
    } catch (err) {
        eH(res, err);
    }
}
const eH = require('../middleware/errorHandler');
const { Sequelize } = require('../models');

const UserBookStat = require('../models/userbookstat').Model;
const Book = require('../models/book').Model;
const Author = require('../models/author').Model;
const Genre = require('../models/genre').Model;
const Favorite = require('../models/favorite').Model;
const BookAuthor = require('../models/bookauthor').Model;
const BookGenre = require('../models/bookgenre').Model;

// Auth + bookId in body
module.exports.buyABook = async function (req, res) {
    try {
        let userId = req.user.id;
        let bookId = req.body.bookId;

        await UserBookStat.create({
            UserId: userId,
            BookId: bookId,
            isRead: false,
            readPages: 0,
            currentPage: 0,
            readDate: Date.now()
        });
        res.status(200).send(`Книга успешно добавлена`);
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
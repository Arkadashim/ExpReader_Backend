const eH = require('../middleware/errorHandler');
const { Sequelize } = require('../models');

const Favorite = require('../models/favorite').Model;
const Book = require('../models/book').Model;
const Author = require('../models/author').Model;
const BookAuthor = require('../models/bookauthor').Model;

// should contain in req: in header - Authorization, in body - bookId
module.exports.switchFav = async function (req, res) {
    try {
        const bId = req.body.bookId;
        const _fav = await Favorite.findOne({
            raw: true, where: {
                UserId: req.user.id,
                BookId: bId,
            }
        });
        
        if (_fav) {
            await Favorite.destroy({ raw: true, where: { id: _fav.id } });
            return res.status(200).send(`Товар удален из избранного!`);
        }

        await Favorite.create({ UserId: req.user.id, BookId: bId });
        res.status(200).send(`Товар добавлен в избранное!`);
    } catch (err) {
        eH(res, err);
    }
}

// should contain in req: in header - Authorization
module.exports.showFav = async function(req, res) {
    try {
        const uId = req.user.id;

        const _fav = await Favorite.findAll({
            raw: true,
            where: {UserId: uId},
            include: {model: Book, attributes: []},
            attributes: [
                [Sequelize.col('Book.id'), 'id'],
                [Sequelize.col('Book.title'), 'title'],
                [Sequelize.col('Book.cost'), 'price'],
                [Sequelize.col('Book.cover'), 'cover']
            ]
        });

        for (var i in _fav) {
            const authors = await BookAuthor.findAll({
                raw: true,
                where: { BookId: _fav[i].id },
                include: [{
                    model: Author,
                    attributes: []
                }],
                attributes: [
                    [Sequelize.col('Author.name'), 'name']
                ]
            });

            _fav[i].authors = [];

            for (var j in authors) {
                _fav[i].authors.push(authors[j].name);
            }    
        }

        res.status(200).json(_fav);
    } catch(err) {
        eH(res, err);
    }
}
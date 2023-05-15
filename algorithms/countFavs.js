const { Sequelize } = require('../models');
const sequelize = require('../config/database');

const Book = require('../models/book').Model;
const User = require('../models/user').Model;
const Author = require('../models/author').Model;
const BookAuthor = require('../models/bookauthor').Model;
const Genre = require('../models/genre').Model;
const BookGenre = require('../models/bookgenre').Model;
const UserBookStat = require('../models/userbookstat').Model;


async function ReCount() {
    const _user = await User.findAll({ raw: true, attributes: ['id'] });

    const allAuthors = await Author.findAll({ raw: true });
    const allGenres = await Genre.findAll({ raw: true });

    // console.log(allAuthors);
    for (const i in _user) {

        allGenres.forEach(el => { el.count = 0 });
        allAuthors.forEach(el => { el.count = 0 });

        const books = await UserBookStat.findAll({
            raw: true,
            where: { UserId: _user[i].id },
            attributes: [['BookId', 'id']]
        });

        for (const j in books) {

            const bA = await BookAuthor.findAll({ raw: true, where: { BookId: books[j].id } });
            bA.forEach(el => {
                allAuthors.forEach(_el => {
                    if (_el.id === el.AuthorId) {
                        _el.count++;
                    }
                })
            });

            const bG = await BookGenre.findAll({ raw: true, where: { BookId: books[j].id } });
            bG.forEach(el => {
                allGenres.forEach(_el => {
                    if (_el.id === el.GenreId) {
                        _el.count++;
                    }
                })
            })
        }
        

        var maxAuthor = null;
        allAuthors.forEach(el => {
            if (maxAuthor?.count < el?.count || !maxAuthor) {
                maxAuthor = el;
            }
        });

        var maxGenre = null;
        allGenres.forEach(el => {
            if (maxGenre?.count < el?.count || !maxGenre) {
                maxGenre = el;
            }
        })

        await User.update({favAuthor: maxAuthor?.id, favGenre: maxGenre?.id}, {where: {id: _user[i].id}});
        console.log(maxAuthor,'\n',maxGenre);
    }
}

ReCount();


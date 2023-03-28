const eH = require('../middleware/errorHandler');
const { Sequelize } = require('../models');

const Favorite = require('../models/favorite').Model;

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
        
    } catch(err) {
        eH(res, err);
    }
}
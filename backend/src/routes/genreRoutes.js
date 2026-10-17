const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

router.get('/', genreController.getAll);
router.post('/', genreController.create);
router.put('/:id', genreController.update);
router.delete('/:id', genreController.delete);

module.exports = router;

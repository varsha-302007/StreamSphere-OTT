const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.get('/', ratingController.getAll);
router.post('/', ratingController.create);
router.put('/:id', ratingController.update);
router.delete('/:id', ratingController.delete);

module.exports = router;

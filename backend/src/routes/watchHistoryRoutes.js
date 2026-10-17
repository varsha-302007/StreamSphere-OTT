const express = require('express');
const router = express.Router();
const watchHistoryController = require('../controllers/watchHistoryController');

router.get('/', watchHistoryController.getAll);
router.post('/', watchHistoryController.create);
router.delete('/:id', watchHistoryController.delete);

module.exports = router;

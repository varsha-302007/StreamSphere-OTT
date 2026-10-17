const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

router.get('/', subscriptionController.getAll);
router.post('/', subscriptionController.create);
router.put('/:id', subscriptionController.update);
router.delete('/:id', subscriptionController.delete);

module.exports = router;

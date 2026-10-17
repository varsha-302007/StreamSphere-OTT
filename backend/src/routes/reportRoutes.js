const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/content-by-genre', reportController.getContentByGenre);
router.get('/subscribers-by-plan', reportController.getSubscribersByPlan);
router.get('/revenue-by-plan', reportController.getRevenueByPlan);
router.get('/top-content', reportController.getTopContent);
router.get('/average-ratings', reportController.getAverageRatings);

// View demonstrations
router.get('/view-performance', reportController.getViewPerformance);
router.get('/active-subscriptions-view', reportController.getActiveSubscriptionsView);

// Trigger demonstration endpoint
router.post('/demo-trigger', reportController.demoTrigger);

module.exports = router;

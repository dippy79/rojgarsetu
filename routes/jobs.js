const express = require('express');
const router = express.Router();
const { getJobs, getJobById } = require('../controllers/jobsController');

router.get('/', getJobs);    // GET /jobs?lang=...
router.get('/:id', getJobById);    // GET /jobs/:id?lang=...

module.exports = router;

const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobsController');

router.get('/', getJobs);    // GET /jobs?lang=...
router.get('/:id', getJobById);    // GET /jobs/:id?lang=...
router.post('/', createJob);    // POST /jobs
router.put('/:id', updateJob);    // PUT /jobs/:id
router.delete('/:id', deleteJob);    // DELETE /jobs/:id

module.exports = router;

const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, addCourse } = require('../controllers/coursesController');

router.get('/', getCourses);    // GET /courses?category=&duration=&eligibility=&lang=
router.get('/:id', getCourseById);    // GET /courses/:id?lang=
router.post('/', addCourse);    // POST /courses

module.exports = router;

const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, addCourse, updateCourse, deleteCourse } = require('../controllers/coursesController');

router.get('/', getCourses);    // GET /courses?category=&duration=&eligibility=&lang=
router.get('/:id', getCourseById);    // GET /courses/:id?lang=
router.post('/', addCourse);    // POST /courses
router.put('/:id', updateCourse);    // PUT /courses/:id
router.delete('/:id', deleteCourse);    // DELETE /courses/:id

module.exports = router;

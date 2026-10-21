import { getAllCourses, getCourseBySlug } from '../../models/catalog/courses.js';
import { getSectionsByCourseSlug } from '../../models/catalog/catalog.js';

// Show all courses
const catalogPage = async (req, res) => {
    const courses = await getAllCourses();

    res.render('catalog/list', {
        title: 'Course Catalog',
        courses: courses
    });
};

// Show one course and its sections
const courseDetailPage = async (req, res, next) => {
    const courseSlug = req.params.slugId;
    const course = await getCourseBySlug(courseSlug);

    if (Object.keys(course).length === 0) {
        const err = new Error(`Course ${courseSlug} not found`);
        err.status = 404;
        return next(err);
    }

    const sortBy = req.query.sort || 'time';
    const sections = await getSectionsByCourseSlug(courseSlug, sortBy);


    res.render('catalog/detail', {
        title: `${course.courseCode} - ${course.name}`,
        course: course,
        sections: sections,
        currentSort: sortBy
    });
};

export { catalogPage, courseDetailPage };
import {
  getFacultyBySlug,
  getSortedFaculty
} from '../../models/faculty/faculty.js';

const facultyListPage = async (req, res) => {
  const allowedSorts = ['name', 'department', 'title'];
  const sortBy = allowedSorts.includes(req.query.sort)
    ? req.query.sort
    : 'name';

  const faculty = await getSortedFaculty(sortBy);

  res.render('faculty/list', {
    title: 'Faculty Directory',
    faculty,
    currentSort: sortBy
  });
};

const facultyDetailPage = async (req, res, next) => {
  const facultySlug = req.params.facultyId;
  const facultyMember = await getFacultyBySlug(facultySlug);

  if (Object.keys(facultyMember).length === 0) {
    const err = new Error(`Faculty member ${facultySlug} not found`);
    err.status = 404;
    return next(err);
  }

  res.render('faculty/detail', {
    title: facultyMember.name,
    facultyMember
  });
};

export { facultyListPage, facultyDetailPage };
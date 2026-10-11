import {
  getFacultyById,
  getSortedFaculty
} from '../../models/faculty/faculty.js';

const facultyListPage = (req, res) => {
  const allowedSorts = ['name', 'department', 'title'];
  const sortBy = allowedSorts.includes(req.query.sort)
    ? req.query.sort
    : 'name';

  res.render('faculty/list', {
    title: 'Faculty Directory',
    faculty: getSortedFaculty(sortBy),
    currentSort: sortBy
  });
};

const facultyDetailPage = (req, res, next) => {
  const facultyId = req.params.facultyId;
  const facultyMember = getFacultyById(facultyId);

  if (!facultyMember) {
    const err = new Error(`Faculty member ${facultyId} not found`);
    err.status = 404;
    return next(err);
  }

  res.render('faculty/detail', {
    title: facultyMember.name,
    facultyMember
  });
};

export { facultyListPage, facultyDetailPage };
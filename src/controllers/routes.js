import { Router } from 'express';

import { addDemoHeaders } from '../middleware/demo/headers.js';

import {
  catalogPage,
  courseDetailPage
} from './catalog/catalog.js';

import {
  facultyListPage,
  facultyDetailPage
} from './faculty/faculty.js';

import {
  homePage,
  aboutPage,
  demoPage,
  testErrorPage
} from './index.js';

const router = Router();

router.get('/', homePage);
router.get('/about', aboutPage);

router.get('/catalog', catalogPage);
router.get('/catalog/:slugId', courseDetailPage);

router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

router.get('/demo', addDemoHeaders, demoPage);

router.get('/test-error', testErrorPage);

export default router;
//file to collect the packaged API routes.
const router = require('express').Router();

const apiRoutes = require('./api');
/*In the controllers folder, create a new file called home-routes.js.
This file will contain all of the user-facing routes, such as the homepage and login page.*/
const homeRoutes = require('./home-routes.js');

router.use('/', homeRoutes);

router.use('/api', apiRoutes);
/* Also, note that second use of router.use(). This is so if we make a request to any endpoint
that doesn't exist, we'll receive a 404 error indicating we have requested an incorrect resource,
another RESTful API practice.*/

router.use((req, res) => {
  res.status(404).end();
});

module.exports = router;
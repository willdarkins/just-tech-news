/* Remember how in user-routes.js we didn't use the word users in any routes?
That's because in this file we take those routes and implement them to another router instance,
prefixing them with the path /users at that time.*/

//At some point, we'll add more API endpoints and use this file to collect them and give them their prefixed name.

const router = require('express').Router();

const userRoutes = require('./user-routes');
const postRoutes = require('./post-routes');
const commentRoutes = require('./comment-routes');

router.use('/comments', commentRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

module.exports = router;
const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');

/*Previously, we used res.send() or res.sendFile() for the response.
Because we've hooked up a template engine, we can now use res.render()
and specify which template we want to use.*/

/*The res.render() method can accept a second argument, an object,
which includes all of the data you want to pass to your template.
In home-routes.js, update the homepage route to look like the following code:*/

router.get('/', (req, res) => {
  Post.findAll({
    attributes: [
      'id',
      'post_url',
      'title',
      'created_at',
      [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username']
        }
      },
      {
        model: User,
        attributes: ['username']
      }
    ]
  })
    .then(dbPostData => {
      // pass a single post object into the homepage template
      console.log(dbPostData[0]);
      /*This will loop over and map each Sequelize object into a
      serialized version of itself, saving the results in a new posts array.
      Now we can plug that array into the template.*/
      const posts = dbPostData.map(post => post.get({ plain: true }));
      res.render('homepage', { posts });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});
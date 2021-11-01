//include packages and models that we'll need to create the Express.js API endpoints.
const sequelize = require('../../config/connection');
const router = require('express').Router();
const { Post, User, Vote, Comment } = require("../../models");


// get all posts
router.get('/', (req, res) => {
    console.log('======================');
    Post.findAll({
        attributes: ['id', 'post_url', 'title', 'created_at', [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']],
        /*Notice that the order property is assigned a nested array that orders by the
        created_at column in descending order. This will ensure that the latest posted
        articles will appear first.*/
        order: [['created_at', 'DESC']], 
        //In the next step, we'll include the JOIN to the User table. We do this by adding the property include
        include: [
            // include the Comment model here:
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
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });

});

//get single post via id
router.get('/:id', (req, res) => {
    Post.findOne({
        //We used the where property to set the value of the id using req.params.id. 
        where: {
            id: req.params.id
        },
        attributes: ['id', 'post_url', 'title', 'created_at', [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']],
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
            if (!dbPostData) {
                res.status(404).json({ message: 'No post found with this id' });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

/*We will assign the values of the title, post_url,
and user_id to the properties in the req.body object that was in the request from the user.*/
router.post('/', (req, res) => {
    // expects {title: 'Taskmaster goes public!', post_url: 'https://taskmaster.com/press', user_id: 1}
    Post.create({
        //As we did previously in user-routes.js, we are using req.body to populate the columns in the post table.
        title: req.body.title,
        post_url: req.body.post_url,
        user_id: req.body.user_id
    })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

  //Up vote a post
  router.put('/upvote', (req, res) => {
    Vote.create({
        user_id: req.body.user_id,
        post_id: req.body.post_id
      }).then(() => {
        // then find the post we just voted on
        return Post.findOne({
          where: {
            id: req.body.post_id
          },
          attributes: [
            'id',
            'post_url',
            'title',
            'created_at',
            // use raw MySQL aggregate function query to get a count of how many votes the post has and return it under the name `vote_count`
            [
              sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'),
              'vote_count'
            ]
          ]
        })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
          console.log(err);
          res.status(400).json(err);
        });
    })
});

//Update a Post's Title
router.put('/:id', (req, res) => {
    Post.update(
        /*Notice that we used the request parameter to find the post, then used the req.body.title value to
        replace the title of the post. In the response, we sent back data that has been modified and stored
        in the database.*/
        {
            title: req.body.title
        },
        {
            where: {
                id: req.params.id
            }
        }
    )
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({ message: 'No post found with this id' });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

//Delete a Post
router.delete('/:id', (req, res) => {
    Post.destroy({
      where: {
        id: req.params.id
      }
    })
      .then(dbPostData => {
        if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
        }
        res.json(dbPostData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });



//In order to test this route, we need to expose the changes to the router by using the following Express.js command:
module.exports = router;
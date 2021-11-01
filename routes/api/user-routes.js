const router = require('express').Router();
const { User, Post, Vote } = require("../../models");

// GET /api/users
router.get('/', (req, res) => {
    // Access our User model and run .findAll() method)
    //The .findAll() method lets us query all of the users from the user table in the database
    /*Notice how we now pass an object into the method like we do with the .findOne() method. 
    This time, we've provided an attributes key and instructed the query to exclude the password column.*/
    //It's in an array because if we want to exclude more than one, we can just add more.
    User.findAll({
      // attributes: { exclude: ['password'] }
    })
      .then(dbUserData => res.json(dbUserData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

// GET /api/users/1
router.get('/:id', (req, res) => {
    //different from the .findAll() method in that we're indicating that we only want one piece of data back
    User.findOne({
      attributes: { exclude: ['password'] },
      where: {
        id: req.params.id
      },
      include: [
        {
          model: Post,
          attributes: ['id', 'title', 'post_url', 'created_at']
        },
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'created_at'],
          include: {
            model: Post,
            attributes: ['title']
          }
        },
        {
          model: Post,
          attributes: ['title'],
          through: Vote,
          as: 'voted_posts'
        }
      ]
    })
    /*Because we're looking for one user, there's the possibility that we could accidentally
    search for a user with a nonexistent id value. Therefore, if the .then() method returns nothing
    from the query, we send a 404 status back to the client to indicate everything's okay and they just
    asked for the wrong piece of data.*/
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

// POST /api/users
//Pass in key/value pairs where the keys are what we defined in the User model and the values are what we get from req.body
router.post('/', (req, res) => {
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}
    User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
      .then(dbUserData => res.json(dbUserData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

//there is a reason why a POST is the standard for the login that's in process....
/*A GET method carries the request parameter appended in the URL string, whereas
a POST method carries the request parameter in req.body, which makes it a more secure
way of transferring data from the client to the server.*/
router.post('/login', (req, res) => {
// expects {email: 'lernantino@gmail.com', password: 'password1234'}
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(dbUserData => {
    const validPassword = dbUserData.checkPassword(req.body.password);
    if (!validPassword) {
      res.status(400).json({ message: 'Incorrect password!' });
      return;
    }
    res.json({ user: dbUserData, message: 'You are now logged in!' });
    /*we sent the email and plaintext password in JSON to the application in the body of the request.
    We can see that an instance of the user was returned in the response. We now have access to the
    instance of this user, including its properties, such as the hashed password.*/

    //res.json({ user: dbUserData });

    // Verify user

  });  
});

// PUT /api/users/1
router.put('/:id', (req, res) => {
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}
    // if req.body has exact key/value pairs to match the model, you can just use `req.body` instead
    /*We pass in req.body to provide the new data we want to use in the update and req.params.id
    to indicate where exactly we want that new data to be used.*/
    User.update(req.body, {
      individualHooks: true,
      where: {
        id: req.params.id
      }
    })
      .then(dbUserData => {
        if (!dbUserData[0]) {
          res.status(404).json({ message: 'No user found with this id' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

// DELETE /api/users/1
/*To delete data, use the .destroy() method
and provide some type of identifier to indicate
where exactly we would like to delete data from
the user database table (in this case the id) */
router.delete('/:id', (req, res) => {
    User.destroy({
      where: {
        id: req.params.id
      }
    })
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

module.exports = router;
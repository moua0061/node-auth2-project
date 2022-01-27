const router = require("express").Router();
const bcrypt = require('bcryptjs');
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { BCRYPT_ROUNDS } = require("../secrets"); // use this secret!
const makeToken = require('./auth-token-builder');
const User = require('../users/users-model')

router.post("/register", validateRoleName, (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */

    //bcrypting the password before saving it to the db
  let { username, password } = req.body
  let { role_name } = req
  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS)
    // console.log(req.body)
    // console.log(req);
  //never save plain text pw in the db
  //pw is now saved in db as bcrypted

  User.add({username, password: hash, role_name})
    .then(newUser => {
      // console.log(newUser);
      res.json(newUser)
    })
    .catch(next)
  
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
//   const { password } = req.body
// if(bcrypt.compareSync(password, req.user.password)){
//   const token = makeToken(req.user)
//   res.json({
//     message: `${req.user.username} is back!`,
//     token,
//   })
// } else {
//   next({
//     status: 401,
//     message: 'Invalid credentials'
//   })
// }

const { password } = req.body
    if (bcrypt.compareSync(password, req.user.password)) {
          const token = makeToken(req.user)
          res.json({
            status: 201,
            message: `${req.user.username} is back!`,
            token
          })
        } else {
          next({
            status: 401,
            message: 'Invalid credentials'
          })
        }
});


module.exports = router;

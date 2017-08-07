const
  express = require('express'),
  app = express()
  yelp = require('yelp-fusion'),
  dotenv = require('dotenv').load(),
  mongoose = require('mongoose'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  jwt = require('jsonwebtoken'),
  cors = require('cors'),
  PORT = process.env.PORT || 3000,
  token = process.env.TOKEN,
  client = yelp.client(token),
  User = require('./models/User')


//=============Connect to Mongo======
const mongoUrl = (process.env.MONGO_URL || 'mongodb://localhost/tenderDB')
mongoose.connect(mongoUrl, (err) => {
  console.log(err || 'connected to MongoDB');
});


// ==========Setup Middleware
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());


// =================API===============
  client.search({
    term :'restaurants',
    location: 'los angeles, ca'
  }).then(response => {
    // console.log(response.jsonBody)
  }).catch(e => {
    // console.log(e)
  });
  // client.business('electric-owl-los-angeles').then(response => {
  //   console.log(response.jsonBody.photos);
  // }).catch(e => {
  //   console.log(e);
  // });

  //  ==========ROUTES========


  app.get('/', (req,res) =>{
    res.json({message: 'heellllllo'})
  });

  //routes for all users
  app.route('/users')
    .get((req, res) =>{
      User.find({}, (err, users) =>{
        res.json(users)
      })
    })
    .post((req, res) => {
      User.create(req.body, (err, user) =>{
        res.json({message: "GREAT SUCCESS", user})
      })
    })

//  individual user ROUTES
app.route('/users/:id')
  .get((req,res) => {
    User.findById(req.params.id, (err, foundUser) => {
      res.json(foundUser)
    })
  })
  .patch((req, res) => {
    User.findById(req.params.id, (err, updatedUser) => {
      Object.assign(updatedUser, req.body)
      updatedUser.save((err, updatedUser) => {
        res.json({message: "User updated, so great.", user: updatedUser})
      })
    })
  })

  // =====login routes
  app.post('/authenticate', (req, res) => {
    User.findOne({email: req.body.email}, '+password', (err, user) => {
      if(!user || (user && !user.validPassword(req.body.password))){
      return res.json({success: false, message: "incorrect email or password entry."})
    }
    const userData = user.toObject()
    delete userData.password
    const token = jwt.sign(userData, process.env.SECRET)
    res.json({success: true, message: "Logged in successfully, great success!", token})
    })
  })




app.listen(PORT, () => {
  console.log(`server is litening on port ${PORT}`)
})

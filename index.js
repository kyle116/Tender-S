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
  PORT = process.env.PORT || 3001,
  token = process.env.TOKEN,
  client = yelp.client(token),
  User = require('./models/User'),
  Business = require('./models/Business')

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
  // const businessId
  app.get('/yelp', (req, res) => {
    client.search({
      term :'restaurants',
      location: 'los angeles, ca'
    }).then(response => {
      client.business(response.jsonBody.businesses[Math.floor((Math.random() * (response.jsonBody.businesses.length -1)))].id).then(resp => {
        res.json(resp.jsonBody)
        console.log(resp.jsonBody)
      }).catch(e => {
        console.log(e);
      });
    }).catch(e => {
      console.log(e)
    })
});
  // setTimeout({console.log(businessId)}, 4000)
app.post('/matches', (req, res) => {
  Business.create(req.body, (err, business) => {
    res.json({success: true, message: "BUSINESS SUCCESS", business})
  })
})


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
        res.json({success: true, message: "GREAT SUCCESS", user})
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
        res.json({success: true, message: "User updated, so great.", user: updatedUser})
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

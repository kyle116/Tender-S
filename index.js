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

app.use(verifyToken)
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
app.route('/:user_id/matches')
  .post((req, res) => {
    User.findById(req.params.user_id, (err, user)=>{
      Business.create(req.body, (err, business) => {
        console.log('SAVED');
        user.businesses.push(business)
        user.save((err, user)=>{
          res.json({success: true, message: "BUSINESS SUCCESS", business})
        })
      })
    })
  })
  .get((req, res) => {
    User.findById(req.params.user_id).populate("businesses").exec((err, user) => {
      res.json(user)
    })
  })


  // app.post('/:user_id/hates', (req, res) => {
  //   User.findById(req.params.user_id, (err, user)=>{
  //     Business.create(req.body, (err, business) => {
  //       console.log('SAVED');
  //       user.hates.push(business)
  //       user.save((err, user)=>{
  //         res.json({success: true, message: "BUSINESS SUCCESS", business})
  //       })
  //     })
  //   })
  //
  // })
  app.delete('/:user_id/:business_id/delete', (req, res) => {
    Business.findById(req.params.business_id, (err, business) => {
      User.findById(req.params.user_id).populate("businesses").exec((err, user) => {
        // console.log(user.businesses[0].yelpID.toString());
        // console.log(business.yelpID.toString());
        for(i = 0; i < user.businesses.length; i++) {
          if (user.businesses[i].yelpID.toString() === business.yelpID.toString()) {
          user.businesses.splice(i, 1);
          console.log('in the for loop');
          break;       //<-- Uncomment  if only the first term has to be removed
          }
        }
        user.save()
        res.json(user)
      })


    })
  })

function verifyToken(req, res, next) {
  const token = req.headers['token']

  if(token) {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if(err) return res.json({success: false, message: "Token could not be verified."})

    req.user = decoded
    next()
    })
  } else {
    res.json({success: false, message: "No token provided. Access denied."})
  }
}

app.listen(PORT, () => {
  console.log(`server is litening on port ${PORT}`)
})

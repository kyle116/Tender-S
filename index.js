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

  //
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




app.listen(PORT, () => {
  console.log(`server is litening on port ${PORT}`)
})

const
  express = require('express'),
  app = express()
  yelp = require('yelp-fusion'),
  dotenv = require('dotenv').load()
  PORT = 3000,
  token = process.env.TOKEN



app.listen(PORT, () => {
  console.log(`server is litening on port ${PORT}`)
})

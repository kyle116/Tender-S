const
  mongoose = require('mongoose'),
  businessSchema = new mongoose.Schema({
    yelpID: {type: String, required: true},
    name: {type: String, required: true},
    address: String,
    city: String,
    state: String,
    zip_code: String,
    rating: Number,
    url: String,
    images: [],
  })

module.exports = mongoose.model('Business', businessSchema)

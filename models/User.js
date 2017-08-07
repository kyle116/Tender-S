const
  moongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),

  userSchema = new mongoose.Schema({
    name: String,
    email:String,
    password: {type: String, select: false}
    // select: false used to prevent PW from
  });

  // hash the PW and encrypt it
  userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
  }

  // compare stored PW to currentPW
  userSchema.methods.validPassword = function(password){
    if(!password) return false
    return bcrypt.compareSync(password, this.password)
  }

  // encrypt PW before saving PW
  userSchema.pre('save', function(next){
    if(!this.isModified('password')) return next()
    this.password = this.generateHash(this.password)
    next()
  });

  module.exports = mongoose.model('User', userSchema)

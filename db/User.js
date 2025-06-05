const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { Schema } = mongoose;
const { BRYPT_SALT } = require('../scripts/constants');

const MANDATORY_FIELDS =  'Mandatory fields';

const userSchema = new Schema({
   lastName: {
      type: String,
      required: [true, MANDATORY_FIELDS ],
      minLength: [2, 'Too short'],
      maxLength: [20, 'Too long']
   },
   firstName: {
      type: String,
      required: [true, MANDATORY_FIELDS ],
      minLength: [2, 'Too short'],
      maxLength: [20, 'Too long']
   },
   phone: {
      type: String,
      validate: {
         validator: function (v) {
            return /\d{3}/.test(v);
            // return /\d{3}-\d{3}-\d{4}/.test(v);
         },
         message: props => `${props.value} is not a valid phone number!`
      },
      required: [false, 'User phone number required']
   },
   email: {
      type: String,
      required: [true, MANDATORY_FIELDS],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Wrong Email']
   },
   password: {
      type: String,
      required: [true, MANDATORY_FIELDS]
   },
   rememberme: {
      type: Boolean,
      default: false
   }
});

userSchema.statics.login = async function(email, password) {
   const user = await this.findOne({ email });
   if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
         return user;
      }
      throw Error('incorrect password');
   }
   throw Error('incorrect email');
}

userSchema.pre('save', async function (next) {
   if (this.password) {
      let result = await bcrypt.hash(this.password, BRYPT_SALT);
      this.password = result;
   }

   next();
});

const User = mongoose.model('User', userSchema);

module.exports = User
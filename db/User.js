const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const saltRounds = 10;


const userSchema = new Schema({
   email: String,
   password: String
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
      let result = await bcrypt.hash(this.password, saltRounds);
      this.password = result;
   }

   next();
});

//Compiling our schema into a Model.
const User = mongoose.model('User', userSchema);

module.exports = User
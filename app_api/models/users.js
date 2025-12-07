const mongoose = require('mongoose'); 
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({ 
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  hash: String, // 암호화된 비밀번호 (Hash)
  salt: String // Hash 생성에 사용된 무작위 문자열 (Salt)
});


//2023810100 이지민
//crypto
userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

userSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.hash === hash;
};


//2023810100 이지민
//JWT
userSchema.methods.generateJwt = function () {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // 토큰 만료 기간을 7일 후로 설정

  // jwt.sign() 메소드를 사용하여 토큰 생성
  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000, 10),
  }, 'thisIsSecret');
};

mongoose.model('User', userSchema);
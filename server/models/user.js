let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;
let bcrypt = require('bcryptjs');
const SALT_FACTOR = 10;
import { models } from '../config/constants'

let schema = new Schema({
    username: { type: String, required: true, unique: true, uniqueCaseInsensitive: true },
    password: { type: String, required: true },
    bio: { type: String, default: 'Tell us about yourself!' },
    steamId: { type: String },
    games: { type: Array },
    avatar: { type: String },
    invites: [{ type: Schema.Types.Mixed }],
    // Relations
    friends: [{ type: ObjectId, ref: models.user.name }],
    chats: [{ type: ObjectId, ref: models.chat.name }],
    groups: [{ type: ObjectId, ref: models.group.name }],
    blocked: [{ type: ObjectId, ref: models.user.name }],
})

schema.plugin(uniqueValidator);

schema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')){
        return next();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt){
        if(err){
            return next(err);
        } else {
            bcrypt.hash(user.password, salt, function(err, hash){
                user.password = hash;
                next();
            });
        }
    });
});

schema.methods.validatePassword = function(password){
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, this.password, function(err, isMatch){
            if(err || !isMatch){
                return reject(err);
            }
            return resolve(isMatch);
        });
    })
}

module.exports = mongoose.model(models.user.name, schema)
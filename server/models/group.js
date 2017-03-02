let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;
let bcrypt = require('bcryptjs');
const SALT_FACTOR = 10;
import { models } from '../config/constants'

let schema = new Schema({
    groupTitle: { type: String, required: true },
    description: {type: String},
    game: { type: String },
    // Relations
    players: [{ type: ObjectId, ref:models.user }]
    
})
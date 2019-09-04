const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let orderSchema = new Schema({
    username: String,
    user_id: Number,
    previous_order_time: String,
    next_order_time: String,
    total_followers: Number,
    followers_sent: Number,
    done: Boolean
});



const Order = mongoose.model('order', orderSchema);

module.exports = Order

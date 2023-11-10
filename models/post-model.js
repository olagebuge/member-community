const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    cover:{
        type:String,
        default: '../defaultimg/no-cover.jpg',
    },
    category:{
        type:String,
    },
    tag:{
        type:[]
    },
    content:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    author:String,
    community:{
        type: mongoose.Schema.Types.ObjectId, //引用某個model的ID
        ref:"Community", // 引用 Community-model
        default: null,
        
    }
});

module.exports = mongoose.model("Post", postSchema);
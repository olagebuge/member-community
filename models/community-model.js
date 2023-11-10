const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, //社區名稱
  },
  address: {
    type: String, //社區地址
  },
  builder: { //建商名稱跟官網連結
    name: String,
    link: String
  },
  consyear: {
    type: String, //建造年分
  },
  photos: {
    type: [], //社區(公設)照片
  },
});
module.exports = mongoose.model("Community", communitySchema);

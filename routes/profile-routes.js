const router = require("express").Router();
const Post = require("../models/post-model");
const Community = require("../models/community-model");

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    //若有經過passport.serializeUser req.isAuthenticated()會被設定為true
    next();
  } else {
    return res.redirect("/auth/login");
  }
};

router.get("/", authCheck, async (req, res) => {
  //因為這頁要顯示post的內容
  let postFound = await Post.find({ author: req.user._id }).populate('community').exec(); //populate('community')是為了把community的資料也一起顯示  
  return res.render("profile", { user: req.user, posts: postFound }); //req.user來自passport.js的deserializeUser()
});

router.get("/post", authCheck, async(req, res) => {
  let communityFound = await Community.find({});
  return res.render("post", { user: req.user , community: communityFound });
});

router.get("/community", authCheck, async(req, res) => {
  let communityFound = await Community.find({});
  return res.render("community", { user: req.user, community: communityFound });
});

router.post("/community", authCheck, async (req, res) => {
  let { title, address, builder, consyear, photos } = req.body;
  let newCommunity = new Community({ title, address, builder, consyear, photos });
  try {
    await newCommunity.save();
    return res.redirect("/profile/community");
  } catch (e) {
    req.flash("error_msg", "請至少填寫社區名稱");
    return res.redirect("/profile/community");
  }
});

router.post("/post", authCheck, async (req, res) => {
  let { title, community, content } = req.body;
  let newPost = new Post({ title, content, community, author: req.user._id });
  try {
    await newPost.save();
    return res.redirect("/profile");
  } catch (e) {
    req.flash("error_msg", "標題與內容都需要填寫");
    return res.redirect("/profile/post");
  }
});

module.exports = router;

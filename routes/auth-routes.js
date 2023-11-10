const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login", async (req, res) => {
  return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    //req.logOut也是passport內建的
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], //profile是拿到所有個人資料
    prompt: "select_account",
  }) //可以選擇google帳號
);

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    req.flash("error_msg", "密碼長度過短，至少需要8個數字或英文字母");
    return res.redirect("/auth/signup");
  }
  //確認信箱是否被註冊過
  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "此信箱已經被註冊，請使用另一個信箱，或者嘗試使用此信箱登入系統"
    );
    return res.redirect("/auth/signup");
  }
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  req.flash("success_msg", "註冊成功! 現在可以登入系統了");
  return res.redirect("/auth/login");
});

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "登入失敗．帳號或密碼不正確。", //這個值會被自動套入index.js的res.locals.error= req.flash("error");
  }),
  //登入成功的話
    (req, res) => {
      return res.redirect("/profile");
    }
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  return res.redirect("/profile");
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

module.exports = router;

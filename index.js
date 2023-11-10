const dotenv = require("dotenv");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const methodOverride = require("method-override");
const authRoutes = require("./routes/auth-routes");
const profileRoutes =require("./routes/profile-routes");
require("./config/passport");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");



const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/test")
  .then(() => {
    console.log("成功連結mongoDB...");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(cors());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//告訴後端public是靜態的根目錄
app.use(express.static(path.join(__dirname, "public")));
// 讓瀏覽器有post及get以外的方法
app.use(methodOverride('_method'));

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    //是否在https的協議下進行傳輸 localhost下沒有https
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next)=>{
  res.locals.success_msg = req.flash("success_msg");//locals是res的一個內建屬性 他可以把資料傳到views的ejs模板中
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error= req.flash("error");
  next();
})

//設定routes
app.use("/auth",authRoutes);
app.use("/profile",profileRoutes);


app.get("/",(req,res)=>{
  return res.render("index",{user: req.user});
})

// app.use((err,req,res ,next)=>{  
//   return res.status(400).render("error");
// })


app.listen(8080, () => console.log("伺服器正在聆聽port8080..."));

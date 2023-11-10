const router = require("express").Router();
const Owner = require("../models/owner-model");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 12;

router.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    //是否在https的協議下進行傳輸 localhost下沒有https
    cookie: { secure: false },
  })
);

router.use(passport.initialize());
router.use(passport.session());

const verifyUser = (req, res, next) => {
  if (req.session.isverified) {
    next();
  } else {
    return res.send("請先登入帳號");
  }
};

router.get("/", async (req, res, next) => {
  try {
    let ownerData = await Owner.find({}).exec();
    return res.render("owners", { ownerData, isverified: req.session.isverified  });
  } catch (e) {
    next(e);
  }
});

router.get("/new", async (req, res) => {
  return res.render("new-owner");
});

router.get("/login", async (req, res) => {
  return res.render("owner-login");
});

router.get("/google",passport.authenticate('google',{
    scope: ['profile','email'],//profile是拿到所有個人資料
    prompt:"select_account"})//可以選擇google帳號
);

router.get("/google/redirect",passport.authenticate("google"),(req,res)=>{
  return res.redirect("/profile");
})

//登入驗證測試，位置不能放在id路由下面
router.get("/logintest", verifyUser, (req, res) => {
  return res.send("登入驗證測試成功");
});

router.get("/:_id", async (req, res, next) => {
  let { _id } = req.params;
  try {
    let foundOwner = await Owner.findOne({ _id }).exec();
    if (foundOwner != null) {
      return res.render("owner-page", { foundOwner });
    } else {
      return res.status(400).render("owner-notfound");
    }
  } catch (e) {
    next(e);
  }
});

router.get("/:_id/edit", async (req, res, next) => {
  let { _id } = req.params;
  try {
    let foundOwner = await Owner.findOne({ _id }).exec();
    if (foundOwner != null) {
      return res.render("edit-owner", { foundOwner });
    } else {
      return res.status(400).render("owner-notfound");
    }
  } catch (e) {
    next(e);
  }
});

router.get("/:_id/delete", async (req, res) => {
  let { _id } = req.params;
  try {
    let foundOwner = await Owner.findOne({ _id }).exec();
    if (foundOwner != null) {
      return res.render("delete-owner", { foundOwner });
    } else {
      return res.status(400).render("owner-notfound");
    }
  } catch (e) {
    return res.status(400).render("owner-notfound");
  }
});

router.post("/", async (req, res) => {
  try {
    let { username, account, password } = req.body;
    let hashValue = await bcrypt.hash(password, saltRounds);
    let newOwner = new Owner({
      username,
      account,
      password: hashValue,
    });
    let savedOwner = await newOwner.save();
    return res.send({ message: "成功加入會員~", savedOwner }); //要用next就不用ejs渲染了
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.post("/login", async (req, res) => {
  try {
    let { account, password } = req.body;
    let foundOwner = await Owner.findOne({ account }).exec();
    if (!foundOwner) {
      return res.send("信箱錯誤，查無使用者。請前註冊或使用google登入");
    } else {
      let result = await bcrypt.compare(password, foundOwner.password);
      if (result) {
        req.session.isverified = true;
        console.log(req.session);
        return res.send("成功登入!");
      } else {
        return res.status(400).send("密碼錯誤!");
      }
    }
  } catch (e) {
    next(e);
  }
});

router.post("/logout", (req, res) => {
  req.session.isverified = false;
  return res.send("已經成功登出!");
});

router.put("/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let { username, account, password } = req.body;
    let newData = await Owner.findOneAndUpdate(
      { _id },
      //根據id去找尋
      { username, account, password },
      //根據上述屬性進行修改
      {
        new: true,
        runValidators: true,
        overwrite: true,
        //HTTP put request要求客戶端提供"所有"數據
        //我們需要根據客戶端提供的數據來更新資料庫內的資料
      }
    );
    return res.render("owner-update-success", { newData });
  } catch (e) {
    return res.status(400).send(e.message);
  }
});

//處理Patch request變更項目數量的不確定性
class NewData {
  constructor() {}
  setProperty(key, value) {
    if (key === "username" || key === "account" || key === "password") {
      this[key] = value;
    } else {
      this[`works.${key}`] = value;
    }
  }
}

router.patch("/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let newObject = new NewData();
    for (let property in req.body) {
      newObject.setProperty(property, req.body[property]);
    }

    let newData = await Owner.findOneAndUpdate({ _id }, newObject, {
      new: true,
      runValidators: true,
      //不能寫overwtite,會把整個物件複寫
    });

    return res.render("owner-update-success", { newData });
  } catch (e) {
    return res.status(400).send(e.message);
  }
});

router.delete("/:_id/", async (req, res) => {
  try {
    let { _id } = req.params;
    let deleteResult = await Owner.deleteOne({ _id });
    return res.redirect("/owner");
  } catch (error) {
    return res.status(500).send("無法刪除此商家");
  }
});

module.exports = router;

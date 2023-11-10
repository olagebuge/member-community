const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

//user這參數會自動帶入下方done()的第二個值  
//有可能是foundUser也有可能是savedUser
passport.serializeUser((user,done)=>{
    console.log("serialize使用者...");
    done(null, user._id);//將mongoDB的ID存在session 並將id簽名用cookie寄給使用者
})

passport.deserializeUser(async(_id, done)=>{
    console.log("deserialize使用者...使用serialize儲存的id去找到資料");
    let foundUser = await User.findOne({_id});
    done(null, foundUser);//將req.user這個屬性設定為foundUser
})


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入google Strategy的區域");      
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if(foundUser){
        console.log("使用者已經註冊過了,無須存入資料庫內");
        done(null, foundUser);
      }else{
        console.log("偵測到新用戶,需要存入資料庫")
        let newUser = new User({
            name:profile.displayName,
            googleID:profile.id,
            thumbnail:profile.photos[0].value,
            email:profile.emails[0].value,            
        });
        let savedUser =await newUser.save();
        console.log("成功創建新用戶");
        done(null, savedUser);
      }
    }
  )
);


passport.use(new LocalStrategy(
  async(username, password, done)=>{
    let foundUser = await User.findOne({email:username});
    if(foundUser){
      let result = await bcrypt.compare(password, foundUser.password);
      if(result){//如果找到user而且密碼也正確
        done(null,foundUser);//他會在自動執行最上方序列化使用者
      }else{
        done(null,false);
      }      
    }else{
      done(null,false);//第二個值為false代表沒有驗證成功
    }
    
  }
))
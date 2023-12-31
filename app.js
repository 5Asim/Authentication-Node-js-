//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const md5 = require("md5");
// const encrypt = require("mongoose-encryption")

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded(
    {
        extended:true
    }
));

app.use(session({
    secret: "Our little Secret",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/UserDB");

const UserSchema = new mongoose.Schema(
{
    email:String,
    password:String,
});
UserSchema.plugin(passportLocalMongoose);

// UserSchema.plugin(encrypt, { secret:process.env.SECRET, encryptedFields:["password"]});

const User = new mongoose.model("User",UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res)
{
    res.render("home");
})

app.get("/login",function(req,res)
{
    res.render("login");
})

app.get("/register",function(req,res)
{
    res.render("register");
})
 

app.get("/secrets",function(req,res)
{
    if(req.isAuthenticated())
    {
        res.render("secrets");

    }
    else{
        res.redirect("/login");
    }
})

app.post("/register",function(req,res)
{
    User.register({username:req.body.username}, req.body.password, function(err,user)
    {
        if(err)
        {
            console.log(err);
            res.redirect("/register");
        }
        else
        {
            passport.authenticate("local")(req,res,function()
            {
                res.redirect("secrets");
            })
        }
    });
//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) 
//     {
//         const newUser = new User(
//         {
//             email:req.body.username,
//             password:hash,
//         }
//     );
//     newUser.save().then(function()
//     {
//         res.render("secrets");
//     }).catch(function(err)
//     {
//         res.send(err);
//     });
// });

});

app.post("/login",function(req,res)
{
    const user = new User({
        username:req.body.username,
        password:req.body.password,
    })
    req.login(user,function(err)
    {
        if(err)
        {
            console.log(err)
        }
        else{
            passport.authenticate("local")(req,res,function()
            {
                res.redirect("secrets");
            })
        }
    })
    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({email:username}).then(function(foundUser)
    // {
    //     if(foundUser)
    //     {
    //         bcrypt.compare(password, foundUser.password, function(err, result) {
    //             if(result===true)
    //             {
    //                 res.render("secrets");
    //             }
    //         });
            
    //     }
    // }).catch(function(err)
    // {
    //     res.send(err);
    // })
})
app.get("/logout",function(req,res)
{
    req.logout(function(err)
    {
        console.log(err); 
    });
    res.redirect("/");
})



 


app.listen(3000,function()
{
    console.log("Server started on port 3000");
})

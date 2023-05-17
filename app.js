const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const md5 = require("md5");

const d = new Date();
let year = d.getFullYear();
let hour = d.getHours();
let date = d.toDateString();
let time = d.toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true });

let waterQulityFlag = false;
let authenticated = false;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/kswtpDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema ({
  username: String,
  password: String
});

const energyParameterSchema = new mongoose.Schema({
  year:Number,
  month:String,

  entryDate: String,
  entryTime: String,

  siteName : String,
  accountNo:Number,
  category : String,

  kVA:Number,
  kWhPeak:Number,
  kWhOffPeak:Number,
  kWhDay:Number,
  TotalKwh: Number,
  totalCharge:Number,
  production:Number
});

const waterQulityParameterSchema = new mongoose.Schema({
  dateStamp: String,
  timeStamp: String,

  conductivity:Number,
  pH:Number,

  turbidityRW:Number,
  turbidityPO:Number,
  turbidityCWS:Number,
  rcl:Number
});

const jarTestSchema = new mongoose.Schema({
  dateStamp: String,
  timeStamp: String,

  turbidityRW:Number,
  phRW:Number,
  conductivityRW:Number,

  turbidityB1:Number,
  pacB1:Number,
  turbidityB2:Number,
  pacB2:Number,
  turbidityB3:Number,
  pacB3:Number,
  turbidityB4:Number,
  pacB4:Number,
  turbidityB5:Number,
  pacB5:Number,

  turbiditySel:Number,
  pacSel:Number
});

const Energy = mongoose.model("Energy", energyParameterSchema);
const WaterQulity = mongoose.model("WaterQulity", waterQulityParameterSchema);
const JarTest = mongoose.model("JarTest", jarTestSchema);
const User = mongoose.model("User", userSchema);


  app.get("/", function(req, res){
    res.render("home");
  });

  app.get("/login", function(req, res){
    res.render("login");
  });

  app.get("/register", function(req, res){
    res.render("register");
  });

  app.get("/qulity", function(req, res){
    if(authenticated === true){
    res.render("qulity", {currentYear: year, currentDate: date, currentHour: hour});
  } else {
    res.redirect("/");
  }
  });

  app.get("/jar", function(req, res){
    if(authenticated === true){
    res.render("jar", {currentYear: year, currentDate: date});
  } else {
    res.redirect("/");
  }
  });

  app.post("/register", function(req, res){
    const newUser =  new User({
      username: req.body.username,
      password: md5(req.body.password)
    });
    newUser.save(function(err){
      if (err) {
        console.log(err);
      } else {
            authenticated = true;
            res.render("body", {currentYear: year});
      }
    });
  });

  app.post("/login", function(req, res){
    const username = req.body.username;
    const password = md5(req.body.password);

    User.findOne({username: username}, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            authenticated = true;
            res.render("body", {currentYear: year});
          }
        } else{
          res.redirect("/");
        }
      }
    });
  });

  app.post("/body", function(req, res){

  const siteName = req.body.site;
  let accNo = 0;

  switch (siteName){
    case "CSWTP":
     accNo = 1770100989;
    break;

    case "Madarangoda":
     accNo = 1770101020;
    break;

    case "Maligathanna":
    accNo = 1711040703;
    break;

    case "Kandakaduwa":
     accNo = 1770101012;
    break;

    case "Kehelwala":
     accNo = 1710340207;
    break;

    case "Mahakanda":
     accNo = 1711040800;
    break;

    case "MobrayI":
     accNo = 1710340304;
    break;

    case "Augustawatta":
     accNo = 7770101360;
    break;

    case "Daulagala":
     accNo = 1713114801;
    break;

    default:
    console.log("Invalid account!");

  }

  if(siteName === "Maligathanna"||siteName === "Kehelwala"||siteName === "Mahakanda"||siteName === "MobrayI"||siteName === "Daulagala"){

    const newEnergy = new Energy({
      year : Number(req.body.year),
      month:req.body.month,
      entryDate: date,
      entryTime: time,
      siteName:req.body.site,
      accountNo:accNo,
      category : "I-1",
      kVA:0,
      kWhPeak:0,
      kWhOffPeak:0,
      kWhDay:Number(req.body.kWhDay),
      TotalKwh: Number(req.body.kWhDay),
      totalCharge:Number(req.body.totalCost),
      production:0
    });

    newEnergy.save(function(err){
      if(!err){
        console.log("Successfully entered I1 to the database!");
      } else {
        console.log(err);
      }
    });
      res.redirect("/body");

  } else if(siteName === "CSWTP"){

  const kwhP =  Number(req.body.kWhPeak);
  const kwhOP = Number(req.body.kWhOffPeak);
  const kwhD = Number(req.body.kWhDay);
  const kwhSum = kwhP+kwhOP+kwhD;

  const newEnergy = new Energy({
    year : Number(req.body.year),
    month:req.body.month,
    entryDate: date,
    entryTime: time,
    siteName:req.body.site,
    accountNo:accNo,
    category : "I-3",
    kVA:Number(req.body.kvaData),
    kWhPeak:Number(req.body.kWhPeak),
    kWhOffPeak:Number(req.body.kWhOffPeak),
    kWhDay:Number(req.body.kWhDay),
    TotalKwh: kwhSum,
    totalCharge:Number(req.body.totalCost),
    production:Number(req.body.production)
  });

  newEnergy.save(function(err){
    if(!err){
      console.log("Successfully entered I3 to the database!");
    } else {
      console.log(err);
    }
  });
    res.redirect("/body");

  } else{

    const kwhP =  Number(req.body.kWhPeak);
    const kwhOP = Number(req.body.kWhOffPeak);
    const kwhD = Number(req.body.kWhDay);
    const kwhSum = kwhP+kwhOP+kwhD;

    const newEnergy = new Energy({
      year : Number(req.body.year),
      month:req.body.month,
      entryDate: date,
      entryTime: time,
      siteName:req.body.site,
      accountNo:accNo,
      category : "I-2",
      kVA:Number(req.body.kvaData),
      kWhPeak:Number(req.body.kWhPeak),
      kWhOffPeak:Number(req.body.kWhOffPeak),
      kWhDay:Number(req.body.kWhDay),
      TotalKwh: kwhSum,
      totalCharge:Number(req.body.totalCost),
      production:0
    });

    newEnergy.save(function(err){
      if(!err){
        console.log("Successfully entered I2 to the database!");
      } else {
        console.log(err);
      }
    });
      res.redirect("/body");

  }

  });

  app.post("/qulity", function(req, res){

  if(waterQulityFlag === false && hour > 6 && hour < 9){
    const newWaterQulity = new WaterQulity({
      dateStamp: date,
      timeStamp: time,
      conductivity:Number(req.body.conductivity),
      pH:Number(req.body.pH),
      turbidityRW:Number(req.body.turbidityRW),
      turbidityPO:Number(req.body.turbidityPO),
      turbidityCWS:Number(req.body.turbidityCWS),
      rcl:Number(req.body.rcl)
    });
    newWaterQulity.save(function(err){
      if(!err){
        console.log("Successfully entered Water qulity with cond. & pH to the database!");
      } else {
        console.log(err);
      }
    });
    waterQulityFlag = true;
    res.redirect("/qulity");
  } else {
    const newWaterQulity = new WaterQulity({
      dateStamp: date,
      timeStamp: time,
      conductivity:0,
      pH:0,
      turbidityRW:Number(req.body.turbidityRW),
      turbidityPO:Number(req.body.turbidityPO),
      turbidityCWS:Number(req.body.turbidityCWS),
      rcl:Number(req.body.rcl)
    });

    newWaterQulity.save(function(err){
      if(!err){
        console.log("Successfully entered Water qulity without cond. & pH to the database!");
      } else {
        console.log(err);
      }
    });

    if( hour > 6 ){
      waterQulityFlag = false;
    }
      res.redirect("/qulity");
  }
  });

  app.post("/jar", function(req, res){

    const newJarTest = new JarTest({
      dateStamp: date,
      timeStamp: time,

      turbidityRW:Number(req.body.turbidityJRW),
      phRW:Number(req.body.pHJData),
      conductivityRW:Number(req.body.conductivityJ),

      turbidityB1:Number(req.body.turbidityB1),
      pacB1:Number(req.body.pacB1),
      turbidityB2:Number(req.body.turbidityB2),
      pacB2:Number(req.body.pacB2),
      turbidityB3:Number(req.body.turbidityB3),
      pacB3:Number(req.body.pacB3),
      turbidityB4:Number(req.body.turbidityB4),
      pacB4:Number(req.body.pacB4),
      turbidityB5:Number(req.body.turbidityB5),
      pacB5:Number(req.body.pacB5),

      turbiditySel:Number(req.body.turbiditySel),
      pacSel:Number(req.body.pacSel)
    });

    newJarTest.save(function(err){
      if(!err){
        console.log("Successfully entered the JAR test data to the database!");
      } else {
        console.log(err);
      }
    });

      res.redirect("/jar");
  });


  app.listen(3000, function() {
    console.log("Server started on port 3000...");
  });

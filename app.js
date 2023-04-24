const express= require("express");
const app=express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const session = require("express-session");
const path=require("path");
// const cookieParser = require('cookie-parser');
// require("./db");


mongoose.connect("mongodb://127.0.0.1:27017/userDB")
.then(() => {
    console.log("Sucessfully connected");
}).catch((err) => {
    console.log(err)
});
const userSchema=new mongoose.Schema({
    name: String,
    gender:String,
    email: String,
    password:String,
    room:Number
})
const User=new mongoose.model("User",userSchema);

const roomSchema =new mongoose.Schema({
    rooma : Number,
    booked: String,
    bookedby: userSchema
})
const Room=mongoose.model("Room",roomSchema);



app.use(express.static("public"));
app.set("view engine", "ejs");
app.set(bodyParser.json());
// app.use(cookieParser());
// app.use(express.cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.set('views',path.join(__dirname,"views"));
// app.use(session({
//     secret: 'keyboardat',
//     resave: false,
//     saveUninitialized: false
// }))
// app.use('/assets',express.static("assets"));


app.get("/",function(req,res){
    // res.send("header",{namee:nam,emaill:emai})  
    res.render("home")
})
app.get("/login",function(req,res){
    res.render("login")
})
app.get("/register",function(req,res){
    // console.log(req.session.userId);
    res.render("register")
});
app.get("/galay",function(req,res){
    res.render("galay")
});
app.get("/about",function(req,res){
    res.render("about")
});
// app.get("/home",function(req,res){
//     console.log("inside home", req.session);
//     res.render("welcome")
// });

app.post("/register",function(req,res){
    const newUser=new User({
        name: req.body.name,
    gender:req.body.gender,
    email: req.body.username,
    password:req.body.password
    })
    const nam=newUser.name;
    const username=newUser.email;
    console.log(nam, username)
    newUser.save()
    .then(() => {
        // res.send("header",{namee:nam,emaill:emai})
        res.render("welcome",{username:username})
    }).catch((err) => {
        console.log(err)
    });
})


app.post("/login",(req,res)=>{
    const username= req.body.username;
    const password= req.body.password;
    // req.session.cookie.user_id=username;
    // console.log(req.session.user_id)
    // console.log("login cookie", req.session.cookie.user_id);

    // console.log("session in login", req.session);
    
    
    User.findOne({email:username})
    .then((foundUser) => {
        if(foundUser){
            if(foundUser.password===password){
                User.findOne({email:username,room:{$exists:true}})
                .then((fu) => {
                    if(fu!==null){
                        console.log(fu)
                        const datee=new  Date();
                    // console.log(foundUser.room,foundUser.name,username);
                    res.render("booked",{nub:foundUser.room,nameee:foundUser.name,email:username,date:datee.toDateString()})
                    }else{
                        console.log(fu)
                        res.render("welcome", {username: username});
            
                    }
                    }).catch((err) => {
                    console.log(err);
                });
                console.log("match")
                // res.render("welcome", {username: username});
            }else{
                console.log("wrong emailid or password");
                window.alert("please enter the correct password");
            }
        }
    }).catch((err) => {
        console.log("error while login",err)
    });
})


app.post("/welcome",function(req,res){
    const roomno= req.body.roomn;
    const username = req.body.username;
    // console.log("new username", newUsername);
    console.log(roomno, username)
    console.log(username);
    // const password= req.body.password;   
    // User.findOne({email:username,room:{$exists:false}})
    User.findOneAndUpdate({email:username},{room:roomno})
    .then((foundUser) => {
        if(foundUser){
            console.log(roomno,username)
            Room.findOneAndUpdate({rooma:roomno,booked:"FALSE"},{booked:"TRUE",bookedby:foundUser})
            .then((foundroom) => {
                if(foundroom){
                    console.log(roomno,username);
                    console.log(foundUser,foundroom)
                    
                    // res.render("booked",{nub:foundUser.room,nameee:foundUser.name,email:username,date:datee.toDateString()})
                    console.log("room updated")
                }else{
                    res.send("room is already occupied please select another room");
                }
            }).catch((err) => {
                console.log(err)
            }); 
            // console.log(Room.bookedby)
            
        }
    }).catch((err) => {
        console.log(err)
    });
})

// const qs = require("querystring");

// const parseUrl = express.urlencoded({ extended: false });
// const parseJson = express.json({ extended: false });
// app.post("/paynow", [parseUrl, parseJson], (req, res) => {
//     // Route for making payment
  
//     var paymentDetails = {
//       amount: req.body.amount,
//       customerId: req.body.name,
//       customerEmail: req.body.email,
//       customerPhone: req.body.phone,
//     };
//     if (
//       !paymentDetails.amount ||
//       !paymentDetails.customerId ||
//       !paymentDetails.customerEmail ||
//       !paymentDetails.customerPhone
//     ) {
//       res.status(400).send("Payment failed");
//     } else {
//       var params = {};
//       params["MID"] = config.PaytmConfig.mid;
//       params["WEBSITE"] = config.PaytmConfig.website;
//       params["CHANNEL_ID"] = "WEB";
//       params["INDUSTRY_TYPE_ID"] = "Retail";
//       params["ORDER_ID"] = "TEST_" + new Date().getTime();
//       params["CUST_ID"] = paymentDetails.customerId;
//       params["TXN_AMOUNT"] = paymentDetails.amount;
//       params["CALLBACK_URL"] = "http://localhost:3000/callback";
//       params["EMAIL"] = paymentDetails.customerEmail;
//       params["MOBILE_NO"] = paymentDetails.customerPhone;
  
//       checksum_lib.genchecksum(
//         params,
//         config.PaytmConfig.key,
//         function (err, checksum) {
//           var txn_url =
//             "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
//           // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
  
//           var form_fields = "";
//           for (var x in params) {
//             form_fields +=
//               "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
//           }
//           form_fields +=
//             "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
  
//           res.writeHead(200, { "Content-Type": "text/html" });
//           res.write(
//             '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
//               txn_url +
//               '" name="f1">' +
//               form_fields +
//               '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
//           );
//           res.end();
//         }
//       );
//     }
//   });
  
//   app.post("/callback", (req, res) => {
//     // Route for verifiying payment
  
//     var body = "";
  
//     req.on("data", function (data) {
//       body += data;
//     });
  
//     req.on("end", function () {
//       var html = "";
//       var post_data = qs.parse(body);
  
//       // received params in callback
//       console.log("Callback Response: ", post_data, "n");
  
//       // verify the checksum
//       var checksumhash = post_data.CHECKSUMHASH;
//       // delete post_data.CHECKSUMHASH;
//       var result = checksum_lib.verifychecksum(
//         post_data,
//         config.PaytmConfig.key,
//         checksumhash
//       );
//       console.log("Checksum Result => ", result, "n");
  
//       // Send Server-to-Server request to verify Order Status
//       var params = { MID: config.PaytmConfig.mid, ORDERID: post_data.ORDERID };
  
//       checksum_lib.genchecksum(
//         params,
//         config.PaytmConfig.key,
//         function (err, checksum) {
//           params.CHECKSUMHASH = checksum;
//           post_data = "JsonData=" + JSON.stringify(params);
  
//           var options = {
//             hostname: "securegw-stage.paytm.in", // for staging
//             // hostname: 'securegw.paytm.in', // for production
//             port: 443,
//             path: "/merchant-status/getTxnStatus",
//             method: "POST",
//             headers: {
//               "Content-Type": "application/x-www-form-urlencoded",
//               "Content-Length": post_data.length,
//             },
//           };
  
//           // Set up the request
//           var response = "";
//           var post_req = https.request(options, function (post_res) {
//             post_res.on("data", function (chunk) {
//               response += chunk;
//             });
  
//             post_res.on("end", function () {
//               console.log("S2S Response: ", response, "n");
  
//               var _result = JSON.parse(response);
//               if (_result.STATUS == "TXN_SUCCESS") {
//                 res.send("payment sucess");
//               } else {
//                 res.send("payment failed");
//               }
//             });
//           });
  
//           // post the data
//           post_req.write(post_data);
//           post_req.end();
//         }
//       );
//     });
//   });
  

app.listen(3000,function(){
    console.log("Server started on port 3000")
})
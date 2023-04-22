const ejs=require('ejs');
const express = require("express");
const bodyParser = require("body-parser");
const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config()
var jwt = require('jsonwebtoken');
var cookie = require('cookie');
var qr = require('qr-image');
const session = require('express-session');
app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));


const mongoURI="mongodb://localhost:27017/menukart";
try{
    mongoose.connect(mongoURI);
    console.log("Connected to database");

}
catch(err){
    console.log(err);
}
const menu=new mongoose.Schema({

    itemname:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
    
})
const Order= new mongoose.Schema({



    itemname:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }

})


const hotelAdmin = new mongoose.Schema({
    phone:{type:String,required:true,validate: {
        validator: function(v) {
            return /^[6-9]{1}[0-9]{9}$/.test(v);
        },message: 'Invalid Indian phone number!'}},
    password:{type:String,required:true},
    currentOrders:[{ order: [Order],
        status: String,
        paymentstatus: String,
        customer: String
    
    
      
       
       
    }],
    completedOrders:[{ order: [Order],
        status: String,
        paymentstatus: String,
        customer: String
    
    
      
       
       
    }],
    hotelMenu:[menu],
    

})
const menuuser=new mongoose.Schema({
    phone:{type:String,required:true,validate: {
        validator: function(v) {
            return /^[6-9]{1}[0-9]{9}$/.test(v);
        },message: 'Invalid Indian phone number!'}},
    tableno:String,
    cart:[Order]

})


const hotelModel=new mongoose.model("hoteladmins",hotelAdmin)
const ordermodel=new mongoose.model("order",Order)
const menuModel=new mongoose.model("menu",menu)
const menuuserModel=new mongoose.model("menuuser",menuuser)

app.get('/signup',function(req,res){
    res.send("this is signup")
})
app.get('/login',function(req,res){
    res.send("this is login")
})


app.post("/signup",async function(req,res){
    const found= await hotelModel.findOne({phone:req.body.phone});
    if(!found){
        const hash= bcrypt.hashSync(req.body.password, saltRounds);
        const user=new hotelModel({
            phone:req.body.phone,
            password:hash
        })
        const token = jwt.sign(
            { user_id: user._id, phone:user.phone},
            process.env.TOKEN_KEY,
            {
              expiresIn: "1h",
            }
          );
          
          
          var setCookie=cookie.serialize('jwtToken', token,{
            httpOnly: true,
            maxAge: 60 * 60 // 1 hour
        });
         res.setHeader('Set-Cookie', setCookie);//used to send cookie to client

        try{
            await user.save()
            res.send("account created");
           
            
        }
        catch(err){
            if(err.name=="ValidationError"){
                for (const field in err.errors) {
                    res.send(err.errors[field].message);
            }
           
        }}

    }
    else{
        res.redirect('/login')
    }

    
})


app.post("/login",async function(req,res){
    const found= await hotelModel.findOne({phone:req.body.phone})
    if(found){
        const pass=found.password
        bcrypt.compare(req.body.password, pass, function(err, result) {
            if(result==true){
                const token = jwt.sign(
                    { user_id: found._id, phone:found.phone},
                    process.env.TOKEN_KEY,
                    {
                      expiresIn: "1h",
                    }
                  );
                 
                  
                  var setCookie=cookie.serialize('jwtToken', token,{
                    httpOnly: true,
                    maxAge: 60 * 60 // 1 hour
                });
                  res.setHeader('Set-Cookie', setCookie);//used to send cookie to client
                res.send("signed in")
            }
            else if(result==false){
                res.send("password incorrect");
            }
            else{
                res.send(err);
            }})
    }
    else{
        res.redirect('/signup');
    }


});

app.post('/addMenu',async function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
        const menus=new menuModel({
            itemname:req.body.itemname,
            price:req.body.price
          })
    
          try{
            await menus.save()
            res.json(menus)
          }
          catch(err){
            res.json(err)
          }
       }
       else{
        res.json("need authentication")
       }
      });

      
      


})

app.patch('/addMenu/:id',async function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
        try{
        
        const filter = { _id: req.params.id};
        const update = { itemname:req.body.itemname,price:req.body.price};
        const doc=await menuModel.findOneAndUpdate(filter, update, {
            new: true
          });
          res.json(doc)
        }
        catch(err){
            res.json(err)
        }


          
       }
       else{
        res.json("need authentication")
       }
      });

      
      


})
app.delete('/addMenu/:id',async function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
        try{
        
        const filter = { _id: req.params.id};
        const deleted=await menuModel.findOneAndDelete(filter)
          res.json("deleted sucessfully")
        }
        catch(err){
            res.json(err)
        }


          
       }
       else{
        res.json("need authentication")
       }
      });

      
      


})
app.get('/qr',function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
    const qrPng = qr.image('I love QR!', { type: 'png' });
    res.setHeader('Content-Type', 'image/png');
    qrPng.pipe(res);
       }
       else{
        res.json('need authentication')
       }
  });
});


app.post("/user",async function(req,res){
    const{phone, table}=req.body
    const found=await menuuserModel.findOne({phone:phone})
    if(!found){
    
    const user=new menuuserModel({
        phone:phone,
        tableno:table
    })
    const token = jwt.sign(
        { user_id: user._id, phone:user.phone},
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );
      
      
      var setCookie=cookie.serialize('jwtusertToken', token,{
        httpOnly: true,
        maxAge: 60 * 60 // 1 hour
    });
     res.setHeader('Set-Cookie', setCookie);//used to send cookie to client

    try{
        await user.save()
        res.json(user)
        
    }
    catch(err){
        res.json(err)
    }
}
else{
    const token = jwt.sign(
        { user_id: found._id, phone:found.phone},
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );
      
      
      var setCookie=cookie.serialize('jwtuserToken', token,{
        httpOnly: true,
        maxAge: 60 * 60 // 1 hour
    });
     res.setHeader('Set-Cookie', setCookie);//used to send cookie to client

    res.redirect('/addtocart')
}

})

app.post('/addtocart', (req, res) => {
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtuserToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
  
    const { itemname,price } = req.body;
    const userOrder = new ordermodel({
        itemname:itemname,
        price:price,
        
    })
    const filter={phone:decoded.phone}
    const update = { $push: { cart: userOrder } };
    const finduser=await menuuserModel.findOneAndUpdate(filter, update, {
        new: true
      });
    res.json(`Item ${userOrder} added to your cart`);
       }
       else{
        res.json('no user found')
       }
  });
})



app.post('/deletecart/:id', (req, res) => {
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtuserToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
  
   
    const filter={phone:decoded.phone}
    const update = { $pull: { cart: {_id:req.params.id }} };
    const finduser=await menuuserModel.findOneAndUpdate(filter, update, {
        new: true
      });
    res.json(`Item ${finduser} deleted to your cart`);
       }
       else{
        res.json('no user found')
       }
  });
})
  app.get('/addtocart',function(req,res){
    res.json('this is main menu');
})

app.post("/order/:id",async function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtuserToken,process.env.TOKEN_KEY, async function(err, decoded) {
        if(!err){
        const findcart=await menuuserModel.findOne({phone:decoded.phone})
        const filter={_id:req.params.id}
        const newOrder = {
            order: findcart.cart,
            status: "false",
            customer: decoded.phone
          };
    const update = { $push :{ currentOrders: newOrder}};
    const updateorder=await hotelModel.findOneAndUpdate(filter, update, {
        new: true
      });
      const fil = {phone: decoded.phone};
const up = {$set: {cart: []}};
const result = await menuuserModel.findOneAndUpdate(fil, up,{new:true});
console.log(result)
      


        }
        else{
            res.json("invalid user")
        }
    })


})



app.post('/orderdone/:id', async (req, res) => {
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
        if(!err){
            const find=await hotelModel.findOne({_id:decoded.user_id})
            let ind=-1;
             for(let i=0;i<find.currentOrders.length;i++)
             {
                if(find.currentOrders[i]._id==req.params.id)
                {
                    ind=i
                    break
                }

             }
             console.log(ind)



  
    // Find the hotel with the provided ID
             
             find.currentOrders[ind].status="true"
             await find.save()
            console.log( find.currentOrders[ind].status)
            find.completedOrders.push(find.currentOrders[ind])
            await find.save()
    // Move orders from currentOrders to completedOrders
//     const fil = { _id: decoded.user_id };
// const doc = await hotelModel.findOne(fil);
find.currentOrders.splice(ind, 1);
await find.save();
    // Save changes to the database and delete that order from the currentorders array
    
  
    // res.send('Hotel updated');
        }
        else{
            res.json("need authentication")
        }
    })
  });










app.listen(3000,function(err){
    if(!err){
        console.log("Connected sucessfully");
    }
    else{
        console.log(err);
    }
})

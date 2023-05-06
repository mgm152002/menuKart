const ejs=require('ejs');
const qrCode = require('qrcode');

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


// const mongoURI="mongodb://localhost:27017/menukart";
try{
    mongoose.connect(process.env.Mongo);
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
    tableno:Number,
    cart:[Order]

})


const hotelModel=new mongoose.model("hoteladmins",hotelAdmin)
const ordermodel=new mongoose.model("order",Order)
const menuModel=new mongoose.model("menu",menu)
const menuuserModel=new mongoose.model("menuuser",menuuser)

app.get('/signup',function(req,res){
    res.render("signup")
})
app.get('/login',function(req,res){
    res.render("login")
})
app.get("/",function(req,res){
    res.render("home")
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
            res.redirect("/adminmenu")
           
            
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
                res.redirect("/adminmenu")
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
        const found=await hotelModel.findOne({_id:decoded.user_id})
        const menus=new menuModel({
            itemname:req.body.itemname,
            price:req.body.price
          })
    
          try{
            found.hotelMenu.push(menus)
            await found.save()
            res.redirect("/adminmenu")
        
          }
          catch(err){
            res.json(err)
          }
       }
       else{
        res.redirect("/login")
       }
      });

      
      


})

app.post('/addMenu/:id',async function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
        try{
        const doc=await hotelModel.findOne({_id:decoded.user_id})
        let ind=-1
        for(let i=0;i<doc.hotelMenu.length;i++)
        {
            if(doc.hotelMenu[i]._id==req.params.id)
            {
                ind=i;
                break
            }

        }
        doc.hotelMenu[ind].itemname=req.body.itemname
        doc.hotelMenu[ind].price=req.body.price
        await doc.save()
        res.redirect("/adminmenu")
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
app.post('/delMenu/:id',async function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
        try{
        
            const filter={_id:decoded.user_id}
            const update={$pull:{hotelMenu:{_id:req.params.id}}}
            const up= await hotelModel.findOneAndUpdate(filter,update,{new:true})
          res.redirect("/adminmenu")
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
app.get('/qr',async function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
    
        const baseUrl = req.protocol + '://' + req.get('host')+'/user/'+decoded.user_id;
const currentUrl = baseUrl + req.originalUrl.replace('/qr', '');

         // The data to encode in the QR code
        qrCode.toDataURL(currentUrl, (err, url) => {
          if (err) {
            console.error(err);
            return res.sendStatus(500);
          }
          res.render('qr', { qrdata: url }); // Pass the generated data URL to the EJS view
        });
       }
       else{
        res.json('need authentication')
       }
  });
});


app.post("/user/:id",async function(req,res){
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
        maxAge: 60 * 60, // 1 hour
        path:'/'
    });
     res.setHeader('Set-Cookie', setCookie);//used to send cookie to client

    try{
        await user.save()
        res.redirect("/user/menu/"+req.params.id)
        
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
        maxAge: 60 * 60,
        path:"/" // 1 hour
    });
     res.setHeader('Set-Cookie', setCookie);//used to send cookie to client
     found.tableno=table
     await found.save()

     res.redirect("/user/menu/"+req.params.id)
}

})

app.post('/addtocart/:id', (req, res) => {
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtuserToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
  
    const { itemname,price } = req.body;
    const userOrder = new ordermodel({
        itemname:itemname,
        price:price,
        
    })
    // const found=await menuModel.findOne({_id:decoded.user_id})
    // found.cart.push(userOrder)
    // await found.save();
    const filter={_id:decoded.user_id}
    const update = { $push: { cart: userOrder } };
    const finduser=await menuuserModel.findOneAndUpdate(filter, update, {
        new: true
      });
      res.redirect("/user/menu/"+req.params.id)
   
       }
       else{
        res.json('no user found')
       }
  });
})



app.post('/deletecart/:id/:menu', (req, res) => {
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtuserToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
  
   
    const filter={phone:decoded.phone}
    const update = { $pull: { cart: {_id:req.params.id }} };
    const finduser=await menuuserModel.findOneAndUpdate(filter, update, {
        new: true
      });
    res.redirect("/user/cart/"+req.params.menu)
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
res.redirect("/user/cart/"+req.params.id)
      


        }
        else{
            res.json("invalid user")
        }
    })


})



app.get('/orderdone/:id', async (req, res) => {
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
    res.redirect("/adminorders")
  
    // res.send('Hotel updated');
        }
        else{
            res.json("need authentication")
        }
    })
  });
  app.get("/adminmenu",async function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
        if(!err){

        var found=await hotelModel.findOne({_id:decoded.user_id})
        var menu=found.hotelMenu
        res.render("menu",{menuItems:menu})
        }
        else{
            res.send("need auth")
        }



  })
})
app.get("/adminorders",function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
        if(!err){

        var found=await hotelModel.findOne({_id:decoded.user_id})
        var orders=found.currentOrders
        res.render("orders",{orders:orders})
        }
        else{
            res.send("need auth")
        }

})
})
app.get("/admincomplete",function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
        if(!err){

        var found=await hotelModel.findOne({_id:decoded.user_id})
        var orders=found.completedOrders
        res.render("completed",{orders:orders})
        }
        else{
            res.send("need auth")
        }

})
})
app.get("/addmenu",function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
        if(!err){

        res.render("addform")
        }
        else{
            res.send("need auth")
        }

})
})

app.get("/updatemenu/:id",function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtToken,process.env.TOKEN_KEY, async function(err, decoded) {
        if(!err){
            const doc=await hotelModel.findOne({_id:decoded.user_id})
            let ind=-1
            for(let i=0;i<doc.hotelMenu.length;i++)
            {
                if(doc.hotelMenu[i]._id==req.params.id)
                {
                    ind=i;
                    break
                }
    
            }
            let upd=doc.hotelMenu[ind]
           

        res.render("updateform",{upd:upd})
        }
        else{
            res.send("need auth")
        }

})
})
app.get("/user/:id",function(req,res){
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtuserToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
        res.redirect("/user/menu/"+req.params.id)
       }
       else{
        res.render("userform",{id:req.params.id});

       }


})
})
app.get("/user/menu/:id",async function(req,res){
    const docs = await hotelModel.findOne({_id:req.params.id})
    const menuItems=docs.hotelMenu
    const docsid=docs._id
    res.render("usermenu",{menuItems:menuItems,docsid:docsid})

})
app.get("/user/cart/:id",async function(req,res){
    const docs = await hotelModel.findOne({_id:req.params.id})
    const docsid=docs._id
    var cookies = cookie.parse(req.headers.cookie || '');
    jwt.verify(cookies.jwtuserToken,process.env.TOKEN_KEY, async function(err, decoded) {
       if(!err){
        const docs = await menuuserModel.findOne({_id:decoded.user_id})
        const cart=docs.cart
        res.render("cart",{cartItems:cart,docsid:docsid})
       }
       else{
        res.json("Need auth")

       }


})

})










app.listen(process.env.PORT||3000,function(err){
    if(!err){
        console.log("Connected sucessfully");
    }
    else{
        console.log(err);
    }
})

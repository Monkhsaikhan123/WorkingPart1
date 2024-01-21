const express = require ('express');
const app = express();
const mongoose = require('mongoose')

app.use(express.json())
const cors = require('cors')
app.use(cors())
const bcrypt = require('bcryptjs')
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:false}))
var nodemailer = require('nodemailer');

const jwt = require('jsonwebtoken');
const JWT_SECRET= "hagakljkglahgahgla[]lkjfk34dadw3523ghdgz";


mongoose.connect("mongodb+srv://DbUser:DbUser@munkh.tgu5wgq.mongodb.net/Login",{

}).then(()=>{console.log("connected Database")})
.catch((e)=>console.log(e))

require('./schema')
const User = mongoose.model('users');

app.post('/register', async(req,res)=>{
    const {fname, lname, email,password,Usertype} = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10)
    try{
        const oldUser =await User.findOne({email});
        if(oldUser){
           return res.send({error: " User Exist"})
        }
        await User.create({
            fname,
            lname,
            email,
            password:encryptedPassword,
            Usertype
        })
        res.send({status : 'ok'})
    }catch{
        res.send({status: 'error'})
    }
})


app.post('/login-user', async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
    if(!user){
        return res.json({error : "User not Found"});
    }
    if(await bcrypt.compare(password, user.password)){
        const token = jwt.sign({email: user.email}, JWT_SECRET, {
            expiresIn:'1000m'
        });
        
        if(res.status(201)){
            return res.json({status: 'ok', data:token})
        }else{
            return res.json({error: 'error'});
        }
    }
    res.json({status:'error', error:'invalid password'})
})

app.post('/userData', async(req,res)=>{
    const {token}= req.body;
    try {
        const user=jwt.verify(token,JWT_SECRET,(err,res)=>{
            if(err){
                return 'token expired';
            }
           return res;
        });
        console.log(user);
        if(user==='token expired'){
            return res.send({status:'error', data:'token expired'})
        }
        
        const useremail = user.email;
        console.log(user)
        User.findOne({email:useremail}).then((data)=>{
            res.send({status:'ok', data:data})
        }).catch((error)=>{
            res.send({status:'error', data:error})
        })

    } catch (error) {
        
    }
})
app.post('/forgot-password', async(req,res)=>{
    const{email}= req.body
    try {
        const oldUser = await User.findOne({email});
        if(!oldUser){
            return res.json({status:"user not exists!"})
        }
        const secret = JWT_SECRET + oldUser.password;
        const token = jwt.sign({email:oldUser.email, id:oldUser._id}, secret, {expiresIn:'5m'})
        const link = `http://localhost:3000/reset-password/${oldUser._id}/${token}`;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'monkhsaikhan01@gmail.com',
              pass: 'ymsp jsnp srdv bugm'
            }
          });
          
          var mailOptions = {
            from: 'youremail@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: link
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        console.log(link);
    } catch (error) {
        
    }
})
app.get('/reset-password/:id/:token', async(req,res)=>{
    const {id,token} = req.params;
    console.log(req.params)
    const oldUser = await User.findOne({_id : id});
    if(!oldUser){
        return res.json({status:"User not exists!!"})
    }
    const secret = JWT_SECRET + oldUser.password;
    try{
        const verify=jwt.verify(token,secret)
        res.render("index",{email:verify.email, status:'Not verified'})
    }catch(error){
        console.log(error);
        res.send("Not verified");
    }
})

app.post('/reset-password/:id/:token', async(req,res)=>{
    const {id,token} = req.params;
    const{password}=req.body;
    const oldUser = await User.findOne({_id : id});
    if(!oldUser){
        return res.json({status:"User not exists!!"})
    }
    const secret = JWT_SECRET + oldUser.password;
    try{
        const verify=jwt.verify(token,secret)
        const encryptedPassword = await bcrypt.hash(password,100000);
        await User.updateOne(
        {
            _id:id,
        },
        {
            $set:{
                password:encryptedPassword,
            }
        }
        )
        res.render('index', {email:verify.email,status:'verified'})



    }catch(error){
        console.log(error);
        res.json({status:"Something wend wrong"});
    }
})

app.get('/getUser', async(req,res)=>{
    const data = await User.find({})
   res.json({success: true, data:data})
})

app.post('/updateUser', async(req,res)=>{
    const{id, fname, lname} = req.body
    try {
        await User.updateOne({_id:id},{
            $set:{
                fname:fname,
                lname:lname,
            }
        })
        return res.json({status:"ok", data: "updated"})
    } catch (error) {
        return res.json({status : "error", data:error})
    }
})


app.post('/deleteUser', async(req,res)=>{
    const {userid} = req.body;
    try {
        User.deleteOne({_id:userid}, function(err,res){
            console.log(err)
        })
        res.send({status:"ok" ,data:"deleted"})
    } catch (error) {
        console.log(error)
    }
})

app.delete('/deleteUser/:id' , async(req,res)=>{
    const id = req.params.id;
    console.log(id)
    const data = await User.deleteOne({_id: id})
    res.send({success:true, message: " data delete success", data:data})
})


require('./imageSchema')

const Images = mongoose.model('ImageDetails')


app.post('/upload-image' , async(req, res)=>{
    const {base64,name} = req.body;
    try {
        Images.create({image:base64 , name:name});
        res.send({status:"ok", data:"uploaded"})
    } catch (error) {
        res.send({status:"error", data:error})
    }
})

/////////PRODUCTS
require('./schema')
const Products = mongoose.model('products');


//​http://localhost:3000/getProduct
app.get('/getProduct', async(req,res)=>{
    const data = await Products.find({})
   res.json({success: true, data:data})
})


//​http://localhost:3000/saveProduct
app.post('/saveProduct', async(req,res)=>{
    const {name, image, desc, price, imageURL} = req.body;
   try {
        Products.create({name:name, desc:desc, price:price, image:image ,imageURL:imageURL})
        res.send({success:true, message: "data delete success", data:data})
   } catch (error) {
        res.send({status:"error", data:error})
   }
})






///Image heseg
require('./imageSchema')
const ImageModel= mongoose.model('Images');

///upload image with multer
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/upload')
    },
    filename: function (req, file, cb) {
     /*  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) */
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })


  app.post('/uploadImage', upload.single("articleImage") ,(req,res)=>{
    const {name} = req.body;
    const articleImage = req.file.originalname;
    try {
         ImageModel.create({name:name, articleImage:articleImage})
         res.send({status:"ok", data:"uploaded"})
    } catch (error) {
         res.send({status:'error', data:error})
    }
 })


app.listen(3000,()=>{
    console.log("server started")
});
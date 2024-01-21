const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema(
    {
        fname:String,
        lname:String, 
        email:{ type: String,unique:true},
        password:String,
        Usertype:String,

    },{
        collection:'users'
    }
);

mongoose.model('users' , UsersSchema)




const ProductsSchema = new mongoose.Schema(
    {
        name:String,
        image:String, 
        desc:String,
        price:String,
        imageURL:String,

    },{
        collection:'products'
    }
);

mongoose.model('products' , ProductsSchema)


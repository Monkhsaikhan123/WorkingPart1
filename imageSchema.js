const mongoose = require('mongoose');

const ImageDetailsSchema = new mongoose.Schema(
    {
       image:String,
    },{
        collection:'ImageDetails'
    }
);

mongoose.model('ImageDetails' , ImageDetailsSchema)



const ImageSchema = new mongoose.Schema(
    {
       image:String,
       name:String,
    },{
        collection:'Images'
    }
);

mongoose.model('Images' , ImageSchema)
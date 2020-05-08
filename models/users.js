const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const {JSDOM} = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)


const userSchema = new mongoose.Schema({

    username:{
        type:String,
        required:true,
         
    },
    email:{
        type:String,
        required:true,
         
    },
    password:{
        type:String,
        required:true
    }


})



module.exports = mongoose.model('Users', userSchema);
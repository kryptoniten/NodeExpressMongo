const express = require('express')
const router = express.Router()
const User = require('../models/users');


router.get('/register', (req, res) => {
    res.render('users/register')
  })


  router.get('/login', (req, res) => {
    res.render('users/login')
  })



  router.post('/register',(req,res) =>{
    User.create(req.body,(error,user) =>{
      console.log(req.body.username)
      res.redirect('/')
    })
      


  })

  router.post('/login',(req,res) =>{
    const { username,password} = req.body
    User.findOne({username}, (error,user)=>{
      if(user){

        if(user.password == password){
          req.session.userId = user._id
          
          res.redirect('/')
         }
        else
        {
          res.redirect('/users/login')
         }

      
        }
        else{
          res.redirect('/users/register')
        }
        
    })

  })

  
  router.get('/profile',(req,res)=>{
    res.render('users/profile')
  })
  


 
  module.exports = router
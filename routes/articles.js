const express = require('express')
const Article = require('./../models/article')
const User = require('./../models/users')

const router = express.Router()
const path = require('path');

router.get('/new', (req, res) => {
  
 if(req.session.userId){
  
 res.render('articles/new', { article: new Article() })  
 }
 else
 {
   res.redirect('/users/login')
 }



  
})


 

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})




router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  res.render('articles/show', { article: article })
  

})




router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
   
 }, saveArticleAndRedirect('new'))




router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))





router.delete('/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/')
})


 

function saveArticleAndRedirect() {
  return async (req, res) => {
    let postImage = req.files.post_image;
    postImage.mv(path.resolve(__dirname,'../public/images/postimages',postImage.name))
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.post_image = `/images/postimages/${postImage.name}`;
    article.author = req.session.userId;
  
    try {
      article = await article.save()
      res.redirect('/articles/articles')

    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}

module.exports = router
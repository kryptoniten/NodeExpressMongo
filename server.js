const express = require('express');
const mongoose = require('mongoose');
const articleRouter = require('./routes/articles')
const userRouter = require('./routes/user')
const expressSession = require('express-session')
var expressLayouts = require('express-ejs-layouts');
const Article = require('./models/article')
const User = require('./models/users');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const connectMongo = require('connect-mongo');
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;




mongoose.connect('mongodb://localhost/myblog', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => {

  console.log('Database Connected')

})

const mongoStore = connectMongo(expressSession);
app.use(expressSession({
  secret: 'test',
  resave: false,
  saveUninitialized: true,
  store: new mongoStore({ mongooseConnection: mongoose.connection })


}))

//Links Middleware


app.use(fileUpload());

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'));
app.use(expressLayouts);

//Middleware for links
app.use((req,res,next)=>{
  const { userId } = req.session
  if (userId) {
    res.locals = {
      displayLink: true
    }
   
  }
  else {
    res.locals = {
      displayLink: false
    }
  }
  next();
})


app.get('/', async (req, res) => {
  const articles = await Article.find().populate({path:'author',model:User}).sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
  
});

app.get('/articles/articles', async (req, res) => {
   
  const articles = await Article.find().sort({ createdAt: 'desc' })

  res.render('articles/articles', { articles: articles })
})


app.use(express.static(__dirname + '/public'));

app.use('/articles', articleRouter);
app.use('/users', userRouter);

app.use(cors())
app.use(cookieParser())

function spotifyAuth() {




  var client_id = 'f135a42dbc6b405c8c64212eb22975cc'; // Your client id
  var client_secret = 'bea47059a9084195b9dc603b2c5fab07'; // Your secret
  var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

  /**
   * Generates a random string containing numbers and letters
   * @param  {number} length The length of the string
   * @return {string} The generated string
   */
  var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  var stateKey = 'spotify_auth_state';




  app.get('/login', function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

  app.get('/callback', function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };

      request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {

          var access_token = body.access_token,
            refresh_token = body.refresh_token;

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };

          // use the access token to access the Spotify Web API
          request.get(options, function (error, response, body) {
          });

          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });

  app.get('/refresh_token', function (req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });



}
spotifyAuth();

  

app.get('/logout',(req,res)=>{
  req.session.destroy(()=>{
    res.redirect('/')
  })
})
 


app.listen(PORT, () => { console.log(`Server is online at ${PORT}`); });   
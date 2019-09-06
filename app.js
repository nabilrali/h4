const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
let Instagram = require('instagram-nodejs-without-api');
Instagram = new Instagram(),
fs = require('fs');
const mongoose = require('mongoose');
const cron = require('node-cron');

const controller = require('./controllers/');

mongoose.connect("mongodb://root:instagram123@ds217078.mlab.com:17078/instagram", {useNewUrlParser: true});


//get Instagram auth info

// (function () {
//   fs.readFile('./config.json', 'utf-8', (err, data) => {
//     if (err) console.log('err', err);
//     data = JSON.parse(data);
//     console.log('data', data);
//
//     if (data.csrfToken && data.sessionId) {
//       Instagram.csrfToken = data.csrfToken
//       Instagram.sessionId = data.sessionId
//       controller.cron()
//
//     }else {
//       let obj = {
//         username: "nabil.elghali",
//         password: "nb100100"
//       }
//       controller.login(obj, (err, result) => {
//         if (err) console.log('err', err);
//         Instagram.csrfToken = result.csrfToken,
//         Instagram.sessionId = result.sessionId
//         controller.cron()
//
//       })
//     }
//   })
// })()



// controller.getUserId("abdurahimisafandffsfd", (err, result) => {
//   if (err) return console.error();
//   // console.log('user_id', result.id);
//
// })





const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


app.listen(process.env.PORT || 3000, () => {
  console.log(`The App is running in localhost: 3000`);
})

app.get('/login', (req, res) => {

  controller.login(req.query, (err, result) => {
      if (err) console.log('err', err);
      console.log('result', result);
      Instagram.csrfToken = result.csrfToken,
      Instagram.sessionId = result.sessionId

      res.json(result)
      // controller.cron()
    })
})


app.get('/', (req, res) => {
  console.log(req.query);

  let {target_user } = req.query
  if (target_user.includes("http") || target_user.includes("instagram")) {
    console.log('yep');
    target_user = target_user.split('.com/')[1].replace('/', '')
  }
  if (target_user.includes("?")) {
    target_user = target_user.split('?')[0].replace('/', '')
  }
  target_user = target_user.trim().toString();
  console.log('target_user', target_user);
  controller.getUserId(target_user, (err, result) => {
    if (err) return res.json(err);
    console.log('user_id', result.id);
    if (result.id) {
      let user_id = result.id
      let data = {
        quantity: parseInt(req.query.quantity),
        user_id: parseInt(user_id)
      }
      console.log('data', data);
      controller.getFollowers(data, (err, result) => {
        if (err) res.json(err);
        res.json(result)
      })
    }
  })
  // return Instagram.getUserDataByUsername(target_user).then((t) =>
  // {
  //
  //
  // }).catch((err) => {
  //   return res.json({success: false, message: "something wrong with that user "+ target_user, err: err})
  // });
})

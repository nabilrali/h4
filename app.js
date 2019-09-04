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

controller.login((err, result) => {
  if (err) res.json(err);
  console.log('result', result);
  Instagram.csrfToken = result.csrfToken
  Instagram.sessionId = "2722206080%3AxIVkC9aFpftMvH%3A6"
  // controller.cron()
  Instagram.getUserDataByUsername("nabil.boudlal").then((t) =>
  {
    console.log('t', t);
    // if (t.graphql.hasOwnProperty('user')) {
    //   let user_id = t.graphql.user.id
    //   let data = {
    //     quantity: parseInt(req.query.quantity),
    //     user_id: parseInt(user_id)
    //   }
    //   console.log('data', data);
    //   controller.getFollowers(data, (err, result) => {
    //     if (err) res.json(err);
    //     res.json(result)
    //   })
    // }

    // return Instagram.getUserFollowers(t.graphql.user.id).then((t) =>
    // {
    //   console.log(t); // - instagram followers for user "username-for-get"
    // })
  }).catch((err) => {
    console.log('err', err);
    return res.json({success: false, message: "something wrong with that user "+ target_user, err: err})
  });

})
// (function () {
//   fs.readFile('./config.json', 'utf-8', (err, data) => {
//     if (err) console.log('err', err);
//     data = JSON.parse(data);
//     console.log('data', data);
//
//     if (data.csrfToken && data.sessionId) {
//
//     }else {
//       controller.login((err, result) => {
//         if (err) console.log('err', err);
//         Instagram.csrfToken = result.csrfToken,
//         Instagram.sessionId = result.sessionId
//         controller.cron()
//
//       })
//     }
//   })
// })()






const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


app.listen(process.env.PORT || 3000, () => {
  console.log(`The App is running in localhost: 3000`);
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
  return Instagram.getUserDataByUsername(target_user).then((t) =>
  {
    console.log('t', t);
    if (t.graphql.hasOwnProperty('user')) {
      let user_id = t.graphql.user.id
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

    return Instagram.getUserFollowers(t.graphql.user.id).then((t) =>
    {
      console.log(t); // - instagram followers for user "username-for-get"
    })
  }).catch((err) => {
    console.log('err', err);
    return res.json({success: false, message: "something wrong with that user "+ target_user, err: err})
  });
})

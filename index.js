const mongoose= require('mongoose');
const dotenv=require('dotenv')
const express = require('express');
dotenv.config({path:'./config.env'});
const app = express()
const DB='mongodb+srv://hafiznizaqatali:trellopassword@cluster0.w113wyo.mongodb.net/Mytrello?retryWrites=true&w=majority'
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
   // useCreateIndex: true,
   // useFindAndModify:true,
  }).then(console.log("Connected to MongoDB  "))
  .catch((err) => console.log(err));
  const authRoute = require("./routes/auth");
  const userRoute = require("./routes/userRoute");
  const boardRoute = require("./routes/boardRoute");
 app.use(express.json())
 //   app.use("/api/auth", authRoute);
  //  app.use("/api/users", userRoute);
    app.use('/user', userRoute);
app.use('/board', boardRoute);
//app.use('/list', listRoute);
//app.use('/card', cardRoute);
    app.get('/about', function (req, res) {
        console.log('in the middle ware');
          res.send('Hello World  of About')
        })
  app.listen(5000,()=>{
    console.log("Backend is running with MongoDb Database");
});

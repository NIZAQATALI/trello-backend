const mongoose= require('mongoose');
const dotenv=require('dotenv')
const cors = require('cors');
const express = require('express');
dotenv.config({path:'./config.env'});
const app = express()
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
   // useCreateIndex: true,
   // useFindAndModify:true,
  }).then(console.log("Connection Sucessfully"))
  .catch((err) => console.log(err));
  const userRoute = require("./routes/userRoute");
  const boardRoute = require("./routes/boardRoute");
  const listRoute = require("./routes/listRoute");
  const cardRoute = require("./routes/cardRoute");
  const workspaceRoute = require("./routes/workspaceRoute");
 app.use(express.json())
 
 app.use(cors());
 //   app.use("/api/auth", authRoute);
  //  app.use("/api/users", userRoute);
    app.use('/user', userRoute);
app.use('/board', boardRoute);
app.use('/list', listRoute);
app.use('/card', cardRoute);
app.use('/workspace', workspaceRoute);
    app.get('/about', function (req, res) {
        console.log('in the middleWare');
          res.send('Hello World  of About')
        })
  app.listen(5000,()=>{
    console.log(" Server is running on port 5000");
});

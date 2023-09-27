const mongoose= require('mongoose');
const dotenv=require('dotenv')
const cors = require('cors');
const express = require('express');
const unless = require('express-unless');
dotenv.config({path:'./config.env'});
const auth = require('./Middlewares/auth.js');
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
// AUTH VERIFICATION AND UNLESS
auth.verifyToken.unless = unless;

app.use(
	auth.verifyToken.unless({
		path: [
			{ url: '/user/login', method: ['POST'] },
			{ url: '/user/register', method: ['POST'] },
      { url: '/user/submit-otp', method: ['POST'] },
			{ url: '/user/send-otp', method: ['POST'] },
		],
	})
);
// AUTH ADMIN VERIFICATION AND UNLESS
// auth.adminAccessMiddleware.unless = unless;

// app.use(
// 	auth.adminAccessMiddleware.unless({
// 		path: [
//       //user unless routes
//       { url: '/user/login', method: ['POST'] },
// 			{ url: '/user/register', method: ['POST'] },
//       { url: '/user/submit-otp', method: ['POST'] },
// 			{ url: '/user/send-otp', method: ['POST'] },
// 			{ url: '/user/get-user', method: ['GET'] },
// 			{ url: '/user/get-user-with-email', method: ['GET'] },
//     //workspace unless routes
//       { url: '/workspace/get-workspaces', method: ['GET'] },
//       { url: '/workspace/get-workspaces', method: ['GET'] }, 
//       { url: /^\/workspace\/get-workspace\/\w+$/, method: ['GET'] },
//   //board unless routes
//   { url: /^\/board\/\w+$/, method: ['GET'] },
//   { url: /^\/board\/\w+\/\w+$/, method: ['GET'] },
//   //list unless routes
  
// 		],
// 	})
// );
 //   app.use("/api/auth", authRoute);
  //  app.use("/api/users", userRoute);
    app.use('/user', userRoute);
app.use('/board', boardRoute);
app.use('/list', listRoute);
app.use('/card', cardRoute);
app.use('/workspace', workspaceRoute);
    app.get('/about', function (req, res) {
       res.send('Hello World  of About')
        })
  app.listen(5000,()=>{
    console.log(" Server is running on port 5000");
});

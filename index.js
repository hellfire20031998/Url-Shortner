const express= require('express');

const app= express();

const { connectToMongoDB}= require('./connect')

const urlRoute= require('./routes/url')

const staticRoute= require('./routes/staticRouter')

const UserRoute =require('./routes/User')

const PORT=8002;
 
const path= require('path')

const URL= require('./model/url')

const cookieParser=require('cookie-parser');
const e = require('express');

const {checkForAuthentication,restrictTo} = require('./middleware/auth')

connectToMongoDB('mongodb://localhost:27017/short-url')
.then(()=>console.log('MongoDB connected'))

app.use(express.json())

app.use(express.urlencoded({extended: false}))

app.use(cookieParser())

app.use(checkForAuthentication)


app.set("view engine", "ejs");
app.set('views',path.resolve("./views"));
app.use('/user',UserRoute);
app.get('/url/test',async (req,res)=>{

    const allUrls= await URL.find({});
    return res.render('home',{
        urls : allUrls,
    })
})



app.use("/url",restrictTo(["NORMAL","ADMIN"]), urlRoute)
app.use('/',staticRoute);

app.get('/url/:shortId',async(req,res)=>{
    const shortId= req.params.shortId;

    const entry =await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push:{
                visitHistory:{
                    timestamp: Date.now(),

                },
            },
        }
    )

    res.redirect(entry.redirectURL)
})

app.listen(PORT,()=>console.log(`Server is listening on ${PORT}`))
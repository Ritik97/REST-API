const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');


const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => { 
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().getSeconds() + '-' + file.originalname );
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        callback(null, true);
    }
    else {
        callback(null, false);
    }
};

//app.use(bodyParser.urlencoded({extended:false})); //x-www-form-urlencoded <form> 

app.use(bodyParser.json()); //application/json

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

/**files in the images folder will be served statically, for requests going to '/images' */
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin' , '*'); /**2nd parameter would be the domain name.Here, '*' means all domain */
    res.setHeader('Access-Control-Allow-Methods' , 'GET, POST, PUT, PATCH, DELETE'); 
    res.setHeader('Access-Control-Allow-Headers' , 'Origin, Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose.connect('mongodb+srv://ritik:JvH5BXDdB5cgE6hF@cluster0-925sp.mongodb.net/blogger?retryWrites=true&w=majority')
.then(result => {
    console.log('Connected!!');
    const server = app.listen(8000);

    const io = require('./socket').init(server);
    io.on('connection', socket => {
        console.log('Client-Connected');
    });
}).catch(err => {
    console.log(err);
});

const express = require('express')
const bodyParser = require('body-parser')
const db = require('./queries')
var multer  = require('multer');
const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/images');
  },
  filename: (req, file, cb) => {
 
    var filetype = '';
    if(file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if(file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if(file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    cb(null, 'car-' + Date.now() + '.' + filetype);
  }
});

var upload = multer({ storage: storage });

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})
app.use('/uploads', express.static('uploads'));

app.get('/cars', db.getCars)
app.get('/cars/:id', db.getCarsById)
app.get('/carsimg', db.getCarWithImage)
app.post('/cars', db.createCar)
app.put('/cars/:id', db.updateCar)
app.delete('/cars/:id', db.deleteCar)

app.post('/upload/:id', upload.single('profilepicture'),db.carImageUpload);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

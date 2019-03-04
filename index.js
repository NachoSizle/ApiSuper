const express = require('express')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
var serviceAccount = require('./gomovies-e82da-firebase-adminsdk-5k8g8-8357a992fe.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://gomovies-e82da.firebaseio.com'
})

const getProducts = require('./controllers/products/GET/searchBySuperCPName')

const app = express()
const port = process.env.PORT || 8080

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.listen(port, () => console.log('Server is listening, port ' + port))

app.get('/getProducts/:super/:zipCode/:productName', getProducts)

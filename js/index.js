const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
// const osrmq = require('./osrm_queries')
const port = 4000
app.use(express.json());
app.get('/nodes', db.getAllNodes)


app.post('/dateTime',db.getNodesBasedOnDateTimePost)
// app.get("/fastestRoute", osrmq.getFastestRoute)
app.get('/', (request, response) => {
  console.log("Connected")
  response.status(200).json({ info: 'connected' })
})
app.get('/', (request, response) => {
  console.log("Connected")
  response.status(200).json({ info: 'connected' })
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
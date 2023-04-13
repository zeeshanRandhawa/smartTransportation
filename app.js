const express = require("express");
const app = express();
const cors = require("cors");
// const db = require('./js/queries');
const path = require('path');
const Pool = require('pg').Pool
const { Client } = require("pg");


function getFormattedRows(rows, nodes, driverNode){
    formattedRows = []
    let myList = []
    rows.forEach(element => {
  
      try{
       
  
        formattedJsonTop = {
          "Orig":element["origin_node"],
          "Dest":element["destination_node"],
          "DateTime":element["departure_time"],
          "Drv":driverNode[element["origin_node"]],
          "Capacity":element["capacity"],
          "MaxWait":element["max_wait"],
          "FixedRoute":element["fixed_route"],
        }
        formattedJsonIndent = {
            "Orig":nodes[element["origin_node"]]["location"].trim()+","+nodes[element["origin_node"]]["description"].trim()+","+nodes[element["origin_node"]]["address"].trim()+","+nodes[element["origin_node"]]["city"].trim(),
            "Dest":nodes[element["destination_node"]]["location"].trim()+","+nodes[element["destination_node"]]["description"].trim()+","+nodes[element["destination_node"]]["address"].trim()+","+nodes[element["destination_node"]]["city"].trim()

        }
        
        

        myList.push({
            'top': formattedJsonTop,
            'indent':formattedJsonIndent
        })

        formattedRows.push(formattedJsonTop)
      }
      catch(error){
        console.log(error)
      }
  
     
    });
    myList.sort((a, b) => b.top.Orig - a.top.Orig);

      return myList
  }
async function getNodesBasedOnDateTimePost(request, response) {
    
    try {
      const { datetime, duration } = request.body;
  
      // parse the datetime and duration inputs
      const startDateTime = new Date(datetime);
      const [hours, minutes, seconds] = duration.split(":");
      // const durationMs = ((hours * 60) + minutes + (seconds / 60)) * 1000;
      const durationMs = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000)
      console.log(startDateTime.getTime())
      const endDateTime = new Date(startDateTime.getTime() + durationMs);
      console.log(startDateTime," ",endDateTime)
      // format the datetimes for use in the SQL query
      const formattedStartDateTime = startDateTime.toISOString();
      const formattedEndDateTime = endDateTime.toISOString();
  
      // execute the SQL query
      const query = `
        SELECT *
        FROM droutes
        WHERE departure_time BETWEEN '${formattedStartDateTime}' AND '${formattedEndDateTime}';
      `;
      let result = await pool.query(query);
  
      let nodes = getUniqueNodes(result.rows)
      let newNodes = await getAllNodeData(nodes)
      let driverNode = await queryAllDriverNodeData(nodes)
      let newRows = getFormattedRows(result.rows, newNodes, driverNode)
     
      response.send(newRows);
    } catch (error) {
      console.error(error);
      response.status(500).send("Error executing query",);
    }
  }
  
  function getUniqueNodes(rows){
    try{
      nodes = []
      rows.forEach(element => {
        nodes.push(element["origin_node"])
        nodes.push(element["destination_node"])
      } );
      let setNodes = new Set(nodes);
      const array = Array.from(setNodes)
      return array
    }
    catch(error){
      console.log(error)
  
    }
  
  }

    async function queryAllNodeData(nodes) {
    let nodeRows = {};
    const query = `
    SELECT *
    FROM nodes
    WHERE node_id IN (${nodes.join(',')});
    `;

    try {
      //const ret = await pool.query('SELECT * FROM droutes WHERE departure_time = $1', [dateTime]);
      const ret = await pool.query(query);
      
      
      return ret.rows
  
    } catch (error) {
      console.log(error)
    }
  }
    async function queryAllDriverNodeData(nodes) {
    
        const query = `
        SELECT DISTINCT *
        FROM droutenodes
        WHERE node_id IN (${nodes.join(',')});
      `;

    try {
      //const ret = await pool.query('SELECT * FROM droutes WHERE departure_time = $1', [dateTime]);
      const ret = await pool.query(query);
      let ret_obj = {}
      ret.rows.forEach((row)=>{
        node_id = row['node_id']
        driver_id = row['outb_driver_id']
        ret_obj[node_id] = driver_id
    
      })
      
      return ret_obj
  
    } catch (error) {
      console.log(error)
    }
  }
  async function getAllNodeData(nodes) {
    let nodeRowsNew = {};
    
    let alpha = await queryAllNodeData(nodes)
    alpha.forEach((a)=>{
        nodeRowsNew[a['node_id']] = a
    })

    return nodeRowsNew;
  }
  
  
// const corsOptions = {
//     origin: 'http://localhost:3000', // allow requests from this origin
//     optionsSuccessStatus: 200 // return 200 for preflight requests
//   };

//   app.use(cors(corsOptions)); // enable CORS with specific options
const pool = new Pool({
    user: 'doadmin',
    password: 'AVNS_MHGwE5WNGWUy_wvn_-l',
    host: 'db-postgresql-sfo2-32856-do-user-13737111-0.b.db.ondigitalocean.com',
    port: "25060",
    database: 'defaultdb',
    ssl: {
      rejectUnauthorized: false,
      sslmode: 'require'
    }
  });
app.use(cors());
app.use(express.json());
// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
//Static files:
app.use(express.static("public"));

app.post("/api/datetime", getNodesBasedOnDateTimePost)
app.use((req, res, next) => {
    console.log(req.url)
    if (req.url.includes("demo")) {
        res.sendFile(path.join(__dirname, "public", "demo.html"));
    } else {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    }
});


module.exports = app;

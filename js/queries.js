const Pool = require('pg').Pool
const { Client } = require("pg");

// host = 
// port = 25060
// database = 
// sslmode = require
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


//     user: 'azthrtech_pgadmin',
//     host: '162.241.218.130',
//     database: 'azthrtec_pgdb1',
//     password: 'db1xyz45admin',
//     port: 5432,

const getRelevantNodes = (request, response) => {
  const id = parseInt(request.params.id)
    pool.query('SELECT * FROM nodes WHERE id = $1;',[id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

async function getNodesBasedOnDateTime(dateTime) {
  console.log("Internal")
  try {
    const ret = await pool.query('SELECT * FROM droutes WHERE departure_time = $1', [dateTime]);
    console.log(ret.rows);
    return ret.rows;
  } catch (error) {
    throw error;
  }
}

// function makEndTime(startTime, duration){

//   let seperate = duration.split(":")
//   let hours = seperate[0]
//   let minutes = seperate[1]
//   let seconds = seperate[2]

//   seperate = startTime.split(" ")

//   let seperateDate = seperate[0].split("-")
//   let seperateTime = seperate[1].split(":")
//   let start_hours = seperateTime[0]
//   let start_minutes = seperateTime[1]
//   let start_seconds = seperateTime[2]
//   let year = seperateDate[0]
//   let month = seperate[1]
//   let day = seperate[2]

//   // console.log(start_hours," ",start_minutes," ",start_seconds)
//   // console.log(hours," ",minutes," ",seconds)

//   // console.log(startTime," ",duration)
//   let parsedSrartTime = new Date(startTime)
//   console.log(parsedSrartTime)
//   console.log(parsedSrartTime.getUTCDay())

// }

// function makEndTime(startTime, duration){

//   const startDateTime = new Date(startTime.replace(" ","T")); // Note the "T" separating the date and time
//   const durationParts = duration.split(":");
//   const hours = parseInt(durationParts[0]);
//   const minutes = parseInt(durationParts[1]);
//   const seconds = parseInt(durationParts[2]);
 
//   let endDateTime = new Date(startDateTime.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000);
//   console.log(endDateTime)
//   endDateTime.setUTCHours(endDateTime.getUTCHours(), endDateTime.getUTCMinutes(), endDateTime.getUTCSeconds(),5);
//   console.log(endDateTime)
//   const endDateTimeISO = endDateTime.toISOString();
//  //console.log(Date(endDateTime.setUTCHours(endDateTime.getUTCHours(), endDateTime.getUTCMinutes(), endDateTime.getUTCSeconds(), endDateTime.getUTCMilliseconds())));
//   console.log(endDateTimeISO)
// }

function makEndTime(startTime, duration){

  const startDateTime = new Date(startTime.replace(" ","T")+".000Z"); // Note the "T" separating the date and time
  const durationParts = duration.split(":");
  const hours = parseInt(durationParts[0]);
  const minutes = parseInt(durationParts[1]);
  const seconds = parseInt(durationParts[2]);
 
  const endDateTime = new Date(startDateTime.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000);
  const endDateTimeISO = endDateTime.toISOString();
  
  console.log(endDateTimeISO);
  return endDateTimeISO
}

function getFormattedRows(rows, nodes){
  formattedRows = []
  
  rows.forEach(element => {

    try{
     

      formattedJson = {
        "Orig":element["origin_node"],
        "Dest":element["destination_node"],
        "DateTime":element["departure_time"],
        "Drv":"503",
        "Capacity":element["capacity"],
        "MaxWait":element["max_wait"],
        "FixedRoute":element["fixed_route"]

      }

      
      formattedRows.push(formattedJson)
    }
    catch(error){
      console.log(error)
    }

   
  });
    return formattedRows
}

async function convertDateToDbTimezone(dateString) {
  // 1. Get the database timezone
  const { rows } = await pool.query('SELECT current_setting($1) as timezone', ['TIMEZONE']);
  const dbTimezone = rows[0].timezone;

  // 2. Get the node timezone
  const nodeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 3. Parse the input date string into a JavaScript Date object
  const inputDate = new Date(dateString);

  // 4. Convert the input date to a string in the node timezone
  const nodeDateString = inputDate.toLocaleString('en-US', { timeZone: nodeTimezone });

  // 5. Create a new Date object from the node timezone string
  const nodeDate = new Date(nodeDateString);

  // 6. Convert the date to a string in the database timezone
  const dbDateString = nodeDate.toLocaleString('en-US', { timeZone: dbTimezone });

  // 7. Return the date string in the database timezone
  return dbDateString;
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
    let newRows = getFormattedRows(result.rows, newNodes)
   
    response.json(newRows);
  } catch (error) {
    console.error(error);
    response.status(500).send("Error executing query");
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

async function getAllNodeData(nodes) {
  let nodeRows = {};
  for (const nodeID of nodes) {
    let row = await getNodeData(nodeID);
    nodeRows[nodeID] = row;
  }
  return nodeRows;
}

async function getNodeData(nodeId) {

  const query = `
  SELECT *
  FROM nodes
  WHERE node_id =${nodeId};
`;
  try {
    //const ret = await pool.query('SELECT * FROM droutes WHERE departure_time = $1', [dateTime]);
    const ret = await pool.query(query);
    
    
    return ret.rows[0]

  } catch (error) {
    console.log(error)
  }
}

const getAllNodes = (request, response) => {
    
    pool.query('SELECT * FROM nodes ORDER BY node_id ASC', (error, results) => {
      if (error) {
        console.log(error)
        throw error
      }
      response.status(200).json(results.rows)
    })
}

// getNodeData("1")


// const 
module.exports = {

  getRelevantNodes,
  getAllNodes,
  getNodesBasedOnDateTimePost,
  getNodeData,
}




// const client = new Client({
//     user: 'azthrtech_pgadmin',
//     host: '162.241.218.130',
//     database: 'azthrtec_pgdb1',
//     password: 'db1xyz45admin',
//     port: 5432,
//   });
  
//   client.connect()
//     .then(() => console.log('Connected to PostgreSQL database'))
//     .catch(err => console.error('Failed to connect to PostgreSQL database', err));
  
  
  
//   client.end();
  // app.use(bodyParser.json())
  // app.use(
  //   bodyParser.urlencoded({
  //     extended: true,
  //   })
  // )
  
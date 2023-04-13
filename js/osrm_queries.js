const axios = require('axios');

const getWaypoints = (profile, coordinates, bearings) => {

    

    const url = `http://router.project-osrm.org/nearest/v1/${profile}/${coordinates}?number=3&bearings=${bearings}`;
    console.log(url)
    axios.get(url)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
};


const getFastestRoute = (profile, coordinates) => {

  

    const url = `http://router.project-osrm.org/route/v1/${profile}/${coordinates}`;
    console.log(url)
    axios.get(url)
      .then(resp => {
        // response.json(resp.data)
        console.log(resp.data.routes.geometry.coordinates);
      })
      .catch(error => {
        console.log(error);
      });
};

getFastestRoute("driving", "-97.357945354999,37.703222581546854;-97.28990410342152,37.72088852207657")

const pageRender = (request, response) =>{


  res.setHeader('Content-Type', 'text/html');
  res.write('<!DOCTYPE html>');
  res.write('<html>');
  res.write('<head>');
  res.write('<meta charset="utf-8">');
  res.write('<title>Driving Directions</title>');
  res.write('<style>');
  res.write('#map { height: 400px; }');
  res.write('#directions-panel { margin-top: 20px; }');
  res.write('</style>');
  res.write('</head>');
  res.write('<body>');
  res.write('<div id="map"></div>');
  res.write('<div id="directions-panel"></div>');
  res.write('<script>');
  res.write('function initMap() {');
  
  // Display the map
  res.write('const map = new google.maps.Map(document.getElementById("map"), {');
  res.write('zoom: 8,');
  res.write('center: {');
  res.write(`lat: ${(originCoords[1] + destCoords[1]) / 2},`);
  res.write(`lng: ${(originCoords[0] + destCoords[0]) / 2}`);
  res.write('}');
  res.write('});');
  
  // Display the route
  res.write('const path = [];');
  res.write('const routeCoords = [');

  route.geometry.coordinates.forEach(coord => {
    res.write(`new google.maps.LatLng(${coord[1]}, ${coord[0]}),`);
  });
  
  res.write('];');
  res.write('const route = new google.maps.Polyline({');
  res.write('path: routeCoords,');
  res.write('geodesic: true,');
  res.write('strokeColor: "#FF0000",');
  res.write('strokeOpacity: 1.0,');
  res.write('strokeWeight: 2');
  res.write('});');
  res.write('route.setMap(map);');
  
  // Display the driving directions
  res.write(`const directionsRenderer = new google.maps.DirectionsRenderer({`);
  res.write(`map: map,`);
  res.write(`directions: {`);
  res.write(`routes: [`);
  res.write(`{`);
  res.write(`bounds: route.getBounds(),`);
  res.write(`legs: [`);
  
  route.legs.forEach(leg => {
    res.write(`{`);
    res.write(`start_address: "${leg.steps[0].intersections[0].location}",`);
    res.write(`end_address: "${leg.steps[leg.steps.length-1].intersections[leg.steps[leg.steps.length-1].intersections.length-1].location}",`);
    res.write(`steps: [`);
    
    leg.steps.forEach(step => {
      res.write(`{`);
      res.write(`instructions: "${step.name} ${step.ref ? "(" + step.ref + ")" : ""}",`);
      res.write(`distance: {
        text: "${step.distance.toFixed(1)} mi",
        value: ${step.distance.toFixed(1)}
    },`);

              res.write('}},');
              res.write(`duration: {`);
              res.write(`text: "${(step.duration / 60).toFixed(1)} mins",`);
              res.write(`value: ${step.duration.toFixed(0)}`);
              res.write('},');
              res.write('},');
            });
            
            res.write(`]`);
            res.write(`}`);
          });
          
          res.write(`]`);
          res.write(`}`);
          res.write(`}});`);
          res.write(`directionsRenderer.setPanel(document.getElementById("directions-panel"));`);
          res.write(`directionsRenderer.setOptions({suppressMarkers: true});`);
          res.write(`directionsRenderer.setDirections({routes: [{legs: [{steps: route.legs[0].steps}]}]});`);
          res.write(`}`);
          res.write('</script>');
          res.write(`<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAlcoiLrtWjyilkky2rKqhnRLiN7v3eZM0&callback=initMap"></script>`);
          res.write('</body>');
          res.write('</html>');
          
          res.end();
        



}

module.exports ={

    getWaypoints,
    getFastestRoute,
}

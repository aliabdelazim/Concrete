/**
 * Calculates and displays a car route from the Brandenburg Gate in the centre of Berlin
 * to Friedrichstraße Railway Station.
 *
 * A full list of available request parameters can be found in the Routing API documentation.
 * see: http://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html
 *
 * @param {H.service.Platform} platform A stub class to access HERE services
 */

var routetime = 0;
function calculateRouteFromAtoB(platform,start,end) {
  if(start.type)
  {

        var orgin = start.lat + "," + start.lng;
      var destination = end.lat + "," + end.lng;
      var router = platform.getRoutingService(null, 8),
          routeRequestParams = {
            routingMode: 'fast',
            transportMode: 'truck',
            origin: orgin, 
            destination: destination, 
            return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
          };

      router.calculateRoute(
        routeRequestParams,
        function(data){
          var route = data.routes[0];
         
          /*
           * The styling of the route response on the map is entirely under the developer's control.
           * A representative styling can be found the full JS + HTML code of this example
           * in the functions below:
           */
          addRouteShapeToMapPump(route,start);
        },
        onError
      );
  }
  else
  {

    var orgin = start.lat + "," + start.lng;
    var destination = end.lat + "," + end.lng;
    var router = platform.getRoutingService(null, 8),
        routeRequestParams = {
          routingMode: 'fast',
          transportMode: 'truck',
          origin: orgin, 
          destination: destination, 
          return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
        };
  
    router.calculateRoute(
      routeRequestParams,
      function(data){
        var route = data.routes[0];
       
        /*
         * The styling of the route response on the map is entirely under the developer's control.
         * A representative styling can be found the full JS + HTML code of this example
         * in the functions below:
         */
        addRouteShapeToMap(route,start);
      },
      onError
    );
  }
  
}
// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

function openTab(evt, listName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(listName).style.display = "block";
  evt.currentTarget.className += " active";
} 

var grouptruk = new H.map.Group();

//Comparer Function    
function GetSortOrder(prop) {    
  return function(a, b) {    
      if (a[prop] > b[prop]) {    
          return 1;    
      } else if (a[prop] < b[prop]) {    
          return -1;    
      }    
      return 0;    
  }    
}   

var firstJobnow = new Date(); 
function jobStartAttime(first,second){
   // var datetostart = new Date(first.taskStartTime)
    var datetostart = add_minutes(firstJobnow, first.taskStartTime);
    var datetostartRouting = add_minutes(datetostart, first.durationinsec);
    currentRoutetime = second.eta;
    var millisTill10 = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now;
    var millisTillRouting = new Date(datetostartRouting.getFullYear(), datetostartRouting.getMonth(), datetostartRouting.getDate(), datetostartRouting.getHours(), datetostartRouting.getMinutes(), datetostartRouting.getSeconds(), 0) - now;
    routetime = second.eta;
    var parisPngIcon = new H.map.Icon("http://localhost/routing/img/truck.png", {size: {w: 30, h: 30}});
    var parisMarker = new H.map.Marker({
    lat: first.lat,
    lng: first.lng
  }, {icon: parisPngIcon});
    if(millisTill10 < 0)
    {
      millisTill10 =0
    }
    if(millisTillRouting < 0)
    {
      millisTillRouting =0
    }
    var myVar = setTimeout(jobPickUpTask, millisTill10, parisMarker);
    var myVar2 = setTimeout(StartRouting, millisTillRouting, first, second,parisMarker);
   // setTimeout(function(){alert("It's 10am!")}, millisTill10);
}
var add_minutes =  function (dt, minutes) {
  return new Date(dt.getTime() + minutes*60000);
}
var add_seconds =  function (dt, second) {
  return new Date(dt.getTime() + second*1000);
}
function jobPickUpTask(parisMarker){
  
  map.addObject(parisMarker);
}
function StartRouting(start,end,parisMarker)
{
  map.removeObject(parisMarker);
  calculateRouteFromAtoB(platform,start,end);
}


function buttonClick(){
  now = new Date();
  firstJobnow = new Date(); 
  const url = 'http://localhost/routing/jobdata.json';
 
  fetch(
      url,
      {
          headers: { "Content-Type": "application/json" },         
          method: "Get"
      }
  )
  .then(data => data.json())
  .then((json) => {
    json.sort(GetSortOrder("sequence"));  
    var i =0;   
    for (var item in json) {    
      var firsttime = null;
      var job = json[item].tasks;
      job.sort(GetSortOrder("sequence"));    
      for (var task in job) {    
        if(firsttime == null)
        {
          firsttime = job[task];       
        } 
        else
        {
          var second = job[task];
          if(firsttime.type=='pump' )   
          {
            jobStartAttimepump(firsttime,second);
          }   
          else
          {
            jobStartAttime(firsttime,second);

          }
         
          firsttime = second;
        }   
     }
     i++;
    }
  });
}
function jobStartAttimepump(first,second)
{
  
    // var datetostart = new Date(first.taskStartTime)
     var datetostart = add_minutes(firstJobnow, first.taskStartTime);
     var datetostartRouting = add_minutes(datetostart, first.durationinsec);
     currentRoutetime = second.eta;
     var millisTill10 = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now;
     var millisTillRouting = new Date(datetostartRouting.getFullYear(), datetostartRouting.getMonth(), datetostartRouting.getDate(), datetostartRouting.getHours(), datetostartRouting.getMinutes(), datetostartRouting.getSeconds(), 0) - now;
     routetime = second.eta;
     var parisPngIcon = new H.map.Icon("http://localhost/routing/img/pump.png", {size: {w: 30, h: 30}});
     var parisMarker = new H.map.Marker({
     lat: first.lat,
     lng: first.lng
   }, {icon: parisPngIcon});
     if(millisTill10 < 0)
     {
       millisTill10 =0
     }
     if(millisTillRouting < 0)
     {
       millisTillRouting =0
     }
     var myVar = setTimeout(jobPickUpTask, millisTill10, parisMarker);
     var myVar2 = setTimeout(StartRouting, millisTillRouting, first, second,parisMarker);
    // setTimeout(function(){alert("It's 10am!")}, millisTill10);

}
/**
 * This function will be called once the Routing REST API provides a response
 * @param {Object} result A JSONP object representing the calculated route
 *
 * see: http://developer.here.com/rest-apis/documentation/routing/topics/resource-type-calculate-route.html
 */
function onSuccessPump(result) {
  var route = result.routes[0];

  /*
   * The styling of the route response on the map is entirely under the developer's control.
   * A representative styling can be found the full JS + HTML code of this example
   * in the functions below:
   */
  addRouteShapeToMapPump(route);
  
  // ... etc.
}
function onSuccess(result) {
  var route = result.routes[0];

  /*
   * The styling of the route response on the map is entirely under the developer's control.
   * A representative styling can be found the full JS + HTML code of this example
   * in the functions below:
   */
  addRouteShapeToMap(route);
  
  // ... etc.
}
var currentRoutetime;
/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param {Object} error The error message received.
 */
function onError(error) {
  alert('Can\'t reach the remote server');
}

/**
 * Boilerplate map initialization code starts below:
 */

// set up containers for the map + panel
var mapContainer = document.getElementById('map'),
  routeInstructionsContainer = document.getElementById('panel');

// Step 1: initialize communication with the platform
// In your own code, replace variable window.apikey with your own apikey
var platform = new H.service.Platform({
  apikey: "CHxAmo_Q-UwWjf3giMYx7zB5bhRfPOHTXtoxms7M9PE"
});

var defaultLayers = platform.createDefaultLayers();

// Step 2: initialize a map - this map is centered over Berlin 24.764842, 46.784035
var map = new H.Map(mapContainer,
  defaultLayers.vector.normal.map, {
  center: {lat: 24.720955,lng: 46.850254},
  zoom: 13,
  pixelRatio: window.devicePixelRatio || 1
});

function addMarkerToGroup(group, coord, html) {
  
  var parisPngIcon = new H.map.Icon("http://localhost/routing/img/factory.png", {size: {w: 56, h: 56}});
  var marker = new H.map.Marker({
    lat: coord.lat,
    lng: coord.lng
  }, {icon: parisPngIcon});
  // add custom data to the marker
  marker.setData(html);
  group.addObject(marker);
}
// add a resize listener to make sure that the map occupies the whole container
window.addEventListener('resize', () => map.getViewPort().resize());

// Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);
var factorySite = [];
var customer = false;
var customercord;
var customerMarker;
//map.addObject(custgroup);
var customerPngIcon = new H.map.Icon("http://localhost/routing/img/site.png", {size: {w: 56, h: 56}});

function buttonCustomer(){
  customer = true;
  if(customerMarker != null)
  {
    map.removeObject(customerMarker);  
  }
  
}

map.addEventListener('tap', function(evt) {
    // Log 'tap' and 'mouse' events:
      var coord = map.screenToGeo(evt.currentPointer.viewportX,evt.currentPointer.viewportY);
      
      if(customer)
      {    
              
         customerMarker = new H.map.Marker({
          lat: coord.lat,
          lng: coord.lng
        }, {icon: customerPngIcon});
        customercord = coord;
        map.addObject(customerMarker);
        customer = false;
      }
     
});
// Hold a reference to any infobubble opened
var bubble;

/**
 * Opens/Closes a infobubble
 * @param {H.geo.Point} position The location on the map.
 * @param {String} text          The contents of the infobubble.
 */
function openBubble(position, text) {
  if (!bubble) {
    bubble = new H.ui.InfoBubble(
      position,
      // The FO property holds the province name.
      {content: text});
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}


function addInfoBubble(map) {
  var group = new H.map.Group();

  map.addObject(group);

  // add 'tap' event listener, that opens info bubble, to the group
  group.addEventListener('tap', function (evt) {
    // event target is the marker itself, group is a parent event target
    // for all objects that it contains
    var bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
      // read custom data
      content: evt.target.getData()
    });
    // show info bubble
    ui.addBubble(bubble);
  }, false);

 
  
  for(i=0; i < factorySite.length; i++)   
  {
    var html =  '<div>Name : ' + factorySite[i].factorname + '</div>' +
    '<div>Address : ' + factorySite[i].address + '</div><div>Capacity: '+ factorySite[i].capacity + '</div>'
    addMarkerToGroup(group,{lat:factorySite[i].lat, lng:factorySite[i].lng},html);
  }
}

function removeRoute(groupRoutingline,start)
{
  console.log("End =>" + start.Truck.toString() + " => " + new Date().toLocaleTimeString() )
  groupRoutingline.removeAll();
}
/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
 //var dotIcon = new H.map.Icon("https://cdn3.iconfinder.com/data/icons/tourism/eiffel200.png", {size: {w: 56, h: 56}});
function addRouteShapeToMap(route,start) {
  var groupRoutingline = new H.map.Group();
  map.addObject(groupRoutingline);
  var poly =[];
  var now = new Date();
  console.log("Start => " + start.Truck.toString() + " " + now.toLocaleTimeString())
  route.sections.forEach((section) => {
    // decode LineString from the flexible polyline
    let pol = H.geo.LineString.fromFlexiblePolyline(section.polyline).getLatLngAltArray();
    let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
    var now = new Date();
    // Create a polyline to display the route:
    let polyline = new H.map.Polyline(linestring, {
      style: {
        lineWidth: 4,
        strokeColor: 'rgba(0, 128, 255, 0.7)'
      }
    });
    groupRoutingline.addObject(polyline);
    poly.push(pol);
  });
    var dateRemoveRoute = add_seconds(now, currentRoutetime*60);
    var millisTillend = new Date(dateRemoveRoute.getFullYear(), dateRemoveRoute.getMonth(), dateRemoveRoute.getDate(), dateRemoveRoute.getHours(), dateRemoveRoute.getMinutes(), dateRemoveRoute.getSeconds(), 0) - now; 
    var routerem = setTimeout(removeRoute,millisTillend,groupRoutingline,start)
    dotIcon1 = new H.map.Icon("http://localhost/routing/img/truck.png", {size: {w: 30, h: 30}});
    var groupRouting = new H.map.Group();
    
    map.addObject(groupRouting);
    var offset = poly[0].length/ (currentRoutetime * 60 *3);
    var offsetint = Math.ceil(offset);
    var numberOfPoints = poly[0].length/ 3
    var firstJobnow;
    
   // var datetostart = now;
    
    // Create a polyline to display the route:
    var second =0;
    var totallaps = currentRoutetime * 60;
    var totaltime = currentRoutetime * 60000;
    var traversed =0,x=0,y=0;
    // var timeUnit = totaltime/numberOfPoints;
     console.log(poly.length)
    for (i = 0; i <= totallaps;) {
     
        second++;
        traversed = offsetint * i+1
        if((numberOfPoints- traversed) <= (totallaps -i))
        {
          offsetint = 1;
        }
        x =  x +  (3*offsetint);
        y =  y +  (3*offsetint) +1;
       
        var datetostart = add_seconds(now, second);
      
        if(y>  poly[0].length)
        {
          
          var marker = new H.map.Marker({
          lat: poly[0][poly[0].length -3],
          lng: poly[0][poly[0].length -2]},
          {icon: dotIcon1});  
          var datetostart = add_seconds(datetostart, 60);
          var myVar = setTimeout(AddGraphics, millisTill10, marker, groupRouting); 
          var millisTillend = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now; 
          var myVar = setTimeout(RemoveEnd, millisTillend, marker, groupRouting,start);  

          break;    
        }
        
        var millisTill10 = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now;
        var marker = new H.map.Marker({
        lat: poly[0][x],
        lng: poly[0][y]},
        {icon: dotIcon1});
        i=i+1;
        if(i== totallaps)
        {
          
          var marker = new H.map.Marker({
          lat: poly[0][poly[0].length -3],
          lng: poly[0][poly[0].length -2]},
          {icon: dotIcon1});  
          var myVar = setTimeout(AddGraphics, millisTill10, marker, groupRouting);  
          var datetostart = add_seconds(datetostart, 60);  
          var millisTillend = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now; 
          var myVar = setTimeout(RemoveEnd, millisTillend, marker, groupRouting);  
        }
        var myVar = setTimeout(AddGraphics, millisTill10, marker, groupRouting);
    } 

   /*  var millisTill10 =0;
    for (i = 0; i < poly.length;i++) {
     
      var x = i * (3);
      var y = i * 3 +1;
      second++;
     // var datetostart = add_seconds(now, second);
      console.log(now.toLocaleTimeString());
      console.log(datetostart.toLocaleTimeString())
      console.log(x)
      console.log(y)
      
     // var millisTill10 = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now;
      var marker = new H.map.Marker({
      lat: poly[x],
      lng: poly[y]},
      {icon: dotIcon1});
      i=i+1;
      
      var myVar = setTimeout(AddGraphics, millisTill10, marker, groupRouting);
      millisTill10 = millisTill10 + timeUnit;
   //  groupRouting.addObject(marker);
   // marker.instruction = action.instruction;
     //AddGraphics(3000, marker,groupRouting);
  } */

  
}
function addRouteShapeToMapPump(route,start) {
  var groupRoutingline = new H.map.Group();
  map.addObject(groupRoutingline);
  var poly =[];
  var now = new Date();
  console.log("Start => " + start.Truck.toString() + " " + now.toLocaleTimeString())
  route.sections.forEach((section) => {
    // decode LineString from the flexible polyline
    let pol = H.geo.LineString.fromFlexiblePolyline(section.polyline).getLatLngAltArray();
    let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
    var now = new Date();
    // Create a polyline to display the route:
    let polyline = new H.map.Polyline(linestring, {
      style: {
        lineWidth: 4,
        strokeColor: 'rgba(0, 128, 255, 0.7)'
      }
    });
    groupRoutingline.addObject(polyline);
    poly.push(pol);
  });
    var dateRemoveRoute = add_seconds(now, currentRoutetime*60);
    var millisTillend = new Date(dateRemoveRoute.getFullYear(), dateRemoveRoute.getMonth(), dateRemoveRoute.getDate(), dateRemoveRoute.getHours(), dateRemoveRoute.getMinutes(), dateRemoveRoute.getSeconds(), 0) - now; 
    var routerem = setTimeout(removeRoute,millisTillend,groupRoutingline,start)
    dotIcon1 = new H.map.Icon("http://localhost/routing/img/pump.png", {size: {w: 30, h: 30}});
    var groupRouting = new H.map.Group();
    
    map.addObject(groupRouting);
    var offset = poly[0].length/ (currentRoutetime * 60 *3);
    var offsetint = Math.ceil(offset);
    var numberOfPoints = poly[0].length/ 3
    var firstJobnow;
    
   // var datetostart = now;
    
    // Create a polyline to display the route:
    var second =0;
    var totallaps = currentRoutetime * 60;
    var totaltime = currentRoutetime * 60000;
    var traversed =0,x=0,y=0;
    // var timeUnit = totaltime/numberOfPoints;
     console.log(poly.length)
    for (i = 0; i <= totallaps;) {
     
        second++;
        traversed = offsetint * i+1
        if((numberOfPoints- traversed) <= (totallaps -i))
        {
          offsetint = 1;
        }
        x =  x +  (3*offsetint);
        y =  y +  (3*offsetint) +1;
       
        var datetostart = add_seconds(now, second);
      
        if(y>  poly[0].length)
        {
          
          var marker = new H.map.Marker({
          lat: poly[0][poly[0].length -3],
          lng: poly[0][poly[0].length -2]},
          {icon: dotIcon1});  
          var datetostart = add_seconds(datetostart, 60);
          var myVar = setTimeout(AddGraphics, millisTill10, marker, groupRouting); 
          
         // var millisTillend = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now; 
        //  var myVar = setTimeout(RemoveEnd, millisTillend, marker, groupRouting);  

          break;    
        }
        
        var millisTill10 = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now;
        var marker = new H.map.Marker({
        lat: poly[0][x],
        lng: poly[0][y]},
        {icon: dotIcon1});
        i=i+1;
        if(i== totallaps)
        {
          
          var marker = new H.map.Marker({
          lat: poly[0][poly[0].length -3],
          lng: poly[0][poly[0].length -2]},
          {icon: dotIcon1});  
          var myVar = setTimeout(AddGraphics, millisTill10, marker, groupRouting);  
          var datetostart = add_seconds(datetostart, 60);  
        //  var millisTillend = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now; 
         // var myVar = setTimeout(RemoveEnd, millisTillend, marker, groupRouting);  
        }
        var myVar = setTimeout(AddGraphics, millisTill10, marker, groupRouting);
    } 

   /*  var millisTill10 =0;
    for (i = 0; i < poly.length;i++) {
     
      var x = i * (3);
      var y = i * 3 +1;
      second++;
     // var datetostart = add_seconds(now, second);
      console.log(now.toLocaleTimeString());
      console.log(datetostart.toLocaleTimeString())
      console.log(x)
      console.log(y)
      
     // var millisTill10 = new Date(datetostart.getFullYear(), datetostart.getMonth(), datetostart.getDate(), datetostart.getHours(), datetostart.getMinutes(), datetostart.getSeconds(), 0) - now;
      var marker = new H.map.Marker({
      lat: poly[x],
      lng: poly[y]},
      {icon: dotIcon1});
      i=i+1;
      
      var myVar = setTimeout(AddGraphics, millisTill10, marker, groupRouting);
      millisTill10 = millisTill10 + timeUnit;
   //  groupRouting.addObject(marker);
   // marker.instruction = action.instruction;
     //AddGraphics(3000, marker,groupRouting);
  } */

  
}
function RemoveEnd(marker,layer,start){
  console.log("End => " + start.Truck.toString() + " " + new Date().toLocaleTimeString())
  layer.removeAll();
}

function AddGraphics(marker,layer){
    layer.removeAll();
    layer.addObject(marker);
}

function toMMSS(duration) {
  return Math.floor(duration / 60) + ' minutes ' + (duration % 60) + ' seconds.';
}


const url = 'http://localhost/routing/factorydata.json';
 
fetch(
    url,
    {
        headers: { "Content-Type": "application/json" },         
        method: "Get"
    }
)
.then(data => data.json())
.then((json) => {
  json.sort(GetSortOrder("sequence"));  
  var i =0;   
  for (var item in json) { 
    var site = json[item];
    factorySite.push(site)
   }
   addInfoBubble(map);
});


var listOfItems = [
  {
    name: 'Peanuts',
    img: 'https://nuts.com/images/auto/801x534/assets/dd79402e574cd109.jpg',
    desc: 'First cultivated in the valleys of Paraguay.'
  },
  {
    name: 'Beans',
    img: 'https://www.rd.com/wp-content/uploads/2014/02/03-beans-lower-cholesterol-sl.jpg',
    desc: 'A summer crop that needs warm temperatures.'
  },
  {
    name: 'Lentils',
    img: 'https://5.imimg.com/data5/KV/EJ/MY-27379132/organic-masoor-dal-500x500.jpeg',
    desc: 'An edible pulse from a bushy annual plant.'
  }
];

listOfItems.forEach(function(itemType) {
  $('.items-list').append('<li><img src="' + itemType.img + '"><div><h2>' + itemType.name + '</h2><p>' + itemType.desc + '</p></div></li>');
});
const socket = io('https://9b547253.ngrok.io');
let data = new Array();
socket.on('instantPower', function(instantPower) {
    console.log(instantPower);
    data.push(instantPower);
    if ( data.length > 10 ) {
        data = data.slice(1, 11);
    }
    console.log(data);
    drawGraph();
});

const marker = d3.select("a-marker");
// let data = [ 10, 20, 30, 15, 25, 35, 40, 45, 50, 70, 100, 120];
let bars = marker.selectAll("a-box.bar").data(data);

function drawGraph() {
  // fake data
//   let data = [...new Array(10)].map( function(i) { return Math.random() * 150 } );
  let bars = marker.selectAll("a-box.bar").data(data);
  console.log( data );

  var colourScale = d3.scale.linear()
    .domain( [ 0, d3.max( data ) ] )
    .range( [ 'green', 'red' ] );


  // we scale the height of our bars using d3's linear scale
  var hscale = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, 3])

  // we use d3's enter/update/exit pattern to draw and bind our dom elements
  bars.enter().append("a-box").classed("bar", true);
  // we set attributes on our cubes to determine how they are rendered
  bars.attr({
    position: function(d,i) {
      var x = 0;
      var y = 0;
      var z = 0;
      return x + " " + y + " " + z
    },
    rotation: function(d,i) {
      var x = 0;
      var z = 0;
      // var y = -(i/data.length)*360;
      var y = 0;
      return x + " " + y + " " + z;
    },
    width: function(d) { return 0.1},
    depth: 0,
    height: function(d) { return 0.1},
    opacity: 0.9,
    color: colourScale
    //metalness: function(d,i) { return i/data.length}
  })

  bars.transition()
    .duration(500)
    .delay( function( d, i ) { return i * 100 } )
    .ease(d3.easeBack)
    .attrTween("depth", function(d) {
      return d3.interpolateNumber(0, hscale(d));
    })
    .attrTween("position", function(d,i) {
      var t = i;
      return function(i) {
        var height = d3.interpolateNumber(0, hscale(d));

        var x = 0.2 * t;
        var y = 0.5;
        var z = 0 - (height(i) / 2);
        return x + " " + y + " " + z;
      }
    });
}

let started = false;
let markerElement = document.querySelector("a-marker");
function update() {
  if(markerElement.object3D.visible == true && started === false) {
    started = true;
    drawGraph();
  } else if (markerElement.object3D.visible == false && started === true) {
    started = false;
    bars.remove();
  }
  window.requestAnimationFrame( update );
}

update();

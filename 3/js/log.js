function init_log() {
  switch_to('log');
  var margin = {top: 20, right: 120, bottom: 30, left: 150},
      width = 1280 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%d-%b-%y").parse;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(d3.time.format("%b %d"))
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var line = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.score); });

  var area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) { return y(d.score); });
  var svg = d3.select("#graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var data = [
      {date:'22-Feb-14',score:88.1},
      {date:'23-Feb-14',score:71.5},
      {date:'24-Feb-14',score:79.8},
      {date:'25-Feb-14',score:53.6},
      {date:'26-Feb-14',score:96.4},
      {date:'27-Feb-14',score:85.4},
      {date:'28-Feb-14',score:62.3},
      {date:'01-Mar-14',score:88.8},
      {date:'02-Mar-14',score:65.7},
      {date:'03-Mar-14',score:79.3},
      {date:'04-Mar-14',score:69.0},
      {date:'05-Mar-14',score:79.4},
      {date:'06-Mar-14',score:59.9},
      {date:'07-Mar-14',score:82.3}
    ]

    data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.score = +d.score;
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.score; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Score (%)");

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
}

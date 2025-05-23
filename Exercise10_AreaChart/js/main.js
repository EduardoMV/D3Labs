/*
*    main.js
*/

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    
var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
        "," + margin.top + ")");

// Time parser for x-scale
var parseTime = d3.timeParse("%d-%b-%y");

// Scales
var x = d3.scaleTime().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom();
var yAxisCall = d3.axisLeft();

// Area generator
var area = d3.area()
    .x(function(d) { return x(d.date); })
    .y0(function() { return y(0); })  // Bottom of the area (baseline)
    .y1(function(d) { return y(d.close); }); // Top of the area (data value)

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis");
        
// Y-Axis label
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Price ($)");

d3.tsv("data/area.tsv").then((data) => {
    data.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
    }); 

    x.domain(d3.extent(data, (d) => { return d.date; }));
    y.domain([0, d3.max(data, (d) => { return d.close; })]);

    // Generate axes once scales have been set
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));

    // Add area chart
    g.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("fill", "steelblue")
        .attr("d", area);
   
}).catch((error) => {
    console.log(error);
});
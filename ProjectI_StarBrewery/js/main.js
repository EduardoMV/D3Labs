var svg = d3.select("#chart-area")
  .append("svg")
  .attr("width", 600)
  .attr("height", 400)
  .style("background-color", "black");

d3.json("./data/revenues.json").then((data) => {
  data.forEach((d) => {
    d.revenue = +d.revenue;
  });

console.log(data);

var margin = { top: 30, right: 10, bottom: 100, left: 100 };
var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand()
  .domain(data.map(d => d.month))
  .range([0, width])
  .paddingInner(0.3)
  .paddingOuter(0.3);

var y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.revenue) / 1000])
  .range([height, 0]);

var color = d3.scaleOrdinal()
  .domain(data.map(d => d.month))
  .range(["#e6e600"]);

var rects = g.selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", d => x(d.month))
  .attr("y", d => y(d.revenue / 1000)) 
  .attr("width", x.bandwidth())
  .attr("height", d => height - y(d.revenue / 1000))
  .attr("fill", d => color(d.month));

var xAxisCall = d3.axisBottom(x);
g.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxisCall)
  .selectAll("text")
    .attr("y", "10")
    .attr("x", "-5")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-40)")
    .attr("fill", "white");

var yAxisCall = d3.axisLeft(y)
  .ticks(11)
  .tickFormat(d => "$" + d + "k");
g.append("g")
  .attr("class", "y axis")
  .call(yAxisCall)
  .selectAll("text")
    .attr("fill", "white");

g.append("text")
  .attr("class", "x axis-label")
  .attr("x", width / 2)
  .attr("y", height + 70)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Month")
  .attr("fill", "white");

g.append("text")
  .attr("class", "y axis-label")
  .attr("x", -(height / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Revenue (dlls.)")
  .attr("fill", "white");

g.selectAll(".domain, .tick line")
  .attr("stroke", "white");


}).catch((error) => {
  console.error("404 JSON file not found", error);
});
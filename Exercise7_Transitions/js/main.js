var margin = { top: 30, right: 10, bottom: 100, left: 100 };
var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var flag = true;

var svg = d3.select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("background-color", "black");

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand()
  .range([0, width])
  .padding(0.2);

var y = d3.scaleLinear()
  .range([height, 0]);

var xAxisGroup = g.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")");

var yAxisGroup = g.append("g")
  .attr("class", "y axis");

g.append("text")
  .attr("class", "x axis-label")
  .attr("x", width / 2)
  .attr("y", height + 70)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("fill", "white")
  .text("Month");

var yLabel = g.append("text")
  .attr("class", "y axis-label")
  .attr("x", -(height / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .attr("fill", "white")
  .text("Revenue");

d3.json("./data/revenues.json").then((data) => {
  data.forEach((d) => {
    d.revenue = +d.revenue;
    d.profit = +d.profit;
  });

  d3.interval(() => {
    var newData = flag ? data : data.slice(1);
	  update(newData);
	  flag = !flag;
  }, 1000);

  update(data);

}).catch((error) => {
  console.error("404 JSON file not found", error);
});

function update(data) {
  var value = flag ? "revenue" : "profit";

  x.domain(data.map((d) => d.month));
  y.domain([0, d3.max(data, (d) => d[value])]);

  var xAxisCall = d3.axisBottom(x);
  xAxisGroup.call(xAxisCall)
    .selectAll("text")
    .attr("y", "10")
    .attr("x", "-5")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-40)")
    .attr("fill", "white");

  var yAxisCall = d3.axisLeft(y)
    .ticks(11)
    .tickFormat(d => "$" + (d/1000) + "k");
  yAxisGroup.call(yAxisCall)
    .selectAll("text")
    .attr("fill", "white");

  var label = flag ? "Revenue" : "Profit";
  yLabel.text(label);

  var rects = g.selectAll("rect")
    .data(data, d => d.month);

  rects.exit().remove();

  g.selectAll(".domain, .tick line")
    .attr("stroke", "white");

  rects
    .attr("x", (d) => x(d.month))
    .attr("y", (d) => y(d[value]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[value]))
    .attr("fill", "yellow");

  rects.enter().append("rect")
    .attr("x", (d) => x(d.month))
    .attr("y", (d) => y(d[value]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[value]))
    .attr("fill", "yellow");
}

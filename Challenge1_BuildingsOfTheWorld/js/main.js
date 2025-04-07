var svg = d3.select("#chart-area")
  .append("svg")
  .attr("width", 500)
  .attr("height", 400);

d3.json("../data/buildings.json").then((data) => {
  data.forEach((d) => {
    d.height = +d.height;
  });

  console.log(data);

  var heightScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.height)])
    .range([0, 350]);

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 50)
    .attr("y", d => 400 - heightScale(d.height) - 40)
    .attr("width", 30)
    .attr("height", d => heightScale(d.height))
    .attr("fill", "steelblue");

}).catch((error) => {
  console.error("404 JSON file not found", error);
});

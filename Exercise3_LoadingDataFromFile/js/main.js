var svg = d3.select("#chart-area")
  .append("svg")
  .attr("width", 400)
  .attr("height", 400);

// d3.csv("../data/ages.csv").then((data)=> {
//   console.log(data);
// });

// d3.tsv("../data/ages.tsv").then((data)=> {
// 	console.log(data);
// });

d3.json("../data/ages.json").then((data)=> {
	data.forEach((d)=>{
		d.age = +d.age;
	});
	console.log(data);

  svg.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", (d, i) => i * 60 + 30)
  .attr("cy", d => 150)
  .attr("r", d => d.age * 2)
  .attr("fill", d => d.age > 10 ? "darkblue" : "steelblue");

}).catch((error) => {
  console.error("404 JSON file not found", error);
});

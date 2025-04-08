const margin = { top: 50, right: 100, bottom: 80, left: 100 };
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
let currentYear = 0;
let isPlaying = false;
let interval;
let selectedContinent = "All";
let processedData = [];

const svg = d3.select("#chart-area")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleLog()
  .base(10)
  .domain([142, 150000])
  .range([0, width]);

const yScale = d3.scaleLinear()
  .domain([0, 90])
  .range([height, 0]);

const radiusScale = d3.scaleSqrt()
  .domain([2000, 1400000000])
  .range([5, 40]);

const colorScale = d3.scaleOrdinal()
  .range(d3.schemePastel1);

const xAxis = d3.axisBottom(xScale)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format("$,"));

const yAxis = d3.axisLeft(yScale);

svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis);

svg.append("g")
  .attr("class", "y-axis")
  .call(yAxis);

svg.append("text")
  .attr("x", width/2)
  .attr("y", height + 50)
  .style("text-anchor", "middle")
  .text("Income per capita (GDP)");

svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -50)
  .attr("x", -height/2)
  .style("text-anchor", "middle")
  .text("Life Expectancy (years)");

const yearLabel = svg.append("text")
  .attr("x", width - 40)
  .attr("y", height - 20)
  .attr("text-anchor", "end")
  .style("font-size", "40px")
  .style("fill", "#ddd");

const tooltip = d3.select("#tooltip");

d3.json("data/data.json").then(data => {
  processedData = data.map(yearEntry => ({
    year: yearEntry.year,
    countries: yearEntry.countries
      .filter(d => d.income && d.life_exp && d.population)
      .map(d => ({
        ...d,
        income: +d.income,
        life_exp: +d.life_exp,
        population: +d.population
      }))
  }));

  const continents = [...new Set(processedData.flatMap(d => d.countries.map(c => c.continent)))];
  colorScale.domain(continents);

  const legend = svg.append("g")
    .attr("transform", `translate(${width - 120}, 30)`);

  continents.forEach((continent, i) => {
    const legendRow = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    legendRow.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", colorScale(continent));

    legendRow.append("text")
      .attr("x", 25)
      .attr("y", 15)
      .text(continent);
  });

  const continentFilter = d3.select("#continent-filter");
  continentFilter.selectAll("option")
    .data(["All", ...continents])
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  d3.select("#year-slider")
    .attr("max", processedData.length - 1)
    .on("input", function() {
      currentYear = +this.value;
      if(isPlaying) togglePlay();
      updateChart();
    });

  updateChart();
  updateSlider();

  d3.select("#play-button").on("click", () => {
    if (!isPlaying) togglePlay();
  });
  
  d3.select("#pause-button").on("click", () => {
    if (isPlaying) togglePlay();
  });
  
  d3.select("#reset").on("click", resetChart);
  d3.select("#continent-filter").on("change", function() {
    selectedContinent = this.value;
    updateChart();
  });
}).catch(error => console.error("Data loading error:", error));

function updateChart() {
  let yearData = processedData[currentYear];
  let filteredData = selectedContinent === "All" 
    ? yearData.countries 
    : yearData.countries.filter(d => d.continent === selectedContinent);

  const circles = svg.selectAll("circle")
    .data(filteredData, d => d.country);

  circles.exit().remove();

  circles.enter()
    .append("circle")
    .attr("cx", width/2)
    .attr("cy", height/2)
    .attr("r", 0)
    .attr("fill", d => colorScale(d.continent))
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip)
    .transition().duration(1000)
      .attr("cx", d => xScale(d.income))
      .attr("cy", d => yScale(d.life_exp))
      .attr("r", d => Math.max(2, radiusScale(d.population)));

  circles.transition()
    .duration(1000)
    .attr("cx", d => xScale(d.income))
    .attr("cy", d => yScale(d.life_exp))
    .attr("r", d => Math.max(2, radiusScale(d.population)));

  yearLabel.text(yearData.year);
  updateSlider();
}

function togglePlay() {
  isPlaying = !isPlaying;
  d3.select("#play-pause span")
    .classed("glyphicon-play", !isPlaying)
    .classed("glyphicon-pause", isPlaying);

  if(isPlaying) {
    interval = d3.interval(() => {
      currentYear = (currentYear + 1) % processedData.length;
      updateChart();
    }, 1000);
  } else {
    interval.stop();
  }
}

function resetChart() {
  currentYear = 0;
  if(isPlaying) togglePlay();
  updateChart();
}

function updateSlider() {
  d3.select("#year-slider")
    .property("value", currentYear);
  
  d3.select("#slider-value")
    .text(processedData[currentYear]?.year || "");
}

function showTooltip(event, d) {
  tooltip.classed("hidden", false)
    .html(`
      <p><strong>Country:</strong> ${d.country}</p>
      <p><strong>Continent:</strong> ${d.continent}</p>
      <p><strong>Income:</strong> $${d3.format(",")(d.income)}</p>
      <p><strong>Life Expectancy:</strong> ${d.life_exp} years</p>
      <p><strong>Population:</strong> ${d3.format(",")(d.population)}</p>
    `);
}

function moveTooltip(event) {
  tooltip.style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 20}px`);
}

function hideTooltip() {
  tooltip.classed("hidden", true);
}
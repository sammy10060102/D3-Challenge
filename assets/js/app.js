// @TODO: YOUR CODE HERE!

d3.select(window).on("resize", makeResponsive);

// make responsive function
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
        makeChart();
    }
}

// Initialise the chart by calling makeChart
makeChart();

function makeChart() {
    // Setup my chart parameters
    var svgWidth = window.innerWidth - window.innerWidth / 3;
    var svgHeight = window.innerHeight - window.innerHeight / 2;

    var margin = {
        top: 20,
        right: 40,
        bottom: 60,
        left: 120
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var chartGroup = svg.append("g")
        .attr("class", "chart")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Import Data
    d3.csv("./assets/data/data.csv").then(function (healthData) {

        // Step 1: Parse Data/Cast as numbers
        // ==============================
        healthData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

        console.log(healthData);

        // Step 2: Create scale functions
        // ==============================
        var xLinearScale = d3.scaleLinear()
            // adding -1 to nudge the visualisation to the right
            .domain([(d3.min(healthData, d => d.poverty) - 1), d3.max(healthData, d => d.poverty)])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(healthData, d => d.healthcare)])
            .range([height, 0]);

        // Step 3: Create axis functions
        // ==============================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Step 4: Append Axes to the chart
        // ==============================
        chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .attr("class", "y-axis")
            .call(leftAxis);

        // Step 5: Create Circles
        // ==============================
        var circlesGroup = chartGroup.append("g")
            .attr("class", "stateCircle")
            .selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "15");
        // .attr("fill", "blue")
        // .attr("opacity", ".20");

        // Step 6: Create text Group
        // ==============================
        var textGroup = chartGroup.append("g")
            .attr("class", "stateText aText")
            .selectAll("text")
            .data(healthData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d.poverty))
            .attr("y", d => yLinearScale(d.healthcare) + 4)
            .text(d => d.abbr);

        // Step 7: Initialize tool tip
        // ==============================
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function (d) {
                return (`${d.state}<br>Poverty (%): ${d.poverty}<br>Healthcare (%): ${d.healthcare}`);
            });

        // Step 8: Create tooltip in the chart
        // ==============================
        chartGroup.call(toolTip);

        // Step 9: Create event listeners to display and hide the tooltip
        // ==============================
        textGroup.on("mouseover", function (data) {
            toolTip.show(data, this);
        })
            // onmouseout event
            .on("mouseout", function (data, index) {
                toolTip.hide(data);
            });

        // Create axes labels - Healthcare vs. Poverty 
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "aText active")
            .text("Lack of Helathcare (%)");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("class", "aText active")
            .text("Poverty (%)");
    }).catch(function (error) {
        console.log(error);
    });

}

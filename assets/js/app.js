// @TODO: YOUR CODE HERE!

// set chart size limits
var svgWidth = 900;
var svgHeight = 600;

// set chart size margins
var chartMargin = {
    top: 40,
    right: 40,
    bottom: 90,
    left: 100
};

// Define dimensions of the chart area
var width = svgWidth - chartMargin.left - chartMargin.right;
var height = svgHeight - chartMargin.top - chartMargin.bottom;

//select body, append SVG area to it, set the dimensions
var svg = d3.select("#scatter")
    .append("svg")
    .attr('height', svgHeight)
    .attr('width', svgWidth);


// Append a group to the SVG area and shift ('translate') it to the right and down to adhere to the margins set in the "charMargin" object.

var chartGroup = svg.append("g")
    .attr('transform', `translate(${chartMargin.left}, ${chartMargin.top})`);

var chosenXAxis ="poverty"
var chosenYAxis ="smokes"

// function used for updating x-scale var upon click on axis label
function xScale(cData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(cData, d => d[chosenXAxis]) * 0.8,
        d3.max(cData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}

function yScale(cData, chosenYAxis) {

    var yLinearScale = d3.scaleLinear()
      .domain([d3.max(cData, d => d[chosenYAxis]) * 1.2,
        d3.min(cData, d => d[chosenYAxis]) * 0.8
      ])
      .range([0, height]);
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click y axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    ///.attr("cy", d => newYScale(d[chosenYAxis]));  ************************
  return circlesGroup;
}

// new state abbr labels inside of circles
function renderCirLabels(textElems, newXScale, chosenXAxis) {
    textElems.transition()
    .duration(1500)
    .attr('x', d => newXScale(d[chosenXAxis]))
    ///.attr('y', d => newYScale(d[chosenYAxis]));  ****************************
    
    return textElems
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    
    var labelX;
    
    if (chosenXAxis === "poverty") {
        labelX = "Poverty: ";
    }
    else if (chosenXAxis === 'age') {
        labelX = "Age: ";
    }
    else {
        labelX = 'Income: ';
    }
    
    var labelY;
    
    if (chosenYAxis === "smokes") {
        labelY = "Smokers: ";
    }
    else if (chosenYAxis === 'obesity') {
        labelY = "Obesity: ";
    }
    else {
        labelY = 'No Healthcare: ';
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {

        return (`${d.state}<br> ${labelX} ${d[chosenXAxis]} <br>${labelY} ${d[chosenYAxis]}`);
        });
    
        circlesGroup.call(toolTip);
    
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // onmouseout event
       .on("mouseout", function(data, index) {
        toolTip.hide(data);
        });
    
        return circlesGroup;
    }

//     // function used for updating circles group with new tooltip
// function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    
//     var labelY;
    
//     if (chosenYAxis === "smokes") {
//         labelY = "Smokers: ";
//     }
//     else if (chosenYAxis === 'obesity') {
//         labelY = "Obesity: ";
//     }
//     else {
//         labelY = 'No Healthcare: ';
//     }
    
//     var toolTip = d3.tip()
//         .attr("class", "tooltip")
//         .offset([80, -60])
//         .html(function(d) {
//         return (`${d.state}<br> ${labelX} ${d[chosenXAxis]} <br>${labelY} ${d[chosenYAxis]}`);
//         });
    
//         circlesGroup.call(toolTip);
    
//     circlesGroup.on("mouseover", function(data) {
//         toolTip.show(data);
//     })
//         // onmouseout event
//        .on("mouseout", function(data, index) {
//         toolTip.hide(data);
//         });
    
//         return circlesGroup;
//     }


// load the data from the csv file
d3.csv("assets/data/data.csv").then(function(cData, err){
    if(err) throw err;

    //console log the data so you can make sure it is loading properly
    //console.log(cData);

    //Cast the poverty, healthcare, age, income, obesity, smokes value to a number for each piece of cData
    cData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(cData, chosenXAxis);

    var yLinearScale = yScale(cData, chosenYAxis);

    // var yLinearScale = d3.scaleLinear()
    //     .domain ([0, d3.max(cData, d => d.poverty)])
    //     .range ([height, 0]);
  
    //Create the initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append('g')
        .classed("x-axis", true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append('g')
        .classed("y-axis", true)
        // .attr('transform', `translate(0, ${width})`)
        .call(leftAxis);

    // chartGroup.append('g')
    //     .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(cData)
        .enter()
        .append('circle')
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', 20)
        .style('fill', 'red')
        .attr('opacity', '.75')

    var textElems = chartGroup
        .selectAll('stateCircle')
        .data(cData)
        .enter().append('text')
        .text(function(d){return d.abbr})
        .attr('font-size', 13)
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis])+5)
        .attr('text-anchor', 'center')
        .attr('class', 'stateText')

  // Create group for 3 x-axis labels
    var XlablesGroup = chartGroup.append('g')
        .attr('transform', `translate(${width/2}, ${height + 20})`);
    
    var povertyLabel = XlablesGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')//value to grab for event listener
        .classed('active', true)
        .attr("data-value","poverty")
        .attr("class", "aText active x")
        .text('In Poverty (%)');    
    
    var ageLabel = XlablesGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')//value to grab for event listener
        .attr("data-value","age")
        .classed('inactive', true)
        .attr("class", "aText inactive x")
        .text('Age (Median)'); 
    
    var incomeLabel = XlablesGroup.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')//value to grab for event listener
        .attr("data-value","income")
        .classed('inactive', true)
        .attr("class", "aText inactive x")
        .text('Household Income (Median)');     
  
    // append y axis
    // chartGroup.append('text')
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - chartMargin.left)
    //     .attr("x", 0 - (height / 2))
    //     .attr("dy", "1em")
    //     .classed("axis-text", true)
    //     .text("Lacks Healthcare (%)");

    var YlablesGroup = chartGroup.append('g')

        .attr("dy", "1em")
        .classed("axis-text", true)
    
    var smokesLabel = YlablesGroup.append('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 20- chartMargin.left)
        .attr("x", 0 - (height / 2))
        .attr("data-value", "smokes")
        .attr("class", "bText active x")
        .text("Smokes (%)")
        .classed('active', true)

    var obeseLabel = YlablesGroup.append('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 40 - chartMargin.left)
        .attr("x", 0 - (height / 2))
        .attr("data-value", "obesity")
        .attr("class", "bText active x")
        .text("Obese (%)")
        .classed('inactive', true)

    var healthcareLabel = YlablesGroup.append('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 60 - chartMargin.left)
        .attr("x", 0 - (height / 2))
        .attr("data-value", "healthcare")
        .attr("class", "bText active x")
        .text("Lacks Heathcare (%)")
        .classed('inactive', true)

    //updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    XlablesGroup.selectAll(".aText")
       
        .on("click", function() {
            // get value of selection
            var self = d3.select(this)
            var value = self.attr('data-value');
                //console.log("Value ",value)
            
            if (value !== chosenXAxis) {
                // replace chosenXAxis with value
                chosenXAxis = value;
                // conosole.log(chosenXAxis)
                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(cData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);
                // yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                textElems  = renderCirLabels(textElems, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
                // changes classe to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if (chosenXAxis === "age"){
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', true)
                        .classed('inactive', false);

                console.log(chosenXAxis)
                }
            }
        });

        // x axis labels event listener
    YlablesGroup.selectAll(".bText")
       
        .on("click", function() {
            // get value of selection
            var self = d3.select(this)
            var value = self.attr('data-value');
                //console.log("Value ",value)
            
            if (value !== chosenYAxis) {
                // replace chosenXAxis with value
                chosenYAxis = value;
                // conosole.log(chosenYAxis)
                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(cData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

                textElems  = renderCirLabels(textElems, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
  
                // changes classe to change bold text
                if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    obeseLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if (chosenYAxis === "obesity"){
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    obeseLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else {
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    obeseLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', true)
                        .classed('inactive', false);

                console.log(chosenYAxis)
                }
            }
        });
        
        // .catch(function(error){
        // console.log(error);
    });
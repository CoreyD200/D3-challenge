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
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr('height', svgHeight)
    .attr('width', svgWidth);


// Append a group to the SVG area and shift ('translate') it to the right and down to adhere to the margins set in the "charMargin" object.

var chartGroup = svg.append("g")
    .attr('transform', `translate(${chartMargin.left}, ${chartMargin.top})`);

var chosenXAxis ="age";
var chosenYAxis ="healthcare";

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
  
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
 
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
  
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    
    var label;
    
    if (chosenXAxis === "poverty") {
        label = "Poverty: ";
    }
    else if (chosenXAxis === 'age') {
        label = "Age: ";
    }
    else {
        label = 'Income: ';
    }
    
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
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

// load the data from the csv file
d3.csv("assets/data/data.csv").then(function(cData, err){
    if(err) throw err;

    //console log the data so you can make sure it is loading properly
    console.log(cData);

    //Cast the poverty, healthcare, age, income, obesity, smokes value to a number for each piece of cData
    cData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(cData, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
        .domain ([0, d3.max(cData, d => d.healthcare)])
        .range ([height, 0]);
  
    //Create the initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append('g')
        .classed("x-axis", true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append('g')
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(cData)
        .enter()
        .append('circle')
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d.healthcare))
        .attr('r', 20)
        .style('fill', 'red')
        .attr('opacity', '.75')
        .attr('class', function(d){return 'stateCircle' + d.abbr})
    
    const textElems = chartGroup
        .selectAll('stateCircle')
        .data(cData)
        .enter().append('text')
        .text(function(d){return d.abbr})
        .attr('font-size', 8)
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d.healthcare))
        .attr('text-anchor', 'center')
        .attr('class', 'stateText')

  // Create group for 3 x-axis labels
    var lablesGroup = chartGroup.append('g')
        .attr('transform', `translate(${width/2}, ${height + 20})`);
    
    var povertyLabel = lablesGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')//value to grab for event listener
        .classed('active', true)
        .text('In Poverty (%)');    
    
    var ageLabel = lablesGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')//value to grab for event listener
        .classed('inactive', true)
        .text('Age (Median)'); 
    
    var incomeLabel = lablesGroup.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')//value to grab for event listener
        .classed('inactive', true)
        .text('Household Income (Median)');     
  
    // append y axis
    chartGroup.append('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartMargin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    //updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    lablesGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr('value)');
            if (value !== chosenXAxis) {
                // replace chosenXAxis with value
                chosenXAxis = value;
                console.log(chosenXAxis)
                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(cData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

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
    }).catch(function(error){
        console.log(error);
    });


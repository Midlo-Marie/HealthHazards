// D3 and Javascript script to generate scatter plot
// with selectable axes

// Set page and chart parameters
let svgWidth = 960;
let svgHeight = 620;

let margin = { top: 20, right: 20, bottom: 150, left: 80 };

// Calculate chart height and width within the svs "view"
let width = svgWidth - margin.right - margin.left;
let height = svgHeight - margin.top - margin.bottom;

// append a div class to the empty "scatter" element in the HTML sript
let chart = d3.select('#scatter')
  .append('div')
  .classed('chart', true);

//append an svg element to the chart 
let svg = chart.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

//append an svg group
let chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

//initial parameters; x and y axis, based on high correlation

let chosenXAxis = 'poverty';
let chosenYAxis = 'healthcare';

//a function for updating the x-scale variable upon click of label
function xScale(healthData, chosenXAxis) {
  //scales
  let xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;
}
//a function for updating y-scale variable upon click of label
function yScale(healthData, chosenYAxis) {
//scales
let yLinearScale = d3.scaleLinear()
  .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
    d3.max(healthData, d => d[chosenYAxis]) * 1.2])
  .range([height, 0]);

return yLinearScale;
}
//a function for updating the xAxis upon click
function renderXAxis(newXScale, xAxis) {
let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
  .duration(2000)
  .call(bottomAxis);

return xAxis;
}

//function used for updating yAxis variable upon click
function renderYAxis(newYScale, yAxis) {
var leftAxis = d3.axisLeft(newYScale);

yAxis.transition()
  .duration(2000)
  .call(leftAxis);

return yAxis;
}

//a function for updating the circles with a transition to new circles 
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(2000)
    .attr('cx', data => newXScale(data[chosenXAxis]))
    .attr('cy', data => newYScale(data[chosenYAxis]))

  return circlesGroup;
}

//function for updating STATE labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(2000)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]));

  return textGroup
}
//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

  //style based on variable
  //poverty
  if (chosenXAxis === 'poverty') {
      return `${value}%`;
  }
  //household income
  else if (chosenXAxis === 'income') {
      return `${value}`;
  }
  else {
    return `${value}`;
  }
}

//funtion for updating circles group
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  //poverty
  if (chosenXAxis === 'poverty') {
    var xLabel = 'Poverty:';
  }
  //income
  else if (chosenXAxis === 'income'){
    var xLabel = 'Median Income:';
  }
  //age
  else {
    var xLabel = 'Age:';
  }
//Y label
//healthcare
if (chosenYAxis ==='healthcare') {
  var yLabel = "No Healthcare:"
}
else if(chosenYAxis === 'obesity') {
  var yLabel = 'Obesity:';
}
//smoking
else{
  var yLabel = 'Smokers:';
}

//create tooltip
var toolTip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-1, 0])
  .html(function(d) {
      return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
});

circlesGroup.call(toolTip);

//add
circlesGroup.on('mouseover', toolTip.show)
  .on('mouseout', toolTip.hide);

  return circlesGroup;
}

d3.csv("./assets/data/data_regional.csv").then (function(healthData) {
  console.log(healthData[0]);
// Assign values to variables from the csv file, parse by column name
  
  //Parse data
  healthData.forEach(function(data){
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.region = +data.region
  });

//create linear scales
  var xLinearScale = xScale(healthData, chosenXAxis);
  var yLinearScale = yScale(healthData, chosenYAxis);

//create x axis
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

//append X
  var xAxis = chartGroup.append('g')
  .classed('x-axis', true)
  .attr('transform', `translate(0, ${height})`)
  .call(bottomAxis);

//append Y
  var yAxis = chartGroup.append('g')
  .classed('y-axis', true)
  //.attr
  .call(leftAxis);

//append Circles
  var circlesGroup = chartGroup.selectAll('circle')
  .data(healthData)
  .enter()
  .append('circle')
  .classed('stateCircle', true)
  .attr('cx', d => xLinearScale(d[chosenXAxis]))
  .attr('cy', d => yLinearScale(d[chosenYAxis]))
  .attr('r', 14)
  .attr('opacity', '.5')
  .style("fill", function(d) {
    var returnColor;
    if( d.region === 1){returnColor = "red";}
    else if (d.region === 2) {returnColor = "purple";}
    else if (d.region === 3) {returnColor = "yellow";}
    else if (d.region === 4) {returnColor = "green";}
    else if (d.region === 5) {returnColor = "blue";}
    else if (d.region === 6) {returnColor = "cyan";}
    else if (d.region === 7) {returnColor = "magenta";}
    return returnColor;
  });

//append Initial Text
  var textGroup = chartGroup.selectAll('.stateText')
  .data(healthData)
  .enter()
  .append('text')
  .classed('stateText', true)
  .attr('x', d => xLinearScale(d[chosenXAxis]))
  .attr('y', d => yLinearScale(d[chosenYAxis]))
  .attr('dy', 3)
  .attr('font-size', '10px')
  // .attr('font-decorator-color', 'black')
  .text(function(d){return d.abbr});

 //create a group for the x axis labels
  var xLabelsGroup = chartGroup.append('g')
 .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

  var povertyLabel = xLabelsGroup.append('text')
 .classed('aText', true)
 .classed('active', true)
 .attr('x', 0)
 .attr('y', 20)
 .attr('value', 'poverty')
 .text('In Poverty (%)');
 
  var ageLabel = xLabelsGroup.append('text')
 .classed('aText', true)
 .classed('inactive', true)
 .attr('x', 0)
 .attr('y', 40)
 .attr('value', 'age')
 .text('Age (Median)');  

  var incomeLabel = xLabelsGroup.append('text')
 .classed('aText', true)
 .classed('inactive', true)
 .attr('x', 0)
 .attr('y', 60)
 .attr('value', 'income')
 .text('Household Income (Median)')

//create a group for Y labels
  var yLabelsGroup = chartGroup.append('g')
 .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

  var healthcareLabel = yLabelsGroup.append('text')
 .classed('aText', true)
 .classed('active', true)
 .attr('x', 0)
 .attr('y', 0 - 20)
 .attr('dy', '1em')
 .attr('transform', 'rotate(-90)')
 .attr('value', 'healthcare')
 .text('Without Healthcare (%)');

  var smokesLabel = yLabelsGroup.append('text')
 .classed('aText', true)
 .classed('inactive', true)
 .attr('x', 0)
 .attr('y', 0 - 40)
 .attr('dy', '1em')
 .attr('transform', 'rotate(-90)')
 .attr('value', 'smokes')
 .text('Smoker (%)');

  var obesityLabel = yLabelsGroup.append('text')
 .classed('aText', true)
 .classed('inactive', true)
 .attr('x', 0)
 .attr('y', 0 - 60)
 .attr('dy', '1em')
 .attr('transform', 'rotate(-90)')
 .attr('value', 'obesity')
 .text('Obese (%)');

//update the toolTip
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

//x axis event listener
  xLabelsGroup.selectAll('text')
 .on('click', function() {
   var value = d3.select(this).attr('value');

   if (value != chosenXAxis) {

     //replace chosen x with a value
     chosenXAxis = value; 

     //update x for new data
     xLinearScale = xScale(healthData, chosenXAxis);

     //update x 
     xAxis = renderXAxis(xLinearScale, xAxis);

     //upate circles with a new x value
     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

     //update text 
     textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

     //update tooltip
     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

     //change of classes changes text
     if (chosenXAxis === 'poverty') {
       povertyLabel.classed('active', true).classed('inactive', false);
       ageLabel.classed('active', false).classed('inactive', true);
       incomeLabel.classed('active', false).classed('inactive', true);
     }
     else if (chosenXAxis === 'age') {
       povertyLabel.classed('active', false).classed('inactive', true);
       ageLabel.classed('active', true).classed('inactive', false);
       incomeLabel.classed('active', false).classed('inactive', true);
     }
     else {
       povertyLabel.classed('active', false).classed('inactive', true);
       ageLabel.classed('active', false).classed('inactive', true);
       incomeLabel.classed('active', true).classed('inactive', false);
     }
   }
 });
//y axis lables event listener
  yLabelsGroup.selectAll('text')
 .on('click', function() {
   var value = d3.select(this).attr('value');

   if(value !=chosenYAxis) {
       //replace chosenY with value  
       chosenYAxis = value;

       //update Y scale
       yLinearScale = yScale(healthData, chosenYAxis);

       //update Y axis 
       yAxis = renderYAxis(yLinearScale, yAxis);

       //Udate CIRCLES with new y
       circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

       //update TEXT with new Y values
       textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

       //update tooltips
       circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

       //Change of the classes changes text
       if (chosenYAxis === 'obesity') {
         obesityLabel.classed('active', true).classed('inactive', false);
         smokesLabel.classed('active', false).classed('inactive', true);
         healthcareLabel.classed('active', false).classed('inactive', true);
       }
       else if (chosenYAxis === 'smokes') {
         obesityLabel.classed('active', false).classed('inactive', true);
         smokesLabel.classed('active', true).classed('inactive', false);
         healthcareLabel.classed('active', false).classed('inactive', true);
       }
       else {
         obesityLabel.classed('active', false).classed('inactive', true);
         smokesLabel.classed('active', false).classed('inactive', true);
         healthcareLabel.classed('active', true).classed('inactive', false);
       }
     }
   });
});
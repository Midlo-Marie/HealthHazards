const scatterUrl = "/api/chart/bubble";

let year = 2014;
let cause = "All causes"

    // Fetch the JSON data and console log it
d3.json(scatterUrl, function(data) {
    console.log(data);
    const points = data.filter(function(record) {
        return record.Year === year &&
            record["Cause Name"] === cause

    }).map(function(record) {
            let bg = "cyan"
            s=record.State
            if(s==="Maine"||s==="Rhode Island"||s==="Vermont"||s==="Connecticut"||s==="New Hampshire"||s==="Massachusetts") 
                {bg="magenta";}
            else if(s==="New York"||s==="New Jersey"||s==="Pennsylvania") {bg="purple";}
            else if(s==="West Virginia"||s==="Virginia"||s==="Kentucky"||s==="Delaware"||s==="Maryland"||
                s==="North Carolina"||s==="South Carolina"||s==="Tennessee"||s==="Arkansas"||s==="Louisiana"||
                s==="Florida"||s==="Georgia"||s==="Alabama"||s==="Mississippi") {bg="red";}
            else if(s==="Michigan"||s==="North Dakota"||s==="South Dakota"||s==="Iowa"||s==="Minnesota"||s==="Kansas"||
                s==="Nebraska"||s==="Ohio"||s==="Indiana"||s==="Illinois"||s==="Wisconsin"||s==="Missouri") {bg="yellow";}
            else if(s==="Texas"||s==="Arizona"||s==="New Mexico"||s==="Oklahoma") {bg="cyan";}
            else if(s==="Montana"||s==="Idaho"||s==="Colorado"||s==="Utah"||s==="Wyoming"||s=="Nevada") {bg="blue";}
            else if(s==="California"||s==="Oregon"||s==="Washington"||s==="Hawaii"||s==="Alaska") {bg="green";}
            return {
                label: record.State,
                backgroundColor: bg,
                borderColor: "#004D40",
                data: [{
                    x: record.normalized_deaths,
                    y: record.normalized_medicare_spending,
                    r: 8
                }]
            }

        }

    )
    var ctx = document.getElementById('bubble-chart').getContext('2d');
    var scatterChart = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: points
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',

                    scaleLabel: {
                        labelString: 'Normalized Deaths per 100,000',
                        display: true
                    },
                    gridLines: {
                        display: false

                    }


                }],
                yAxes: [{
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        labelString: 'Normalized Medicare Spending (Millions)',
                        display: true

                    },
                }]
            },


            legend: {
                display: false

            },
            layout: {
                padding: {
                    left: 0,
                    right: 10,
                    top: 10,
                    bottom: 0
                }

            }

        }

    });
});
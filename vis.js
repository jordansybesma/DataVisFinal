// County map rendering based on http://bl.ocks.org/jadiehm/af4a00140c213dfbc4e6

const width            = 900;
const height           = 600;
let centered;
let currentYear        = 2004; // Sets which year we're currently examining
let diabetesThresholds = []; // Stores quantiles for diabetes
let incomeThresholds   = []; // Stores quantiles for income
let lookup = {}

// colorMap stores the two-dimensional color matrix.
// The physical position of the hex in the array matches the
// physical position of the corresponding color in the key.
const colorMap = [
    ['#e8e8e8','#e5c5c2','#dea29e','#d57f7b','#c85a5a'],
    ['#c9d9dd','#a7bed5','#a39cc4','#af759c','#ac535c'],
    ['#a9cad3','#93adc8','#928db2','#976c8c','#904e59'],
    ['#88bbc8','#7e9eba','#7f7fa0','#7e627c','#734853'],
    ['#64acbe','#698eac','#6e718e','#69576b','#574249'],
]

// This particular color scale was inspired by http://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/
// and was fleshed out using https://learnui.design/tools/data-color-picker.html#palette
// Maps values to buckets based on established thresholds
function color(diabetes, income) {
    for (let i = 1; i < 6; i++) {
        if (income <= incomeThresholds[i]) {
            for (let j = 1; j < 6; j++) {
                if (diabetes <= diabetesThresholds[j]) {
                    return colorMap[i-1][j-1];
                }
            }
        }
    }
    return 	'#FAEBD7' // data doesn't exist or something messed up.
}

const div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const svg = d3.select("body").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .style("margin", "-15px auto");

const key = d3.select('body').append('svg:svg')
      .attr('width', width / 3)
      .attr('height', height)
      .append('g')
      //.attr("transform", "translate(" + width + ",0)");

const path = d3.geo.path()
const g = svg.append("g")

queue()
    .defer(d3.json, "usCounties.json")
    .defer(d3.csv, "data.csv")
    .await(render);

function render(error, us, data) {
    diabetes = []
    income = []
    // Populate lookup table, analysis arrays
    data.forEach(function(d) {
        if (lookup[d.Year] == null) {
            lookup[d.Year] = {}
        }
        if (parseFloat(d.DiabetesPercent)) {
            diabetes.push(parseFloat(d.DiabetesPercent))
        }
        if (parseInt(d.PersonalIncome)) {
            income.push(parseInt(d.PersonalIncome))
        }
        lookup[d.Year][d.FIPS] = {'diabetes':parseFloat(d.DiabetesPercent), 'name':d.CountyName, 'income':parseInt(d.PersonalIncome)};
    });
    diabetes.sort(d3.ascending)
    income.sort(d3.ascending)
    // calculate 20q, 40q, 60q, 80q, max for both variables
    diabetesThresholds = [d3.quantile(diabetes, 0), d3.quantile(diabetes, 0.2), d3.quantile(diabetes, 0.4), d3.quantile(diabetes, 0.6),
        d3.quantile(diabetes, 0.8), d3.quantile(diabetes, 1)];
    incomeThresholds = [d3.quantile(income, 0), d3.quantile(income, 0.2), d3.quantile(income, 0.4), d3.quantile(income, 0.6),
        d3.quantile(income, 0.8), d3.quantile(income, 1)];

    // Draw key
    const squareSize = 30
    for (let i = 0; i < colorMap.length; i++) {
        for (let j = 0; j < colorMap[i].length; j++) {
            key.append("rect")
                .attr("x", 100 + squareSize*i)
                .attr("y", (height / 2) - (5 * squareSize / 2) + squareSize*j)
                .attr("width", squareSize)
                .attr("height", squareSize)
                .attr("fill", colorMap[j][i])

                .on("mouseover", function(d) {
                    var sel = d3.select(this);
                    sel.moveToFront();
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .style({'opacity': 1, 'stroke': 'black', 'stroke-width': 1.5});

                    div.transition().duration(300)
                        .style("opacity", 0.8)

                    div.text(`Diabetes Prevalence: (${diabetesThresholds[i]}% - ${diabetesThresholds[i+1]}%); Mean Personal Income: ($${incomeThresholds[j]} - $${incomeThresholds[j + 1]})`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY -30) + "px");
                })
                .on("mouseout", function() {
                    var sel = d3.select(this);
                    sel.moveToBack();

                    d3.select(this)
                        .transition()
                        .duration(300)
                        .style({'opacity': 1, 'stroke': 'white', 'stroke-width': 0});

                    div.transition()
                        .duration(300)
                        .style("opacity", 0);
                })
        }
    }

    // Draw legend labels
    key.append("text")
        .attr('class', 'label')
        .attr("x", 100)
        .attr("y", (height / 2) - (5 * squareSize / 2) - 15)
        .attr('text-anchor', 'middle')
        .text('Less Diabetes,')
    key.append("text")
        .attr('class', 'label')
        .attr("x", 100)
        .attr("y", (height / 2) - (5 * squareSize / 2) -5)
        .attr('text-anchor', 'middle')
        .text('Lower Income')

    key.append("text")
        .attr('class', 'label')
        .attr("x", 100 + squareSize * 5)
        .attr("y", (height / 2) - (5 * squareSize / 2) - 15)
        .attr('text-anchor', 'middle')
        .text('More Diabetes,')
    key.append("text")
        .attr('class', 'label')
        .attr("x", 100 + squareSize * 5)
        .attr("y", (height / 2) - (5 * squareSize / 2) -5)
        .attr('text-anchor', 'middle')
        .text('Lower Income')

    key.append("text")
        .attr('class', 'label')
        .attr("x", 100)
        .attr("y", (height / 2) + 2.5 * squareSize + 15)
        .attr('text-anchor', 'middle')
        .text('Less Diabetes,')
    key.append("text")
        .attr('class', 'label')
        .attr("x", 100)
        .attr("y", (height / 2) + 2.5 * squareSize + 25)
        .attr('text-anchor', 'middle')
        .text('Higher Income')

    key.append("text")
        .attr('class', 'label')
        .attr("x", 100 + squareSize * 5)
        .attr("y", (height / 2) + 2.5 * squareSize + 15)
        .attr('text-anchor', 'middle')
        .text('More Diabetes,')
    key.append("text")
        .attr('class', 'label')
        .attr("x", 100 + squareSize * 5)
        .attr("y", (height / 2) + 2.5 * squareSize + 25)
        .attr('text-anchor', 'middle')
        .text('Higher Income')

    function update() {
        d3.selection.prototype.moveToFront = function() {
            return this.each(function() {
                this.parentNode.appendChild(this);
            });
        };

        d3.selection.prototype.moveToBack = function() {
            return this.each(function() {
                var firstChild = this.parentNode.firstChild;
                if (firstChild) {
                    this.parentNode.insertBefore(this, firstChild);
                }
            });
        };

        g.append("g")
            .attr("class", "county")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function (d) {
                // If we don't have data for this county, return some default value.
                if (!lookup[currentYear][d.id] || !lookup[currentYear][d.id].diabetes || !lookup[currentYear][d.id].income) {
                    return color(0);
                }
                return color(lookup[currentYear][d.id].diabetes, lookup[currentYear][d.id].income);
            })
            .style("opacity", 1)
            .on("click", clicked)
            .on("mouseover", function(d) {
                var sel = d3.select(this);
                sel.moveToFront();
                d3.select(this)
                    .transition()
                    .duration(300)
                    .style({'opacity': 1, 'stroke': 'black', 'stroke-width': 1.5});

                div.transition().duration(300)
                    .style("opacity", 0.8)

                div.text(`${lookup[currentYear][d.id]['name']} - Diabetes Prevalence: ${lookup[currentYear][d.id]['diabetes']}%, Mean Personal Income: $${lookup[currentYear][d.id]['income']}`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY -30) + "px");
            })
            .on("mouseout", function() {
                var sel = d3.select(this);
                sel.moveToBack();

                d3.select(this)
                    .transition()
                    .duration(300)
                    .style({'opacity': 1, 'stroke': 'white', 'stroke-width': 0});

                div.transition()
                    .duration(300)
                    .style("opacity", 0);
            })

        // Draw state outlines
        g.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a.id !== b.id; }))
            .attr("class", "state")
            .attr("d", path);
    }

    function clicked(d) {
        var x, y, k;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        g.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");
    }


    update() // Call update initially so it can create the initial plot (year 2003)

    // Creates a slider to show each data frame by year, and animate with play button
    d3.select("#slider")
        .call(
            chroniton()
                .domain([new Date(2004, 1, 1), new Date(2013, 1, 1)])
                .labelFormat(function(date) {
                    return date.getFullYear();
                })
                .width(600).on('change', function(date) {
                var newYear = date.getFullYear();
                if (newYear !== currentYear) {
                    currentYear = newYear;
                    g.selectAll("path").remove();
                    update();
                }
            })
                .playButton(true)
                .playbackRate(0.5)
                .loop(false)
        );
};

// County map rendering based on http://bl.ocks.org/jadiehm/af4a00140c213dfbc4e6

const width = 960;
const height = 600;
var year = 2004; // Sets which year we're currently examining
var color_domain = [3, 6, 9, 12, 15]

var color = d3.scale.threshold()
	.domain(color_domain)
	.range(['#d8e1ff','#b0bfef','#869fde','#5980ce','#0d62bd']);

var div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("margin", "-15px auto");

var path = d3.geo.path()

queue()
	.defer(d3.json, "usCounties.json")
	.defer(d3.csv, "data.csv")
	.await(render);

function render(error, us, data) {
	var lookup = {};

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

	// Populate lookup table
	data.forEach(function(d) {
		if (lookup[d.Year] == null) {
			lookup[d.Year] = {}
		}
		lookup[d.Year][d.FIPS] = {'diabetes':parseFloat(d.DiabetesPercent), 'name':d.CountyName, 'income':d.PersonalIncome};
	});

	svg.append("g")
		.attr("class", "county")
		.selectAll("path")
		.data(topojson.feature(us, us.objects.counties).features)
		.enter().append("path")
		.attr("d", path)
		.style("fill", function (d) {
			// If we don't have data for this county, return some default value.
			if (!lookup[year][d.id] || !lookup[year][d.id].diabetes) {
				return color(0);
			}
			return color(lookup[year][d.id].diabetes);
		})
		.style("opacity", 1)
		.on("mouseover", function(d) {
			var sel = d3.select(this);
			sel.moveToFront();
		 	d3.select(this)
		 		.transition()
		 		.duration(300)
		 		.style({'opacity': 1, 'stroke': 'black', 'stroke-width': 1.5});

			div.transition().duration(300)
				.style("opacity", 0.8)
		
			div.text(lookup[year][d.id]['name'] + ": " + lookup[year][d.id]['diabetes'])
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

	svg.append("path")
    	.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a.id !== b.id; }))
    	.attr("class", "state")
    	.attr("d", path);
};

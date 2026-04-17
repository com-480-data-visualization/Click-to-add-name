let updateMapYear = null;

async function initLifespanMap() {
    let currentDataLookup = new Map(); 
    const container = d3.select("#d3-lifespan-map");
    const width = container.node().clientWidth ;
    const height = container.node().clientHeight * 0.9 ; 

    container.selectAll("svg").remove();

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${container.node().clientHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const [lifespanData, geoData] = await Promise.all([
        d3.csv("./data/cleaned_lifespan_map_data.csv"),
        d3.json("./data/world.json")
    ]);

    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], geoData)
        .translate([width / 2, height / 1.55]);

    const path = d3.geoPath().projection(projection);
   
    const domain = [50, 60, 70, 75, 77, 80]; 

    const range = [
        "#e55951",
        "#fee08b", 
        "#d9ef8b", 
        "#22af5f", 
        "#28a4bc", 
        "#2877bc",
        "#0b4b84"  
    ];

    const colorScale = d3.scaleThreshold()
        .domain(domain)
        .range(range);

    // --- line chart in tooltip
    const drawTooltipChart = (containerId, countryId) => {
        const history = lifespanData
            .filter(d => d.SpatialDimValueCode === countryId)
            .map(d => ({ year: +d.Period, value: +d.Value }))
            .sort((a, b) => a.year - b.year);

        if (history.length === 0) return;

        const w = 160, h = 50;
        const x = d3.scaleLinear().domain([2000, 2021]).range([0, w]);
        const y = d3.scaleLinear().domain([d3.min(history, d => d.value)-2, d3.max(history, d => d.value)+2]).range([h, 0]);

        const miniSvg = d3.select(containerId).append("svg").attr("width", w).attr("height", h);
        
        // line
        miniSvg.append("path")
            .datum(history)
            .attr("fill", "none")
            .attr("stroke", "#17486a")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.value)));

        // year
        const curYear = +document.getElementById("year-slider").value;
        const curPoint = history.find(d => d.year === curYear);
        if (curPoint) {
            miniSvg.append("circle")
                .attr("cx", x(curPoint.year)).attr("cy", y(curPoint.value))
                .attr("r", 3).attr("fill", "#ffcc00").attr("stroke", "#17486a");
        }
    };

    // country outline according to world.js
    const countries = svg.append("g")
        .selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("class", "country-path")
        .attr("fill", "#e0e0e0")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .raise() 
                .transition().duration(100)
                .attr("stroke", "#ffcc00") 
                .attr("stroke-width", 2);
            d3.select("#map-tooltip").style("visibility", "visible");
        })
        .on("mousemove", function(event, d) {
            const year = document.getElementById("year-slider").value;
            
            const countryCode = d.properties.ISO_A3 || d.id;
            const val = currentDataLookup.get(countryCode);
            
            const officialName = window.currentNameLookup ? window.currentNameLookup.get(countryCode) : d.properties.name;

            const [mx, my] = d3.pointer(event, container.node());

            d3.select("#map-tooltip")
                .style("left", (mx + 20) + "px")
                .style("top", (my + 20) + "px")
                .html(`
                    <div style="font-weight:bold; color:#17486a;">${officialName || "Unknown"}</div>
                    <div style="font-size:0.85rem;">${year}: <b>${val ? val.toFixed(1) : 'No Data'} yrs</b></div>
                    <div id="mini-chart" class="tooltip-chart-container"></div>
                `);

            drawTooltipChart("#mini-chart", countryCode)
            countries.style("pointer-events", "all");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(200)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 0.5);
            d3.select("#map-tooltip").style("visibility", "hidden").html("");
        });
        
    updateMapYear = function(year) {
        const data = lifespanData.filter(d => +d.Period === year);
        currentDataLookup = new Map(data.map(d => [d.SpatialDimValueCode, +d.Value]));
        const nameLookup = new Map(data.map(d => [d.SpatialDimValueCode, d.Location])); // 核心：保存数据里的 Location 字段
        countries.transition().duration(400)
            .attr("fill", d => {
                const code = d.properties.ISO_A3 || d.id; 
                const v = currentDataLookup.get(code);
                return v ? colorScale(v) : "#f0f0f0";
            });
        window.currentNameLookup = nameLookup; 
    };

    const initialYear = +document.getElementById("year-slider").value;

    d3.select("#year-display").text(initialYear);

    updateMapYear(initialYear);

    d3.select("#year-slider").on("input", function() {
        const val = +this.value;
        d3.select("#year-display").text(val);
        updateMapYear(val);
    });

}
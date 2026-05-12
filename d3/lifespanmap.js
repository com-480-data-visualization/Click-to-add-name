let updateMapYear = null;

async function initLifespanMap() {
    let currentDataLookup = new Map(); 
    const container = d3.select("#d3-lifespan-map");
    const width = container.node().clientWidth ;
    const height = container.node().clientHeight * 0.9 ; 
    const legendPanelWidth = 150;
    const legendGap = 18;

    container.selectAll("svg").remove();

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const [lifespanData, geoData] = await Promise.all([
        d3.csv("./data/cleaned_lifespan_map_data.csv"),
        d3.json("./data/world.json")
    ]);

    const projection = d3.geoNaturalEarth1()
        .fitExtent(
            [[legendPanelWidth + legendGap, 8], [width - 8, height - 8]],
            geoData
        );

    const path = d3.geoPath().projection(projection);
   
    const domain = [50, 60, 70, 75, 77, 80]; 

    const range = [
        "#e55951", //below 50
        "#fee08b", //50-60
        "#d9ef8b", //60-70
        "#22af5f", //70-75
        "#28a4bc", //75-77
        "#2877bc",//77-80
        "#0b4b84"  //above 80
    ];

    const colorScale = d3.scaleThreshold()
        .domain(domain)
        .range(range);

    // 在地图右侧添加图例：legendGroup
    const legendLabels = ["< 50", "50 - 60", "60 - 70", "70 - 75", "75 - 77", "77 - 80", "> 80"];
    const legendItemHeight = 28;
    const legendBarWidth = 20;
    const legendX = 10;
    const legendY = 18;

    const legendGroup = svg.append("g")
        .attr("class", "map-legend")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    legendGroup.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendPanelWidth)
        .attr("height", legendItemHeight * range.length + 48)
        .attr("rx", 10)
        .attr("fill", "rgba(255, 255, 255, 0.84)")
        .attr("stroke", "rgba(23, 72, 106, 0.24)")
        .attr("stroke-width", 1.2);

    legendGroup.append("text")
        .attr("x", 12)
        .attr("y", 20)
        .attr("fill", "#17486a")
        .attr("font-size", 13)
        .attr("font-weight", 800)
        .text("Life Expectancy");

    legendGroup.selectAll("rect.legend-item")
        .data(range)
        .enter()
        .append("rect")
        .attr("class", "legend-item")
        .attr("x", 12)
        .attr("y", (_, i) => 34 + i * legendItemHeight)
        .attr("width", legendBarWidth)
        .attr("height", legendItemHeight)
        .attr("fill", d => d)
        .attr("stroke", "rgba(23, 72, 106, 0.28)")
        .attr("stroke-width", 0.6);

    legendGroup.selectAll("text.legend-label")
        .data(legendLabels)
        .enter()
        .append("text")
        .attr("class", "legend-label")
        .attr("x", legendBarWidth + 20)
        .attr("y", (_, i) => 34 + i * legendItemHeight + legendItemHeight / 2 + 6)
        .attr("fill", "#17486a")
        .attr("font-size", 12)
        .attr("font-weight", 600)
        .text(d => d);

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
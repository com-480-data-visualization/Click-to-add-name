let updateMapYear = null;

async function initLifespanMap() {
    const container = d3.select("#d3-lifespan-map");
    
    // 1.initial setting
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    container.selectAll("*").remove();

    // 2. create canvas
    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // 3. load data
    const [lifespanData, geoData] = await Promise.all([
        d3.csv("./data/cleaned_lifespan_map_data.csv"),
        d3.json("./data/world.json")
    ]);

    // 4. projection
    // fitSize 
    const projection = d3.geoNaturalEarth1()
        .fitSize([width * 0.9, height * 0.9], geoData) 
        .translate([width / 2, height / 1.6]); // titlespace

    const path = d3.geoPath().projection(projection);

    // 5. color scale
    const colorScale = d3.scaleSequential()
        .domain([45, 85]) // age range
        .interpolator(d3.interpolateYlGnBu); //color yellow green blue

    // 6. mapshape
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
                .transition().duration(100)
                .attr("stroke", "#17486a")
                .attr("stroke-width", 1.5);
            
            // 2. 显示 Tooltip
            d3.select("#map-tooltip").style("visibility", "visible");
        })
        .on("mousemove", function(event, d) {
            // 获取当前年份
            const year = document.getElementById("year-slider").value;
            // 从你之前创建的 dataLookup 里拿数值
            const val = dataLookup.get(d.id); 

            // 计算坐标：相对于 .lifespan 容器
            const [x, y] = d3.pointer(event);

            d3.select("#map-tooltip")
                .style("left", (x + 15) + "px")
                .style("top", (y + 15) + "px")
                .html(`
                    <div style="font-weight: bold; border-bottom: 1px solid #ccc; margin-bottom: 5px;">
                        ${d.properties.name || d.id}
                    </div>
                    <div>Year: ${year}</div>
                    <div>Lifespan: <span style="color: #17486a; font-weight: bold;">
                        ${val ? val.toFixed(1) + ' yrs' : 'N/A'}
                    </span></div>
                `);
        })
        .on("mouseout", function() {
            // 1. 恢复描边
            d3.select(this)
                .transition().duration(100)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 0.5);
            
            // 2. 隐藏 Tooltip
            d3.select("#map-tooltip").style("visibility", "hidden");
        });

    // 7. year
    updateMapYear = function(year) {
        // search and diapay year data
        const currentYearData = lifespanData.filter(d => +d.Period === year);
        const dataLookup = new Map(currentYearData.map(d => [d.SpatialDimValueCode, +d.Value]));

        // change color accordingly
        countries.transition()
            .duration(400) 
            .attr("fill", d => {
                const val = dataLookup.get(d.id); 
                return val ? colorScale(val) : "#f0f0f0";
            });

    };

    // 8. default 2021
    updateMapYear(2021);

    // 9. slider
    const slider = document.getElementById("year-slider");
    const display = document.getElementById("year-display");
    if (slider) {
        slider.addEventListener("input", function() {
            const year = parseInt(this.value);
            display.textContent = year;
            updateMapYear(year);
        });
    }
}
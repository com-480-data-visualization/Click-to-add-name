// rankingchart.js

async function initRankingChart() {
    // 1. load data
    const [rawLifespanData, geoData] = await Promise.all([
        d3.csv("./data/cleaned_lifespan_map_data.csv", d => {
            const keys = Object.keys(d);
            return {
                Code: d[keys[0]],           // AFG
                Entity: d[keys[1]],         // Afghanistan
                Year: +d[keys[2]],          // 2000
                LifeExpectancy: +d[keys[3]] // 53.82
            };
        }),
        d3.json("./data/world.json")
    ]);

    // 2. UI
    const container = d3.select("#d3-ranking-chart");
    const playBtn = document.getElementById("rankingPlayBtn");
    const timeline = document.getElementById("rankingTimeline");
    const yearLabel = document.getElementById("rankingYearLabel");

    container.html(""); 
    const rect = container.node().getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    const margin = { top: 20, right: 80, bottom: 20, left: 20 };

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "100%");

    // 3. define projection and path
    const barHeight = (height - margin.top - margin.bottom) / 5;
    const countryPaths = new Map();

    geoData.features.forEach(f => {

        const countryCode = f.properties.ISO_A3 || f.id || f.properties.code;
        
        if (countryCode) {
            // indicidual projection for each country
            const localProjection = d3.geoIdentity()
                .reflectY(true)
                .fitSize([barHeight - 20, barHeight - 20], f); // margin
            
            const localPathGenerator = d3.geoPath().projection(localProjection);
            countryPaths.set(countryCode, localPathGenerator(f));
        }
    });

    // 4. scale
    const x = d3.scaleLinear().range([margin.left, width - margin.right]);
    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const years = [...new Set(rawLifespanData.map(d => d.Year))].sort(d3.ascending);
    let currentIndex = 0;
    let timer = null;

    // 5. update each year
    function update(year, duration = 600) {
        const yearData = rawLifespanData
            .filter(d => d.Year === year && !isNaN(d.LifeExpectancy))
            .sort((a, b) => b.LifeExpectancy - a.LifeExpectancy)
            .slice(0, 5);

        if (yearData.length === 0) return;

        // bar long/short
        x.domain([45, d3.max(rawLifespanData, d => d.LifeExpectancy) ]);

        // change UI lookup
        timeline.value = year;
        yearLabel.textContent = year;
        const pct = ((year - years[0]) / (years[years.length-1] - years[0])) * 100;
        timeline.style.setProperty('--pct', pct);

        // unique identity key
        const bars = svg.selectAll(".bar-group")
            .data(yearData, d => d.Code);

        // EXIT
        bars.exit().transition().duration(duration)
            .attr("transform", `translate(0, ${height})`)
            .style("opacity", 0)
            .remove();

        // ENTER
        const enter = bars.enter().append("g")
            .attr("class", "bar-group")
            .attr("transform", `translate(0, ${height})`);

        enter.append("rect")
            .attr("height", barHeight - 15)
            .attr("rx", 6)
            .attr("fill", d => color(d.Code));

        enter.append("path")
            .attr("class", "country-silhouette")
            .attr("fill", "rgba(255, 255, 255, 0.6)");

        enter.append("text")
            .attr("class", "name-label")
            .attr("dy", barHeight / 2 - 5)
            .attr("x", margin.left + 10)
            .style("fill", "#fff")
            .style("font-size", "12px")
            .style("font-weight", "bold");

        enter.append("text")
            .attr("class", "val-label")
            .attr("dy", barHeight / 2 - 5)
            .style("font-weight", "bold")
            .style("fill", "#17486a");

        // UPDATE
        const merged = enter.merge(bars);

        merged.transition().duration(duration).ease(d3.easeCubicInOut)
            .attr("transform", (d, i) => `translate(0, ${margin.top + i * barHeight})`);

        // Bar 
        merged.select("rect")
            .transition().duration(duration)
            .attr("x", margin.left)
            .attr("width", d => x(d.LifeExpectancy) - margin.left);

        // map shape follow bar
        merged.select("path")
            .attr("d", d => countryPaths.get(d.Code) || "")
            .transition().duration(duration)
            .attr("transform", d => `translate(${x(d.LifeExpectancy) - barHeight + 5}, 4)`);

        // name of the country
        merged.select(".name-label").text(d => d.Entity);

        // LifeExpectanc
        merged.select(".val-label")
            .transition().duration(duration)
            .attr("x", d => x(d.LifeExpectancy) + 8)
            .text(d => d.LifeExpectancy.toFixed(1));
    }

    // 6.(Play/Pause/Slider)
    playBtn.onclick = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
            playBtn.innerHTML = "&#9654;";
        } else {
            if (currentIndex >= years.length - 1) currentIndex = 0;
            playBtn.innerHTML = "&#10074;&#10074;";
            timer = setInterval(() => {
                update(years[currentIndex]);
                currentIndex++;
                if (currentIndex >= years.length) {
                    clearInterval(timer);
                    timer = null;
                    playBtn.innerHTML = "&#9654;";
                }
            }, 800);
        }
    };

    timeline.oninput = (e) => {
        const val = +e.target.value;
        currentIndex = years.indexOf(val);
        update(val, 200);
    };

    update(years[0]);
}

initRankingChart();
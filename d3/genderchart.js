// d3/genderChart.js

const drawGenderDivide = async () => {
    const container = d3.select("#d3-gender-chart");
    container.selectAll("*").remove();
    
    const width = container.node().getBoundingClientRect().width;
    const height = 500; 
    const margin = { top: 80, right: 60, bottom: 60, left: 60 };

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    //load clean data
    const data = await d3.csv("./data/cleaned_gender_data.csv");
    
    // Y-axis
    const years = [...new Set(data.map(d => d.Period))].sort().reverse();

    // 2. scale
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const centerGap = 40; 

    // male left
    const xMale = d3.scaleLinear()
        .domain([50, 80]) 
        .range([innerWidth / 2 - centerGap, 0]);

    // female right
    const xFemale = d3.scaleLinear()
        .domain([50, 80])
        .range([innerWidth / 2 + centerGap, innerWidth]);

    const y = d3.scaleBand()
        .domain(years)
        .range([0, innerHeight])
        .padding(0.3);

    //text
    svg.append("text")
        .attr("x", xMale(60)) 
        .attr("y", -30) // 
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "700")
        .style("fill", "#1a008b") 
        .text("Male");

    svg.append("text")
        .attr("x", xFemale(60)) 
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "700")
        .style("fill", "#e64d9c") 
        .text("Female");

    // 3. year text
    svg.append("text")
        .attr("x", innerWidth / 2) 
        .attr("y", innerHeight + 15) 
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("fill", "#17486a")
        .style("text-transform", "uppercase")
        .text("Year");


    // 3. year display
    svg.selectAll(".year-label")
        .data(years)
        .join("text")
        .attr("x", innerWidth / 2)
        .attr("y", d => y(d) + y.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", "#17486a")
        .text(d => d);

    // 4. dynamic
    window.startGenderAnimation = () => {
        svg.selectAll(".bar-male, .bar-female, .bar-label").remove();
        // male pillar
        svg.selectAll(".bar-male")
            .data(data.filter(d => d.Dim1 === "Male"))
            .join("rect")
            .attr("class", "bar-male")
            .attr("fill", "#1a008b")
            .attr("y", d => y(d.Period))
            .attr("height", y.bandwidth())
            .attr("x", innerWidth / 2 - centerGap)
            .attr("width", 0)
            .transition().duration(1200).delay((d, i) => i * 40)
            .attr("x", d => xMale(+d.Value))
            .attr("width", d => (innerWidth / 2 - centerGap) - xMale(+d.Value));
        
        // female pillar
        svg.selectAll(".bar-female")
            .data(data.filter(d => d.Dim1 === "Female"))
            .join("rect")
            .attr("class", "bar-female")
            .attr("fill", "#e64d9c")
            .attr("y", d => y(d.Period))
            .attr("height", y.bandwidth())
            .attr("x", innerWidth / 2 + centerGap)
            .attr("width", 0)
            .transition().duration(1200).delay((d, i) => i * 40)
            .attr("width", d => xFemale(+d.Value) - (innerWidth / 2 + centerGap));
       
        // labels
        svg.selectAll(".label-male")
            .data(data.filter(d => d.Dim1 === "Male"))
            .join("text")
            .attr("class", "bar-label")
            .attr("y", d => y(d.Period) + y.bandwidth() / 2)
            .attr("x", innerWidth / 2 - centerGap - 5)
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "middle")
            .style("font-size", "11px")
            .style("fill", "#17486a")
            .style("opacity", 0)
            .text(d => (+d.Value).toFixed(1))
            .transition().duration(1200).delay((d, i) => i * 40 + 400)
            .attr("x", d => xMale(+d.Value) - 5) 
            .style("opacity", 1);

        svg.selectAll(".label-female")
            .data(data.filter(d => d.Dim1 === "Female"))
            .join("text")
            .attr("class", "bar-label")
            .attr("y", d => y(d.Period) + y.bandwidth() / 2)
            .attr("x", innerWidth / 2 + centerGap + 5)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle")
            .style("font-size", "11px")
            .style("fill", "#17486a")
            .style("opacity", 0)
            .text(d => (+d.Value).toFixed(1))
            .transition().duration(1200).delay((d, i) => i * 40 + 400)
            .attr("x", d => xFemale(+d.Value) + 5)
            .style("opacity", 1);
    };
};

drawGenderDivide();
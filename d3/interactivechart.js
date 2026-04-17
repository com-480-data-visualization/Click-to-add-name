const rawDataPath = "./raw_data/Life expectancy at birth (years).csv";

async function initUserCalculator() {
    try {
        const rawData = await d3.csv(rawDataPath);

        
        const data = rawData.filter(d => d.IndicatorCode === "WHOSIS_000001");

        populateCountryDropdown(data);
        setupCalculateEvent(data);

    } catch (error) {
        console.error("Failed to load data:", error);
    }
}

// dropdown
function populateCountryDropdown(data) {
    const countrySelect = d3.select("#user-country-select");

    const countries = Array.from(
        new Set(data.map(d => d.Location))
    )
    .filter(d => d)
    .sort((a, b) => a.localeCompare(b));

    countrySelect.selectAll("option").remove();

    countrySelect.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);


    countrySelect.property("value", "Switzerland");
}

function setupCalculateEvent(data) {
    const currentYear = new Date().getFullYear();

    const targetYear = 2019;

    d3.select("#calculate-btn").on("click", function () {

        const userAge = +d3.select("#user-age-input").property("value");
        const userCountry = d3.select("#user-country-select").property("value");
        const userGender = d3.select("#user-gender-select").property("value");

        if (isNaN(userAge) || userAge <= 0) {
            alert("Please enter a valid age.");
            return;
        }

        const match = data.find(d =>
            d.Location === userCountry &&
            d.Dim1.toLowerCase() === userGender.toLowerCase() &&
            +d.Period === targetYear
        );

        if (!match) {
            showError("No data found for this selection.");
            return;
        }

        const expectancy = parseFloat(match.FactValueNumeric);

        if (isNaN(expectancy)) {
            showError("Data unavailable.");
            return;
        }

        const birthYear = currentYear - userAge;
        const remaining = expectancy - userAge;

        renderResult({
            birthYear,
            country: userCountry,
            expectancy,
            remaining
        });
    });
}

function renderResult({ birthYear, country, expectancy, remaining }) {
    const resultDisplay = d3.select("#result-display");
    const resultText = d3.select("#result-text");

    resultDisplay.style("display", "block");

    let message = "";

    if (remaining > 5) {
        message = `
            You still have about <b>${remaining.toFixed(1)}</b> years ahead: 
            plenty of time to explore, grow, and experience more of life.
        `;
    } else if (remaining >= 0 && remaining <= 5) {
        message = `
            You’re right around the average life expectancy in <b>${country}</b>. 
            From here on, every year is something extra! Make it meaningful in your own way.
        `;
    } else {
        message = `
            You’ve already lived <b>${Math.abs(remaining).toFixed(1)}</b> years beyond the average in <b>${country}</b>. 
            That’s not just time, that’s a life rich with stories.
        `;
    }

    resultText.html(`
        <div style="font-size: 1.1rem; margin-bottom: 8px;">
            Born in <b>${birthYear}</b> | <b>${country}</b>
        </div>

        <div style="font-size: 1.6rem; font-weight: bold; color: #17486a;">
            ${expectancy} years
        </div>

        <div style="margin-top: 10px; font-size: 1rem; color: #666;">
            Average life expectancy
        </div>

        <p style="
            margin-top: 14px;
            font-size: 1.15rem;
            line-height: 1.6;
            color: ${remaining > 0 ? '#1f9d55' : '#d64545'};
        ">
            ${message}
        </p>
    `);
}

function showError(message) {
    const resultDisplay = d3.select("#result-display");
    const resultText = d3.select("#result-text");

    resultDisplay.style("display", "block");

    resultText.html(`
        <p style="color: red; font-weight: bold;">
            ${message}
        </p>
    `);
}


initUserCalculator();
# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Lin Xiaoya | 423134 |
| Wu Yiqian | 423147 |
| Liu Tingsen | 422014 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (21st March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

For our project, we combined three publicly available international datasets from the World Health Organization (WHO) and the World Bank. 

The sources of these data are reliable and authoritative. However, due to coming from different organizations/institutions, we need to do some data cleaning and integration (such as integrating two datasets by year and country to obtain a more correlated integrated dataset)


Datasets:
1. Life Expectancy at Birth (WHO):
https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy-at-birth-(years)
2. GDP per Capita (World Bank):
https://data.worldbank.org/indicator/NY.GDP.PCAP.CD
3. NCD Mortality Rate (World Bank):
https://data.worldbank.org/indicator/SH.DYN.NCOM.ZS

### Problematic

**Life expectancy** is one of the most widely used indicators of a country’s overall well-being. It reflects not only healthcare quality but also economic conditions, education, public policy, and social inequality. At the same time, economic development, often measured through GDP per capita, is commonly assumed to improve living standards and health outcomes. However, the strength and nature of this relationship is not always straightforward.

Our project aims to explore the following central questions:
- How strongly is GDP per capita associated with life expectancy across countries?
- What are the differences in life expectancy between men and women globally?
- How is GDP related to mortality from non-communicable diseases (NCDs), and does higher income necessarily imply lower NCD mortality?

By visualising these relationships, we aim to better understand the interplay between economic development and public health.

This project is relevant to students of economics, public health, and global development, as well as anyone interested in understanding global inequality. By presenting interactive visualisations and statistical summaries, we provide a clear and accessible overview of how wealth, gender, and disease burden relate to longevity.

### Exploratory Data Analysis

All three datasets were loaded into pandas DataFrames. Since they originate from different sources, preprocessing was necessary before merging:

- Year variables were converted to consistent integer formats.
- Country names were standardised to ensure correct joins.
- Rows missing essential values (GDP per capita, life expectancy, or NCD mortality rate) were removed.
- GDP per capita was log-transformed to better capture non-linear relationships and reduce skewness.

The datasets were then **merged using inner joins on country and year**, ensuring that only observations present in all three datasets were retained. The resulting dataset **spans from 2000 to 2021, with 12,060 total records**.

All these works can be found in the Jupyter Notebook [`EDA.ipynb`](./data-preprocessing/EDA.ipynb). 


Key findings:

1. On average across the dataset, women live 4.84 years longer than men.
2. GDP and Life Expectancy maintain a strong logarithmic correlation
3. Higher GDP tends to be associated with lower NCD mortality.
However, substantial variance remains even among high-income countries.


### Related work

While giants like [Gapminder](https://www.gapminder.org/tools/) and the [IHME’s GBD Compare](https://vizhub.healthdata.org/gbd-compare/) offer comprehensive data on health and wealth, they function more like digital encyclopedias than narrative tools. The connection between wealth and preventable death is a story hidden in plain sight. But for most people, uncovering that story requires a tedious trek across platforms that treat human lives like static rows of data. The data is "there," but it isn't always "alive."

Our project takes the high-quality data provided by the [World Bank Open Data](https://data.worldbank.org/indicator/SH.DYN.NCOM.ZS). We’ve stripped away the academic density of the World Bank's archives to investigate a singular mystery: The Wealth Paradox. Why do some nations with high GDPs see their citizens die years earlier than those in countries with far fewer resources? By focusing on the 'exceptions', nations like The Bahamas, we look past the spreadsheets to uncover the cultural habits, dietary shifts, and hidden inequalities that determine who actually gets to grow old.

Visually, we were inspired by the clean, interactive aesthetics of [The Pudding](https://pudding.cool). By bringing GDP, NCD mortality, and gendered longevity into one animated interface, we transform complex public health statistics into an interactive journey.

(Note: The datasets utilized in this project have not been explored by our team in any previous ML, ADA, or semester projects).

---

## Milestone 2 (18th April, 5pm)

**10% of the final grade**
## The Longevity Equation
### Project Report
Our comprehensive Milestone 2 report contains our detailed project goals, visualization sketches, technical tool mapping to the COM-480 syllabus, and our implementation roadmap.
* [**Milestone 2 Report (PDF)**](assets/Milestone_2_Report.pdf)


### Functional Prototype
The initial website skeleton and functional prototype are now live. This version demonstrates our paginated narrative structure and the layout for our upcoming D3.js visualizations.
* [**The Longevity Equation Prototype**](https://com-480-data-visualization.github.io/Click-to-add-name/)


### Current Progress and Technical Implementation
For this milestone, we have focused on building a robust foundation for our data story:
* **Web Skeleton:** We developed a navigation system using HTML, CSS, and JavaScript. The site supports vertical transitions between major topics and horizontal navigation for detailed rankings.
* **Narrative Flow:** The investigative journey is fully drafted, moving from global demographic trends (The Gender Divide) to specific case studies (The Wealth Paradox).
* **Visualization Containers:** We have implemented responsive SVG containers for our D3.js widgets. 
* **D3.js Preparation:** Our unified dataset from the WHO and World Bank has been pre-processed and is ready for the implementation of the Butterfly Chart, Racing Bar Chart, and the normalized Radar Chart.


### Core MVP Goals
* Deliver a fully navigable website with structured data storytelling.
* Functional interactive World Map with a manual year timeline slider.
* Normalized Radar Chart for individual country health profiles.

### Creative Extras
* **Audio Sonification:** Heartbeat sound effects that scale with data trends.
* **Personalized Marker:** User-driven data input for statistical comparison.

---

## Milestone 3 (30th May, 5pm)

**80% of the final grade**


## The Longevity Equation: Final Delivery

> A data-driven narrative exploring how national wealth, gender demographics, and chronic lifestyle diseases intersect to determine human lifespan across the globe.

### 📌 Final Project Deliverables
* **Interactive Data Story:** [Live Website Demo](https://com-480-data-visualization.github.io/Click-to-add-name/)
* **Process Book:** [Download Process Book (PDF)](assets/Process_Book.pdf)
* **Screencast Demo:** [Watch on YouTube](VIDEO_LINK_HERE)

### 💡 About The Final Project
"The Longevity Equation" transforms complex global health datasets into an engaging, interactive data journalism narrative. We moved beyond static spreadsheets to uncover the hidden forces that dictate human lifespan. 

Through a guided scrollytelling experience, users explore the inherent gender divide, the geographic lottery of birth, and ultimately, **The Wealth Paradox** which tells why certain high-income nations fail to achieve proportional health outcomes due to high rates of Non-Communicable Diseases (NCDs) and wealth inequality.

### 📊 The Interactive Visualizations
Our final project is built natively using **D3.js (v7)** and features a suite of responsive, interactive tools:
1. **The Butterfly Chart:** A comparative analysis of male and female life expectancy, highlighting the persistent global survival gap and the impact of the 2020-2021 COVID-19 pandemic.
2. **Interactive Choropleth & Racing Bar Chart:** A synchronized macro-level view of global health progression from 2000 to 2021, allowing users to scrub through history.
3. **The Wealth Paradox Scatter Plot:** A logarithmic mapping of GDP vs. Life Expectancy, utilizing bubble size to encode NCD mortality rates, effectively highlighting anomalies like The Bahamas.
4. **Personal Longevity Calculator ("Where do you stand?"):** We pivoted from a complex multidimensional radar chart to a highly personalized interactive tool. Users input their demographics to compare their statistical life expectancy against global pre-COVID baselines.

### 🛠 Technical Setup & Local Development

To run this project locally and explore the code:

1. Clone this repository:
   ```bash
   git clone [https://github.com/com-480-data-visualization/Click-to-add-name.git](https://github.com/com-480-data-visualization/Click-to-add-name.git)
   cd Click-to-add-name
   ```
2. Start a local server (Required to prevent CORS errors when D3 loads local datasets). If you have Python installed, run:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to `http://localhost:8000`


**Repository Architecture:**
Based on the current structure of our final delivery:
* `/assets/`: Contains images, icons, the Milestone reports, and the final Process Book.
* `/d3/`: Contains the core JavaScript files handling the D3.js visualization logic.
* `/data-preprocessing/`: Contains the Jupyter notebooks (`EDA.ipynb`) used for data cleaning.
* `/data/`: Contains the final cleaned JSON/CSV datasets used by the D3 visualizations.
* `/raw_data/`: Contains the original unedited datasets from the WHO and World Bank.
* `/scripts/`: Contains the Vanilla JS logic for the scrollytelling mechanism and UI interactions.
* `/style/`: Contains all CSS stylesheets for layout, typography, and responsive design.
* `/website_outdated/`: Contains legacy architecture from earlier development phases.
* `index.html`: The main entry point for the interactive data story.

### 👥 Peer Assessment & Contributions
* **Lin Xiaoya (423134):** Conducted data preprocessing and Exploratory Data Analysis (EDA). Authored the Milestone 2 report, the Milestone 3 Process Book, and narrative text for the website. 
* **Liu Tingsen (422014):** Developed the foundational HTML and JavaScript architecture (scrollytelling and navigation). Authored the initial draft for Milestone 1.
* **Wu Yiqian (423147):** Conducted related work research. Authored the initial draft for Milestone 1. Implemented the core D3.js visualizations.
---



## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

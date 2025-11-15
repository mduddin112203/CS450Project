# LoanScope: Interactive Visualization of Loan Eligibility Data

An interactive data storytelling web application built with React and D3.js to explore loan eligibility patterns from the Kaggle Loan Eligibility Prediction dataset.

## Project Overview

LoanScope provides an interactive dashboard that visualizes how demographic attributes, financial indicators, and credit history relate to loan approval outcomes. The application includes four distinct visualizations and an integrated dashboard with filtering capabilities.

**Note:** This dataset is from **India** and all financial values (income, loan amounts) are in **Indian Rupees (₹)**. The application includes a currency converter to display equivalent values in US Dollars ($) for reference.

## Dataset

The project uses the [Loan Eligibility Prediction dataset](https://www.kaggle.com/datasets/avineshprabhakaran/loan-eligibility-prediction) from Kaggle, which contains loan application data from **India**. The dataset includes 614 loan applications with 13 attributes including:

- **Demographics**: Gender, Marital Status, Dependents, Education
- **Financial**: Applicant Income (₹ annually), Coapplicant Income (₹ annually), Loan Amount (₹ in thousands), Loan Amount Term (months)
- **Credit**: Credit History (1 = Has credit history, 0 = No credit history)
- **Location**: Property Area (Urban, Semiurban, Rural)
- **Outcome**: Loan Status (Y = Approved, N = Rejected)

**Important:** All income and loan amount values are in **Indian Rupees (₹)**. The application includes a currency converter to display USD ($) equivalents (approximately 1 USD = 83 INR).

The CSV file is located in the `public` folder and is loaded at runtime.

## Features

### Four Interactive Visualizations

1. **Income vs Loan Status**: Stacked bar chart comparing income ranges for approved and rejected applications
2. **Education and Loan Approval**: Stacked bar chart comparing approval rates between graduate and non-graduate applicants
3. **Credit History Distribution**: Stacked bar chart showing how credit history values are distributed and their impact on approval decisions
4. **Property Area Trends**: Bar chart comparing loan approval rates across urban, rural, and semi-urban areas

### Interactive Dashboard

- **Global Filters**: Filter by Property Area, Education, Gender, Credit History, and Loan Status
- **Dynamic Updates**: All charts update automatically when filters are applied
- **Tooltips**: Hover over chart elements to see detailed information
- **Insight Summary**: Overview metrics including overall approval rate and key statistics

## Technology Stack

- **React** 19.2.0 - UI framework
- **D3.js** 7.9.0 - Data visualization library
- **Create React App** - Build tooling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mduddin112203/CS450Project.git
cd CS450Project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Deployment

The application is deployed on GitHub Pages. The GitHub Pages URL will be added here once deployment is complete.

## Project Structure

```
CS450Project/
├── public/
│   └── Loan Eligibility Prediction.csv  # Dataset
├── src/
│   ├── components/
│   │   ├── charts/                      # Individual chart components
│   │   │   ├── IncomeVsLoanStatusChart.js
│   │   │   ├── EducationApprovalChart.js
│   │   │   ├── CreditHistoryOutcomeChart.js
│   │   │   └── ApprovalByPropertyChart.js
│   │   ├── Dashboard.js                 # Main dashboard container
│   │   ├── FilterPanel.js               # Filter controls
│   │   └── InsightSummary.js            # Summary metrics
│   ├── App.js                           # Main application component
│   ├── App.css                          # Application styles
│   └── index.js                         # Entry point
└── package.json
```

## Authors

- Richie Rojas
- Md Uddin
- Eser Gjoka
- Jonathan Malave
- Ismail Shaikh

## Course Information

This project was created for **CS450: Data Visualization** at New Jersey Institute of Technology (NJIT).

## License

This project is for academic purposes only.

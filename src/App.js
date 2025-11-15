import { useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import './App.css';
import Dashboard from './components/Dashboard';
import InsightSummary from './components/InsightSummary';

const DATA_URL = `${process.env.PUBLIC_URL}/Loan Eligibility Prediction.csv`;

const numericFields = [
  'Applicant_Income',
  'Coapplicant_Income',
  'Loan_Amount',
  'Loan_Amount_Term',
  'Credit_History'
];

function normalizeRecord(record) {
  const cleaned = { ...record };

  numericFields.forEach((field) => {
    const rawValue = record[field];
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      cleaned[field] = null;
      return;
    }

    const parsed = Number(rawValue);
    cleaned[field] = Number.isNaN(parsed) ? null : parsed;
  });

  cleaned.Customer_ID = record.Customer_ID;
  cleaned.Dependents = record.Dependents?.trim() ?? '';
  cleaned.Gender = record.Gender?.trim() ?? '';
  cleaned.Married = record.Married?.trim() ?? '';
  cleaned.Education = record.Education?.trim() ?? '';
  cleaned.Self_Employed = record.Self_Employed?.trim() ?? '';
  cleaned.Property_Area = record.Property_Area?.trim() ?? '';
  cleaned.Loan_Status = record.Loan_Status?.trim() ?? '';

  cleaned.Total_Income = [cleaned.Applicant_Income, cleaned.Coapplicant_Income]
    .filter((value) => typeof value === 'number')
    .reduce((sum, value) => sum + value, 0);

  return cleaned;
}

function App() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    propertyArea: 'All',
    education: 'All',
    gender: 'All',
    creditHistory: 'All',
    loanStatus: 'All'
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const data = await d3.csv(DATA_URL);
        if (!isMounted) {
          return;
        }
        setRawData(data);
        setLoading(false);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError('Unable to load the loan eligibility dataset. Please refresh the page.');
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const dataset = useMemo(() => rawData.map(normalizeRecord), [rawData]);

  const filteredData = useMemo(() => {
    if (!dataset.length) {
      return [];
    }

    return dataset.filter((item) => {
      if (filters.propertyArea !== 'All' && item.Property_Area !== filters.propertyArea) {
        return false;
      }

      if (filters.education !== 'All' && item.Education !== filters.education) {
        return false;
      }

      if (filters.gender !== 'All' && item.Gender !== filters.gender) {
        return false;
      }

      if (
        filters.creditHistory !== 'All' &&
        item.Credit_History !== Number(filters.creditHistory)
      ) {
        return false;
      }

      if (filters.loanStatus !== 'All') {
        if (filters.loanStatus === 'Approved' && item.Loan_Status !== 'Y') {
          return false;
        }
        if (filters.loanStatus === 'Rejected' && item.Loan_Status !== 'N') {
          return false;
        }
      }

      return true;
    });
  }, [dataset, filters]);

  const filterOptions = useMemo(() => {
    const toOptionList = (values) => ['All', ...Array.from(new Set(values)).filter(Boolean)];

    return {
      propertyAreas: toOptionList(dataset.map((item) => item.Property_Area)),
      educations: toOptionList(dataset.map((item) => item.Education)),
      genders: toOptionList(dataset.map((item) => item.Gender)),
      creditHistories: ['All', '1', '0'],
      loanStatuses: ['All', 'Approved', 'Rejected']
    };
  }, [dataset]);

  const insightMetrics = useMemo(() => {
    if (!dataset.length) {
      return null;
    }

    const approved = dataset.filter((item) => item.Loan_Status === 'Y');
    const approvalRate = (approved.length / dataset.length) * 100;

    const avgLoanAmount = d3.mean(approved, (item) => item.Loan_Amount) ?? 0;
    const avgIncome = d3.mean(dataset, (item) => item.Total_Income) ?? 0;

    const propertyImpact = d3.rollups(
      dataset,
      (values) => ({
        approvalRate: d3.mean(values, (d) => (d.Loan_Status === 'Y' ? 1 : 0)) ?? 0,
        count: values.length
      }),
      (d) => d.Property_Area
    )
      .map(([area, metrics]) => ({ area, ...metrics }))
      .filter((entry) => entry.area)
      .sort((a, b) => b.approvalRate - a.approvalRate);

    return {
      approvalRate,
      avgLoanAmount,
      avgIncome,
      propertyImpact
    };
  }, [dataset]);

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  return (
    <div className="App">
      <header className="app-header">
        <div>
          <h1>LoanScope</h1>
          <p>
            Interactive visualization of loan eligibility data using React and D3. Explore how
            income, education, credit history, and property location relate to loan approval
            outcomes. Dataset from India (annual income in Indian Rupees, ₹).
          </p>
        </div>
        <div className="data-badge">
          <span>Source</span>
          <a
            href="https://www.kaggle.com/datasets/avineshprabhakaran/loan-eligibility-prediction"
            target="_blank"
            rel="noreferrer"
          >
            Kaggle Loan Eligibility Prediction
          </a>
        </div>
      </header>

      {loading && (
        <section className="app-state">
          <p className="loading">Loading dataset...</p>
        </section>
      )}

      {error && (
        <section className="app-state error">
          <p>{error}</p>
        </section>
      )}

      {!loading && !error && (
        <>
          <InsightSummary insights={insightMetrics} totalCount={dataset.length} />
          <Dashboard
            data={filteredData}
            allData={dataset}
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
          />
        </>
      )}

      <footer className="app-footer">
        <p>
          CS450 Data Visualization Project &mdash; React + D3.js
          <br />
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
            Richie Rojas, Md Uddin, Eser Gjoka, Jonathan Malave, Ismail Shaikh
          </span>
        </p>
      </footer>
    </div>
  );
}

export default App;

import PropTypes from 'prop-types';
import CurrencyConverter from './CurrencyConverter';

function InsightSummary({ insights, totalCount }) {
  if (!insights) {
    return null;
  }

  const hasPropertyImpact = insights.propertyImpact.length > 0;
  const topPropertyArea = hasPropertyImpact ? insights.propertyImpact[0] : null;
  const trailingPropertyArea = hasPropertyImpact
    ? insights.propertyImpact[insights.propertyImpact.length - 1]
    : null;

  return (
    <section className="insight-summary">
      <div className="summary-card">
        <h2>Dataset Overview</h2>
        <p>
          This dataset contains <strong>{totalCount}</strong> loan applications from <strong>India</strong> with information on
          applicant demographics, financial indicators, and approval outcomes. All income values are annual income in Indian Rupees (₹).{' '}
          <strong>{insights.approvalRate.toFixed(1)}%</strong> of applications were approved.
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Average approved loan amount</span>
          <span className="metric-value">
            <CurrencyConverter value={insights.avgLoanAmount} showBoth />
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Average household income (annual)</span>
          <span className="metric-value">
            <CurrencyConverter value={insights.avgIncome} showBoth />
          </span>
        </div>

        {topPropertyArea && (
          <div className="metric-card">
            <span className="metric-label">Best performing property area</span>
            <span className="metric-value">
              {topPropertyArea.area}{' '}
              <span className="metric-subvalue">
                {Math.round(topPropertyArea.approvalRate * 100)}% approval
              </span>
            </span>
          </div>
        )}

        {trailingPropertyArea && (
          <div className="metric-card">
            <span className="metric-label">Lowest performing property area</span>
            <span className="metric-value">
              {trailingPropertyArea.area}{' '}
              <span className="metric-subvalue">
                {Math.round(trailingPropertyArea.approvalRate * 100)}% approval
              </span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

InsightSummary.propTypes = {
  insights: PropTypes.shape({
    approvalRate: PropTypes.number.isRequired,
    avgLoanAmount: PropTypes.number.isRequired,
    avgIncome: PropTypes.number.isRequired,
    propertyImpact: PropTypes.arrayOf(
      PropTypes.shape({
        area: PropTypes.string,
        approvalRate: PropTypes.number,
        count: PropTypes.number
      })
    ).isRequired
  }),
  totalCount: PropTypes.number.isRequired
};

InsightSummary.defaultProps = {
  insights: null
};

export default InsightSummary;



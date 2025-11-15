import PropTypes from 'prop-types';
import FilterPanel from './FilterPanel';
import ApprovalByPropertyChart from './charts/ApprovalByPropertyChart';
import IncomeVsLoanStatusChart from './charts/IncomeVsLoanStatusChart';
import EducationApprovalChart from './charts/EducationApprovalChart';
import CreditHistoryOutcomeChart from './charts/CreditHistoryOutcomeChart';

function Dashboard({ data, allData, filters, filterOptions, onFilterChange }) {
  const activeData = data.length ? data : [];

  return (
    <section className="dashboard">
      <FilterPanel
        filters={filters}
        options={filterOptions}
        onFilterChange={onFilterChange}
        totalRecords={activeData.length}
        totalAvailable={allData.length}
      />

      {!activeData.length && (
        <div className="no-data">
          <p>
            No records match the current filter selection. Try broadening your filters or resetting
            them to view the full dataset.
          </p>
        </div>
      )}

      {activeData.length > 0 && (
        <div className="charts-grid">
          <IncomeVsLoanStatusChart data={activeData} />
          <EducationApprovalChart data={activeData} />
          <CreditHistoryOutcomeChart data={activeData} />
          <ApprovalByPropertyChart data={activeData} />
        </div>
      )}
    </section>
  );
}

Dashboard.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  allData: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.shape({
    propertyArea: PropTypes.string.isRequired,
    education: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    creditHistory: PropTypes.string.isRequired,
    loanStatus: PropTypes.string.isRequired
  }).isRequired,
  filterOptions: PropTypes.shape({
    propertyAreas: PropTypes.arrayOf(PropTypes.string).isRequired,
    educations: PropTypes.arrayOf(PropTypes.string).isRequired,
    genders: PropTypes.arrayOf(PropTypes.string).isRequired,
    creditHistories: PropTypes.arrayOf(PropTypes.string).isRequired,
    loanStatuses: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired
};

export default Dashboard;



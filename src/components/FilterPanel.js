import PropTypes from 'prop-types';

function FilterPanel({ filters, options, onFilterChange, totalRecords, totalAvailable }) {
  const filteredPercentage =
    totalAvailable > 0 ? Math.round((totalRecords / totalAvailable) * 100) : 0;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2>Filters</h2>
        <p>
          Use the dropdowns below to filter the dataset by different attributes. All charts update
          automatically to show only the selected subset of applicants.
        </p>
      </div>

      <div className="filter-controls">
        <label htmlFor="propertyArea-filter">
          Property Area
          <select
            id="propertyArea-filter"
            value={filters.propertyArea}
            onChange={(event) => onFilterChange('propertyArea', event.target.value)}
          >
            {options.propertyAreas.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="education-filter">
          Education
          <select
            id="education-filter"
            value={filters.education}
            onChange={(event) => onFilterChange('education', event.target.value)}
          >
            {options.educations.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="gender-filter">
          Gender
          <select
            id="gender-filter"
            value={filters.gender}
            onChange={(event) => onFilterChange('gender', event.target.value)}
          >
            {options.genders.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="creditHistory-filter">
          Credit History
          <select
            id="creditHistory-filter"
            value={filters.creditHistory}
            onChange={(event) => onFilterChange('creditHistory', event.target.value)}
          >
            {options.creditHistories.map((option) => (
              <option key={option} value={option}>
                {option === 'All'
                  ? 'All'
                  : option === '1'
                    ? 'Has credit history'
                    : 'No credit history'}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="loanStatus-filter">
          Loan Status
          <select
            id="loanStatus-filter"
            value={filters.loanStatus}
            onChange={(event) => onFilterChange('loanStatus', event.target.value)}
          >
            {options.loanStatuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-footer">
        <p>
          Showing <strong>{totalRecords}</strong> applicants ({filteredPercentage}% of dataset).
        </p>
        <button
          type="button"
          className="reset-button"
          onClick={() => {
            onFilterChange('propertyArea', 'All');
            onFilterChange('education', 'All');
            onFilterChange('gender', 'All');
            onFilterChange('creditHistory', 'All');
            onFilterChange('loanStatus', 'All');
          }}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}

FilterPanel.propTypes = {
  filters: PropTypes.shape({
    propertyArea: PropTypes.string.isRequired,
    education: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    creditHistory: PropTypes.string.isRequired,
    loanStatus: PropTypes.string.isRequired
  }).isRequired,
  options: PropTypes.shape({
    propertyAreas: PropTypes.arrayOf(PropTypes.string).isRequired,
    educations: PropTypes.arrayOf(PropTypes.string).isRequired,
    genders: PropTypes.arrayOf(PropTypes.string).isRequired,
    creditHistories: PropTypes.arrayOf(PropTypes.string).isRequired,
    loanStatuses: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  totalRecords: PropTypes.number.isRequired,
  totalAvailable: PropTypes.number.isRequired
};

export default FilterPanel;



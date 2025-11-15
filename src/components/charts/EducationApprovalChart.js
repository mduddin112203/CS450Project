import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const dimensions = {
  width: 420,
  height: 320,
  margin: { top: 24, right: 140, bottom: 56, left: 64 }
};

const statusColors = {
  Y: '#22c55e',
  N: '#ef4444'
};

function EducationApprovalChart({ data }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data.length) {
      return;
    }

    const aggregated = d3
      .rollups(
        data,
        (values) => ({
          Y: values.filter((entry) => entry.Loan_Status === 'Y').length,
          N: values.filter((entry) => entry.Loan_Status === 'N').length,
          total: values.length,
          approvalRate: d3.mean(values, (entry) => (entry.Loan_Status === 'Y' ? 1 : 0)) ?? 0
        }),
        (entry) => entry.Education
      )
      .map(([education, metrics]) => ({ education, ...metrics }))
      .filter((entry) => entry.education)
      .sort((a, b) => d3.ascending(a.education, b.education));

    if (!aggregated.length) {
      return;
    }

    const stackedData = d3
      .stack()
      .keys(['Y', 'N'])
      .value((entry, key) => entry[key])(aggregated);

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    const { width, height, margin } = dimensions;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(aggregated.map((entry) => entry.education))
      .range([0, chartWidth])
      .padding(0.4);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(aggregated, (entry) => entry.total) ?? 1])
      .nice()
      .range([chartHeight, 0]);

    const svg = svgElement.attr('viewBox', `0 0 ${width} ${height}`);
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    chart
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .attr('class', 'x-axis')
      .call(d3.axisBottom(xScale));

    chart.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

    chart
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + margin.bottom - 8)
      .attr('text-anchor', 'middle')
      .text('Education level');

    chart
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', -chartHeight / 2)
      .attr('y', -margin.left + 16)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Number of applicants');

    const tooltip = d3.select(tooltipRef.current);

    chart
      .selectAll('.stack')
      .data(stackedData)
      .join('g')
      .attr('fill', (stackLayer) => statusColors[stackLayer.key])
      .attr('opacity', 0.9)
      .selectAll('rect')
      .data((stackLayer) =>
        stackLayer.map((segment) => ({
          segment,
          key: stackLayer.key
        }))
      )
      .join('rect')
      .attr('x', ({ segment }) => xScale(segment.data.education))
      .attr('y', ({ segment }) => yScale(segment[1]))
      .attr('height', ({ segment }) => yScale(segment[0]) - yScale(segment[1]))
      .attr('width', xScale.bandwidth())
      .on('mouseenter', (event, entry) => {
        const [x, y] = d3.pointer(event);
        const { key, segment } = entry;
        const group = segment.data;
        const count = key === 'Y' ? group.Y : group.N;
        const rate = group.total > 0 ? Math.round((count / group.total) * 100) : 0;
        tooltip
          .style('opacity', 1)
          .style('left', `${x + margin.left + 8}px`)
          .style('top', `${y + margin.top - 32}px`)
          .html(
            `<strong>${group.education}</strong><br/>${key === 'Y' ? 'Approved' : 'Rejected'}: ${count}<br/>Share: ${rate}%<br/>Total: ${group.total}`
          );
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
      });

    chart
      .selectAll('.hover-area')
      .data(aggregated)
      .join('rect')
      .attr('class', 'hover-area')
      .attr('x', (entry) => xScale(entry.education))
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, entry) => {
        const [x, y] = d3.pointer(event);
        const rate = entry.total > 0 ? Math.round((entry.Y / entry.total) * 100) : 0;
        tooltip
          .style('opacity', 1)
          .style('left', `${x + margin.left + 8}px`)
          .style('top', `${y + margin.top - 32}px`)
          .html(
            `<strong>${entry.education}</strong><br/>Approved: ${entry.Y}<br/>Rejected: ${entry.N}<br/>Total: ${entry.total}<br/>Approval rate: ${rate}%`
          );
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
      });

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - margin.right + 20},${margin.top})`);

    ['Y', 'N'].forEach((status, index) => {
      const group = legend.append('g').attr('transform', `translate(0, ${index * 24})`);
      group
        .append('rect')
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', 16)
        .attr('height', 16)
        .attr('fill', statusColors[status]);
      group
        .append('text')
        .attr('x', 24)
        .attr('y', 0)
        .text(status === 'Y' ? 'Approved' : 'Rejected');
    });
  }, [data]);

  return (
    <article className="chart-card">
      <header>
        <h3>Education and loan approval</h3>
        <p>Compare approval rates between graduate and non-graduate applicants.</p>
      </header>
      <div className="chart-wrapper">
        <svg ref={svgRef} aria-label="Stacked bar chart showing education level and loan approval outcomes" />
        <div ref={tooltipRef} className="chart-tooltip" />
      </div>
    </article>
  );
}

EducationApprovalChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      Education: PropTypes.string,
      Loan_Status: PropTypes.string
    })
  ).isRequired
};

export default EducationApprovalChart;


import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const dimensions = {
  width: 420,
  height: 320,
  margin: { top: 24, right: 140, bottom: 56, left: 64 }
};

const areaColors = {
  Rural: '#3b82f6',
  Semiurban: '#10b981',
  Urban: '#f59e0b'
};

function ApprovalByPropertyChart({ data }) {
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
          approvalRate: d3.mean(values, (entry) => (entry.Loan_Status === 'Y' ? 1 : 0)) ?? 0,
          total: values.length
        }),
        (entry) => entry.Property_Area?.trim()
      )
      .map(([area, metrics]) => ({ area: area?.trim(), ...metrics }))
      .filter((entry) => entry.area)
      .sort((a, b) => {
        const order = { Rural: 0, Semiurban: 1, Urban: 2 };
        return (order[a.area] ?? 99) - (order[b.area] ?? 99);
      });

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    const { width, height, margin } = dimensions;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = svgElement.attr('viewBox', `0 0 ${width} ${height}`);
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(aggregated.map((entry) => entry.area))
      .range([0, chartWidth])
      .padding(0.35);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(aggregated, (entry) => entry.approvalRate) ?? 1])
      .nice()
      .range([chartHeight, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format('.0%'));

    chart
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis);

    chart.append('g').attr('class', 'y-axis').call(yAxis);

    chart
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + margin.bottom - 8)
      .attr('text-anchor', 'middle')
      .text('Property area');

    chart
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', -chartHeight / 2)
      .attr('y', -margin.left + 16)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Approval rate');

    const tooltip = d3.select(tooltipRef.current);

    chart
      .selectAll('.area-bar')
      .data(aggregated)
      .join('rect')
      .attr('class', 'area-bar')
      .attr('x', (entry) => xScale(entry.area))
      .attr('y', (entry) => yScale(entry.approvalRate))
      .attr('width', xScale.bandwidth())
      .attr('height', (entry) => chartHeight - yScale(entry.approvalRate))
      .style('fill', (entry) => {
        const area = entry.area?.trim();
        return areaColors[area] || '#007bff';
      })
      .on('mouseenter', (event, entry) => {
        const [x, y] = d3.pointer(event);
        tooltip
          .style('opacity', 1)
          .style('left', `${x + margin.left}px`)
          .style('top', `${y + margin.top - 24}px`)
          .html(
            `<strong>${entry.area}</strong><br/>Approval rate: ${(entry.approvalRate * 100).toFixed(
              1
            )}%<br/>Applications: ${entry.total}`
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
      .attr('x', (entry) => xScale(entry.area))
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, entry) => {
        const [x, y] = d3.pointer(event);
        tooltip
          .style('opacity', 1)
          .style('left', `${x + margin.left}px`)
          .style('top', `${y + margin.top - 24}px`)
          .html(
            `<strong>${entry.area}</strong><br/>Approval rate: ${(entry.approvalRate * 100).toFixed(
              1
            )}%<br/>Applications: ${entry.total}`
          );
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
      });

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - margin.right + 20},${margin.top})`);

    aggregated.forEach((entry, index) => {
      const group = legend.append('g').attr('transform', `translate(0, ${index * 24})`);
      const area = entry.area?.trim();
      const color = areaColors[area] || '#007bff';
      group
        .append('rect')
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', 16)
        .attr('height', 16)
        .attr('fill', color);
      group
        .append('text')
        .attr('x', 24)
        .attr('y', 0)
        .text(area);
    });
  }, [data]);

  return (
    <article className="chart-card">
      <header>
        <h3>Property area trends</h3>
        <p>Compare loan approval rates and patterns across urban, rural, and semi-urban areas.</p>
      </header>
      <div className="chart-wrapper">
        <svg ref={svgRef} aria-label="Bar chart showing approval rate by property area" />
        <div ref={tooltipRef} className="chart-tooltip" />
      </div>
    </article>
  );
}

ApprovalByPropertyChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      Property_Area: PropTypes.string,
      Loan_Status: PropTypes.string
    })
  ).isRequired
};

export default ApprovalByPropertyChart;



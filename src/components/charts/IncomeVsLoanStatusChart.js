import { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const dimensions = {
  width: 420,
  height: 320,
  margin: { top: 24, right: 140, bottom: 80, left: 72 }
};

const statusColors = {
  Y: '#22c55e',
  N: '#ef4444'
};

const thresholds = [0, 5000, 10000, 15000, 20000, 30000, 50000, 75000];

function IncomeVsLoanStatusChart({ data }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  const incomeRanges = useMemo(() => {
    const filtered = data.filter(
      (entry) => typeof entry.Total_Income === 'number' && entry.Total_Income > 0
    );

    if (!filtered.length) {
      return [];
    }

    const minIncome = d3.min(filtered, (entry) => entry.Total_Income) ?? 0;
    const maxIncome = d3.max(filtered, (entry) => entry.Total_Income) ?? 100000;
    const incomeThresholds = [...thresholds, maxIncome + 1];

    const bins = d3
      .bin()
      .domain([minIncome, maxIncome])
      .thresholds(incomeThresholds)
      .value((entry) => entry.Total_Income)(filtered);

    return bins
      .filter((bin) => bin.length > 0)
      .map((bin) => {
        let rangeLabel;
        if (bin.x1 > 75000) {
          rangeLabel = `₹${d3.format(',.0f')(bin.x0 / 1000)}k+`;
        } else {
          rangeLabel = `₹${d3.format(',.0f')(bin.x0 / 1000)}k - ₹${d3.format(',.0f')(bin.x1 / 1000)}k`;
        }

        const approved = bin.filter((entry) => entry.Loan_Status === 'Y').length;
        const rejected = bin.filter((entry) => entry.Loan_Status === 'N').length;
        const approvalRate = bin.length > 0 ? approved / bin.length : 0;

        return {
          range: rangeLabel,
          rangeStart: bin.x0,
          rangeEnd: bin.x1,
          approved,
          rejected,
          total: bin.length,
          approvalRate
        };
      });
  }, [data]);

  useEffect(() => {
    if (!incomeRanges.length) {
      return;
    }

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    const { width, height, margin } = dimensions;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(incomeRanges.map((entry) => entry.range))
      .range([0, chartWidth])
      .padding(0.4);

    const maxCount = d3.max(incomeRanges, (entry) => entry.total) ?? 1;
    const yScale = d3.scaleLinear().domain([0, maxCount]).nice().range([chartHeight, 0]);

    const svg = svgElement.attr('viewBox', `0 0 ${width} ${height}`);
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xAxis = d3.axisBottom(xScale);

    chart
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('font-size', '0.75rem')
      .attr('dx', '-.6em')
      .attr('dy', '.6em')
      .attr('transform', 'rotate(-45)');

    chart.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

    chart
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + margin.bottom - 8)
      .attr('text-anchor', 'middle')
      .text('Income range');

    chart
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', -chartHeight / 2)
      .attr('y', -margin.left + 16)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Number of applicants');

    const tooltip = d3.select(tooltipRef.current);

    const stackedData = d3
      .stack()
      .keys(['approved', 'rejected'])
      .value((entry, key) => entry[key])(incomeRanges);

    chart
      .selectAll('.stack')
      .data(stackedData)
      .join('g')
      .attr('fill', (stackLayer) => (stackLayer.key === 'approved' ? statusColors.Y : statusColors.N))
      .attr('opacity', 0.9)
      .selectAll('rect')
      .data((stackLayer) =>
        stackLayer.map((segment) => ({
          segment,
          key: stackLayer.key,
          data: segment.data
        }))
      )
      .join('rect')
      .attr('x', ({ data }) => xScale(data.range))
      .attr('y', ({ segment }) => yScale(segment[1]))
      .attr('height', ({ segment }) => yScale(segment[0]) - yScale(segment[1]))
      .attr('width', xScale.bandwidth())
      .on('mouseenter', (event, entry) => {
        const [xPos, yPos] = d3.pointer(event);
        const { data: entryData } = entry;
        tooltip
          .style('opacity', 1)
          .style('left', `${xPos + margin.left + 8}px`)
          .style('top', `${yPos + margin.top - 32}px`)
          .html(
            `<strong>${entryData.range}</strong><br/>Approved: ${entryData.approved}<br/>Rejected: ${entryData.rejected}<br/>Total: ${entryData.total}`
          );
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
      });

    chart
      .selectAll('.hover-area')
      .data(incomeRanges)
      .join('rect')
      .attr('class', 'hover-area')
      .attr('x', (entry) => xScale(entry.range))
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, entry) => {
        const [xPos, yPos] = d3.pointer(event);
        tooltip
          .style('opacity', 1)
          .style('left', `${xPos + margin.left + 8}px`)
          .style('top', `${yPos + margin.top - 32}px`)
          .html(
            `<strong>${entry.range}</strong><br/>Approved: ${entry.approved}<br/>Rejected: ${entry.rejected}<br/>Total: ${entry.total}`
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
  }, [incomeRanges]);

  return (
    <article className="chart-card">
      <header>
        <h3>Income vs loan status</h3>
        <p>
          Compare income ranges for approved and rejected applications. Income shown is annual
          income in Indian Rupees (₹).
        </p>
      </header>
      <div className="chart-wrapper">
        <svg ref={svgRef} aria-label="Grouped bar chart showing income ranges by loan approval status" />
        <div ref={tooltipRef} className="chart-tooltip" />
      </div>
    </article>
  );
}

IncomeVsLoanStatusChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      Total_Income: PropTypes.number,
      Loan_Status: PropTypes.string
    })
  ).isRequired
};

export default IncomeVsLoanStatusChart;


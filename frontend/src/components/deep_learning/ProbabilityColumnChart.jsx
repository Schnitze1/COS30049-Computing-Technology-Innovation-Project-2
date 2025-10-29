/**
 * @file ProbabilityColumnChart.jsx
 * @description A responsive D3.js column chart that visualizes
 * classification probabilities
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Chart's size and layout
const SVG_WIDTH = 860;
const SVG_HEIGHT = 575;
const MARGIN = {
  top: 130, right: 30, bottom: 40, left: 80,
};

/**
 * The chart shows the top 3 predictions and groups the rest into an Other category
 *
 * @param {object} props The component props
 * @param {number[]} props.probabilities An array of probability scores from the model
 * @param {string[]} props.classLabels The corresponding labels for each probability score
 * @param {boolean} props.isDark A flag to toggle dark mode styles
 */
export function ProbabilityColumnChart({ probabilities, classLabels, isDark = false }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!probabilities || probabilities.length === 0) {
      return;
    }

    // SECTION: Data Preparation
    const allData = classLabels.map((label, i) => ({
      label,
      value: probabilities[i],
    })).sort((a, b) => b.value - a.value);

    const top3Data = allData.slice(0, 3);
    const otherValue = allData.slice(3).reduce((sum, current) => sum + current.value, 0);

    const finalData = [...top3Data];
    if (otherValue > 0.001) {
      finalData.push({ label: "Other", value: otherValue });
    }
    finalData.sort((a, b) => a.value - b.value);

    // SECTION: SVG and Chart Setup
    const width = SVG_WIDTH - MARGIN.left - MARGIN.right;
    const height = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current)
      // Use viewBox for responsive scaling on mobile
      .attr("viewBox", `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`)
      .html(""); // Clear previous SVG

    const chart = svg.append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // SECTION: Scales and Colors
    const color = d3.scaleOrdinal()
      .domain(finalData.map((d) => d.label))
      .range(["#FBC877", "#45A587", "#4582BD", "#EF9B7D"]);

    const xScale = d3.scaleBand()
      .domain(finalData.map((d) => d.label))
      .range([0, width])
      .padding(0.4);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(finalData, (d) => d.value) * 1.1 || 0.1])
      .range([height, 0]);

    // SECTION: Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute").style("z-index", "10")
      .style("visibility", "hidden").style("padding", "10px")
      .style("background", "rgba(0,0,0,0.7)").style("border-radius", "5px")
      .style("color", "#fff");

    // SECTION: Chart Elements (Titles, Axes, Grid)
    chart.append("text")
      .attr("x", width / 2).attr("y", -100).attr("text-anchor", "middle")
      .style("font-size", "28px").style("font-weight", "bold")
      .attr("fill", isDark ? "#EF9B7D" : "#D95C39")
      .text("Model Confidence Scores");
    chart.append("text")
      .attr("x", width / 2).attr("y", -75).attr("text-anchor", "middle")
      .style("font-size", "14px").attr("fill", isDark ? "#AAA" : "#555")
      .text("Shows the model's confidence for the most likely predicted traffic types.");

    const yAxis = chart.append("g").call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".0%")));
    yAxis.selectAll("text").attr("fill", isDark ? "#FFF" : "#000").style("font-size", "14px");

    chart.append("text")
      .attr("transform", "rotate(-90)").attr("y", 0 - MARGIN.left + 20)
      .attr("x", 0 - (height / 2)).attr("dy", "1em")
      .style("text-anchor", "middle").style("font-size", "16px").style("font-weight", "bold")
      .attr("fill", isDark ? "#FFF" : "#000")
      .text("Accuracy (%)");

    chart.append("g").attr("class", "grid")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat(""))
      .selectAll("line").style("stroke", isDark ? "#444" : "#e0e0e0");

    const legend = chart.append("g").attr("transform", 'translate(0, -15)');
    const legendScale = d3.scalePoint()
      .domain(finalData.map((d) => d.label)).range([0, width]).padding(0.5);

    const legendItems = legend.selectAll(".legend-item").data(finalData).enter()
      .append("g").attr("class", "legend-item")
      .attr("transform", (d) => `translate(${legendScale(d.label)}, 0)`);

    legendItems.append("rect")
      .attr("y", -7).attr("width", 15).attr("height", 15)
      .attr("fill", (d) => color(d.label));

    legendItems.append("text")
      .attr("x", 20).attr("y", 0).attr("dy", "0.35em")
      .text((d) => d.label).attr("fill", isDark ? "#FFF" : "#000")
      .style("font-size", "14px");

    chart.selectAll(".bar").data(finalData).enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.label))
      .attr("width", xScale.bandwidth())
      .attr("fill", (d) => color(d.label))
      .attr("y", yScale(0))
      .attr("height", 0)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).style("opacity", 0.8);
        tooltip.html(`${d.label}: ${(d.value * 100).toFixed(2)}%`)
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget).style("opacity", 1);
        tooltip.style("visibility", "hidden");
      })
      .transition()
      .duration(800)
      .attr("y", (d) => yScale(d.value))
      .attr("height", (d) => height - yScale(d.value))
      .delay((d, i) => i * 100);

    return () => {
      tooltip.remove();
    };
  }, [probabilities, classLabels, isDark]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
}
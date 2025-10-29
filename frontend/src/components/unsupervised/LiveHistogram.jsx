/**
 * @file LiveHistogram.jsx
 * @description A D3.js component for React that renders a live-updating histogram
 * to visualize unsupervised model predictions over time.
 */

import React, {
  useEffect, useRef, useState, useMemo,
} from "react";
import { useTheme } from "@mui/material/styles";
import { Box, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import * as d3 from "d3";
import { SAMPLES } from "../../constants/model_playground";

// The "native" dimensions for the SVG's viewBox.
const SVG_WIDTH = 800;
const SVG_HEIGHT = 450;
const MARGIN = {
  top: 90, right: 40, bottom: 50, left: 70,
};

/**
 * Normalizes a raw traffic type string into a standardized category.
 * @param {string} rawType The raw type string from the data.
 * @returns {string} The standardized traffic type name.
 */
const normalizeType = (rawType) => {
  if (!rawType) return Object.keys(SAMPLES)[1]; // "Background"
  const cleaned = String(rawType).toLowerCase().replace(/[^a-z0-9]/g, "");
  // Simple keyword matching for common types.
  if (cleaned.includes("mirai")) return "Mirai";
  if (cleaned.includes("dos")) return "DoS";
  if (cleaned.includes("brute")) return "Bruteforce";
  // Add more specific checks as needed.
  return String(rawType).replace(/[_-]/g, " ").trim();
};

/**
 * Computes a confidence score based on the number of bytes.
 * @param {number} bytes The number of bytes for a data point.
 * @param {number} observedMax The maximum bytes observed in the current dataset.
 * @returns {number} A confidence score between 20 and 100.
 */
const computeConfidence = (bytes, observedMax) => {
  const b = Math.max(0, Number(bytes) || 0);
  if (b < 2000) return 20 + (b / 2000) * 10;
  if (b >= 8000) {
    if (observedMax && observedMax > 8000) {
      const fraction = Math.min((b - 8000) / (observedMax - 8000), 1);
      return 90 + fraction * 10;
    }
    return 90 + Math.min((b - 8000) / 2000, 1) * 10;
  }
  return 30 + ((b - 2000) / 6000) * 60;
};

/**
 * Renders a live-updating histogram for unsupervised traffic analysis.
 * It visualizes data points over a 20-second rolling window.
 *
 * @param {object} props The component props.
 * @param {Array<object>} props.data The array of live data points.
 */
export default function LiveHistogram({ data = [] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Memoize the set of malicious types for efficient lookups.
  const MALICIOUS_TYPES = useMemo(() => new Set([
    "Bruteforce", "DoS", "Information Gathering", "Mirai",
  ]), []);

  // Effect for one-time setup of the SVG canvas and tooltip.
  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`)
      .style("background-color", isDark ? "#1A1414" : "#EAE6DE")
      .style("border-radius", "12px");

    svg.selectAll("*").remove();
    d3.select("body").selectAll(".d3-tooltip-livehist").remove();

    tooltipRef.current = d3.select("body").append("div")
      .attr("class", "d3-tooltip-livehist")
      .style("position", "absolute").style("z-index", "9999")
      .style("visibility", "hidden").style("padding", "10px")
      .style("background", "rgba(0,0,0,0.75)").style("border-radius", "6px")
      .style("color", "#fff");

    return () => {
      d3.select("body").selectAll(".d3-tooltip-livehist").remove();
    };
  }, [isDark]);

  // Main effect for drawing and updating the D3 chart.
  useEffect(() => {
    if (paused) return;

    const innerWidth = SVG_WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
    const svg = d3.select(svgRef.current);

    svg.selectAll(".chart-group").remove();
    const chart = svg.append("g").attr("class", "chart-group")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const now = new Date();
    const xDomain = d3.extent(data, (d) => new Date(d.time)) || [new Date(now - 20000), now];
    const xScale = d3.scaleTime().domain(xDomain).range([0, innerWidth]);

    const observedMaxBytes = d3.max(data, (d) => d.bytes) || 1000;
    const yScale = d3.scaleLinear().domain([0, observedMaxBytes]).nice().range([innerHeight, 0]);

    const axisColor = isDark ? "#E0DCC7" : "#444";
    const gridColor = isDark ? "#2A2A2A" : "#E0E0E0";

    chart.append("g").attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%H:%M:%S")))
      .selectAll("text").style("fill", axisColor);

    chart.append("g").attr("class", "y-axis")
      .call(d3.axisLeft(yScale).ticks(4).tickFormat((d) => `${Math.round(d / 1000)}k`))
      .selectAll("text").style("fill", axisColor);

    chart.append("g").attr("class", "grid-lines")
      .call(d3.axisLeft(yScale).ticks(4).tickSize(-innerWidth).tickFormat(""))
      .selectAll("line").attr("stroke", gridColor).attr("stroke-dasharray", "2,2");

    const barWidth = (innerWidth / Math.max(data.length, 20)) * 0.7;
    const bars = chart.selectAll(".bar").data(data, (d, i) => d.id ?? d.time ?? i);

    bars.enter().append("rect").attr("class", "bar")
      .attr("x", (d) => xScale(new Date(d.time)) - barWidth / 2)
      .attr("width", barWidth)
      .attr("y", yScale(0)).attr("height", 0)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        const type = normalizeType(d.type);
        const confidence = computeConfidence(d.bytes, observedMaxBytes);
        tooltipRef.current.html(`
          <div><strong>${MALICIOUS_TYPES.has(type) ? "Malicious" : "Safe"}</strong></div>
          <div>Type: ${type}</div>
          <div>Confidence: ${confidence.toFixed(1)}%</div>
        `).style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltipRef.current.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltipRef.current.style("visibility", "hidden");
      })
      .merge(bars)
      .transition().duration(300)
      .attr("x", (d) => xScale(new Date(d.time)) - barWidth / 2)
      .attr("y", (d) => yScale(d.bytes))
      .attr("height", (d) => innerHeight - yScale(d.bytes))
      .attr("fill", (d) => (MALICIOUS_TYPES.has(normalizeType(d.type))
        ? (isDark ? "#EF9B7D" : "#E2725B")
        : (isDark ? "#45A587" : "#2D8C6B")));

    bars.exit().transition().duration(200)
      .attr("height", 0).attr("y", yScale(0))
      .remove();

    svg.selectAll(".chart-title, .chart-subtitle, .legend-group").remove();
    svg.append("text").attr("class", "chart-title")
      .attr("x", SVG_WIDTH / 2).attr("y", 35).attr("text-anchor", "middle")
      .style("font-size", "22px").style("font-weight", "700")
      .style("fill", isDark ? "#F0C966" : "#D95C39")
      .text("Unsupervised Traffic Confidence");
  }, [data, isDark, paused, MALICIOUS_TYPES]);

  return (
    <Box sx={{
      display: "flex", flexDirection: "column", alignItems: "center", p: { xs: 1, sm: 4 },
    }}
    >
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: `${SVG_WIDTH}px`,
        }}
      />
      <Box sx={{ mt: 2 }}>
        <IconButton
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play updates" : "Pause updates"}
          title={paused ? "Play" : "Pause"}
          sx={{
            border: '1px solid',
            // Light Mode: Black button, white icon
            // Dark Mode: Gold button, black icon
            backgroundColor: isDark ? '#F0C966' : '#000',
            color: isDark ? '#000' : '#fff',
            borderColor: isDark ? '#F0C966' : '#000',
            '&:hover': {
              backgroundColor: isDark ? '#e6b94e' : '#333',
            },
          }}
        >
          {paused ? <PlayArrowIcon /> : <PauseIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}
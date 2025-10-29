/**
 * @file DecisionFlowSnakey.jsx
 * @description A D3.js Sankey diagram component for React that visualizes the flow
 * from feature inputs, through a model, to classification probabilities.
 */

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

// Chart's native aspect ratio and layout. D3 will always draw to this size.
const SVG_WIDTH = 900;
const SVG_HEIGHT = 500;

export default function DecisionFlowSnakey({
  probabilities,
  classLabels,
  featureImportances,
  featureVector = {},
  modelName = "Model",
  isDark = false,
}) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!probabilities || !classLabels || !featureImportances) {
      return;
    }

    // SECTION: SVG and Tooltip Setup
    const svg = d3.select(svgRef.current)
      // Use viewBox for responsive scaling.
      .attr("viewBox", `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`)
      .html(""); // Clear previous renders

    if (!tooltipRef.current) {
      tooltipRef.current = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute").style("z-index", "10")
        .style("visibility", "hidden").style("padding", "8px 12px")
        .style("background", "rgba(0,0,0,0.8)").style("border-radius", "6px")
        .style("color", "#fff").style("font-size", "14px");
    }
    const tooltip = tooltipRef.current;

    // ... (The rest of the D3 drawing logic remains the same)
    const validFeatures = featureImportances.filter((d) => d && d.name);
    const validClasses = classLabels.filter(Boolean);
    const graph = {
      nodes: [
        ...validFeatures.map((d) => ({ id: d.name, type: "feature" })),
        { id: modelName, type: "model" },
        ...validClasses.map((d) => ({ id: d, type: "class" })),
      ],
      links: [
        ...validFeatures.map((d) => ({
          source: d.name,
          target: modelName,
          value: Math.max(0.001, featureVector[d.name] || 0),
        })),
        ...probabilities.map((p, i) => ({
          source: modelName,
          target: validClasses[i],
          value: Math.max(0.001, p),
        })).filter((link) => link.target),
      ],
    };
    const sankeyLayout = sankey()
      .nodeId((d) => d.id)
      .nodeWidth(25)
      .nodePadding(20)
      .extent([[50, 50], [SVG_WIDTH - 50, SVG_HEIGHT - 80]]);
    const { nodes, links } = sankeyLayout(graph);
    const colors = ["#4582BD", "#EF9B7D", "#FBC877", "#45A587"];
    const classColor = d3.scaleOrdinal().domain(classLabels).range(colors);
    const linkPaths = svg.selectAll(".link").data(links, (d) => `${d.source.id}->${d.target.id}`);
    linkPaths.enter().append("path").attr("class", "link")
      .merge(linkPaths)
      .on("mouseover", (event, d) => {
        const text = d.source.type === "model"
          ? `Confidence in '${d.target.id}': <strong>${(d.value * 100).toFixed(1)}%</strong>`
          : `'${d.source.id}' Contribution`;
        tooltip.html(text).style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"))
      .transition().duration(600)
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (d) => (d.source.type === "model" ? classColor(d.target.id) : isDark ? "#555" : "#ccc"))
      .attr("stroke-opacity", (d) => (d.source.type === "model" ? 0.7 : 0.5))
      .attr("stroke-width", (d) => Math.max(1.5, d.width));
    linkPaths.exit().remove();
    const nodeGroups = svg.selectAll(".node").data(nodes, (d) => d.id);
    const nodeEnter = nodeGroups.enter().append("g").attr("class", "node");
    nodeEnter.append("rect");
    nodeEnter.append("text");
    const nodeUpdate = nodeEnter.merge(nodeGroups);
    nodeUpdate.select("rect")
      .transition().duration(600)
      .attr("x", (d) => d.x0).attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0).attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => (d.type === "class" ? classColor(d.id) : isDark ? "#888" : "#999"))
      .attr("stroke", isDark ? "#111" : "#fff");
    nodeUpdate.select("text")
      .text((d) => d.id)
      .transition().duration(600)
      .attr("x", (d) => (d.x0 < SVG_WIDTH / 2 ? d.x1 + 8 : d.x0 - 8))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < SVG_WIDTH / 2 ? "start" : "end"))
      .attr("fill", isDark ? "#eee" : "#333")
      .style("font-size", "15px");
    nodeGroups.exit().remove();

    return () => {
      tooltip.style("visibility", "hidden");
    };
  }, [probabilities, classLabels, featureImportances, featureVector, modelName, isDark]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: SVG_WIDTH,
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
}
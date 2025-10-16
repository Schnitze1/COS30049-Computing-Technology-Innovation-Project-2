import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

const DecisionFlowSankey = ({
  probabilities,
  classLabels,
  featureImportances,
  featureVector = {},
  modelName = "Model",
  isDark = false,
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!probabilities || !classLabels || !featureImportances) return;
    const svgWidth = 900;
    const svgHeight = 500;
    const svg = d3
      .select(svgRef.current)
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    if (!tooltipRef.current) {
      tooltipRef.current = d3
        .select("body")
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "8px 12px")
        .style("background", "rgba(0,0,0,0.8)")
        .style("border-radius", "6px")
        .style("color", "#fff")
        .style("font-size", "14px");
    }
    const tooltip = tooltipRef.current;
    const colors = ["#4582BD", "#EF9B7D", "#FBC877", "#45A587"];
    const classColor = d3.scaleOrdinal().domain(classLabels).range(colors);
    const totalProbability = d3.sum(probabilities);
    const totalFeatureValue = d3.sum(Object.values(featureVector));
    const allSlidersZero = totalFeatureValue === 0;
    const validFeatures = featureImportances.filter(d => d && d.name);
    const validClasses = classLabels.filter(Boolean);
    const graph = {
      nodes: [
        ...validFeatures.map(d => ({ id: d.name, type: "feature" })),
        { id: modelName, type: "model" },
        ...validClasses.map(d => ({ id: d, type: "class" })),
      ],
      links: [
        ...validFeatures.map(d => {
          const featureValue = allSlidersZero ? 1 : featureVector[d.name] || 0;
          const normalizedTotal = allSlidersZero
            ? validFeatures.length
            : totalFeatureValue || 1;
          return {
            source: d.name,
            target: modelName,
            value: (featureValue / normalizedTotal) * totalProbability,
          };
        }),
        ...probabilities
          .map((p, i) => ({
            source: modelName,
            target: validClasses[i],
            value: p,
          }))
          .filter(link => link.target),
      ],
    };

    console.log("Graph Data:", graph);
    const sankeyLayout = sankey()
      .nodeId(d => d.id)
      .nodeWidth(25)
      .nodePadding(20)
      .extent([
        [50, 50],
        [svgWidth - 50, svgHeight - 80],
      ]);

    let nodes, links;
    try {
      ({ nodes, links } = sankeyLayout(graph));
    } catch (error) {
      console.error("Sankey layout failed:", error, graph);
      return;
    }
    let linkGroup = svg.select(".links-g");
    if (linkGroup.empty()) linkGroup = svg.append("g").attr("class", "links-g");
    const linkPaths = linkGroup
      .selectAll("path")
      .data(links, d => `${d.source.id}->${d.target.id}`);
    linkPaths
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", d =>
        d.source.type === "model"
          ? classColor(d.target.id)
          : isDark
          ? "#555"
          : "#ccc"
      )
      .attr("opacity", d => (d.source.type === "model" ? 0.7 : 0.5))
      .merge(linkPaths)
      .transition()
      .duration(600)
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke-width", d => Math.max(1.5, d.width));
    linkPaths.exit().remove();

    svg
      .selectAll(".links-g path")
      .on("mouseover", (event, d) => {
        const confidence = (d.value * 100).toFixed(1);
        const text =
          d.source.type === "model"
            ? `Confidence in '${d.target.id}': <strong>${confidence}%</strong>`
            : `'${d.source.id}' Setting: <strong>${(
                (featureVector[d.source.id] || 0) * 100
              ).toFixed(0)}%</strong>`;
        tooltip.html(text).style("visibility", "visible");
      })
      .on("mousemove", event => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    let nodeGroup = svg.select(".nodes-g");
    if (nodeGroup.empty()) nodeGroup = svg.append("g").attr("class", "nodes-g");

    const nodeSel = nodeGroup.selectAll("g").data(nodes, d => d.id);
    const nodeEnter = nodeSel.enter().append("g");

    nodeEnter
      .append("rect")
      .attr("fill", d => {
        if (d.type === "class") return classColor(d.id);
        return isDark ? "#888" : "#999";
      })
      .attr("stroke", isDark ? "#111" : "#fff");

    nodeEnter
      .append("text")
      .attr("dy", "0.35em")
      .attr("fill", isDark ? "#eee" : "#333")
      .style("font-size", "15px");

    const nodeMerge = nodeEnter.merge(nodeSel);

    nodeMerge
      .select("rect")
      .transition()
      .duration(600)
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0);

    nodeMerge
      .select("text")
      .attr("x", d => (d.x0 < svgWidth / 2 ? d.x1 + 8 : d.x0 - 8))
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("text-anchor", d => (d.x0 < svgWidth / 2 ? "start" : "end"))
      .text(d => d.id);

    nodeSel.exit().remove();

    return () => {
      tooltip.style("visibility", "hidden");
    };
  }, [probabilities, classLabels, featureImportances, featureVector, modelName, isDark]);

  return <svg ref={svgRef} />;
};

export default DecisionFlowSankey;

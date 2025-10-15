import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const ProbabilityColumnChart = ({ probabilities, classLabels, isDark = false }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!probabilities || probabilities.length === 0) return;

        const allData = classLabels.map((label, i) => ({
            label: label, value: probabilities[i]
        })).sort((a, b) => b.value - a.value);

        const top3Data = allData.slice(0, 3);
        const otherValue = allData.slice(3).reduce((sum, current) => sum + current.value, 0);
        
        let finalData = [...top3Data];
        if (otherValue > 0.001) {
            finalData.push({ label: "Other", value: otherValue });
        }
        
        finalData.sort((a, b) => a.value - b.value);
        const svgWidth = 860;
        const svgHeight = 575;
        const margin = { top: 130, right: 30, bottom: 40, left: 80 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .html("");
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        const colors = ["#FBC877", "#45A587", "#4582BD", "#EF9B7D"]; 
        const color = d3.scaleOrdinal()
            .domain(finalData.map(d => d.label))
            .range(colors.slice(0, finalData.length));
        g.append("text")
            .attr("x", width / 2)
            .attr("y", -100)
            .attr("text-anchor", "middle")
            .style("font-size", "28px")
            .style("font-weight", "bold")
            .attr("fill", isDark ? "#EF9B7D" : "#D95C39")
            .text("Model Confidence Scores");

        g.append("text")
            .attr("x", width / 2)
            .attr("y", -75)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .attr("fill", isDark ? "#AAA" : "#555")
            .text("Shows the model's confidence for the most likely predicted traffic types.");

        const legendScale = d3.scalePoint()
            .domain(finalData.map(d => d.label))
            .range([0, width])
            .padding(0.5);
            
        const legend = g.append("g")
            .attr("transform", `translate(0, -15)`);

        const legendItems = legend.selectAll(".legend-item")
            .data(finalData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", d => `translate(${legendScale(d.label)}, 0)`);

        legendItems.append("rect")
            .attr("y", -7)
            .attr("width", 15).attr("height", 15)
            .attr("fill", d => color(d.label));

        legendItems.append("text")
            .attr("x", 20).attr("y", 0)
            .attr("dy", "0.35em")
            .text(d => d.label)
            .attr("fill", isDark ? "#FFF" : "#000")
            .style("font-size", "14px");

        const maxValue = d3.max(finalData, d => d.value);
        const y = d3.scaleLinear()
            .domain([0, maxValue > 0 ? maxValue * 1.1 : 0.1])
            .range([height, 0]);

        const x = d3.scaleBand()
            .domain(finalData.map(d => d.label))
            .range([0, width])
            .padding(0.4);

        const yAxisG = g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")));
            
        yAxisG.selectAll("text")
            .attr("fill", isDark ? "#FFF" : "#000")
            .style("font-size", "14px");

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .attr("fill", isDark ? "#FFF" : "#000")
            .text("Accuracy (%)");

        g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
            .selectAll("line").style("stroke", isDark ? "#444" : "#e0e0e0");

        const xAxisG = g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSize(5));
        xAxisG.select(".domain").attr("stroke", isDark ? "#666" : "#333");
        xAxisG.selectAll(".tick line").attr("stroke", isDark ? "#666" : "#333");
        xAxisG.selectAll("text").remove();

        const boxColor = isDark ? "#666" : "#333";
        g.append("line")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", width).attr("y2", 0)
            .attr("stroke", boxColor);
        g.append("line")
            .attr("x1", width).attr("y1", 0)
            .attr("x2", width).attr("y2", height)
            .attr("stroke", boxColor);

        const tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute").style("z-index", "10").style("visibility", "hidden")
            .style("padding", "10px").style("background", "rgba(0,0,0,0.7)").style("border-radius", "5px")
            .style("color", "#fff");
        
        g.selectAll(".bar")
            .data(finalData)
            .enter()
            .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.label))
                .attr("width", x.bandwidth())
                .attr("fill", d => color(d.label))
                .attr("y", y(0))
                .attr("height", 0)
                .on("mouseover", function(event, d) {
                    d3.select(this).style("opacity", 0.8);
                    tooltip.html(`${d.label}: ${(d.value * 100).toFixed(2)}%`)
                        .style("visibility", "visible");
                })
                .on("mousemove", (event) => {
                    tooltip.style("top", (event.pageY - 10) + "px")
                           .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this).style("opacity", 1);
                    tooltip.style("visibility", "hidden");
                })
                .transition()
                .duration(800)
                .attr("y", d => y(d.value))
                .attr("height", d => height - y(d.value))
                .delay((d,i) => i * 100);

    }, [probabilities, classLabels, isDark]);

    return <svg ref={svgRef} />;
};
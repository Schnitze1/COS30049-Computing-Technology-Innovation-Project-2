/**
 * @file DeepLearningDiagram.jsx
 * @description Renders a dynamic, interactive D3.js visualization of a neural
 * network architecture. It fetches model data from an API and highlights the
 * activation path for a selected output class
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { Button, Box } from "@mui/material";

// The size of SVG's viewBox
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;

// Labels for the output layer classifications
const CLASS_LABELS = [
  "Audio", "Background", "Bruteforce", "DoS",
  "Information Gathering", "Mirai", "Text", "Video",
];

// Consistent styling for the class selection buttons
const BUTTON_STYLES = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "6px",
  fontSize: "0.9rem",
  padding: "8px 16px",
  transition: "background-color 0.3s",
};

export default function DeepLearningDiagram({ modelName = "mlp", isDark = false }) {
  const svgRef = useRef();
  const layersRef = useRef([]);
  const edgesRef = useRef([]);
  const [activeClass, setActiveClass] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const layerColors = useMemo(() => ["#4285F4", "#34A853", "#EA4335"], []);

  const buildNetwork = useCallback((data) => {
    const yOffset = 80;
    const numLayers = data.layers.length + 1;
    const layerXSpacing = SVG_WIDTH / (numLayers + 1);
    const layers = [];

    const inputNeurons = d3.range(data.layers[0].input_dim).map((i) => ({
      x: layerXSpacing,
      y: yOffset + (i + 1) * ((SVG_HEIGHT - yOffset) / (data.layers[0].input_dim + 1)),
      layer: 0, index: i,
    }));
    layers.push({ neurons: inputNeurons, layer: 0 });

    data.layers.forEach((layer, idx) => {
      const neurons = d3.range(layer.output_dim).map((i) => ({
        x: (idx + 2) * layerXSpacing,
        y: yOffset + (i + 1) * ((SVG_HEIGHT - yOffset) / (layer.output_dim + 1)),
        layer: idx + 1, index: i,
      }));
      layers.push({ neurons, layer: idx + 1 });
    });
    layersRef.current = layers;

    const edges = [];
    data.layers.forEach((layer, l) => {
      const srcs = layers[l].neurons;
      const tgts = layers[l + 1].neurons;
      layer.edges.forEach((edge) => {
        const src = srcs[edge.src];
        const tgt = tgts[edge.tgt];
        if (src && tgt) edges.push({
          src, tgt, weight: edge.weight, layer: l,
        });
      });
    });
    edgesRef.current = edges;
  }, []);

  const drawDiagram = useCallback((outputNeuronIdx) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`);

    const layers = layersRef.current;
    const allEdges = edgesRef.current;
    const focusedEdges = [];

    let currentTargets = [outputNeuronIdx];
    const maxLayer = Math.max(...allEdges.map((e) => e.layer));

    for (let l = maxLayer; l >= 0; l--) {
      const currentTargetsCopy = [...currentTargets];
      const matches = allEdges.filter((e) => e.layer === l && currentTargetsCopy.includes(e.tgt.index));
      if (matches.length === 0) continue;
      focusedEdges.push(...matches);
      currentTargets = [...new Set(matches.map((e) => e.src.index))];
    }

    const activeNeurons = new Set();
    focusedEdges.forEach((e) => {
      activeNeurons.add(`${e.src.layer}-${e.src.index}`);
      activeNeurons.add(`${e.tgt.layer}-${e.tgt.index}`);
    });

    const activeMap = {};
    layers.forEach((layer) => {
      activeMap[layer.layer] = layer.neurons.filter((n) => activeNeurons.has(`${n.layer}-${n.index}`));
    });

    const yOffset = 80;
    Object.values(activeMap).forEach((neurons) => {
      const n = neurons.length;
      neurons.forEach((neuron, i) => {
        neuron.y = yOffset + (i + 1) * ((SVG_HEIGHT - yOffset) / (n + 1));
      });
    });

    const neuronRadius = 15;
    const padding = 25;
    const labelOffset = 30;

    const drawBoundingBox = (neurons, color) => {
      if (!neurons || neurons.length === 0) return;
      const xCoords = neurons.map(n => n.x);
      const yCoords = neurons.map(n => n.y);
      const minX = d3.min(xCoords) - neuronRadius - padding;
      const maxX = d3.max(xCoords) + neuronRadius + padding;
      const minY = d3.min(yCoords) - neuronRadius - padding;
      const maxY = d3.max(yCoords) + neuronRadius + padding;
      svg.insert("rect", ":first-child")
        .attr("x", minX).attr("y", minY)
        .attr("width", maxX - minX).attr("height", maxY - minY)
        .attr("fill", "none").attr("rx", 20).attr("ry", 20)
        .attr("stroke", color).attr("stroke-width", 2);
    };

    drawBoundingBox(activeMap[0], layerColors[0]);
    drawBoundingBox(activeMap[layers.length - 1], layerColors[2]);
    const allHiddenNeurons = Object.entries(activeMap)
      .filter(([key]) => parseInt(key, 10) > 0 && parseInt(key, 10) < layers.length - 1)
      .flatMap(([, neurons]) => neurons);
    drawBoundingBox(allHiddenNeurons, layerColors[1]);

    svg.selectAll(".edge").data(focusedEdges).enter().append("line")
      .attr("x1", d => d.src.x)
      .attr("y1", d => d.src.y)
      .attr("x2", d => d.tgt.x)
      .attr("y2", d => d.tgt.y)
      .attr("stroke", isDark ? "#EFF0EB" : "#999999").attr("stroke-width", 1)
      .attr("opacity", 0.6).lower();

    Object.values(activeMap).forEach((neurons) => {
      if (!neurons.length) return;
      const layerIndex = neurons[0].layer;
      const color = layerIndex === 0 ? layerColors[0] : (layerIndex === layers.length - 1 ? layerColors[2] : layerColors[1]);
      const grp = svg.selectAll(`.layer-${layerIndex}`).data(neurons, d => d.index).enter()
        .append("g").attr("transform", d => `translate(${d.x},${d.y})`);
      grp.append("circle").attr("r", neuronRadius).attr("fill", color);
    });

    const drawLabel = (neurons, text) => {
      if (!neurons || neurons.length === 0) return;
      const minX = d3.min(neurons.map(n => n.x)) - neuronRadius - padding;
      const maxX = d3.max(neurons.map(n => n.x)) + neuronRadius + padding;
      const minY = d3.min(neurons.map(n => n.y)) - neuronRadius - padding;
      svg.append("text")
        .attr("x", minX + (maxX - minX) / 2).attr("y", minY - labelOffset / 2)
        .attr("text-anchor", "middle").attr("font-size", 16).attr("font-weight", "bold")
        .attr("fill", isDark ? "#F0C966" : "#333").text(text);
    };

    drawLabel(activeMap[0], "Input Layer");
    drawLabel(allHiddenNeurons, "Hidden Layers");
    drawLabel(activeMap[layers.length - 1], "Output Layer");

    const outputLayer = activeMap[layers.length - 1];
    if (outputLayer && outputLayer.length > 0) {
      const minY = d3.min(outputLayer.map(n => n.y)) - neuronRadius - padding;
      svg.append("text")
        .attr("x", outputLayer[0].x).attr("y", minY - labelOffset / 2 + 25)
        .attr("text-anchor", "middle").attr("font-size", 16)
        .attr("fill", isDark ? "#F0C966" : "#000").text(CLASS_LABELS[activeClass]);
    }
  }, [isDark, activeClass, layerColors, CLASS_LABELS]);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
    fetch(`${apiUrl}/model-architecture/${modelName}?top_k=2`)
      .then((res) => res.json())
      .then((data) => {
        buildNetwork(data);
        setIsDataLoaded(true);
      })
      .catch((err) => console.error("Failed to fetch model architecture:", err));
  }, [modelName, buildNetwork]);

  useEffect(() => {
    if (isDataLoaded) {
      drawDiagram(activeClass);
    }
  }, [activeClass, isDark, isDataLoaded, drawDiagram]);

  return (
    <Box>
      <svg
        ref={svgRef}
        style={{
          width: "100%", height: "auto", maxWidth: `${SVG_WIDTH}px`,
          display: "block", margin: "0 auto",
          background: isDark ? "#222" : "#EAE6DE",
          borderRadius: "10px",
        }}
      />
      <Box sx={{
        marginTop: "40px", display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center",
      }}>
        {CLASS_LABELS.map((label, idx) => (
          <Button
            key={label}
            onClick={() => setActiveClass(idx)}
            variant={activeClass === idx ? "contained" : "outlined"}
            sx={{
              ...BUTTON_STYLES,
              ...(activeClass === idx && {
                backgroundColor: isDark ? '#F0C966' : '#1A1414',
                color: isDark ? '#000' : '#EAE6DE',
                '&:hover': { backgroundColor: isDark ? '#e6b94e' : '#333' },
              }),
              ...(activeClass !== idx && {
                borderColor: isDark ? '#F0C966' : '#000',
                color: isDark ? '#F0C966' : '#000',
                '&:hover': {
                  borderColor: isDark ? '#e6b94e' : '#333',
                  backgroundColor: isDark ? 'rgba(240, 201, 102, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                },
              }),
            }}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
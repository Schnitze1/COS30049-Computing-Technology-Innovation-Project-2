import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import Button from "@mui/material/Button";

const DeepLearningDiagram = ({ modelName = "mlp", isDark = false }) => {
  const svgRef = useRef();
  const layersRef = useRef([]);
  const edgesRef = useRef([]);
  
  const [activeClass, setActiveClass] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const layerColors = useMemo(() => ["#4285F4", "#34A853", "#EA4335"], []); 

  const CLASS_LABELS = useMemo(() => [
    "Audio", "Background", "Bruteforce", "DoS",
    "Information Gathering", "Mirai", "Text", "Video",
  ], []);

  const buttonStyles = {
    textTransform: "none", fontWeight: 600, borderRadius: "6px",
    fontSize: "0.9rem", padding: "8px 16px", transition: "background-color 0.3s",
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/model-architecture/${modelName}?top_k=2`)
      .then((res) => res.json())
      .then((data) => {
        buildNetwork(data);
        setIsDataLoaded(true); 
      })
      .catch((err) => console.error(err));
  }, [modelName]);

  const buildNetwork = (data) => {
    const width = 1000, height = 600;
    const numLayers = data.layers.length + 1;
    const layerXSpacing = width / (numLayers + 1);
    const layers = [];
    
    const inputNeurons = d3.range(data.layers[0].input_dim).map((i) => ({
      x: layerXSpacing, y: (i + 1) * (height / (data.layers[0].input_dim + 1)), layer: 0, index: i,
    }));
    layers.push({ neurons: inputNeurons, layer: 0 });

    data.layers.forEach((layer, idx) => {
      const neurons = d3.range(layer.output_dim).map((i) => ({
        x: (idx + 2) * layerXSpacing, y: (i + 1) * (height / (layer.output_dim + 1)), layer: idx + 1, index: i,
      }));
      layers.push({ neurons, layer: idx + 1 });
    });
    layersRef.current = layers;

    const edges = [];
    data.layers.forEach((layer, l) => {
      const srcs = layers[l].neurons;
      const tgts = layers[l + 1].neurons;
      layer.edges.forEach((edge) => {
        const src = srcs[edge.src], tgt = tgts[edge.tgt];
        if (src && tgt) edges.push({ src, tgt, weight: edge.weight, layer: l });
      });
    });
    edgesRef.current = edges;
  };

  const drawDiagram = useCallback((outputNeuronIdx) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000, height = 600;
    const layers = layersRef.current;
    const allEdges = edgesRef.current;
    const focusedEdges = [];

    let currentTargets = [outputNeuronIdx];
    const maxLayer = Math.max(...allEdges.map((e) => e.layer));

    for (let l = maxLayer; l >= 0; l--) {
      const currentTargetsCopy = [...currentTargets]; // Create a copy to avoid unsafe reference
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
      const act = layer.neurons.filter((n) => activeNeurons.has(`${n.layer}-${n.index}`));
      activeMap[layer.layer] = act;
    });

    Object.values(activeMap).forEach((neurons) => {
      const n = neurons.length;
      neurons.forEach((neuron, i) => { neuron.y = (i + 1) * (height / (n + 1)); });
    });

    const svgContainer = svg.attr("width", width).attr("height", height);
    const neuronRadius = 15, padding = 25, labelOffset = 30;
    const numLayers = layers.length;

    svgContainer.append("defs").append("marker").attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10").attr("refX", 10).attr("refY", 0)
      .attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto")
      .append("path").attr("d", "M0,-5L10,0L0,5")
      .attr("fill", isDark ? "#FFFFFF" : "#555");

    [0, numLayers - 1].forEach(layerIndex => {
        const neurons = activeMap[layerIndex];
        if (neurons && neurons.length > 0) {
            const color = layerIndex === 0 ? layerColors[0] : layerColors[2];
            const xCoords = neurons.map(n => n.x);
            const yCoords = neurons.map(n => n.y);
            
            const minX = d3.min(xCoords) - neuronRadius - padding;
            const maxX = d3.max(xCoords) + neuronRadius + padding;
            const minY = d3.min(yCoords) - neuronRadius - padding;
            const maxY = d3.max(yCoords) + neuronRadius + padding;

            svgContainer.insert("rect", ":first-child").attr("x", minX).attr("y", minY)
                .attr("width", maxX - minX).attr("height", maxY - minY).attr("fill", "none")
                .attr("rx", 20).attr("ry", 20).attr("stroke", color).attr("stroke-width", 2);
        }
    });
    
    const allHiddenNeurons = Object.entries(activeMap)
        .filter(([key]) => parseInt(key, 10) > 0 && parseInt(key, 10) < numLayers - 1)
        .flatMap(([, neurons]) => neurons);

    if (allHiddenNeurons.length > 0) {
        const xCoords = allHiddenNeurons.map(n => n.x);
        const yCoords = allHiddenNeurons.map(n => n.y);
        const minX = d3.min(xCoords) - neuronRadius - padding;
        const maxX = d3.max(xCoords) + neuronRadius + padding;
        const minY = d3.min(yCoords) - neuronRadius - padding;
        const maxY = d3.max(yCoords) + neuronRadius + padding;
        svgContainer.insert("rect", ":first-child").attr("x", minX).attr("y", minY)
            .attr("width", maxX - minX).attr("height", maxY - minY).attr("fill", "none")
            .attr("rx", 20).attr("ry", 20).attr("stroke", layerColors[1]).attr("stroke-width", 2);
    }

    svgContainer.selectAll(".edge").data(focusedEdges).enter().append("line")
      .attr("x1", d => activeMap[d.src.layer]?.find(n => n.index === d.src.index)?.x || d.src.x)
      .attr("y1", d => activeMap[d.src.layer]?.find(n => n.index === d.src.index)?.y || d.src.y)
      .attr("x2", d => {
          const src = activeMap[d.src.layer]?.find(n => n.index === d.src.index);
          const tgt = activeMap[d.tgt.layer]?.find(n => n.index === d.tgt.index);
          if (!src || !tgt) return d.tgt.x;
          const dx = tgt.x - src.x, dy = tgt.y - src.y, dist = Math.sqrt(dx*dx + dy*dy);
          return tgt.x - (dx / dist) * neuronRadius;
      })
      .attr("y2", d => {
          const src = activeMap[d.src.layer]?.find(n => n.index === d.src.index);
          const tgt = activeMap[d.tgt.layer]?.find(n => n.index === d.tgt.index);
          if (!src || !tgt) return d.tgt.y;
          const dx = tgt.x - src.x, dy = tgt.y - src.y, dist = Math.sqrt(dx*dx + dy*dy);
          return tgt.y - (dy / dist) * neuronRadius;
      })
      .attr("stroke", isDark ? "#EFF0EB" : "#999999").attr("stroke-width", 1).attr("opacity", 0.6)
      .attr("marker-end", "url(#arrowhead)").lower();

    Object.values(activeMap).forEach((neurons, layerIdx) => {
      if (!neurons.length) return;
      const isInput = layerIdx === 0, isOutput = layerIdx === numLayers - 1;
      const color = isInput ? layerColors[0] : (isOutput ? layerColors[2] : layerColors[1]);
      const grp = svgContainer.selectAll(`.layer-${neurons[0].layer}`).data(neurons).enter()
        .append("g").attr("transform", d => `translate(${d.x},${d.y})`);
      grp.append("circle").attr("r", neuronRadius).attr("fill", color).attr("stroke", "none");
    });

    const inputLayer = activeMap[0];
    if(inputLayer && inputLayer.length > 0) {
        const minY = d3.min(inputLayer.map(n => n.y)) - neuronRadius - padding;
        svgContainer.append("text").attr("x", inputLayer[0].x).attr("y", minY - labelOffset / 2)
          .attr("text-anchor", "middle").attr("font-size", 16).attr("font-weight", "bold")
          .attr("fill", isDark ? "#F0C966" : "#333").text("Input Layer");
    }

    if (allHiddenNeurons.length > 0) {
        const minX = d3.min(allHiddenNeurons.map(n => n.x)) - neuronRadius - padding;
        const maxX = d3.max(allHiddenNeurons.map(n => n.x)) + neuronRadius + padding;
        const minY = d3.min(allHiddenNeurons.map(n => n.y)) - neuronRadius - padding;
        svgContainer.append("text").attr("x", minX + (maxX - minX) / 2).attr("y", minY - labelOffset / 2)
          .attr("text-anchor", "middle").attr("font-size", 16).attr("font-weight", "bold")
          .attr("fill", isDark ? "#F0C966" : "#333").text("Hidden Layers");
    }
    
    const outputLayer = activeMap[numLayers - 1];
    if (outputLayer && outputLayer.length > 0) {
        const minY = d3.min(outputLayer.map(n => n.y)) - neuronRadius - padding;
        svgContainer.append("text").attr("x", outputLayer[0].x).attr("y", minY - labelOffset / 2 - 15)
            .attr("text-anchor", "middle").attr("font-size", 16).attr("font-weight", "bold")
            .attr("fill", isDark ? "#F0C966" : "#333").text("Output Layer");
        svgContainer.append("text").attr("x", outputLayer[0].x).attr("y", minY - labelOffset / 2 + 25 - 15)
            .attr("text-anchor", "middle").attr("font-size", 16)
            .attr("fill", isDark ? "#F0C966" : "#000").text(CLASS_LABELS[activeClass]);
    }
  }, [isDark, activeClass, CLASS_LABELS, layerColors]);

  useEffect(() => {
    if (!isDataLoaded) return;
    drawDiagram(activeClass);
  }, [activeClass, isDark, isDataLoaded, drawDiagram]);

  return (
    <div>
      <svg ref={svgRef} style={{ display: "block", margin: "0 auto", background: isDark ? "#222" : "#EAE6DE", borderRadius: "10px" }}/>
      <div style={{ marginTop: "40px", display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        {CLASS_LABELS.map((label, idx) => (
          <Button key={label} 
            onClick={() => setActiveClass(idx)} 
            variant={activeClass === idx ? "contained" : "outlined"}
            sx={{
              ...buttonStyles,
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
      </div>
    </div>
  );
};

export default DeepLearningDiagram;
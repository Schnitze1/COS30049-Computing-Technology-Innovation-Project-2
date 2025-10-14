import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Button from "@mui/material/Button";

const DeepLearningDiagram = ({ modelName = "mlp", topK = 5, isDark = false }) => {
  const svgRef = useRef();
  const layersRef = useRef([]);
  const edgesRef = useRef([]);
  const [activeClass, setActiveClass] = useState(0);

  const CLASS_LABELS = [
    "Audio",
    "Background",
    "Bruteforce",
    "DoS",
    "Information Gathering",
    "Mirai",
    "Text",
    "Video",
  ];

  const buttonStyles = {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: "6px",
    fontSize: "0.9rem",
    padding: "8px 16px",
    transition: "background-color 0.3s",
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/v1/model-architecture/${modelName}?top_k=${topK}`)
      .then((res) => res.json())
      .then((data) => {
        buildNetwork(data);
        setTimeout(() => focusOnClass(0), 200);
      })
      .catch((err) => console.error(err));
  }, [modelName, topK]);

  const buildNetwork = (data) => {
    const width = 1000;
    const height = 600;
    const numLayers = data.layers.length + 1;
    const layerXSpacing = width / (numLayers + 1);
    const layers = [];

    // Input Layer
    const inputNeurons = d3.range(data.layers[0].input_dim).map((i) => ({
      x: layerXSpacing,
      y: (i + 1) * (height / (data.layers[0].input_dim + 1)),
      label: `x${i + 1}`,
      layer: 0,
      index: i,
    }));
    layers.push({ neurons: inputNeurons, layer: 0 });

    // Hidden + Output Layers
    data.layers.forEach((layer, idx) => {
      const neurons = d3.range(layer.output_dim).map((i) => ({
        x: (idx + 2) * layerXSpacing,
        y: (i + 1) * (height / (layer.output_dim + 1)),
        label:
          idx === data.layers.length - 1
            ? "f(x)" // for output neuron
            : `${i + 1}`,
        layer: idx + 1,
        index: i,
      }));
      layers.push({ neurons, layer: idx + 1 });
    });

    layersRef.current = layers;

    // Build Edges
    const edges = [];
    data.layers.forEach((layer, l) => {
      const srcs = layers[l].neurons;
      const tgts = layers[l + 1].neurons;
      layer.edges.forEach((edge) => {
        const src = srcs[edge.src];
        const tgt = tgts[edge.tgt];
        if (src && tgt) {
          edges.push({ src, tgt, weight: edge.weight, layer: l });
        }
      });
    });
    edgesRef.current = edges;
  };

  const focusOnClass = (outputNeuronIdx) => {
    setActiveClass(outputNeuronIdx);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 600;
    const layers = layersRef.current;
    const allEdges = edgesRef.current;
    const focusedEdges = [];

    let currentTargets = [outputNeuronIdx];
    const maxLayer = Math.max(...allEdges.map((e) => e.layer));

    for (let l = maxLayer; l >= 0; l--) {
      const matches = allEdges.filter(
        (e) => e.layer === l && currentTargets.includes(e.tgt.index)
      );
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
      const act = layer.neurons.filter((n) =>
        activeNeurons.has(`${n.layer}-${n.index}`)
      );
      activeMap[layer.layer] = act;
    });

    // Uniform Y spacing
    Object.values(activeMap).forEach((neurons) => {
      const n = neurons.length;
      neurons.forEach((neuron, i) => {
        neuron.y = (i + 1) * (height / (n + 1));
      });
    });

    const maxAbs = d3.max(allEdges, (d) => Math.abs(d.weight)) || 1;
    const svgContainer = svg.attr("width", width).attr("height", height);

    svgContainer
      .selectAll(".edge")
      .data(focusedEdges)
      .enter()
      .append("line")
      .attr("x1", (d) => d.src.x)
      .attr("y1", (d) => {
        const n = activeMap[d.src.layer]?.find((n) => n.index === d.src.index);
        return n?.y || d.src.y;
      })
      .attr("x2", (d) => d.tgt.x)
      .attr("y2", (d) => {
        const n = activeMap[d.tgt.layer]?.find((n) => n.index === d.tgt.index);
        return n?.y || d.tgt.y;
      })
      .attr("stroke", (d) => {
        if (d.weight > 0) return "red";
        if (d.weight < 0) return "blue";
        return isDark ? "#aaa" : "grey";
      })
      .attr("stroke-width", (d) => 0.5 + (Math.abs(d.weight) / maxAbs) * 4)
      .attr("opacity", (d) => 0.2 + (Math.abs(d.weight) / maxAbs) * 0.8)
      .lower();

    const neuronRadius = 15;

    Object.values(activeMap).forEach((neurons, layerIdx) => {
      if (!neurons.length) return;

      const grp = svgContainer
        .selectAll(`.layer-${neurons[0].layer}`)
        .data(neurons)
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      grp
        .append("circle")
        .attr("r", neuronRadius)
        .attr("fill", isDark ? "#333" : "white")
        .attr("stroke", isDark ? "#F0C966" : "red")
        .attr("stroke-width", 2);

      // Label circles
      grp
        .append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", 12)
        .attr("fill", isDark ? "#FFF" : "#000")
        .text((d) => d.label);

      // Output Annotations
      if (layerIdx === Object.keys(activeMap).length - 1) {
        grp
          .append("text")
          .attr("x", 0)
          .attr("y", neuronRadius + 20)
          .attr("text-anchor", "middle")
          .attr("fill", isDark ? "#F0C966" : "#333")
          .attr("font-size", 14)
          .text("Output");

        grp
          .append("text")
          .attr("x", 0)
          .attr("y", neuronRadius + 40)
          .attr("text-anchor", "middle")
          .attr("fill", isDark ? "#FFF" : "#000")
          .attr("font-size", 14)
          .text(CLASS_LABELS[activeClass]);
      }
    });

    layers.forEach((layer, i) => {
      let label = "";
      if (i === 0) label = "Input Layer";
      else if (i === layers.length - 1) label = "Output Layer";
      else label = `Hidden Layer (${i})`;

      svgContainer
        .append("text")
        .attr("x", layer.neurons[0].x)
        .attr("y", height - 1)
        .attr("text-anchor", "middle")
        .attr("font-size", 13)
        .attr("fill", isDark ? "#ddd" : "#333")
        .text(label);
    });

    svgContainer
      .append("text")
      .attr("x", 100)
      .attr("y", height / 2 - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", 18)
      .attr("fill", isDark ? "#F0C966" : "#333")
      .text("Features");

    svgContainer
      .append("text")
      .attr("x", 100)
      .attr("y", height / 2 + 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 16)
      .attr("fill", isDark ? "#FFF" : "#000")
      .text("(X)");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: isDark ? "#1A1A1A" : "#FFF",
        padding: "40px 0",
      }}
    >
      <svg
        ref={svgRef}
        style={{
          display: "block",
          margin: "0 auto",
          background: isDark ? "#222" : "transparent",
        }}
      />

      <div
        style={{
          marginTop: "40px",
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {CLASS_LABELS.map((label, idx) => (
          <Button
            key={label}
            onClick={() => focusOnClass(idx)}
            variant="contained"
            sx={{
                                ...buttonStyles,
                                color: isDark ? "#F0C966" : "#000",
                                borderColor: isDark ? "#F0C966" : "#000",
                                "&:hover": {
                                    backgroundColor: isDark
                                        ? "rgba(240, 201, 102, 0.1)"
                                        : "rgba(0, 0, 0, 0.04)",
                                    borderColor: isDark ? "#e6b94e" : "#333",
                                },
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

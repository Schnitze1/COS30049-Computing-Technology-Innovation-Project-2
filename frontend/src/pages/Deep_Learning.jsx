import React from "react";
import DeepLearningDiagram from "../components/deep_learning/DeepLearningDiagram";

const DeepLearningPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">MLP Model Architecture</h1>
      <DeepLearningDiagram modelName="mlp" />
    </div>
  );
};

export default DeepLearningPage;

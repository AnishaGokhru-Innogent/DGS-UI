import { Segmented } from "antd";
import { useState } from "react";
import { AllTemplate } from "./AllTemplates";
import { AccessTemplates } from "./AccessTemplates";

export function SelectTempltes() {
  const [selectedSegment, setSelectedSegment] = useState("My Templates");
  return (
    <div>
      <Segmented
        options={["My Templates", "Access"]}
        value={selectedSegment}
        onChange={(value) => setSelectedSegment(value)}
      />
      {selectedSegment === "My Templates" ? (
        <AllTemplate />
      ) : (
        <AccessTemplates />
      )}
    </div>
  );
}

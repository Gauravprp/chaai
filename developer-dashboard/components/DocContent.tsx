"use client";

import React from "react";
import { useDoc } from "./DocLayout";
import DynamicEndpoint from "./DynamicEndpoint";
import GettingStartedDynamic from "./GettingStartedDynamic";
import AuthenticationAPI from "./AuthenticationAPI";

export default function DocContent() {
  const { documentation, activeTab } = useDoc();

  if (!documentation) return null;

  // Find the active endpoint info
  let activeEndpoint: any = undefined;
  for (const cat of documentation.categories) {
    const found = cat.endpoints.find((e) => e.id === activeTab);
    if (found) {
      activeEndpoint = found;
      break;
    }
  }

  return (
    <div className="mx-auto" suppressHydrationWarning>
      <div className="mb-8 border-b border-slate-700/50 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {activeEndpoint?.label || "API Documentation"}
        </h1>
        <p className="text-slate-400 text-sm">{documentation.description}</p>
      </div>

      {activeTab === "getting-started" ? (
        <GettingStartedDynamic
          endpoint={activeEndpoint}
          documentation={documentation}
        />
      ) : activeTab === "authentication" ? (
        <AuthenticationAPI />
      ) : (
        <DynamicEndpoint endpoint={activeEndpoint} category={activeTab} />
      )}
    </div>
  );
}

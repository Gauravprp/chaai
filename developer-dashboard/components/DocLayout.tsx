"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import apiDocumentationService, {
  type Documentation,
  type Endpoint,
} from "@/services/apiDocumentationService";

interface DocContextType {
  documentation: Documentation | null;
  loading: boolean;
  activeTab: string;
}

const DocContext = createContext<DocContextType | undefined>(undefined);

export const useDoc = () => {
  const context = useContext(DocContext);
  if (!context) throw new Error("useDoc must be used within DocProvider");
  return context;
};

export default function DocLayout({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: Documentation | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const [documentation, setDocumentation] = useState<Documentation | null>(
    initialData,
  );
  const [loading, setLoading] = useState(!initialData);

  // URL se moduleId nikalein (e.g., /getting-started -> getting-started)
  const activeTab =
    (params?.moduleId as string) || pathname.split("/").pop() || "";

  useEffect(() => {
    if (!documentation) {
      const fetchData = async () => {
        try {
          const data = await apiDocumentationService.getDocumentation();
          const transformedData =
            apiDocumentationService.transformDocumentation(data);
          setDocumentation(transformedData);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [documentation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!documentation) return null;

  return (
    <DocContext.Provider value={{ documentation, loading, activeTab }}>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900"
        suppressHydrationWarning
      >
        {/* Header - Stays Persistent */}
        <div className="bg-slate-900/95 backdrop-blur-md shadow-2xl border-b border-slate-700/50 sticky top-0 z-40">
          <div className="mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/dyzo-ai-logo.png"
                alt="Logo"
                width={32}
                height={32}
              />
              <h1 className="text-white font-bold">Dyzo API</h1>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
              v{documentation.version}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar - Stays Persistent */}
          <div className="w-72 bg-slate-900/80 border-r border-slate-700/50 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto p-4 space-y-4">
            {documentation.categories.map((category) => (
              <div key={category.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <div className="p-1 px-1.5 bg-slate-800/50 rounded border border-slate-700/50">
                    <Icon
                      icon={category.icon || "heroicons:folder"}
                      className="h-3.5 w-3.5 text-emerald-400"
                    />
                  </div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                    {category.name}
                  </h3>
                </div>
                <div className="space-y-1 ml-4">
                  {category.endpoints.map((endpoint) => (
                    <Link
                      key={endpoint.id}
                      href={`/${endpoint.id}`}
                      className={`group flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        activeTab === endpoint.id
                          ? "bg-gradient-to-r from-blue-600/20 to-emerald-600/10 text-white border border-blue-500/30 shadow-lg shadow-blue-950/20"
                          : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <Icon
                        icon={endpoint.icon || "heroicons:document-text"}
                        className={`h-4 w-4 transition-colors ${
                          activeTab === endpoint.id
                            ? "text-blue-400"
                            : "text-slate-500 group-hover:text-slate-400"
                        }`}
                      />
                      <span className="font-medium">{endpoint.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Page Content Area - Only this will re-render */}
          <div className="flex-1 p-8 h-[calc(100vh-64px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </DocContext.Provider>
  );
}

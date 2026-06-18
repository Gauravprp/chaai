import DocLayout from "@/components/DocLayout";
import apiDocumentationService from "@/services/apiDocumentationService";

export default async function DocsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side fetch
  const documentation = await apiDocumentationService.getDocumentation();

  return <DocLayout initialData={documentation}>{children}</DocLayout>;
}

import DocContent from "@/components/DocContent";
import apiDocumentationService from "@/services/apiDocumentationService";

export async function generateStaticParams() {
  try {
    const documentation = await apiDocumentationService.getDocumentation();
    const paths = [];

    for (const category of documentation.categories) {
      for (const endpoint of category.endpoints) {
        paths.push({ moduleId: endpoint.id });
      }
    }

    return paths;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default function ModulePage() {
  return <DocContent />;
}

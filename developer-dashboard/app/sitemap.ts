import { MetadataRoute } from 'next'
import apiDocumentationService from '@/services/apiDocumentationService';

export const revalidate = 3600; // revalidate at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://developers.dyzo.ai';
  
  try {
    const documentation = await apiDocumentationService.getDocumentation();
    
    // Base URL entry
    const entries: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
      },
    ];

    // Add entries for each endpoint/module
    documentation.categories.forEach(category => {
      category.endpoints.forEach(endpoint => {
        entries.push({
          url: `${baseUrl}/${endpoint.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    });

    return entries;
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ];
  }
}

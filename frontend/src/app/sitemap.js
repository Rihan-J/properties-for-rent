export default async function sitemap() {
  const baseUrl = 'https://www.propertiesforrents.com';
  
  let propertyUrls = [];
  try {
    // Fetch all active properties to generate dynamic URLs for Google to crawl
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/properties`, { next: { revalidate: 3600 } });
    const data = await res.json();
    
    if (data?.data?.properties) {
      propertyUrls = data.data.properties.map((property) => ({
        url: `${baseUrl}/properties/${property.id}`,
        lastModified: new Date(property.updated_at || property.created_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Sitemap failed to fetch properties:', error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...propertyUrls,
  ];
}

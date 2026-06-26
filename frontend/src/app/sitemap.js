export default async function sitemap() {
  const baseUrl = 'https://www.propertiesforrents.com';

  // 1. Static Routes (only pages that actually exist)
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/account-deletion`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ];

  // 2. Dynamic Property Routes from Database
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    // Using the public nearby endpoint with a massive radius to capture all listings
    const response = await fetch(
      `${apiUrl}/properties/nearby?lat=13.9299&lng=75.5681&radius=100&limit=50`,
      { cache: 'no-store' }
    );
    const data = await response.json();
    
    // Fallback safely if API structure changes
    const properties = data?.data?.properties || [];

    const propertyRoutes = properties.map((p) => ({
      url: `${baseUrl}/properties/${p.id}`,
      lastModified: p.updated_at || p.created_at || new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...propertyRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap routes:', error);
    return staticRoutes; // Fallback to static routes if backend fails
  }
}

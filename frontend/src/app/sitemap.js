export default async function sitemap() {
  const baseUrl = 'https://www.propertiesforrents.com';

  // 1. Static Routes
  const routes = ['', '/category/home', '/category/room', '/category/shop', '/category/pg', '/category/lodge', '/category/site'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // 2. Dynamic Property Routes from Database
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    // Using the public nearby endpoint with a massive radius to capture all listings in the region
    const response = await fetch(`${apiUrl}/properties/nearby?lat=13.9299&lng=75.5681&radius=5000&limit=1000`, { cache: 'no-store' });
    const data = await response.json();
    
    // Fallback safely if API structure changes
    const properties = data?.data?.properties || [];

    const propertyRoutes = properties.map((p) => ({
      url: `${baseUrl}/properties/${p.id}`,
      lastModified: p.updated_at || p.created_at || new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...routes, ...propertyRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap routes:', error);
    return routes; // Fallback to static routes if backend fails
  }
}

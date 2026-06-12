export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/', '/auth/', '/dashboard/'],
    },
    sitemap: 'https://www.propertiesforrents.com/sitemap.xml',
  }
}

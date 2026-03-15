import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  url: string;
  type?: 'website' | 'article' | 'SoftwareApplication';
  keywords?: string;
  image?: string;
}

export default function SEO({ 
  title, 
  description, 
  url, 
  type = 'website', 
  keywords, 
  image = 'https://genzpdf.com/logo.png' 
}: SEOProps) {
  
  const siteUrl = 'https://genzpdf.com';
  const fullUrl = `${siteUrl}${url}`;

  const schemaMarkup = type === 'SoftwareApplication'
    ? {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": title,
        "description": description,
        "url": fullUrl,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All"
      }
    : {
        "@context": "https://schema.org",
        "@type": type === 'article' ? "Article" : "WebSite",
        "headline": title,
        "description": description,
        "url": fullUrl
      };

  return (
    <Helmet>
      <title>{title} | Genz PDF</title>
      <meta name='description' content={description} />
      {keywords && <meta name='keywords' content={keywords} />}
      <link rel="canonical" href={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image} />
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>
    </Helmet>
  );
}

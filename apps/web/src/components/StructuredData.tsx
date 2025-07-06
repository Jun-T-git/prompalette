interface StructuredDataProps {
  type: 'WebApplication' | 'SoftwareApplication' | 'WebPage';
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

export function StructuredData({ 
  type, 
  name, 
  description, 
  url, 
  applicationCategory = 'ProductivityApplication',
  operatingSystem,
  offers = { price: '0', priceCurrency: 'JPY' }
}: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency
    },
    publisher: {
      '@type': 'Organization',
      name: 'PromPalette',
      url: 'https://prompalette.com'
    },
    author: {
      '@type': 'Organization',
      name: 'PromPalette Team'
    },
    inLanguage: 'ja-JP',
    audience: {
      '@type': 'Audience',
      audienceType: 'developers, content creators, professionals'
    },
    keywords: [
      'AIプロンプト',
      'プロンプト管理',
      'AI効率化',
      'ワークフロー',
      'ChatGPT',
      'Claude',
      'Gemini',
      'macOS',
      'デスクトップアプリ',
      'ホットキー',
      '生産性'
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
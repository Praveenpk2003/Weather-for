import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Lightweight RSS fetch via allorigins proxy and DOMParser
async function fetchRss(url) {
  const proxied = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxied);
  if (!res.ok) throw new Error('Failed to load feed');
  const data = await res.json();
  const xml = new window.DOMParser().parseFromString(data.contents, 'text/xml');
  return xml;
}

function extractItemsFromRss(xml, sourceName) {
  const items = Array.from(xml.querySelectorAll('item'));
  return items.map((item) => {
    const title = item.querySelector('title')?.textContent?.trim() || 'Untitled';
    const link = item.querySelector('link')?.textContent?.trim() || '#';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const desc = item.querySelector('description')?.textContent || '';
    const contentEncoded = item.getElementsByTagName('content:encoded')?.[0]?.textContent || '';
    
    let image = '';
    
    // Try multiple image sources in order of preference
    // 1. Media content (media:content, media:thumbnail)
    const mediaContent = item.getElementsByTagName('media:content')?.[0]?.getAttribute('url');
    const mediaThumbnail = item.getElementsByTagName('media:thumbnail')?.[0]?.getAttribute('url');
    const enclosure = item.querySelector('enclosure[type^="image"]')?.getAttribute('url');
    
    if (mediaContent) image = mediaContent;
    else if (mediaThumbnail) image = mediaThumbnail;
    else if (enclosure) image = enclosure;
    
    // 2. Look for images in description/content
    if (!image) {
      const textToSearch = contentEncoded || desc || '';
      const imgMatches = textToSearch.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
      if (imgMatches && imgMatches.length > 0) {
        const firstImg = imgMatches[0].match(/src=["']([^"']+)["']/i);
        if (firstImg) image = firstImg[1];
      }
    }
    
    // 3. Look for any image URLs in the text
    if (!image) {
      const textToSearch = contentEncoded || desc || '';
      const urlMatches = textToSearch.match(/https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp)/gi);
      if (urlMatches && urlMatches.length > 0) {
        image = urlMatches[0];
      }
    }
    
    // 4. Generate fallback image based on weather keywords
    if (!image) {
      const weatherKeywords = ['rain', 'storm', 'snow', 'sun', 'cloud', 'wind', 'heat', 'cold', 'flood', 'drought'];
      const text = (title + ' ' + desc).toLowerCase();
      const foundKeyword = weatherKeywords.find(keyword => text.includes(keyword));
      if (foundKeyword) {
        image = `https://source.unsplash.com/400x200/?${foundKeyword},weather`;
      } else {
        image = 'https://source.unsplash.com/400x200/?weather,sky';
      }
    }
    
    return { title, link, pubDate, description: desc, source: sourceName, image };
  });
}

const FEEDS = [
  // India
  { name: 'India Today', url: 'https://www.indiatoday.in/rss/1206584' },
  { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/feeds/rss/cities/delhi-news/rssfeed.xml' },
  { name: 'The Times of India', url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms' },
  { name: 'The Indian Express', url: 'https://indianexpress.com/section/india/feed/' },
  { name: 'IMD', url: 'https://mausam.imd.gov.in/imd_latest/contents_rss.php' },
  // United Kingdom
  { name: 'BBC Weather', url: 'https://feeds.bbci.co.uk/news/uk/rss.xml' },
  { name: 'The Guardian Environment', url: 'https://www.theguardian.com/uk/environment/rss' },
  { name: 'Met Office', url: 'https://www.metoffice.gov.uk/public/data/PWSCache/WarningsRSS/Region/UK' },
  // United States
  { name: 'AP Weather', url: 'https://apnews.com/hub/weather/rss' },
  { name: 'CNN Weather', url: 'http://rss.cnn.com/rss/cnn_latest.rss' },
  { name: 'NOAA News', url: 'https://www.noaa.gov/rss.xml' },
  { name: 'Weather Channel', url: 'https://weather.com/news/rss' },
  // Europe
  { name: 'Euronews', url: 'https://www.euronews.com/rss?level=theme&name=weather' },
  { name: 'DW Environment', url: 'https://rss.dw.com/rdf/rss-en-env' },
  // Australia / New Zealand
  { name: 'ABC Weather', url: 'https://www.abc.net.au/news/feed/2942460/rss.xml' },
  { name: 'Bureau of Meteorology', url: 'http://www.bom.gov.au/rss/weather/' },
  { name: 'NZ Herald', url: 'https://www.nzherald.co.nz/rss/' },
  // Asia
  { name: 'Japan Times', url: 'https://www.japantimes.co.jp/feed/' },
  { name: 'The Straits Times', url: 'https://www.straitstimes.com/news/world/rss.xml' },
  // Canada
  { name: 'CBC Weather', url: 'https://www.cbc.ca/cmlink/rss-weather' },
  // Global
  { name: 'Reuters Environment', url: 'https://feeds.reuters.com/reuters/environment' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
];

function getWeatherIcon(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('rain') || text.includes('shower') || text.includes('drizzle')) {
    return <div className="text-6xl">🌧️</div>;
  } else if (text.includes('storm') || text.includes('thunder') || text.includes('lightning')) {
    return <div className="text-6xl">⛈️</div>;
  } else if (text.includes('snow') || text.includes('blizzard') || text.includes('frost')) {
    return <div className="text-6xl">❄️</div>;
  } else if (text.includes('sun') || text.includes('sunny') || text.includes('clear')) {
    return <div className="text-6xl">☀️</div>;
  } else if (text.includes('cloud') || text.includes('overcast') || text.includes('fog')) {
    return <div className="text-6xl">☁️</div>;
  } else if (text.includes('wind') || text.includes('breeze') || text.includes('gust')) {
    return <div className="text-6xl">💨</div>;
  } else if (text.includes('heat') || text.includes('hot') || text.includes('warm')) {
    return <div className="text-6xl">🌡️</div>;
  } else if (text.includes('cold') || text.includes('freeze') || text.includes('chill')) {
    return <div className="text-6xl">🧊</div>;
  } else if (text.includes('flood') || text.includes('drought') || text.includes('wildfire')) {
    return <div className="text-6xl">🌊</div>;
  } else if (text.includes('hurricane') || text.includes('typhoon') || text.includes('cyclone')) {
    return <div className="text-6xl">🌀</div>;
  } else if (text.includes('tornado') || text.includes('twister')) {
    return <div className="text-6xl">🌪️</div>;
  } else if (text.includes('pollution') || text.includes('smog') || text.includes('air quality')) {
    return <div className="text-6xl">🌫️</div>;
  } else {
    return <div className="text-6xl">🌤️</div>;
  }
}

function inferCountryFromUrl(link) {
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    if (host.endsWith('.in') || host.includes('timesofindia') || host.includes('indiatoday') || host.includes('hindustantimes') || host.includes('indianexpress') || host.includes('mausam.imd')) return 'India';
    if (host.endsWith('.uk') || host.includes('bbc.') || host.includes('theguardian.') || host.includes('metoffice.gov.uk')) return 'United Kingdom';
    if (host.endsWith('.au') || host.includes('abc.net.au') || host.includes('bom.gov.au')) return 'Australia';
    if (host.endsWith('.nz') || host.includes('nzherald')) return 'New Zealand';
    if (host.endsWith('.ca') || host.includes('cbc.ca')) return 'Canada';
    if (host.endsWith('.jp') || host.includes('japantimes')) return 'Japan';
    if (host.endsWith('.sg') || host.includes('straitstimes')) return 'Singapore';
    if (host.endsWith('.ae') || host.includes('gulfnews')) return 'UAE';
    if (host.includes('aljazeera')) return 'Qatar / Middle East';
    if (host.includes('euronews') || host.includes('dw.com')) return 'Europe';
    if (host.includes('noaa.gov') || host.includes('weather.com')) return 'United States';
    if (host.includes('apnews') || host.includes('cnn.') || host.includes('reuters.com')) return 'United States';
    return 'International';
  } catch {
    return 'International';
  }
}

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const weatherWhitelist = /\b(weather|forecast|imd|rain|rainfall|showers|downpour|monsoon|cyclone|storm|thunderstorm|lightning|snow|hail|heatwave|cold\s*wave|coldwave|temperature|max\s*temp|min\s*temp|humidity|uv\s*index|aqi|air\s*quality|pollution|smog|dust\s*storm|wind\s*speed|winds?\b|gust|barometric|pressure|visibility|alerts?|yellow\s*alert|orange\s*alert|red\s*alert|climate|global\s*warming|flood|drought|wildfire|hurricane|typhoon|tornado|blizzard|frost|ice|fog|mist|haze|environment|meteorology|meteorological)\b/i;
  const blacklist = /(ad\b|sponsored|sleepers|shoulders|iphone|android|gadget|travel|booking|hotel|celebrity|bollywood|cricket|football|movie|series|genius|sale|discount|coupon|review|gaming|stocks?|crypto)/i;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled(
          FEEDS.map(async (f) => {
            const xml = await fetchRss(f.url);
            return extractItemsFromRss(xml, f.name);
          })
        );
        const mergedRaw = results
          .filter((r) => r.status === 'fulfilled')
          .flatMap((r) => r.value)
          // Only keep weather-related and drop likely non-news/ads
          .filter((it) => {
            const text = `${it.title} ${it.description}`;
            return weatherWhitelist.test(text) && !blacklist.test(text);
          });
        // Dedupe by link or title
        const seen = new Set();
        const merged = [];
        for (const it of mergedRaw) {
          const key = (it.link || it.title).toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(it);
        }
        // Sort by date desc when possible
        merged.sort((a, b) => (new Date(b.pubDate).getTime() || 0) - (new Date(a.pubDate).getTime() || 0));
        if (!cancelled) setItems(merged.slice(0, 96));
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 text-gray-900">
              <span className="text-lg font-semibold">Global Weather News</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Back to Features</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="text-gray-600">Loading latest weather updates around the world…</div>
        )}
        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg">Failed to load news. Please try again later.</div>
        )}

        {!loading && !error && (
          (() => {
            const groups = items.reduce((acc, it) => {
              const country = inferCountryFromUrl(it.link);
              if (!acc[country]) acc[country] = [];
              acc[country].push(it);
              return acc;
            }, {});
            const ordered = Object.keys(groups).sort();
            return (
              <div className="space-y-8">
                {ordered.map((country) => (
                  <section key={country} className="mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-gray-900 text-xl font-semibold">{country}</h2>
                        <div className="text-gray-500 text-sm">{groups[country].length} articles</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {groups[country].map((it, idx) => (
                          <a
                            key={`${country}-${idx}`}
                            href={it.link}
                            target="_blank"
                            rel="noreferrer"
                            className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-400 transition shadow-sm"
                          >
                            <div className="h-40 bg-white overflow-hidden relative">
                              {it.image && !it.image.includes('unsplash.com') ? (
                                <img 
                                  src={it.image} 
                                  alt={it.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-full h-full flex flex-col items-center justify-center text-gray-500 ${it.image && !it.image.includes('unsplash.com') ? 'hidden' : 'flex'}`}
                                style={{ display: it.image && !it.image.includes('unsplash.com') ? 'none' : 'flex' }}
                              >
                                {getWeatherIcon(it.title, it.description)}
                                <span className="text-xs mt-2 text-gray-400">Weather News</span>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="text-xs text-gray-500 mb-2">{it.source} {it.pubDate ? `• ${new Date(it.pubDate).toLocaleString()}` : ''}</div>
                              <div className="text-gray-900 font-semibold leading-snug line-clamp-3">{it.title}</div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            );
          })()
        )}
      </main>
    </div>
  );
}



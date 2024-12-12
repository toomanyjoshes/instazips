// Headers that mimic a real browser visit
const getHeaders = (cookie = '') => ({
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-User': '?1',
  'Sec-Fetch-Dest': 'document',
  'Cache-Control': 'max-age=0',
  'Cookie': cookie
});

// Simulate a delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // If we get a 429 (Too Many Requests), wait longer before retry
      if (response.status === 429) {
        await delay(2000 * (i + 1));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1));
    }
  }
}

// Handle CORS and errors
async function handleResponse(response, status = 200) {
  return new Response(response, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

async function fetchInstagramPost(url) {
  try {
    const decodedUrl = decodeURIComponent(url);
    console.log('Decoded URL:', decodedUrl);
    
    const match = decodedUrl.match(/instagram\.com\/p\/([^/?]+)/);
    if (!match) {
      return handleResponse(JSON.stringify({ error: 'Invalid Instagram post URL' }), 400);
    }

    // Replace this URL with your Render.com service URL once deployed
    const SCRAPER_SERVICE_URL = 'https://instagram-scraper-service.onrender.com/scrape';
    
    // Call our hosted scraper service
    const response = await fetch(SCRAPER_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://instadownload.joshi-140.workers.dev'
      },
      body: JSON.stringify({ url: decodedUrl })
    });

    if (!response.ok) {
      const error = await response.json();
      return handleResponse(JSON.stringify({ error: error.message || 'Failed to fetch post data' }), response.status);
    }

    const data = await response.json();
    return handleResponse(JSON.stringify(data));

  } catch (error) {
    console.error('Error in fetchInstagramPost:', error);
    return handleResponse(JSON.stringify({ error: error.message }), 500);
  }
}

addEventListener('fetch', event => {
  if (event.request.method === 'OPTIONS') {
    event.respondWith(handleResponse('{}'));
    return;
  }

  const url = new URL(event.request.url).searchParams.get('url');
  if (!url) {
    event.respondWith(handleResponse(JSON.stringify({ error: 'No URL provided' }), 400));
    return;
  }

  event.respondWith(fetchInstagramPost(url));
});

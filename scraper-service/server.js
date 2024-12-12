const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let browser;

async function initBrowser() {
    browser = await chromium.launch({
        headless: true
    });
}

async function scrapeInstagramPost(url) {
    if (!browser) {
        await initBrowser();
    }

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to Instagram
        await page.goto('https://www.instagram.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Go to the post URL
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Wait for content to load
        await page.waitForSelector('img[style*="object-fit: cover"]', { timeout: 10000 });

        // Extract media URLs
        const mediaUrls = await page.evaluate(() => {
            const urls = [];
            
            // Check for images
            document.querySelectorAll('img[style*="object-fit: cover"]').forEach(img => {
                if (img.src) urls.push(img.src);
            });
            
            // Check for videos
            document.querySelectorAll('video source').forEach(video => {
                if (video.src) urls.push(video.src);
            });
            
            return [...new Set(urls)]; // Remove duplicates
        });

        // Extract caption
        const caption = await page.evaluate(() => {
            const captionElement = document.querySelector('h1') || document.querySelector('div[class*="caption"]');
            return captionElement ? captionElement.textContent : '';
        });

        await context.close();
        
        return {
            success: true,
            media: mediaUrls,
            caption,
            postId: url.match(/\/p\/([^/?]+)/)?.[1] || ''
        };
    } catch (error) {
        console.error('Scraping error:', error);
        await context.close();
        return {
            success: false,
            error: error.message
        };
    }
}

app.post('/scrape', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const data = await scrapeInstagramPost(url);
        if (data.success) {
            res.json(data);
        } else {
            res.status(400).json(data);
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cleanup on shutdown
process.on('SIGINT', async () => {
    if (browser) {
        await browser.close();
    }
    process.exit();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Scraper service running on port ${PORT}`);
    initBrowser().catch(console.error);
});

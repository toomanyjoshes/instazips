const WORKER_URL = 'https://instadownload.joshi-140.workers.dev';

function showStatus(message, isError = false) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = isError ? 'status error' : 'status success';
}

async function downloadPost(url) {
    const statusDiv = document.getElementById('status');
    const downloadBtn = document.getElementById('downloadBtn');
    
    try {
        // Validate URL format
        if (!url.includes('instagram.com/p/')) {
            throw new Error('Please enter a valid Instagram post URL');
        }

        showStatus('Fetching post data...');
        downloadBtn.disabled = true;

        // Clean the URL
        const cleanUrl = url.split('?')[0].replace(/\/$/, '');

        // Add retries for reliability
        let response;
        let retries = 3;
        let lastError;
        
        while (retries > 0) {
            try {
                response = await fetch(`${WORKER_URL}?url=${encodeURIComponent(cleanUrl)}`);
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                if (!data.media?.length) {
                    throw new Error('No media found in post');
                }

                showStatus('Downloading media files...');

                // Create a new zip file
                const zip = new JSZip();
                const mediaFolder = zip.folder('media');
                const postId = data.postId || 'post';

                // Download all media files
                const mediaPromises = data.media.map(async (url, index) => {
                    try {
                        const mediaResponse = await fetch(url);
                        if (!mediaResponse.ok) throw new Error(`Failed to download media ${index + 1}`);
                        const blob = await mediaResponse.blob();
                        const extension = url.includes('/video/') ? 'mp4' : 'jpg';
                        mediaFolder.file(`${postId}_${index + 1}.${extension}`, blob);
                    } catch (error) {
                        console.error(`Failed to download media ${index + 1}:`, error);
                        throw error;
                    }
                });

                // Add caption if available
                if (data.caption) {
                    zip.file('caption.txt', data.caption);
                }

                // Wait for all media downloads to complete
                await Promise.all(mediaPromises);

                showStatus('Creating zip file...');
                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, `instagram_${postId}.zip`);

                showStatus('Download complete!');
                break;
            } catch (error) {
                console.error('Attempt failed:', error);
                lastError = error;
                retries--;
                if (retries > 0) {
                    showStatus(`Retrying... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw lastError;
                }
            }
        }
    } catch (error) {
        console.error('Download failed:', error);
        showStatus(error.message || 'Failed to download post', true);
    } finally {
        downloadBtn.disabled = false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const linkInput = document.getElementById('linkInput');
    const downloadBtn = document.getElementById('downloadBtn');

    // Handle paste event
    linkInput.addEventListener('paste', (e) => {
        setTimeout(() => {
            const url = linkInput.value.trim();
            if (url && url.includes('instagram.com/p/')) {
                downloadBtn.click();
            }
        }, 100);
    });

    downloadBtn.addEventListener('click', async () => {
        const url = linkInput.value.trim();
        if (!url) {
            showStatus('Please paste an Instagram URL first', true);
            return;
        }
        
        if (!url.includes('instagram.com/p/')) {
            showStatus('Please enter a valid Instagram post URL', true);
            return;
        }

        await downloadPost(url);
    });
});

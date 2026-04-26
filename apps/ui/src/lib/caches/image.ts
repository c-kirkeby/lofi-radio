
const MAX_HEIGHT = 256;
const MAX_WIDTH = 256;

export async function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = function() {
      let { width, height } = image;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const aspectRatio = width / height;
        if (width > height) {
          width = MAX_WIDTH;
          height = Math.round(width / aspectRatio);
        } else {
          height = MAX_HEIGHT;
          width = Math.round(height * aspectRatio);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (context) {
        context.fillStyle = 'oklch(0% 0 0)';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    }

    image.onerror = function() {
      reject(new Error(`Failed to load image from URL: ${url}`));
    }

    image.src = url;
  })
}

export async function resizeImage(url: string): Promise<string> {
  const proxy = `${window.location.origin}/api/proxy?url=${encodeURIComponent(url)}`;
  try {
    return await loadImage(proxy);
  } catch (error) {
    // return 
  }
}

export async function cacheImage(data: string, key: string, name: string): Promise<void> {
  const cache = await caches.open(name);
  const binary = atob(data.replace(/^data:image\/png;base64,/, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'image/png' });
  const response = new Response(blob, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': blob.size.toString()
    }
  });
  const absoluteUrl = new URL(`/image/${key}.png`, location.origin).toString();

  await cache.put(absoluteUrl, response);
}


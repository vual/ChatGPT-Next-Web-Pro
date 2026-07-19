export const toMask = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  const size = {
    x: canvas.width,
    y: canvas.height,
  };
  const imageData = ctx?.getImageData(0, 0, size.x, size.y);
  // @ts-ignore
  const origData = Uint8ClampedArray.from(imageData.data);
  if (imageData) {
    for (var i = 0; i < imageData?.data.length; i += 4) {
      const pixelColor =
        imageData.data[i + 3] === 0 ? [0, 0, 0] : [255, 255, 255]; // Check alpha channel for transparency
      imageData.data[i] = pixelColor[0];
      imageData.data[i + 1] = pixelColor[1];
      imageData.data[i + 2] = pixelColor[2];
      imageData.data[i + 3] = 255;
    }
    ctx?.putImageData(imageData, 0, 0);
  }

  const dataUrl = canvas.toDataURL();
  for (var i = 0; i < (imageData?.data?.length || 0); i++) {
    // @ts-ignore
    imageData.data[i] = origData[i];
  }
  // @ts-ignore
  ctx?.putImageData(imageData, 0, 0);

  return dataUrl;
};

export const toMaskWithOriginal = async (
  canvas: HTMLCanvasElement,
  original: string, // Can be http URL or base64 data URL
): Promise<string> => {
  const maskCtx = canvas.getContext("2d");
  if (!maskCtx) {
    throw new Error("Failed to get mask canvas context");
  }
  const maskImageData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);

  const img = new Image();
  // Handle potential CORS issues if original is a URL
  // If the server hosting the 'original' URL doesn't send appropriate CORS headers,
  // this might still fail for cross-origin URLs.
  // Base64 URLs don't have CORS restrictions.
  if (!original.startsWith("data:")) {
    img.crossOrigin = "anonymous";
  }

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const originalCanvas = document.createElement("canvas");
      originalCanvas.width = img.width; // Use naturalWidth for actual image size
      originalCanvas.height = img.height;

      const originalCtx = originalCanvas.getContext("2d");
      if (!originalCtx) {
        return reject(new Error("Failed to get original canvas context"));
      }

      // Draw the original image onto the new canvas
      originalCtx.drawImage(img, 0, 0, img.width, img.height);

      // Get the pixel data of the drawn original image
      const originalImageData = originalCtx.getImageData(
        0,
        0,
        originalCanvas.width,
        originalCanvas.height,
      );

      for (var i = 0; i < maskImageData?.data.length; i += 4) {
        if (maskImageData.data[i + 3] !== 0) {
          // originalImageData.data[i] = 255;
          // originalImageData.data[i + 1] = 255;
          // originalImageData.data[i + 2] = 255;
          originalImageData.data[i + 3] = 0;
        }
      }

      // Put the modified image data back onto the original canvas
      originalCtx.putImageData(originalImageData, 0, 0);

      // Get the final image as a base64 data URL
      const dataUrl = originalCanvas.toDataURL(); // Defaults to PNG
      console.log(dataUrl);
      resolve(dataUrl);
    };

    img.onerror = (error) => {
      console.error("Error loading original image:", error);
      reject(new Error(`Failed to load original image from ${original}`));
    };

    // Start loading the image
    img.src = original;
  });
};

export const hexToRgb = (color: string) => {
  var parts = color.replace("#", "").match(/.{1,2}/g);
  return parts?.map((part) => parseInt(part, 16));
};

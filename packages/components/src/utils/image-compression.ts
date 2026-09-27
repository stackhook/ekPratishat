import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1.5, // target size
    maxWidthOrHeight: 1920, // resize large images
    useWebWorker: true,
    initialQuality: 0.8,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    return file; // fallback
  }
}

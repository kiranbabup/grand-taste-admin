import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../services/firebase";

export const uploadImageToFirebase = async (file, productId) => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${productId}_${timestamp}_${file.name}`;
    
    // Reference to storage location: products/filename (flat structure)
    const storageRef = ref(storage, `products/${filename}`);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Firebase upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

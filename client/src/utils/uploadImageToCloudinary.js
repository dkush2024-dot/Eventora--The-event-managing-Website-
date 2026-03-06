import axios from 'axios';

export const uploadImageToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
    );
    
    // Convert HEIC/HEIF to JPG by modifying the URL
    // Add auto format and quality transformations
    const url = data.secure_url;
    const transformedUrl = url.replace('/upload/', '/upload/f_auto,q_auto/');
    
    return transformedUrl;
};
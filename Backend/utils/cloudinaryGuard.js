import cloudinary from '../config/cloudinary.js';

let cachedUsage = null;
let lastCheck = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export const canUploadToCloudinary = async () => {
    const now = Date.now();

    // Only poll the API if cache is older than 10 minutes
    if (!cachedUsage || (now - lastCheck) > CACHE_DURATION) {
        try {
            const usage = await cloudinary.api.usage();
            // console.log(usage)
            cachedUsage = usage.credits;
            // console.log(cachedUsage)
            lastCheck = now;
            console.log(`Cloudinary Usage Updated: ${cachedUsage.used_percent*100}%`);
        } catch (error) {
            console.error("Failed to poll Cloudinary Usage API:", error.message);
            // If API fails, we assume it's safe to continue or stop based on your preference
            return true; 
        }
    }

    // Stop uploads if we've used 95% or more of the 25 credits
    const SAFETY_THRESHOLD = 95; 
    if ((cachedUsage.used_percent*100) >= SAFETY_THRESHOLD) {
        console.warn("Cloudinary credit limit reached. Blocking upload.");
        return false;
    }

    return true;
};


// // Example usage response structure
// {
//   "plan": "Free",
//   "credits": {
//     "usage": 22.5,        // Credits used so far
//     "limit": 25.0,       // Your total allowance
//     "used_percentage": 90.0
//   }
// }
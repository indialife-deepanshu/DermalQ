import axios from 'axios';
import FormData from 'form-data';

const model_url = process.env.MODEL_URL;
export const getSkinPrediction = async (imageBuffer, age, gender, localization, model_choice) => {
    const form = new FormData();
    // 'image' must match the key name in your Python request.files['image']
    console.log(age, gender, localization, model_choice)
    form.append('image', imageBuffer, { filename: 'upload.jpg' });
    form.append('age', age);
    form.append('gender', gender);
    form.append('localization', localization);
    form.append('model_choice', model_choice)
    // return;
    // console.log(form);
    // console.log("Header",form.getHeaders());
    // return null;
    try {
        const response = await axios.post(model_url, form, {
            headers: {
                ...form.getHeaders(),
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error connecting to Python Bridge:", error.message);
        throw new Error("Machine Learning service is currently unavailable.");
    }
};


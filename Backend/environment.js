let IS_PROD = false;
const BASE_URL = process.env.FRONTEND_URL;
const server_URL = IS_PROD ?
    process.env.PROD_URL
     :
    BASE_URL


export default server_URL;

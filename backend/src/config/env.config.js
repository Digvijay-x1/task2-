import dotenv from 'dotenv' ; 

dotenv.config() ; 


const ENV = {
    PORT: process.env.PORT , 
    JWT: process.env.JWT_SECRET , 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
}

export default ENV ; 
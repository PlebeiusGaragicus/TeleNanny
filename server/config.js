import dotenv from 'dotenv';

dotenv.config();


export default {
    debug: process.env.DEBUG || false,
    port: process.env.PORT || 3000,

    // MongoDB
    DB_DATABASE_NAME: 'teleNanny',
    DB_COLLECTION_NAME: 'settings',
    DB_URI: "mongodb://localhost:27017/",
}

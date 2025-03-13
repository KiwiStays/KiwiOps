module.exports = {
    apps: [
        {
            name: "kiwistays", // Name of your application
            script: "./src/index.js", // Entry point of your app
            instances: 1, // Use multiple instances if needed (e.g., "max" for all cores)
            exec_mode: "fork", // "cluster" for multi-core, "fork" for single instance
            autorestart: true, // Restart if the app crashes
            watch: true, // Watches files for changes (disable in production)
            max_memory_restart: "1G", // Restart if memory usage exceeds 1GB

            env: {
                NODE_ENV: "development",
                PORT: 3000,
                MONGO_URI:"mongodb+srv://smdakhtar007:sabir123@digitalguide.uisoz.mongodb.net/?retryWrites=true&w=majority&appName=DigitalGuide",
                CLOUDINARY_API_SECRET: "iZn4zeu_xe7xgDoI1XybXkDle1Q",
                CLOUDINARY_API_KEY :  "978964983727768",
                CLOUDINARY_CLOUD_NAME : "dofznncaw",
                CLOUDINARY_URL:"cloudinary://978964983727768:iZn4zeu_xe7xgDoI1XybXkDle1Q@dofznncaw",
                JWT_SECRET:"yourSecretKey"
            },

            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
                MONGO_URI:"mongodb+srv://smdakhtar007:sabir123@digitalguide.uisoz.mongodb.net/?retryWrites=true&w=majority&appName=DigitalGuide",
                PORT : 3000,
                CLOUDINARY_API_SECRET: "iZn4zeu_xe7xgDoI1XybXkDle1Q",
                CLOUDINARY_API_KEY :  "978964983727768",
                CLOUDINARY_CLOUD_NAME : "dofznncaw",
                CLOUDINARY_URL:"cloudinary://978964983727768:iZn4zeu_xe7xgDoI1XybXkDle1Q@dofznncaw",
                JWT_SECRET:"yourSecretKey"
            },

         
        }
    ],

    deploy: {
        production: {
            user: "SSH_USERNAME",
            host: "SSH_HOSTMACHINE",
            ref: "origin/main",
            repo: "GIT_REPOSITORY",
            path: "DESTINATION_PATH",
            "pre-deploy-local": "",
            "post-deploy": "npm install && pm2 reload ecosystem.config.js --env production",
            "pre-setup": ""
        }
    }
};

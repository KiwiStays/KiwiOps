module.exports = {
    apps: [
      {
        name: "Kiwiops",
        script: "src/index.js",
        env: {
            MONGO_URI: "mongodb+srv://bookings:bookings123@cluster0.7ar1u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
            PORT : 4000,
            CLOUDINARY_API_SECRET: "qsL8Ro_eg4FSzlH4EG41HYrACWc",
            CLOUDINARY_API_KEY :  "834171772782952",
            CLOUDINARY_CLOUD_NAME : "dghy5vp6u",
            CLOUDINARY_URL :"cloudinary://834171772782952:qsL8Ro_eg4FSzlH4EG41HYrACWc@dghy5vp6u",
            JWT_SECRET: "yourSecretKey"
        }
      }
    ]
  };
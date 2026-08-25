module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || "7d",
    cookieExpire: 7 * 24 * 60 * 60 * 1000,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 200,
    authWindowMs: 15 * 60 * 1000,
    authMax: 10,
  },

  pagination: {
    defaultPage: 1,
    defaultLimit: 9,
    maxLimit: 50,
  },

  app: {
    name: "Wanderlust",
    env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 5000,
    clientUrl:
      process.env.CLIENT_URL || "http://localhost:5173",
  },

  cloudinary: {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
},
};
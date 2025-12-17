export default {
  name: "Halo Optome",
  slug: "halo-optome-app",
  scheme: "halooptome", // untuk deep linking dan auth
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png", // pastikan file ini ada
  userInterfaceStyle: "light", // atau "automatic"
  splash: {
    image: "./assets/icon.png", // atau splash.png jika tersedia
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.halooptome"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png", // bisa copy dari default
      backgroundColor: "#ffffff"
    },
    package: "com.yourcompany.halooptome"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    // Tambahan env di sini kalau butuh
    API_URL: process.env.API_URL
  }
};

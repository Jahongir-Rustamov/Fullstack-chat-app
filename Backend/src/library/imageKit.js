// SDK initialization
import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();

var imagekit = new ImageKit({
  publicKey: process.env.IMAGE_PUBLIC_KEY,
  privateKey: process.env.IMAGE_PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

export default imagekit;

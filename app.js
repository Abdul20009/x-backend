const express  = require('express');
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const morgan = require('morgan');
const cors     = require('cors');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

const app = express();

const authRoutes = require('./routes/auth_routes');
const userRoutes = require('./routes/user_routes');

cloudinary.config({
  cloud_name: "drhbsl3bd",
  api_key: "582239288241383",
  api_secret: "KG1xBOXgxYw0x0Opqstb5dqnxRI",
});

dotenv.config();

app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

app.use("", authRoutes);
app.use("", userRoutes);


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  });
  
  
  // Start Server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));










































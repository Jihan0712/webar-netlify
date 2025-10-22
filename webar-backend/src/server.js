import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import supabase from "./supabaseClient.js";
import { compileToMind } from "./mindCompiler.js";

const app = express();
app.use(cors());

const upload = multer({ dest: "src/uploads/images/" });

app.post("/upload", upload.fields([{ name: "image" }, { name: "video" }]), async (req, res) => {
  try {
    const imageFile = req.files.image[0];
    const videoFile = req.files.video[0];
    const name = req.body.name;

    
    const mindPath = await compileToMind(imageFile.path, "src/uploads/minds");


    const mindBuffer = fs.readFileSync(mindPath);
    const videoBuffer = fs.readFileSync(videoFile.path);
    const timestamp = Date.now();

    const mindFileName = `minds/${timestamp}-${path.basename(mindPath)}`;
    const videoFileName = `videos/${timestamp}-${path.basename(videoFile.originalname)}`;

    await supabase.storage.from("assets").upload(mindFileName, mindBuffer);
    await supabase.storage.from("assets").upload(videoFileName, videoBuffer);

    const mindUrl = supabase.storage.from("assets").getPublicUrl(mindFileName).data.publicUrl;
    const videoUrl = supabase.storage.from("assets").getPublicUrl(videoFileName).data.publicUrl;

    
    await supabase.from("targets").insert([{ name, mindUrl, videoUrl, is_active: false }]);

    res.json({ success: true, mindUrl, videoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("✅ Backend running at http://localhost:3000"));

import { exec } from "child_process";
import path from "path";

export async function compileToMind(imagePath, outputDir) {
  const filename = path.basename(imagePath, path.extname(imagePath));
  const outputPath = path.join(outputDir, `${filename}.mind`);

  const cmd = `npx mindar-image-compiler -i "${imagePath}" -o "${outputPath}"`;

  return new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) reject(err);
      else resolve(outputPath);
    });
  });
}

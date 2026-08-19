const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("/app/node_modules/sharp");

const generatedRoot = process.env.GENERATED_ROOT || "/generated";
const publicRoot = process.env.PUBLIC_ROOT || "/public";
const mediaRoot = path.join(publicRoot, "starter-media");
const limit = 300 * 1024;

const generated = {
  "movera-service-autonomy.webp": "exec-35c39471-3a41-427d-af07-3db2e8b6e756.png",
  "movera-service-fleet.webp": "exec-1ac769ef-2c2a-40fd-841a-251961c8da55.png",
  "movera-service-experience.webp": "exec-371291cb-0e12-4caf-92b7-3c39ed39bd01.png",
  "movera-service-operations.webp": "exec-e3ee814a-4a1d-48d2-bcdc-4f3035e45881.png",
  "movera-product-command.webp": "exec-887a376b-7366-4149-ab84-a1a926eaad4b.png",
  "movera-product-perception.webp": "exec-4072df66-cad1-45d9-a3e0-1f85d600d873.png",
  "movera-product-motion-os.webp": "exec-68076040-4ac4-4589-8250-5163b1485530.png",
  "movera-product-twin.webp": "exec-ecfab69f-bc7b-40f5-a516-fbd254d2baed.png",
  "movera-project-brussels.webp": "exec-1273f61d-7a7e-47a8-ba87-3408bb61dc4a.png",
  "movera-project-antwerp.webp": "exec-09f13a56-dd89-4256-a22d-622837528bfc.png",
  "movera-project-cockpit.webp": "exec-7acffbcc-556b-462e-954b-b5360acdfd0b.png",
  "movera-project-corridor.webp": "exec-8c117c73-00ae-4440-b09a-3d6a5b08e4b7.png",
  "movera-news-introduction.webp": "exec-3fe23a9d-bbc7-4a87-8d88-3aeb0e59aa3f.png",
  "movera-news-edge.webp": "exec-24613c70-ff91-40af-b386-bfa4297916d1.png",
  "movera-news-belgium.webp": "exec-150c23c5-cee5-40d9-99f2-79700c0100d3.png",
  "movera-blog-operator.webp": "exec-5d59eb72-615a-49ef-96e1-65e57412ef4d.png",
  "movera-blog-trust.webp": "exec-1246b23a-1039-4501-822f-f9f938ebd60a.png",
  "movera-blog-signals.webp": "exec-46c95b24-f908-4982-8896-9e80d666cda9.png",
  "movera-innovation-confidence.webp": "exec-5587224d-87b7-48e8-8f29-d1109e8f674a.png",
  "movera-innovation-simulation.webp": "exec-5bf84c26-159d-4753-b178-bf43106195df.png",
  "movera-innovation-curb.webp": "exec-03170315-0516-48a5-9a0b-f3d5cc446ec6.png",
  "movera-careers-team.webp": "exec-6427e99f-748c-4cb7-bdc3-05c399fdae77.png",
  "movera-careers-data.webp": "exec-7dad84c9-16be-4277-a5fd-3f82494f0d93.png",
  "movera-careers-integration.webp": "exec-a9b2dc25-363d-4d65-a247-4b7c104999b7.png",
  "movera-about-studio.webp": "exec-a625a5b0-6287-4349-8583-35b37da69b50.png",
  "movera-about-history.webp": "exec-adcf8b59-b4f5-4735-b10c-652abae6b8dc.png",
  "movera-about-leadership.webp": "exec-9172d9df-6852-494e-ba4c-9ffcbe308507.png",
  "movera-about-vision.webp": "exec-5b84150c-5fd2-4345-bbaa-2b04ddc34664.png",
  "movera-about-assurance.webp": "exec-9ba1e7dc-fde5-465b-b5a5-4fa13494a894.png",
  "movera-about-leadership-note.webp": "exec-bbb835c5-9a81-4aa3-aecc-29cf514b93c3.png",
  "movera-region-brussels.webp": "exec-fc57a533-7944-4258-bc42-707879bd08b4.png",
  "movera-region-flanders.webp": "exec-c7388056-17dd-4028-9a51-2f480470dcf0.png",
  "movera-region-wallonia.webp": "exec-b2a615dd-2274-4f78-bbbe-ce0e9b5923d8.png",
};

async function encode(input, output, width = 1600) {
  let quality = 76;
  let targetWidth = width;
  for (;;) {
    await sharp(input).rotate().resize({ width: targetWidth, height: 1067, fit: "cover", withoutEnlargement: true }).webp({ quality, effort: 5 }).toFile(output);
    const { size } = await fs.stat(output);
    if (size <= limit) return size;
    if (quality > 54) quality -= 6;
    else if (targetWidth > 1280) targetWidth -= 160;
    else throw new Error(`${path.basename(output)} remains over 300 KB`);
  }
}

async function main() {
  await fs.mkdir(mediaRoot, { recursive: true });
  for (const [name, source] of Object.entries(generated)) {
    const input = path.join(generatedRoot, source);
    await fs.access(input);
    const size = await encode(input, path.join(mediaRoot, name));
    console.log(`${name}\t${size}`);
  }

  const current = await fs.readdir(mediaRoot);
  for (const name of current.filter(name => name.toLowerCase().endsWith(".png"))) {
    const input = path.join(mediaRoot, name);
    const output = path.join(mediaRoot, name.replace(/\.png$/i, ".webp"));
    if (!generated[output]) {
      const size = await encode(input, output, name.includes("hero") ? 1920 : 1600);
      console.log(`${path.basename(output)}\t${size}`);
    }
    await fs.rm(input);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

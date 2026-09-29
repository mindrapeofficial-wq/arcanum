import express from 'express';
import multer from 'multer';
import OpenAI, { toFile } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024, files: 2 } });
const port = process.env.PORT || 10000;

function getRecipe() {
  try {
    return JSON.parse(Buffer.from(process.env.SECRET_RECIPE_B64 || '', 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function safeChoice(value, table, fallback) {
  return table[value] || table[fallback] || '';
}

function buildPrompt(body) {
  const r = getRecipe();
  if (!r) throw new Error('Configuración privada no disponible.');
  const locks = ['face','hair','body','expression','hands'].filter(k => body[k] === 'on');
  const keep = locks.map(k => r.locks[k]).filter(Boolean).join(' ');
  const parts = [
    r.base,
    keep,
    safeChoice(body.age, r.age, 'auto'),
    body.hasBackground === 'yes' ? r.backgroundReference : safeChoice(body.scene, r.scenes, 'taller'),
    safeChoice(body.clothes, r.clothes, 'verde'),
    safeChoice(body.pose, r.poses, 'sentado'),
    safeChoice(body.accessory, r.accessories, 'regalo'),
    safeChoice(body.hairAccessory, r.hairAccessories, 'ninguno'),
    r.integration,
    r.finish,
    body.notes ? `${r.extraPrefix} ${String(body.notes).slice(0, 700)}` : ''
  ].filter(Boolean);
  return parts.join('\n\n');
}

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { etag: false, maxAge: 0 }));

app.get('/health', (req, res) => res.json({ ok: true, engine: Boolean(process.env.OPENAI_API_KEY) }));

app.post('/api/generate', upload.fields([{ name: 'subject', maxCount: 1 }, { name: 'background', maxCount: 1 }]), async (req, res) => {
  try {
    const subject = req.files?.subject?.[0];
    const background = req.files?.background?.[0];
    if (!subject) return res.status(400).json({ error: 'Falta la foto del modelo.' });
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'El motor privado de generación todavía no está activado en este estudio.' });
    }
    const prompt = buildPrompt({ ...req.body, hasBackground: background ? 'yes' : 'no' });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const images = [await toFile(subject.buffer, subject.originalname || 'modelo.jpg', { type: subject.mimetype || 'image/jpeg' })];
    if (background) images.push(await toFile(background.buffer, background.originalname || 'fondo.jpg', { type: background.mimetype || 'image/jpeg' }));
    const sizeMap = { portrait: '1024x1536', square: '1024x1024', landscape: '1536x1024' };
    const out = await client.images.edit({
      model: process.env.IMAGE_MODEL || 'gpt-image-2.5-sunburst',
      image: images,
      prompt,
      size: sizeMap[req.body.output] || '1024x1536',
      quality: 'high',
      output_format: 'jpeg'
    });
    const b64 = out.data?.[0]?.b64_json;
    if (!b64) throw new Error('El motor no devolvió una imagen.');
    res.json({ image: `data:image/jpeg;base64,${b64}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'No se pudo generar la fotografía.' });
  }
});

app.use((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Estudio Navideño Premium en ${port}`);
  console.log(`Motor OpenAI: ${process.env.OPENAI_API_KEY ? 'ACTIVO' : 'INACTIVO'}`);
});

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/ai/generate-details', async (req, res) => {
  const { uraianKegiatan, bidang, rincianBelanja, sumberDana } = req.body;

  // Fallback generator helper in case API is unavailable or returns invalid data
  const getFallbackDetails = () => {
    const act = (uraianKegiatan || 'Kegiatan sekolah').trim();
    const rinc = (rincianBelanja || 'Pengadaan barang/jasa').trim();
    return {
      keluaran: `Terlaksananya kegiatan "${act}" (${rinc}) secara optimal dengan hasil pencapaian mutu pendidikan yang terukur dan akuntabel.`,
      keterangan: `Proposal, SK Panitia, daftar hadir peserta, dokumentasi kegiatan, nota/kuitansi, dan laporan pertanggungjawaban (LPJ).`,
    };
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json(getFallbackDetails());
    }

    const prompt = `Bertindaklah sebagai Senior Perencana Sekolah Dasar (SD BOPKRI Gondolayu). 
Berdasarkan rincian kegiatan RKT/RKAS berikut:
- Bidang/SNP: ${bidang || 'Umum'}
- Uraian Kegiatan: ${uraianKegiatan || ''}
- Rincian Belanja: ${rincianBelanja || ''}
- Sumber Dana: ${sumberDana || 'BOS'}

Tolong berikan respons dalam format JSON valid (tanpa markdown backticks) dengan 2 properti saja:
1. "keluaran": kalimat keluaran (output) formal sesuai standar dokumen RKT sekolah dasar (contoh: "Terlaksananya ... dengan hasil pencapaian ...").
2. "keterangan": rincian dokumen pendukung dan indikator keberhasilan (contoh: "Proposal, SK Panitia, daftar hadir, dokumentasi kegiatan, dan laporan pertanggungjawaban (LPJ)").`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    // Clean potential markdown code blocks if any
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch {
      data = getFallbackDetails();
    }

    res.json({
      keluaran: data.keluaran || getFallbackDetails().keluaran,
      keterangan: data.keterangan || getFallbackDetails().keterangan,
    });
  } catch (error) {
    console.error('AI generation error, using robust fallback:', error);
    res.json(getFallbackDetails());
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();

import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  app.post('/api/analyze-assignment', async (req, res) => {
    try {
      const { fileData, fileType, textContent } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      let prompt = `Bạn là chuyên gia giáo dục. Hãy phân tích nội dung sau và chuyển thành danh sách các câu hỏi bài tập tương tác.
      Yêu cầu trả về định dạng JSON:
      {
        "title": "Tiêu đề bài tập",
        "subject": "Môn học",
        "grade": "Khối lớp",
        "questions": [
          {
            "id": "string",
            "type": "multiple-choice | true-false | fill-in-blank | matching | short-answer | essay | math",
            "question": "Nội dung câu hỏi",
            "options": ["A", "B", "C", "D"], // Chỉ dành cho multiple-choice
            "matchingPairs": [{ "left": "...", "right": "..." }], // Chỉ dành cho matching
            "correctAnswer": "đáp án đúng",
            "explanation": "Lời giải chi tiết",
            "points": 1
          }
        ]
      }
      
      Hãy giữ nguyên nội dung gốc, không bịa đặt. Nếu không tìm thấy đáp án, để trống. Luôn trả về JSON hợp lệ.`;

      let result;
      if (fileData) {
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: fileData,
              mimeType: fileType
            }
          }
        ]);
      } else {
        result = await model.generateContent([prompt, textContent]);
      }

      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.status(500).json({ error: "Không thể phân tích dữ liệu thành JSON" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi xử lý AI" });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, (await import('fs')).readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8'));
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();


import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Question, AnswerFeedback, VoiceOption } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImage = async (file: File): Promise<Question[]> => {
  const imagePart = await fileToGenerativePart(file);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: "Sen görme engelli bir YKS öğrencisine yardımcı olan bir eğitim asistanısın. Sağlanan görseldeki sınav kitapçığı sayfasını analiz et. Her bir soruyu, şıklarını ve varsa doğru cevap anahtarını çıkar. Paragrafa bağlı soruları bir grup olarak tanımla. Çıktıyı, sağlanan JSON şemasına tam olarak uyacak şekilde formatla. Tüm metinler ekran okuyucu dostu ve net olmalı." },
        imagePart,
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                questionText: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING },
                      text: { type: Type.STRING },
                    },
                  },
                },
                correctAnswerKey: { type: Type.STRING },
                associatedParagraph: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson.questions as Question[];
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", e);
    console.error("Raw response text:", response.text);
    throw new Error("Yapay zeka tarafından döndürülen yanıt analiz edilemedi. Lütfen tekrar deneyin.");
  }
};

export const checkAnswerAndGetSubject = async (question: Question, userAnswer: string): Promise<AnswerFeedback> => {
    const isCorrect = userAnswer === question.correctAnswerKey;
    
    if (isCorrect) {
        return {
            isCorrect: true,
            feedbackText: "Doğru",
        };
    }

    const prompt = `
    Bir YKS öğrencisi aşağıdaki soruyu yanlış cevapladı. Bu sorunun ait olduğu ders ve konuyu belirle (örneğin: Tarih - İlk Türk Devletleri).
    
    Soru: "${question.questionText}"
    Doğru Cevap: ${question.correctAnswerKey}
    Öğrencinin Cevabı: ${userAnswer}

    Lütfen sadece konuyu içeren bir JSON nesnesi döndür.
    Örnek: {"subject": "Coğrafya - Türkiye'nin İklimi"}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        const subject = parsedJson.subject || 'Konu belirlenemedi';

        return {
            isCorrect: false,
            feedbackText: `Yanlış (Doğru Cevap: ${question.correctAnswerKey})`,
            subject: subject,
        };
    } catch (e) {
        console.error("Failed to get subject from Gemini:", e);
        return {
            isCorrect: false,
            feedbackText: `Yanlış (Doğru Cevap: ${question.correctAnswerKey})`,
            subject: 'Konu belirlenirken bir hata oluştu.',
        };
    }
};

export const generateSpeech = async (text: string, voice: VoiceOption): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Vurgulu bir şekilde oku: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("Ses verisi alınamadı.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Gemini TTS hatası:", error);
        throw new Error("Ses üretimi sırasında bir hata oluştu.");
    }
};

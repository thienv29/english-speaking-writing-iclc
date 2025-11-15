import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.AI_GATEWAY_API_KEY!);

export async function POST(request: Request) {
  try {
    const { type, userAnswer, question, targetWord, partial, transcribedText } = await request.json();

    // Handle speaking type - use AI to assess pronunciation accuracy
    if (type === 'speaking') {
      // Handle error cases first
      if (transcribedText && transcribedText.toLowerCase().includes('could not connect')) {
        return Response.json({
          score: 1,
          feedback: "Có lỗi kết nối. Hãy thử lại!",
          tips: "Kiểm tra internet và thử lại nhé.",
          transcribedText
        });
      }
      else if (transcribedText && (transcribedText.toLowerCase().includes('error') || transcribedText.toLowerCase().includes('failed'))) {
        return Response.json({
          score: 1,
          feedback: "Có lỗi xảy ra. Hãy thử lại!",
          tips: "Ghi âm lại và gửi nhé.",
          transcribedText
        });
      }
      else if (transcribedText && transcribedText.toLowerCase().includes('could not detect')) {
        return Response.json({
          score: 2,
          feedback: "Không nghe rõ giọng bé nói.",
          tips: "Hãy nói to hơn và gần micro hơn nhé!",
          transcribedText
        });
      }

      // Use AI to assess pronunciation accuracy
      const prompt = `Bạn là giáo viên phát âm tiếng Anh đang đánh giá bài ghi âm của trẻ em. Hãy nhẹ nhàng và khích lệ.

Từ cần phát âm: "${targetWord}"
Trích âm giọng nói của trẻ: "${transcribedText || 'Không phát hiện giọng nói'}"

HƯỚNG DẪN QUAN TRỌNG:
- Trích âm giọng nói có thể không chính xác 100% do speech recognition → hãy linh hoạt, tập trung vào ý chính
- Nếu trích âm gần đúng với từ "${targetWord}" (dù sai lỗi nhỏ), hãy CHẤM ĐIỂM CAO và khích lệ → trẻ em cần được động viên!
- Chỉ bảo thử lại khi sai hoàn toàn hoặc không phát âm được gì
- Ưu tiên KHÍCH LỆ thay vì chỉ trích lỗi nhỏ

TIÊU CHÍ CHẤM ĐIỂM HÀNG HẢI (1-10):
10 = Hoàn hảo hoặc rất gần giống native speaker
9-8 = Rất tốt, chỉ có lỗi nhỏ không đáng kể (cho điểm cao!)
7-6 = Tốt, phát âm được nhưng có 1-2 lỗi nhỏ (vẫn khích lệ mạnh!)
5-4 = Trung bình, có nhiều lỗi nhưng vẫn hiểu được ý
3-2 = Phát âm khó hiểu, cần cải thiện nhiều
1 = Gần như không phát âm được hoặc sai hoàn toàn

PHẢN HỒI PHÙ HỢP VỚI TRẺ EM:
- Luôn khích lệ: "Rất tốt!", "Tiếp tục phát huy nhé!", "Cố gắng hơn chút nữa!"
- Chỉ ra lỗi cụ thể nhẹ nhàng: "Thử phát âm âm 'th' rõ hơn nhé"
- Đưa ra gợi ý cụ thể: "Hãy để lưỡi chạm răng trên", "Thổi hơi nhẹ khi phát âm"

VÍ DỤ PHÁT ÂM CẦN CHÚ Ý:
- "think" → cần âm TH không giống S
- "ship" → cần âm SH không giống S  
- "run" → cần âm R lưỡi cuộn lại
- "water" → cần âm W không giống V

LUÔN trả lời bằng TIẾNG VIỆT và format JSON chính xác:
{"score": số từ 1-10, "feedback": "phản hồi ngắn gọn khích lệ", "tips": "lời khuyên phát âm cụ thể"}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;

      const parsedResult = JSON.parse(jsonText);

      return Response.json({
        score: parsedResult.score || 1,
        feedback: parsedResult.feedback || "Thử lại đi!",
        tips: parsedResult.tips || "Nói rõ ràng hơn nhé.",
        transcribedText
      });
    }

    // Use Gemini for other types (writing, qa, sentence, complete)
    let prompt = '';

    if (type === 'qa') {
      prompt = `You are an English teacher grading a student's answer.
Question: "${question}"
Student's answer: "${userAnswer}"

Please rate this answer from 1-10 and provide brief, encouraging feedback for a child (6-12 years old). Important: Respond in Vietnamese language only so that the child can understand.
Format: {"score": number, "feedback": "string", "explanation": "string"}`;
    } else if (type === 'sentence') {
      prompt = `You are an English teacher grading a student's sentence.
Target word to use: "${targetWord}"
Student's sentence: "${userAnswer}"

Check if the sentence is grammatically correct, makes sense, and uses the target word properly.
Rate from 1-10 and provide brief, encouraging feedback for a child. Important: Respond in Vietnamese language only so that the child can understand.
Format: {"score": number, "feedback": "string", "explanation": "string"}`;
    } else if (type === 'complete') {
      prompt = `You are an English teacher grading a student's answer.
Sentence to complete: "${partial}"
Student's answer: "${userAnswer}"
Target word: "${targetWord}"

Check if the answer is correct and makes grammatical sense.
Rate from 1-10 and provide brief, encouraging feedback for a child. Important: Respond in Vietnamese language only so that the child can understand.
Format: {"score": number, "feedback": "string", "explanation": "string"}`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Extract JSON from response (Gemini might return extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    const parsedResult = JSON.parse(jsonText);
    return Response.json(parsedResult);
  } catch (error) {
    console.error('[v0] Scoring error:', error);
    return Response.json({ error: 'Scoring failed' }, { status: 500 });
  }
}

// Text normalization for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ''); // Remove extra spaces
}

// Check phonetic similarity (basic rules)
function hasPhoneticSimilarity(str1: string, str2: string): boolean {
  if (Math.abs(str1.length - str2.length) > 2) return false;

  // Common sound substitutions
  const substitutions: { [key: string]: string[] } = {
    'c': ['k', 's', 'z'],
    'k': ['c'],
    'g': ['j'],
    'j': ['g', 'dge'],
    'f': ['ph'],
    'ph': ['f'],
    's': ['z', 'c'],
    'z': ['s', 'x'],
    'x': ['ks'],
    'ee': ['ea'],
    'oo': ['ou', 'u'],
    'ea': ['ee'],
    'ou': ['oo'],
  };

  // Simple check if words match after applying substitutions
  return arePhoneticallySimilar(str1, str2, substitutions);
}

// Check if words share significant letter matches
function hasLetterMatches(str1: string, str2: string): boolean {
  const common = str1.split('').filter(char => str2.includes(char));
  return common.length >= Math.min(str1.length * 0.4, str2.length * 0.4);
}

// Simple phonetic similarity check
function arePhoneticallySimilar(word1: string, word2: string, substitutions: { [key: string]: string[] }): boolean {
  if (word1 === word2) return true;

  const applySub = (word: string, sub: { [key: string]: string[] }) => {
    let result = word;
    Object.keys(sub).forEach(from => {
      sub[from].forEach(to => {
        result = result.replace(new RegExp(from, 'g'), to);
      });
    });
    return result;
  };

  const word1Alt = applySub(word1, substitutions);
  const word2Alt = applySub(word2, substitutions);

  return word1Alt === word2Alt || levenshteinDistance(word1Alt, word2Alt) <= 1;
}

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

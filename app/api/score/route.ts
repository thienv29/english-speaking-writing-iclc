import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.AI_GATEWAY_API_KEY!);

export async function POST(request: Request) {
  try {
    const { type, userAnswer, question, targetWord, partial, transcribedText, attempts } = await request.json();

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
      const isLenientMode = attempts >= 4; // Nới lỏng sau 4 lần thử
      const prompt = `Bạn là giáo viên phát âm tiếng Anh đang đánh giá bài ghi âm của trẻ em. Hãy nhẹ nhàng và khích lệ.

Từ cần phát âm: "${targetWord}"
Trích âm giọng nói của trẻ: "${transcribedText || 'Không phát hiện giọng nói'}"
Số lần thử: ${attempts || 1}

HƯỚNG DẪN QUAN TRỌNG:
- Trích âm giọng nói có thể không chính xác 100% do speech recognition → hãy linh hoạt, tập trung vào ý chính
- Nếu trích âm gần đúng với từ "${targetWord}" (dù sai lỗi nhỏ), hãy CHẤM ĐIỂM CAO và khích lệ → trẻ em cần được động viên!
- Chỉ bảo thử lại khi sai hoàn toàn hoặc không phát âm được gì
- Ưu tiên KHÍCH LỆ thay vì chỉ trích lỗi nhỏ

${isLenientMode ? `CHẾ ĐỘ NỚI LỎNG: Trẻ đã thử ${attempts} lần! Hãy rất khoan dung và cho điểm cao ngay cả với phát âm gần đúng. Thưởng cho nỗ lực!` : ''}

TIÊU CHÍ CHẤM ĐIỂM ${isLenientMode ? 'SIÊU HÀNG HẢI' : 'HÀNG HẢI'} (1-10):
${isLenientMode ? `10-8 = Tuyệt vời! Bé đã cố gắng nhiều, cho điểm cao!
6-7 = Tốt lắm, tiếp tục phát huy!
4-5 = Khá rồi, bé giỏi lắm!` : `10 = Hoàn hảo hoặc rất gần giống native speaker
9-8 = Rất tốt, chỉ có lỗi nhỏ không đáng kể (cho điểm cao!)
7-6 = Tốt, phát âm được nhưng có 1-2 lỗi nhỏ (vẫn khích lệ mạnh!)
5-4 = Trung bình, có nhiều lỗi nhưng vẫn hiểu được ý
3-2 = Phát âm khó hiểu, cần cải thiện nhiều
1 = Gần như không phát âm được hoặc sai hoàn toàn`}

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

      // Retry logic for AI responses
      let parsedResult;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text().trim();

          // Extract JSON from response
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const jsonText = jsonMatch ? jsonMatch[0] : text;

          parsedResult = JSON.parse(jsonText);
          break; // Success, exit retry loop
        } catch (parseError) {
          retryCount++;
          console.error(`[v0] JSON parsing failed (attempt ${retryCount}/${maxRetries}):`, parseError);

          if (retryCount >= maxRetries) {
            // All retries failed, provide fallback response
            console.error('[v0] All retry attempts failed, using fallback response');
            if (type === 'speaking') {
              parsedResult = {
                score: 5,
                feedback: "Cố gắng tốt lắm! Có lỗi kỹ thuật nhỏ nhưng bé làm rất tốt.",
                tips: "Thử ghi âm lại nhé!",
                transcribedText
              };
            } else {
              parsedResult = {
                score: 8,
                feedback: "Bé làm rất tốt! Điểm cao cho nỗ lực của con nhé!",
                explanation: "Có lỗi kỹ thuật nhỏ nhưng câu trả lời của bé rất đáng khen!"
              };
            }
          } else {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

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
      prompt = `You are an English teacher grading a child's ANSWER to an English question. BE VERY GENEROUS WITH GRADING!
QUESTION in English: "${question}"
CHILD'S ANSWER in English: "${userAnswer}"

IMPORTANT: Children are learning - prioritize HIGH SCORES (8, 9, 10) whenever possible!
- Look for ANY positive aspects first (creativity, effort, understandable ideas)
- Minor grammar/spelling errors = don't deduct many points
- Rate 8-10 if answer is understandable and attempts the task
- Rate 6-7 if answer is simple but correct
- Only low scores (1-5) for completely off-topic or empty answers
- The child speaks Vietnamese, so respond in Vietnamese only

PRIORITY: Give high scores and lots of encouragement. Be a cheerleader for their English learning!
Format: {"score": 8-10 preferably, "feedback": "string in Vietnamese", "explanation": "string in Vietnamese"}`;
    } else if (type === 'sentence') {
      prompt = `You are an English teacher grading a child's ENGLISH sentence. BE ULTRA GENEROUS!
REQUIRED WORD in English: "${targetWord}"
CHILD'S SENTENCE in English: "${userAnswer}"

IMPORTANT: Reward their EFFORT with HIGH SCORES!
- If sentence uses the target word = automatic 8+ points
- Small grammar errors = don't penalize heavily (8-9 points)
- Missing articles/tense errors = still 7-8 points if meaning is clear
- Spelled target word almost right? = generous credit
- Rate 9-10 for any understandable sentence with target word
- Only deduct for completely wrong word or off-topic content

CHILD SPEAKS VIETNAMESE: Use baby talk - "bé", "con", "cố lên", massive encouragement!
Format: {"score": 8-10 preferably, "feedback": "Vietnamese encouragement", "explanation": "Vietnamese writing tips"}`;
    } else if (type === 'complete') {
      prompt = `You are an English teacher grading child's ENGLISH sentence completion. BE SUPER GENEROUS!
SENTENCE TO COMPLETE in English: "${partial}"
TARGET WORD in English: "${targetWord}"
CHILD'S ANSWER in English: "${userAnswer}"

IMPORTANT: Kids are learning - give HIGH SCORES and CHEER THEM ON!
- If target word is used AND sentence makes sense = 9-10 points
- If target word is used but small grammar error = 8 points
- If they're close to correct = be generous
- Reward creativity and effort, not perfection
- Almost all answers should get 7+ points (they're trying!)

ENCOURAGE CONSTANTLY in Vietnamese baby talk - be their biggest cheerleader!
Format: {"score": 8-10 preferably, "feedback": "Vietnamese cheering", "explanation": "gentle Vietnamese English tips"}`;
    }

    // Retry logic for writing exercises
    let writingParsedResult;
    let writingRetryCount = 0;
    const writingMaxRetries = 3;

    while (writingRetryCount < writingMaxRetries) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Extract JSON from response (Gemini might return extra text)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;

        writingParsedResult = JSON.parse(jsonText);
        break; // Success, exit retry loop
      } catch (parseError) {
        writingRetryCount++;
        console.error(`[v0] Writing JSON parsing failed (attempt ${writingRetryCount}/${writingMaxRetries}):`, parseError);

        if (writingRetryCount >= writingMaxRetries) {
          // All retries failed, provide fallback response
          console.error('[v0] All writing retry attempts failed, using fallback response');
          writingParsedResult = {
            score: 8,
            feedback: "Bé làm rất tốt! Điểm cao cho nỗ lực của con nhé!",
            explanation: "Có lỗi kỹ thuật nhỏ nhưng câu trả lời của bé rất đáng khen!"
          };
        } else {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    return Response.json(writingParsedResult);
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

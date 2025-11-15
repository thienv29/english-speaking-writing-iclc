import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.AI_GATEWAY_API_KEY!);

export async function POST(request: Request) {
  try {
    const { type, userAnswer, question, targetWord, partial, transcribedText } = await request.json();

    // Handle speaking type - improved comparison logic with phonetic similarity
    if (type === 'speaking') {
      const normalizedTranscribed = normalizeText(transcribedText || '');
      const normalizedTarget = (targetWord || '').toLowerCase().trim();

      let score = 1;
      let feedback = "Try again! You can do it!";
      let tips = "Say the word clearly and slowly.";

      // Perfect match
      if (normalizedTranscribed === normalizedTarget) {
        score = 10;
        feedback = "Perfect pronunciation! Well done!";
        tips = "Great job!";
      }
      // Close phonetic match (Levenshtein ≤1) or contains the word
      else if (levenshteinDistance(normalizedTranscribed, normalizedTarget) <= 1 ||
               normalizedTranscribed.includes(normalizedTarget)) {
        score = 9;
        feedback = "Very close! Almost perfect!";
        tips = "You're on the right track!";
      }
      // Phonetic similarity (distance 2 or sound-like)
      else if (levenshteinDistance(normalizedTranscribed, normalizedTarget) <= 2 ||
               hasPhoneticSimilarity(normalizedTranscribed, normalizedTarget)) {
        score = 7;
        feedback = "Good effort! Keep practicing!";
        tips = "Pay attention to the exact sounds.";
      }
      // Some letters/digits match
      else if (normalizedTranscribed.length > 0 &&
               hasLetterMatches(normalizedTranscribed, normalizedTarget)) {
        score = 5;
        feedback = "Nice try! You're getting there.";
        tips = "Listen carefully to each sound in the word.";
      }
      // Valid audio but wrong word
      else if (normalizedTranscribed.length > 0) {
        score = 3;
        feedback = "Keep trying! You can do better.";
        tips = `You said "${normalizedTranscribed}". Try saying "${normalizedTarget}".`;
      }

      return Response.json({ score, feedback, tips, transcribedText });
    }

    // Use Gemini for other types (writing, qa, sentence, complete)
    let prompt = '';

    if (type === 'qa') {
      prompt = `You are an English teacher grading a student's answer.
Question: "${question}"
Student's answer: "${userAnswer}"

Please rate this answer from 1-10 and provide brief, encouraging feedback for a child (6-12 years old).
Format: {"score": number, "feedback": "string", "explanation": "string"}`;
    } else if (type === 'sentence') {
      prompt = `You are an English teacher grading a student's sentence.
Target word to use: "${targetWord}"
Student's sentence: "${userAnswer}"

Check if the sentence is grammatically correct, makes sense, and uses the target word properly.
Rate from 1-10 and provide brief, encouraging feedback for a child.
Format: {"score": number, "feedback": "string", "explanation": "string"}`;
    } else if (type === 'complete') {
      prompt = `You are an English teacher grading a student's answer.
Sentence to complete: "${partial}"
Student's answer: "${userAnswer}"
Target word: "${targetWord}"

Check if the answer is correct and makes grammatical sense.
Rate from 1-10 and provide brief, encouraging feedback for a child.
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

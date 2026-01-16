export interface QAData {
  question: string;
  answer: string;
  language: 'EN' | 'BN';
}

export class DatasetParser {
  private qaData: QAData[] = [];

  constructor(datasetContent: string) {
    this.parseDataset(datasetContent);
  }

  private parseDataset(content: string): void {
    const lines = content.split('\n');
    let currentQA: Partial<QAData> = {};
    let isCollectingAnswer = false;
    let answerLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and header lines
      if (!trimmedLine || trimmedLine.includes('M873 CHATBOT DATASET') || trimmedLine.includes('Owner:') || trimmedLine.includes('Site:')) {
        continue;
      }

      // Check for question lines (Q followed by number)
      if (trimmedLine.match(/^Q\d+[a-z]?\s*\((EN|BN)\):\s*(.+)$/)) {
        // Save previous QA if exists
        if (currentQA.question && answerLines.length > 0) {
          currentQA.answer = answerLines.join(' ').trim();
          this.qaData.push(currentQA as QAData);
        }

        // Reset for new question
        const match = trimmedLine.match(/^Q\d+[a-z]?\s*\((EN|BN)\):\s*(.+)$/);
        if (match) {
          currentQA = {
            question: match[2].trim(),
            language: match[1] as 'EN' | 'BN'
          };
          answerLines = [];
          isCollectingAnswer = false;
        }
      }
      // Check for answer start
      else if (trimmedLine === 'A:') {
        isCollectingAnswer = true;
      }
      // Collect answer lines
      else if (isCollectingAnswer && trimmedLine) {
        // Skip language indicators (EN: or BN:)
        if (trimmedLine.match(/^(EN|BN):\s*(.+)$/)) {
          const match = trimmedLine.match(/^(EN|BN):\s*(.+)$/);
          if (match) {
            answerLines.push(match[2]);
          }
        } else {
          answerLines.push(trimmedLine);
        }
      }
    }

    // Save the last QA pair
    if (currentQA.question && answerLines.length > 0) {
      currentQA.answer = answerLines.join(' ').trim();
      this.qaData.push(currentQA as QAData);
    }
  }

  public findAnswer(userQuestion: string): string | null {
    const userQuestionLower = userQuestion.toLowerCase().trim();
    
    // Detect language of the question
    const isBengali = this.detectLanguage(userQuestionLower) === 'BN';
    
    // Enhanced greeting responses in both languages
    const greetings = {
      'EN': ['hi', 'hello', 'hey', 'greetings', 'assalamualaikum', 'good morning', 'good afternoon', 'good evening'],
      'BN': ['সালাম', 'হ্যালো', 'হাই', 'নমস্কার', 'আসসালামুয়ালাইকুম', 'সুপ্রভাত', 'শুভ অপরাহ্ন', 'শুভ সন্ধ্যা']
    };
    
    if (greetings['EN'].some(g => userQuestionLower.includes(g)) || greetings['BN'].some(g => userQuestionLower.includes(g))) {
      return isBengali 
        ? "হ্যালো! আমি M873 সহকারী। আমি কিভাবে আপনাকে সাহায্য করতে পারি?"
        : "Hello! I'm M873 Assistant. How can I help you today?";
    }

    // Enhanced name questions in both languages
    const nameQuestions = {
      'EN': ['what is your name', 'who are you', 'what should I call you', 'your name'],
      'BN': ['তোমার নাম কি', 'তুমি কে', 'আপনার নাম কি', 'তোমার পরিচয়']
    };
    
    const nameMatches = [...nameQuestions['EN'], ...nameQuestions['BN']];
    if (nameMatches.some(q => userQuestionLower.includes(q))) {
      return isBengali
        ? "আমি M873 সহকারী, M873 প্ল্যাটফর্মের জন্য আপনার সহায়ক এআই সঙ্গী!"
        : "I'm M873 Assistant, your helpful AI companion for M873 platform!";
    }

    // Enhanced M873 introduction in both languages
    const m873Questions = {
      'EN': ['what is m873', 'tell me about m873', 'm873 platform', 'about m873'],
      'BN': ['m873 কি', 'm873 সম্পর্কে বলুন', 'm873 প্ল্যাটফর্ম', 'm873 সম্পর্কে']
    };
    
    const m873Matches = [...m873Questions['EN'], ...m873Questions['BN']];
    if (m873Matches.some(q => userQuestionLower.includes(q))) {
      return isBengali
        ? "M873 একটি আধুনিক প্ল্যাটফর্ম যা নিরাপদ অ্যাক্সেস এবং ভবিষ্যত-প্রস্তুত বৈশিষ্ট্যগুলির সাথে তৈরি করা হয়েছে, Md. Mahfuzul Islam দ্বারা তৈরি।"
        : "M873 is a modern platform with secure access and future-ready features, created by Md. Mahfuzul Islam.";
    }

    // Search through the dataset with language preference
    let bestMatch: QAData | null = null;
    let bestScore = 0;

    // First, try to find matches in the same language
    const sameLanguageQAs = this.qaData.filter(qa => qa.language === (isBengali ? 'BN' : 'EN'));
    
    for (const qa of sameLanguageQAs) {
      const score = this.calculateSimilarity(userQuestionLower, qa.question.toLowerCase());
      if (score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    }

    // If no good match in same language, try other language
    if (!bestMatch || bestScore < 0.2) {
      const otherLanguageQAs = this.qaData.filter(qa => qa.language !== (isBengali ? 'BN' : 'EN'));
      for (const qa of otherLanguageQAs) {
        const score = this.calculateSimilarity(userQuestionLower, qa.question.toLowerCase());
        if (score > bestScore) {
          bestScore = score;
          bestMatch = qa;
        }
      }
    }

    // Return answer if similarity is above threshold
    if (bestMatch && bestScore > 0.2) {
      return bestMatch.answer;
    }

    return null;
  }

  private detectLanguage(text: string): 'EN' | 'BN' {
    // Simple language detection based on Bengali characters
    const bengaliChars = /[ঀ-৿]/;
    return bengaliChars.test(text) ? 'BN' : 'EN';
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Enhanced similarity calculation with word stemming and partial matching
    const words1 = str1.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const words2 = str2.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    // Exact word matches
    const exactMatches = words1.filter(word1 => 
      words2.some(word2 => word1 === word2)
    );
    
    // Partial word matches (for similar words)
    const partialMatches = words1.filter(word1 => 
      words2.some(word2 => 
        word1.includes(word2) || word2.includes(word1) || 
        this.getLevenshteinDistance(word1, word2) <= 2
      )
    );
    
    // Key term bonus (for important words like "owner", "features", "m873", etc.)
    const keyTerms = ['owner', 'features', 'm873', 'platform', 'creator', 'developer', 'design', 'access', 'security'];
    const keyTermMatches = words1.filter(word1 => 
      keyTerms.some(term => word1.includes(term))
    ).filter(word1 => 
      words2.some(word2 => word2.includes(word1))
    );
    
    const baseScore = (exactMatches.length * 1.0 + partialMatches.length * 0.5) / Math.max(words1.length, words2.length);
    const keyTermBonus = keyTermMatches.length * 0.1;
    
    return Math.min(baseScore + keyTermBonus, 1.0);
  }

  private getLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  public getAllQAs(): QAData[] {
    return this.qaData;
  }

  public searchDataset(query: string, language?: 'EN' | 'BN'): QAData[] {
    const queryLower = query.toLowerCase();
    let results = this.qaData;
    
    // Filter by language if specified
    if (language) {
      results = results.filter(qa => qa.language === language);
    }
    
    // Search in both question and answer
    return results.filter(qa => 
      qa.question.toLowerCase().includes(queryLower) ||
      qa.answer.toLowerCase().includes(queryLower)
    );
  }

  public getStats(): { total: number; english: number; bengali: number } {
    return {
      total: this.qaData.length,
      english: this.qaData.filter(qa => qa.language === 'EN').length,
      bengali: this.qaData.filter(qa => qa.language === 'BN').length
    };
  }
}

// Create a function to load the dataset
export const loadDataset = async (): Promise<DatasetParser | null> => {
  try {
    const response = await fetch('/M873_Dataset.txt');
    const content = await response.text();
    return new DatasetParser(content);
  } catch (error) {
    console.error('Failed to load dataset:', error);
    return null;
  }
};
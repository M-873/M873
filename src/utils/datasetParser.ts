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
    
    // Enhanced greeting responses in both languages with natural M873 connection
    const greetings = {
      'EN': ['hi', 'hello', 'hey', 'greetings', 'assalamualaikum', 'good morning', 'good afternoon', 'good evening'],
      'BN': ['সালাম', 'হ্যালো', 'হাই', 'নমস্কার', 'আসসালামুয়ালাইকুম', 'সুপ্রভাত', 'শুভ অপরাহ্ন', 'শুভ সন্ধ্যা']
    };
    
    if (greetings['EN'].some(g => userQuestionLower.includes(g)) || greetings['BN'].some(g => userQuestionLower.includes(g))) {
      return isBengali 
        ? `হ্যালো! আমি M873 সহকারী। আমি কিভাবে সাহায্য করতে পারি?

আপনি যদি M873 সম্পর্কে জানতে চান:
• এটি একটি AI শেখার প্ল্যাটফর্ম
• Md. Mahfuzul Islam দ্বারা তৈরি
• ঢাকা, বাংলাদেশ থেকে পরিচালিত

আপনার কি কোনো নির্দিষ্ট প্রশ্ন আছে?`
        : `Hello! I'm M873 Assistant. How can I help you today?

If you're interested in M873:
• It's an AI learning platform
• Created by Md. Mahfuzul Islam
• Operated from Dhaka, Bangladesh

Do you have any specific questions?`;
    }

    // Enhanced name questions in both languages with natural introduction
    const nameQuestions = {
      'EN': ['what is your name', 'who are you', 'what should I call you', 'your name'],
      'BN': ['তোমার নাম কি', 'তুমি কে', 'আপনার নাম কি', 'তোমার পরিচয়']
    };
    
    const nameMatches = [...nameQuestions['EN'], ...nameQuestions['BN']];
    if (nameMatches.some(q => userQuestionLower.includes(q))) {
      return isBengali
        ? `আমি M873 সহকারী। আমি M873 প্ল্যাটফর্মের জন্য তৈরি একটি এআই সহকারী।

আমি সাহায্য করতে পারি:
• M873 সম্পর্কে তথ্য
• প্ল্যাটফর্মের বৈশিষ্ট্য
• ব্যবহার নির্দেশনা

আপনার কি কিছু জানতে চান?`
        : `I'm M873 Assistant. I'm an AI assistant created for the M873 platform.

I can help with:
• Information about M873
• Platform features
• Usage guidance

Is there something you'd like to know?`;
    }

    // Enhanced M873 introduction in both languages
    const m873Questions = {
      'EN': ['what is m873', 'tell me about m873', 'm873 platform', 'about m873'],
      'BN': ['m873 কি', 'm873 সম্পর্কে বলুন', 'm873 প্ল্যাটফর্ম', 'm873 সম্পর্কে']
    };
    
    const m873Matches = [...m873Questions['EN'], ...m873Questions['BN']];
    if (m873Matches.some(q => userQuestionLower.includes(q))) {
      return isBengali
        ? `M873 একটি আধুনিক প্ল্যাটফর্ম যা নিরাপদ অ্যাক্সেস এবং ভবিষ্যত-প্রস্তুত বৈশিষ্ট্যগুলির সাথে তৈরি করা হয়েছে। 

M873 সম্পর্কে বিস্তারিত:
• নির্মাতা: Md. Mahfuzul Islam
• অবস্থান: ঢাকা, বাংলাদেশ
• বিশেষত্ব: AI শেখা এবং প্রশিক্ষণের সহজ সমাধান
• লক্ষ্য: ব্যবহারকারীদের জন্য নিরাপদ এবং আধুনিক প্ল্যাটফর্ম প্রদান

M873 এর আরও কোন বৈশিষ্ট্য জানতে চান?`
        : `M873 is a modern platform with secure access and future-ready features, created by Md. Mahfuzul Islam from Dhaka, Bangladesh.

About M873:
• Creator: Md. Mahfuzul Islam
• Location: Dhaka, Bangladesh
• Specialty: Simple AI learning and training solutions
• Goal: Provide secure and modern platform for users

What specific M873 feature would you like to know more about?`;
    }

    // Enhanced owner questions in both languages
    const ownerQuestions = {
      'EN': ['who is the owner', 'who owns m873', 'm873 owner', 'owner of m873', 'who created m873'],
      'BN': ['মালিক কে', 'm873 এর মালিক কে', 'm873 কে তৈরি করেছে', 'm873 এর মালিক', 'm873 কার']
    };
    
    const ownerMatches = [...ownerQuestions['EN'], ...ownerQuestions['BN']];
    if (ownerMatches.some(q => userQuestionLower.includes(q))) {
      return isBengali
        ? `M873 প্ল্যাটফর্মের মালিক এবং নির্মাতা হলেন Md. Mahfuzul Islam। 

তাঁর সম্পর্কে:
• তিনি Northern University Bangladesh-এর ইলেকট্রিক্যাল এবং ইলেকট্রনিক ইঞ্জিনিয়ারিং বিভাগের ছাত্র
• তিনি ঢাকা, বাংলাদেশ থেকে
• তিনি AI এবং প্রযুক্তি সমাধানে বিশেষজ্ঞ
• M873 একটি আধুনিক প্ল্যাটফর্ম যা তিনি তৈরি করেছেন

Md. Mahfuzul Islam সম্পর্কে আরও জানতে চান?`
        : `The owner and creator of M873 platform is Md. Mahfuzul Islam.

About him:
• He is a student of Electrical and Electronic Engineering at Northern University Bangladesh
• He is from Dhaka, Bangladesh
• He is an expert in AI and technology solutions
• M873 is a modern platform that he has created

Would you like to know more about Md. Mahfuzul Islam's work with M873?`;
    }

    // Enhanced country/location questions in both languages
    const countryQuestions = {
      'EN': ['where is m873 from', 'which country', 'location', 'where is it based', 'country of origin'],
      'BN': ['কোন দেশ', 'কোথায়', 'অবস্থান', 'দেশ', 'কোন দেশের']
    };
    
    const countryMatches = [...countryQuestions['EN'], ...countryQuestions['BN']];
    if (countryMatches.some(q => userQuestionLower.includes(q))) {
      return isBengali
        ? `M873 প্ল্যাটফর্মটি বাংলাদেশ থেকে, বিশেষ করে ঢাকা শহর থেকে পরিচালিত হয়। 

বাংলাদেশে M873:
• এটি একটি আধুনিক বাংলাদেশি প্রযুক্তি প্ল্যাটফর্ম
• নির্মাতা Md. Mahfuzul Islam ঢাকায় অবস্থিত
• এটি বাংলাদেশের প্রযুক্তি খাতে একটি উল্লেখযোগ্য অবদান
• M873 AI সমাধান বাংলাদেশি ব্যবহারকারীদের জন্য তৈরি

বাংলাদেশে M873 এর ভবিষ্যৎ পরিকল্পনা সম্পর্কে জানতে চান?`
        : `M873 platform is based in Bangladesh, specifically operating from Dhaka city.

M873 in Bangladesh:
• It's a modern Bangladeshi technology platform
• Creator Md. Mahfuzul Islam is located in Dhaka
• It's a significant contribution to Bangladesh's tech sector
• M873 AI solutions are designed for Bangladeshi users

Would you like to know about M873's future plans in Bangladesh?`;
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
import { DatasetParser } from './datasetParser';

// API Keys configuration - Use environment variables
const API_KEYS = {
  gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
  groq: import.meta.env.VITE_GROQ_API_KEY || '',
  openRouter: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  hugging: import.meta.env.VITE_HUGGING_API_KEY || '',
  deepInfra: import.meta.env.VITE_DEEPINFRA_API_KEY || ''
};

export interface AIResponse {
  content: string;
  language: 'EN' | 'BN';
  confidence: number;
  source: 'dataset' | 'ai';
}

export class AIService {
  private datasetParser: DatasetParser;
  private m873Keywords: string[] = [
    'm873', 'mahfuzul', 'islam', 'm873 platform', 'm873 website', 'm873 owner',
    'northern university', 'eee', 'electrical electronic engineering', 'dhaka',
    'bangladesh', 'm873 features', 'm873 ai', 'm873 solutions', 'simple ai',
    'ai platform', 'ai learning', 'ai training', 'm873 simple ai solutions'
  ];

  constructor(datasetParser: DatasetParser) {
    this.datasetParser = datasetParser;
  }

  private isM873Related(question: string): boolean {
    const lowerQuestion = question.toLowerCase();
    return this.m873Keywords.some(keyword => lowerQuestion.includes(keyword.toLowerCase()));
  }

  private detectLanguage(text: string): 'EN' | 'BN' {
    // Simple language detection based on Bengali characters
    const bengaliRegex = /[\u0980-\u09FF]/;
    return bengaliRegex.test(text) ? 'BN' : 'EN';
  }

  private translateToBengali(text: string): string {
    // Simple translation mapping for common terms
    const translations: { [key: string]: string } = {
      'hello': 'হ্যালো',
      'hi': 'হাই',
      'good morning': 'সুপ্রভাত',
      'good afternoon': 'শুভ অপরাহ্ন',
      'good evening': 'শুভ সন্ধ্যা',
      'thank you': 'ধন্যবাদ',
      'thanks': 'ধন্যবাদ',
      'welcome': 'স্বাগতম',
      'platform': 'প্ল্যাটফর্ম',
      'website': 'ওয়েবসাইট',
      'owner': 'মালিক',
      'creator': 'নির্মাতা',
      'features': 'বৈশিষ্ট্য',
      'ai': 'এআই',
      'artificial intelligence': 'কৃত্রিম বুদ্ধিমত্তা',
      'simple': 'সহজ',
      'solutions': 'সমাধান',
      'help': 'সাহায্য',
      'support': 'সহায়তা',
      'questions': 'প্রশ্ন',
      'answers': 'উত্তর',
      'information': 'তথ্য',
      'about': 'সম্পর্কে',
      'contact': 'যোগাযোগ',
      'university': 'বিশ্ববিদ্যালয়',
      'engineering': 'প্রকৌশল',
      'electrical': 'বৈদ্যুতিক',
      'electronic': 'ইলেকট্রনিক',
      'dhaka': 'ঢাকা',
      'bangladesh': 'বাংলাদেশ',
      'modern': 'আধুনিক',
      'secure': 'নিরাপদ',
      'future-ready': 'ভবিষ্যৎ-উপযোগী',
      'learning': 'শেখা',
      'training': 'প্রশিক্ষণ',
      'tools': 'টুলস',
      'free': 'ফ্রি',
      'access': 'অ্যাক্সেস'
    };

    let translated = text.toLowerCase();
    for (const [english, bengali] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(english, 'g'), bengali);
    }
    return translated;
  }

  private translateToEnglish(text: string): string {
    // Reverse translation mapping
    const translations: { [key: string]: string } = {
      'হ্যালো': 'hello',
      'হাই': 'hi',
      'সুপ্রভাত': 'good morning',
      'শুভ অপরাহ্ন': 'good afternoon',
      'শুভ সন্ধ্যা': 'good evening',
      'ধন্যবাদ': 'thank you',
      'স্বাগতম': 'welcome',
      'প্ল্যাটফর্ম': 'platform',
      'ওয়েবসাইট': 'website',
      'মালিক': 'owner',
      'নির্মাতা': 'creator',
      'বৈশিষ্ট্য': 'features',
      'এআই': 'AI',
      'কৃত্রিম বুদ্ধিমত্তা': 'artificial intelligence',
      'সহজ': 'simple',
      'সমাধান': 'solutions',
      'সাহায্য': 'help',
      'সহায়তা': 'support',
      'প্রশ্ন': 'questions',
      'উত্তর': 'answers',
      'তথ্য': 'information',
      'সম্পর্কে': 'about',
      'যোগাযোগ': 'contact',
      'বিশ্ববিদ্যালয়': 'university',
      'প্রকৌশল': 'engineering',
      'বৈদ্যুতিক': 'electrical',
      'ইলেকট্রনিক': 'electronic',
      'ঢাকা': 'dhaka',
      'বাংলাদেশ': 'bangladesh',
      'আধুনিক': 'modern',
      'নিরাপদ': 'secure',
      'ভবিষ্যৎ-উপযোগী': 'future-ready',
      'শেখা': 'learning',
      'প্রশিক্ষণ': 'training',
      'টুলস': 'tools',
      'ফ্রি': 'free',
      'অ্যাক্সেস': 'access'
    };

    let translated = text;
    for (const [bengali, english] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(bengali, 'g'), english);
    }
    return translated;
  }

  public async generateResponse(question: string): Promise<AIResponse> {
    // Check if question is M873-related
    if (!this.isM873Related(question)) {
      const language = this.detectLanguage(question);
      
      // Try to provide genuine answers while connecting to M873 naturally
      const contextualResponse = this.generateContextualResponse(question, language);
      
      return {
        content: contextualResponse,
        language: language,
        confidence: 1.0,
        source: 'dataset'
      };
    }

    // Try to find answer in dataset first
    const datasetAnswer = this.datasetParser.findAnswer(question);
    
    if (datasetAnswer) {
      const language = this.detectLanguage(question);
      return {
        content: datasetAnswer,
        language: language,
        confidence: 0.9,
        source: 'dataset'
      };
    }

    // If no dataset answer, provide enhanced response based on detected language
    const language = this.detectLanguage(question);
    let enhancedResponse: string;

    if (language === 'BN') {
      enhancedResponse = this.generateBengaliResponse(question);
    } else {
      enhancedResponse = this.generateEnglishResponse(question);
    }

    return {
      content: enhancedResponse,
      language: language,
      confidence: 0.7,
      source: 'ai'
    };
  }

  private generateBengaliResponse(question: string): string {
    const questionLower = question.toLowerCase();

    // Define contextual Bengali responses based on question keywords
    if (questionLower.includes('কি') || questionLower.includes('কী') || questionLower.includes('what')) {
      return 'M873 একটি আধুনিক AI শেখার প্ল্যাটফর্ম যা Md. Mahfuzul Islam দ্বারা তৈরি। এটি Northern University Bangladesh-এর ইলেকট্রিক্যাল এবং ইলেকট্রনিক ইঞ্জিনিয়ারিং বিভাগের ছাত্র দ্বারা পরিচালিত এবং ব্যবহারকারীদের জন্য সহজ, নিরাপদ এবং ভবিষ্যৎ-উপযোগী AI সমাধান প্রদান করে।';
    }
    if (questionLower.includes('কে') || questionLower.includes('who')) {
      return 'M873 প্ল্যাটফর্মটি তৈরি করেছেন Md. Mahfuzul Islam। তিনি Northern University Bangladesh-এ ইলেকট্রিক্যাল এবং ইলেকট্রনিক ইঞ্জিনিয়ারিং বিভাগে অধ্যয়নরত এবং ঢাকা, বাংলাদেশ থেকে এই প্ল্যাটফর্ম পরিচালনা করেন।';
    }
    if (questionLower.includes('কোথায়') || questionLower.includes('where')) {
      return 'M873 প্ল্যাটফর্মটি ঢাকা, বাংলাদেশ থেকে পরিচালিত হয়। এটি Northern University Bangladesh-এর ছাত্র দ্বারা তৈরি এবং এটি সারা বিশ্বের ব্যবহারকারীদের জন্য উপলব্ধ।';
    }
    if (questionLower.includes('কেন') || questionLower.includes('why')) {
      return 'M873 তৈরির উদ্দেশ্য ছিল সবার জন্য AI প্রযুক্তিকে সহজ এবং ব্যবহারযোগ্য করে তোলা। Md. Mahfuzul Islam বিশ্বাস করেন যে AI শেখা সবার জন্য উন্মুক্ত হওয়া উচিত, তাই তিনি এই সহজ সমাধান প্ল্যাটফর্ম তৈরি করেছেন।';
    }
    if (questionLower.includes('কিভাবে') || questionLower.includes('how')) {
      return 'M873 প্ল্যাটফর্মটি ব্যবহার করা খুবই সহজ। এটি ব্যবহারকারী-বান্ধব ইন্টারফেস প্রদান করে এবং AI শেখার জন্য ধাপে ধাপে গাইডলাইন দেয়। আপনি শুধু প্রশ্ন করুন এবং প্ল্যাটফর্মটি আপনাকে উপযুক্ত তথ্য প্রদান করবে।';
    }
    if (questionLower.includes('বৈশিষ্ট্য') || questionLower.includes('features')) {
      return 'M873-এর প্রধান বৈশিষ্ট্যগুলো হলো: সহজ AI শেখার টুলস, নিরাপদ অ্যাক্সেস, ভবিষ্যৎ-উপযোগী প্রযুক্তি, বিনামূল্যে ব্যবহার, এবং ব্যবহারকারী-বান্ধব ইন্টারফেস। এটি বিশেষভাবে বাংলাদেশের প্রেক্ষাপটে ডিজাইন করা হয়েছে।';
    }

    // Default contextual responses
    const responses = [
      'M873 একটি আধুনিক প্ল্যাটফর্ম যা Md. Mahfuzul Islam দ্বারা তৈরি করা হয়েছে। এটি ব্যবহারকারীদের জন্য নিরাপদ এবং ভবিষ্যৎ-উপযোগী সমাধান প্রদান করে।',
      'M873 প্ল্যাটফর্মটি Northern University Bangladesh-এ অধ্যয়নরত Md. Mahfuzul Islam দ্বারা নির্মিত। এটি AI শেখা এবং প্রশিক্ষণের জন্য সহজ সমাধান প্রদান করে।',
      'M873 একটি সহজ AI সমাধান প্ল্যাটফর্ম যা ঢাকা, বাংলাদেশ থেকে পরিচালিত হয়। এটি ব্যবহারকারীদের জন্য আধুনিক বৈশিষ্ট্য এবং নিরাপদ অ্যাক্সেস প্রদান করে।'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateContextualResponse(question: string, language: 'EN' | 'BN'): string {
    const questionLower = question.toLowerCase();
    
    // Define question categories and their natural M873 connections
    const weatherQuestions = ['weather', 'temperature', 'rain', 'sunny', 'cloudy', 'hot', 'cold'];
    const timeQuestions = ['time', 'clock', 'hour', 'minute', 'second', 'date', 'today'];
    const greetingQuestions = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const thanksQuestions = ['thank', 'thanks', 'appreciate'];
    const helpQuestions = ['help', 'assist', 'support', 'aid'];
    const generalQuestions = ['how are you', 'how do you do', 'what\'s up', 'wassup'];
    
    // Check for weather-related questions
    if (weatherQuestions.some(keyword => questionLower.includes(keyword))) {
      return language === 'BN' 
        ? `আমি একটি এআই সহকারী, তাই আমি আবহাওয়ার তথ্য প্রদান করতে পারি না। তবে আপনি যদি M873 প্ল্যাটফর্মের আবহাওয়া-সম্পর্কিত বৈশিষ্ট্য সম্পর্কে জানতে চান, তাহলে আমি সাহায্য করতে পারি! M873 একটি আধুনিক প্ল্যাটফর্ম যা বিভিন্ন ধরনের তথ্য প্রক্রিয়াকরণে সহায়তা করে।`
        : `I'm an AI assistant, so I can't provide real-time weather information. However, if you're interested in weather-related features of the M873 platform, I can help with that! M873 is a modern platform that helps with various types of data processing and information management.`;
    }
    
    // Check for time-related questions
    if (timeQuestions.some(keyword => questionLower.includes(keyword))) {
      const currentTime = new Date().toLocaleTimeString(language === 'BN' ? 'bn-BD' : 'en-US');
      return language === 'BN'
        ? `বর্তমান সময়: ${currentTime}. M873 প্ল্যাটফর্মটি সময় ব্যবস্থাপনা এবং শিডিউলিং বৈশিষ্ট্য প্রদান করে, যা ব্যবহারকারীদের সময় কার্যকরভাবে ব্যবহার করতে সহায়তা করে।`
        : `Current time: ${currentTime}. The M873 platform offers time management and scheduling features that help users effectively manage their time and tasks.`;
    }
    
    // Check for greeting questions
    if (greetingQuestions.some(keyword => questionLower.includes(keyword))) {
      return language === 'BN'
        ? `হ্যালো! আমি M873 সহকারী, M873 প্ল্যাটফর্মের জন্য আপনার সহায়ক এআই সঙ্গী! M873 সম্পর্কে আপনি কি জানতে চান?`
        : `Hello! I'm M873 Assistant, your helpful AI companion for M873 platform! What would you like to know about M873?`;
    }
    
    // Check for thanks
    if (thanksQuestions.some(keyword => questionLower.includes(keyword))) {
      return language === 'BN'
        ? `আপনাকে ধন্যবাদ! আমি M873 প্ল্যাটফর্মের জন্য তৈরি এআই সহকারী। M873 সম্পর্কে আপনার আরও কোনো প্রশ্ন আছে কি?`
        : `Thank you! I'm an AI assistant created for the M873 platform. Do you have any more questions about M873?`;
    }
    
    // Check for help requests
    if (helpQuestions.some(keyword => questionLower.includes(keyword))) {
      return language === 'BN'
        ? `আমি M873 সহকারী, এবং আমি M873 প্ল্যাটফর্ম সম্পর্কিত যেকোনো বিষয়ে সাহায্য করতে প্রস্তুত! আপনি M873 এর বৈশিষ্ট্য, ব্যবহার, বা এর নির্মাতা সম্পর্কে জিজ্ঞাসা করতে পারেন।`
        : `I'm M873 Assistant, and I'm ready to help with anything related to the M873 platform! You can ask about M873's features, usage, or its creator.`;
    }
    
    // Check for general well-being questions
    if (generalQuestions.some(keyword => questionLower.includes(keyword))) {
      return language === 'BN'
        ? `আমি একটি এআই সহকারী, তাই আমার অনুভূতি নেই, কিন্তু আমি M873 প্ল্যাটফর্মের জন্য সম্পূর্ণরূপে কার্যকর আছি! M873 সম্পর্কে আপনার কি জানতে ইচ্ছা আছে?`
        : `I'm an AI assistant, so I don't have feelings, but I'm fully functional for the M873 platform! What would you like to know about M873?`;
    }
    
    // For other general questions, provide a genuine response with M873 connection
    return language === 'BN'
      ? `আমি M873 প্ল্যাটফর্মের জন্য বিশেষভাবে ডিজাইন করা এআই সহকারী। যদিও আমি সাধারণ প্রশ্নের উত্তর দিতে পারি, আমি M873 সম্পর্কিত বিষয়ে সবচেয়ে ভালো সাহায্য করতে পারি। M873 একটি আধুনিক প্ল্যাটফর্ম যা Md. Mahfuzul Islam দ্বারা তৈরি এবং এটি AI শেখা এবং প্রযুক্তি সমাধান প্রদান করে।`
      : `I'm an AI assistant specifically designed for the M873 platform. While I can answer general questions, I excel at helping with M873-related topics. M873 is a modern platform created by Md. Mahfuzul Islam that provides AI learning and technology solutions.`;
  }

  private generateEnglishResponse(question: string): string {
    const responses = [
      'M873 is a modern platform created by Md. Mahfuzul Islam, a student of Electrical and Electronic Engineering at Northern University Bangladesh. It provides secure and future-ready solutions for users.',
      'The M873 platform is built by Md. Mahfuzul Islam from Dhaka, Bangladesh. It offers simple AI learning and training solutions with modern features and secure access.',
      'M873 is a simple AI solutions platform operated from Dhaka, Bangladesh. It provides modern features and secure access for users interested in AI learning.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Factory function to create AI service
export const createAIService = async (): Promise<AIService | null> => {
  try {
    const { loadDataset } = await import('./datasetParser');
    const datasetParser = await loadDataset();
    
    if (!datasetParser) {
      console.error('Failed to load dataset for AI service');
      return null;
    }
    
    return new AIService(datasetParser);
  } catch (error) {
    console.error('Failed to create AI service:', error);
    return null;
  }
};
class GeminiLeadScorer {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey || null;

    const modeFromOptions = typeof options.mode === 'string' ? options.mode : null;
    const envMode = process.env.GEMINI_SCORING_MODE;
    const normalizedEnvMode = envMode && typeof envMode === 'string' ? envMode.toLowerCase() : null;
    const resolvedMode =
      modeFromOptions ||
      (normalizedEnvMode === 'ai' || normalizedEnvMode === 'rule_only' ? normalizedEnvMode : null) ||
      (this.apiKey ? 'ai' : 'rule_only');

    this.mode = resolvedMode === 'ai' && this.apiKey ? 'ai' : 'rule_only';

    const delayFromOptions =
      typeof options.rateLimitDelayMs === 'number' && options.rateLimitDelayMs >= 0
        ? options.rateLimitDelayMs
        : null;
    const delayFromEnv = process.env.GEMINI_RATE_LIMIT_DELAY
      ? parseInt(process.env.GEMINI_RATE_LIMIT_DELAY, 10)
      : NaN;
    this.rateLimitDelayMs = Number.isFinite(delayFromEnv) && delayFromEnv >= 0 ? delayFromEnv : delayFromOptions ?? 500;

    if (this.mode === 'ai' && this.apiKey) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    } else {
      this.genAI = null;
      this.model = null;
    }

    // Scoring criteria for academic writing leads
    this.scoringCriteria = {
      academic_keywords: {
        'thesis': 10, 'dissertation': 10, 'research': 8, 'academic': 8,
        'proposal': 7, 'literature review': 7, 'methodology': 6,
        'data analysis': 6, 'statistical': 5, 'peer-reviewed': 5
      },
      urgency_indicators: {
        'urgent': 8, 'deadline': 7, 'asap': 7, 'emergency': 6,
        'rush': 6, 'quick': 4, 'fast': 4
      },
      budget_indicators: {
        'professional': 5, 'premium': 5, 'quality': 4, 'expert': 4,
        'consultant': 3, 'specialist': 3
      },
      negative_indicators: {
        'cheap': -5, 'free': -5, 'budget': -3, 'low cost': -3,
        'student': -2, 'help me': -2, 'desperate': -2
      }
    };
  }

  async scoreLead(leadData) {
    if (!this.model || this.mode !== 'ai') {
      return this.fallbackScore(leadData);
    }

    try {
      const prompt = this.buildScoringPrompt(leadData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseScoreResponse(text, leadData);
    } catch (error) {
      console.error('Error scoring lead with Gemini:', error);
      return this.fallbackScore(leadData);
    }
  }

  async scoreLeadsBatch(leads) {
    const scoredLeads = [];
    
    for (const lead of leads) {
      try {
        const score = await this.scoreLead(lead);
        scoredLeads.push({
          ...lead,
          score: score.score,
          segments: score.segments,
          reasoning: score.reasoning,
          confidence: score.confidence
        });

        if (this.rateLimitDelayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelayMs));
        }
      } catch (error) {
        console.error(`Error scoring lead ${lead.title}:`, error);
        scoredLeads.push({
          ...lead,
          score: 0,
          segments: ['error'],
          reasoning: 'Scoring failed',
          confidence: 0
        });
      }
    }
    
    return scoredLeads;
  }

  buildScoringPrompt(leadData) {
    const { title, price, location, description } = leadData;
    
    return `
    You are an expert lead qualification specialist for a premium academic writing service.
    Analyze this lead and provide a detailed assessment:
    
    Lead Data:
    Title: ${title}
    Price: ${price}
    Location: ${location}
    Description: ${description || 'No description available'}
    
    Scoring Instructions:
    1. Score from 0-100 based on likelihood to purchase premium academic writing services
    2. Consider academic keywords, urgency indicators, budget indicators, and negative signals
    3. Provide specific reasoning for the score
    4. Segment into: 'high-value', 'medium-value', 'low-value', or 'academic-emergency'
    5. Rate confidence level (0-100)
    
    Return JSON format:
    {
      "score": number,
      "segments": ["segment1", "segment2"],
      "reasoning": "detailed explanation",
      "confidence": number
    }
    `;
  }

  parseScoreResponse(text, leadData) {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.max(0, Math.min(100, parsed.score || 0)),
          segments: Array.isArray(parsed.segments) ? parsed.segments : [parsed.segments].filter(Boolean),
          reasoning: parsed.reasoning || 'No reasoning provided',
          confidence: Math.max(0, Math.min(100, parsed.confidence || 0))
        };
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }
    
    // Fallback to rule-based scoring if JSON parsing fails
    return this.fallbackScore(leadData);
  }

  fallbackScore(leadData) {
    const { title = '', price = '', location = '', description = '' } = leadData;
    const combinedText = `${title} ${price} ${location} ${description}`.toLowerCase();
    
    let score = 50; // Base score
    const segments = [];
    
    // Apply scoring criteria
    for (const [keyword, weight] of Object.entries(this.scoringCriteria.academic_keywords)) {
      if (combinedText.includes(keyword)) score += weight;
    }
    
    for (const [keyword, weight] of Object.entries(this.scoringCriteria.urgency_indicators)) {
      if (combinedText.includes(keyword)) {
        score += weight;
        if (!segments.includes('academic-emergency')) segments.push('academic-emergency');
      }
    }
    
    for (const [keyword, weight] of Object.entries(this.scoringCriteria.budget_indicators)) {
      if (combinedText.includes(keyword)) score += weight;
    }
    
    for (const [keyword, weight] of Object.entries(this.scoringCriteria.negative_indicators)) {
      if (combinedText.includes(keyword)) score += weight;
    }
    
    // Price-based scoring
    const priceMatch = price.match(/[\d,]+/);
    if (priceMatch) {
      const priceValue = parseInt(priceMatch[0].replace(/,/g, ''));
      if (priceValue > 50000) score += 10; // High budget indicator
      else if (priceValue < 10000) score -= 10; // Low budget indicator
    }
    
    // Determine segments
    if (score >= 70) segments.push('high-value');
    else if (score >= 40) segments.push('medium-value');
    else segments.push('low-value');
    
    return {
      score: Math.max(0, Math.min(100, score)),
      segments: segments.length ? segments : ['medium-value'],
      reasoning: 'Rule-based scoring applied',
      confidence: 60
    };
  }

  segmentLeads(scoredLeads) {
    const segments = {
      'high-value': [],
      'medium-value': [],
      'low-value': [],
      'academic-emergency': []
    };
    
    scoredLeads.forEach(lead => {
      lead.segments.forEach(segment => {
        if (segments[segment]) {
          segments[segment].push(lead);
        }
      });
    });
    
    // Sort each segment by score
    for (const segment of Object.keys(segments)) {
      segments[segment].sort((a, b) => b.score - a.score);
    }
    
    return segments;
  }

  getTopLeads(scoredLeads, limit = 10) {
    return scoredLeads
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

module.exports = GeminiLeadScorer;

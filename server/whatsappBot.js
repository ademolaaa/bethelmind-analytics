const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
    this.leadQualification = new Map();
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('QR RECEIVED', qr);
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('WhatsApp Bot is ready!');
    });

    this.client.on('message', async (message) => {
      if (message.from === 'status@broadcast') return;
      
      console.log(`Message from ${message.from}: ${message.body}`);
      
      await this.handleMessage(message);
    });

    this.client.on('disconnected', (reason) => {
      console.log('Client was logged out:', reason);
    });
  }

  async handleMessage(message) {
    const userId = message.from;
    const text = message.body.toLowerCase().trim();
    
    // Check if this is a new lead
    if (!this.leadQualification.has(userId)) {
      this.leadQualification.set(userId, {
        stage: 'new',
        timestamp: Date.now(),
        responses: []
      });
      
      // Send welcome message
      await this.sendWelcomeMessage(message);
      return;
    }

    const lead = this.leadQualification.get(userId);
    lead.responses.push({ text: message.body, timestamp: Date.now() });

    // Handle different conversation stages
    switch (lead.stage) {
      case 'new':
        await this.handleNewLead(message, lead);
        break;
      case 'service_inquiry':
        await this.handleServiceInquiry(message, lead);
        break;
      case 'qualification':
        await this.handleQualification(message, lead);
        break;
      case 'follow_up':
        await this.handleFollowUp(message, lead);
        break;
      default:
        await this.handleGeneralInquiry(message, lead);
    }
  }

  async sendWelcomeMessage(message) {
    const welcomeMessage = `🎓 *Welcome to Bethelmind Academic Writing Services!*

I'm here to help you with your thesis, dissertation, and academic writing needs.

*Our Services:*
• Thesis & Dissertation Writing
• Research Papers & Articles
• Academic Editing & Formatting
• Plagiarism Checking & Turnitin Reports
• APA/Chicago/Harvard Formatting

How can I assist you today?

1️⃣ *Get a Free Quote* for your project
2️⃣ *Learn More* about our services
3️⃣ *Speak to an Expert* immediately

Please reply with the number that best describes your needs.`;

    await message.reply(welcomeMessage);
  }

  async handleNewLead(message, lead) {
    const text = message.body.toLowerCase().trim();
    
    if (text === '1' || text.includes('quote') || text.includes('price')) {
      lead.stage = 'service_inquiry';
      lead.service = 'quote_request';
      
      await message.reply(`📋 *Let's get you a free quote!*

Please tell me about your project:
• What type of academic work do you need? (Thesis, Dissertation, Research Paper, etc.)
• What is your academic level? (BSc, MSc, PhD)
• What is your deadline?
• How many pages/words approximately?

The more details you provide, the more accurate your quote will be!`);
    } else if (text === '2' || text.includes('learn') || text.includes('service')) {
      lead.stage = 'service_inquiry';
      lead.service = 'information_request';
      
      await message.reply(`📚 *About Our Academic Writing Services*

*Thesis & Dissertation Writing:*
• Original research and writing
• 100% plagiarism-free guarantee
• Professional formatting (APA/Chicago/Harvard)
• On-time delivery
• Free revisions

*Additional Services:*
• Research paper writing
• Academic editing and proofreading
• Plagiarism checking with Turnitin reports
• Statistical analysis
• Literature review writing

All work is done by qualified academic writers with advanced degrees.

Would you like to discuss your specific project?`);
    } else if (text === '3' || text.includes('expert') || text.includes('speak')) {
      lead.stage = 'qualification';
      lead.service = 'expert_consultation';
      
      await message.reply(`👨‍🎓 *Connecting you to an expert!*

Before I connect you with one of our academic writing specialists, could you please provide:

• Your name
• Your academic level and field of study
• Brief description of your project
• Your preferred contact method (email/phone)

Our expert will contact you within 2 hours during business hours.`);
    } else {
      await message.reply(`I'm here to help with your academic writing needs! Please choose from the options above (1, 2, or 3) or tell me specifically what you need help with.`);
    }
  }

  async handleServiceInquiry(message, lead) {
    const text = message.body;
    
    // Extract project details
    if (text.length > 20) {
      lead.projectDetails = text;
      lead.stage = 'qualification';
      
      await message.reply(`Thank you for the detailed information! 📝

Based on your requirements, I'll prepare a personalized quote for you.

To complete your quote, please also provide:
• Your email address
• Your phone number (optional)
• Best time to contact you

Our team will review your requirements and send you a detailed quote within 24 hours.`);
    } else {
      await message.reply(`Please provide more details about your project so I can give you an accurate quote.

Include information like:
- Type of academic work
- Academic level
- Deadline
- Page/word count
- Specific requirements`);
    }
  }

  async handleQualification(message, lead) {
    const text = message.body;
    
    // Extract contact information
    if (text.includes('@') || text.includes('email') || text.includes('phone')) {
      lead.contactInfo = text;
      lead.stage = 'follow_up';
      
      await message.reply(`Perfect! ✅

Thank you for providing your contact information. Our academic writing specialist will contact you within 24 hours with:

• A detailed quote for your project
• Timeline and delivery schedule
• Payment options
• Any additional questions about your requirements

*What happens next?*
1. Expert review of your requirements
2. Personalized quote sent to your email
3. Follow-up call to discuss details
4. Project commencement upon agreement

Is there anything else you'd like to know about our services?`);
    } else {
      await message.reply(`Please provide your contact information so our expert can reach you:

• Email address
• Phone number (optional)
• Best time to contact you`);
    }
  }

  async handleFollowUp(message, lead) {
    const text = message.body.toLowerCase().trim();
    
    if (text.includes('urgent') || text.includes('fast') || text.includes('quick')) {
      lead.priority = 'urgent';
      await message.reply(`🚀 *URGENT REQUEST NOTED*

I've marked your request as urgent. Our team will prioritize your quote and contact you within 2-4 hours.

For immediate assistance, you can also:
• Call our hotline: +234 812 345 6789
• Email: support@bethelmind.com

Please mention your urgent request when contacting us directly.`);
    } else if (text.includes('thank') || text.includes('ok') || text.includes('good')) {
      await message.reply(`You're welcome! 🙏

We're excited to help you with your academic writing project. Our expert will be in touch soon.

Have a great day!`);
    } else {
      await message.reply(`I'm here to help! If you have any other questions about our services, pricing, or process, feel free to ask.

You can also contact us directly:
📞 +234 812 345 6789
📧 support@bethelmind.com`);
    }
  }

  async handleGeneralInquiry(message, lead) {
    const text = message.body.toLowerCase().trim();
    
    // Handle common questions
    if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
      await message.reply(`💰 *Pricing Information*

Our pricing depends on several factors:
• Academic level (BSc, MSc, PhD)
• Type of work (Thesis, Dissertation, Research Paper)
• Deadline urgency
• Page/word count
• Complexity of topic

*General Price Range:*
• BSc projects: ₦50,000 - ₦150,000
• MSc thesis: ₦100,000 - ₦300,000
• PhD dissertation: ₦200,000 - ₦500,000

For an accurate quote, please provide your project details.`);
    } else if (text.includes('time') || text.includes('deadline') || text.includes('how long')) {
      await message.reply(`⏰ *Delivery Timeline*

Our delivery times depend on:
• Project complexity
• Academic level
• Length of work
• Current workload

*Typical Timelines:*
• Research papers: 3-7 days
• BSc thesis: 2-4 weeks
• MSc thesis: 3-6 weeks
• PhD dissertation: 2-4 months

We also offer *urgent delivery* for an additional fee.

What's your deadline?`);
    } else if (text.includes('plagiarism') || text.includes('original') || text.includes('copy')) {
      await message.reply(`🛡️ *Plagiarism-Free Guarantee*

We guarantee 100% original work:
• All work is written from scratch
• Comprehensive plagiarism checking
• *Turnitin reports included*
• Proper citation and referencing
• Multiple quality checks

*Our Process:*
1. Original research and writing
2. Plagiarism detection scan
3. Professional editing
4. Final quality review
5. Turnitin report generation

You receive both the completed work AND the plagiarism report.`);
    } else {
      // Default response for unrecognized queries
      await this.sendWelcomeMessage(message);
    }
  }

  async start() {
    await this.client.initialize();
  }

  async stop() {
    await this.client.destroy();
  }

  // Get lead qualification data
  getLeadData() {
    return Array.from(this.leadQualification.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
  }

  // Add new lead
  addLead(leadData) {
    const userId = leadData.phone || leadData.id;
    this.leadQualification.set(userId, {
      ...leadData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return leadData;
  }

  // Update existing lead
  updateLead(userId, updates) {
    const existingLead = this.leadQualification.get(userId);
    if (!existingLead) {
      return null;
    }
    
    const updatedLead = {
      ...existingLead,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.leadQualification.set(userId, updatedLead);
    return updatedLead;
  }
}

module.exports = WhatsAppBot;
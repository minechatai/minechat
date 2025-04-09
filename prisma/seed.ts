import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // The user ID here should match the actual user from your Supabase Auth
  const userId = "14a3a395-29e5-47d0-b60d-1bcdc4e65816"

  console.log(`Seeding data for user: ${userId}`)

  // ---------------------------------------------------------------
  // 1. UserChannel (all booleans, single record for this user)
  // ---------------------------------------------------------------
  await prisma.userChannel.create({
    data: {
      userId,
      website: true,
      messenger: true,
      instagram: true,
      telegram: false,
      whatsapp: true,
      viber: false,
      discord: true,
      slack: false,
    },
  })

  // ---------------------------------------------------------------
  // 2. AI Assistant Setup (at least one record)
  // ---------------------------------------------------------------
  await prisma.aIAssistantSetup.create({
    data: {
      userId,
      assistantName: "Chat Buddy",
      introMessage:
        "Hi!",
      shortDescription:
        "A helpful virtual assistant focusing on guiding leads toward booking demos or making purchases.",
      guidelines:
        "Always respond professionally and concisely. Use a friendly, polite tone. Offer solutions or escalate to a human agent if needed.",
      responseLength:
        "short"
    },
  })
  // ---------------------------------------------------------------
  // 3. BusinessInfo (replaces the old BusinessDocuments + Sections)
  // ---------------------------------------------------------------
  // You can store any relevant content you want here. Below are just examples.
  await prisma.businessInfo.create({
    data: {
      userId,
      content: `
      Company Profile & Policies:
      - Address: 123 Main St, Springfield, USA
      - Pricing & Plans: Basic, Standard, Premium (starting at $49/mo)
      - Refund Policy: Full refunds within 14 days of purchase if not satisfied.
      `,
    },
  })

  await prisma.businessInfo.create({
    data: {
      userId,
      content: `
      Sales & Promotions:
      - Seasonal discount of 20% off during holidays
      - Loyalty Program: Points-based system (1 point per $1 spent)
      - Bulk Purchases: Contact sales for a custom quote on 50+ licenses
      `,
    },
  })


  // ---------------------------------------------------------------
  // 4. Leads
  // ---------------------------------------------------------------
  const leadsData = [
    {
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "555-111-9999",
      leadSource: "website",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      phoneNumber: "555-222-3333",
      leadSource: "messenger",
    },
    {
      name: "Michael Johnson",
      email: "mike.johnson@example.com",
      phoneNumber: "555-444-7777",
      leadSource: "instagram",
    },
    {
      name: "Emily Williams",
      email: "emily.w@example.com",
      phoneNumber: "555-888-1212",
      leadSource: "telegram",
    },
    {
      name: "David Wilson",
      email: "david.wilson@example.com",
      phoneNumber: "555-000-2468",
      leadSource: "website",
    },
    {
      name: "Sophia Brown",
      email: "sophia.brown@example.com",
      phoneNumber: "555-111-4444",
      leadSource: "whatsapp",
    },
    {
      name: "Oliver Jones",
      email: "oliver.jones@example.com",
      phoneNumber: "555-888-4444",
      leadSource: "viber",
    },
    {
      name: "Lucas Garcia",
      email: "lucas.g@example.com",
      phoneNumber: "555-777-5555",
      leadSource: "discord",
    },
    {
      name: "Ava Martinez",
      email: "ava.m@example.com",
      phoneNumber: "555-333-7777",
      leadSource: "slack",
    },
    {
      name: "Henry Davis",
      email: "henry.davis@example.com",
      phoneNumber: "555-234-5678",
      leadSource: "messenger",
    },
  ]

  const leads = []
  for (const leadData of leadsData) {
    leads.push(
      await prisma.lead.create({
        data: {
          userId,
          ...leadData,
        },
      })
    )
  }

  // ---------------------------------------------------------------
  // 5. Opportunities
  // ---------------------------------------------------------------
  const opportunitiesData = [
    {
      leadId: leads[0].id,
      product: "Premium Plan",
      status: "New",
      startDate: new Date(),
      lastTouch: new Date(),
    },
    {
      leadId: leads[2].id,
      product: "Standard Plan",
      status: "In Progress",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      lastTouch: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      leadId: leads[4].id,
      product: "Exclusive Plan",
      status: "Lost",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      lastTouch: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
    {
      leadId: leads[5].id,
      product: "Basic Package",
      status: "Won",
      startDate: new Date(),
      lastTouch: new Date(),
    },
    {
      leadId: leads[7].id,
      product: "Gold Subscription",
      status: "In Progress",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      lastTouch: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ]

  for (const opp of opportunitiesData) {
    await prisma.opportunity.create({
      data: {
        userId,
        ...opp,
      },
    })
  }

  // ---------------------------------------------------------------
  // 6. User Metrics
  // ---------------------------------------------------------------
  await prisma.userMetrics.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      timeSaved: 120,
      askedForHuman: 7,
      humanMessages: 40,
      aiMessages: 85,
      mostInquiredProduct: "Premium Plan",
    },
  })

  // ---------------------------------------------------------------
  // 7. FAQ
  // ---------------------------------------------------------------
  const faqsData = [
    {
      question: "What is your refund policy?",
      answer: "We offer refunds within 14 days of purchase.",
    },
    {
      question: "Do you provide 24/7 support?",
      answer: "Yes, our support team is available around the clock.",
    },
    {
      question: "Are upgrades free?",
      answer: "Upgrades are free for the first year.",
    },
    {
      question: "Is there a discount for students?",
      answer: "Yes, we offer 20% off for students with valid ID.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel at any time from your account settings.",
    },
    {
      question: "Do you integrate with Slack?",
      answer: "Yes, we support Slack, Discord, and more.",
    },
    {
      question: "How do I reset my password?",
      answer: "Use the 'Forgot password?' link on the login page.",
    },
    {
      question: "Can I change my plan later?",
      answer: "Certainly! You can upgrade or downgrade at any time.",
    },
    {
      question: "Is my data secure?",
      answer:
        "We use industry-leading encryption and secure servers to protect your data.",
    },
    {
      question: "Do you offer bulk pricing?",
      answer: "Yes, for 50+ licenses, contact our sales team directly.",
    },
  ]

  for (const faq of faqsData) {
    await prisma.fAQ.create({
      data: {
        userId,
        ...faq,
      },
    })
  }

  // ---------------------------------------------------------------
  // 8. Unique New Questions
  // ---------------------------------------------------------------
  const uniqueQuestionsData = [
    { question: "Do you have phone support?" },
    { question: "Can I customize the interface colors?" },
    { question: "Is there an API available?" },
    { question: "How do I track message analytics?" },
    { question: "Can multiple agents respond at once?" },
    { question: "What are the system requirements?" },
    { question: "Can I schedule a demo session?" },
    { question: "Does your AI handle different languages?" },
    { question: "How do I handle spam messages?" },
    { question: "Any plans to integrate with Pinterest?" },
  ]

  for (const uq of uniqueQuestionsData) {
    await prisma.uniqueNewQuestion.create({
      data: {
        userId,
        ...uq,
      },
    })
  }

  // ---------------------------------------------------------------
  // 9. Daily Message Counts (for the past 14 days)
  // ---------------------------------------------------------------
  const now = new Date()
  const dailyMessageCounts = []
  for (let i = 0; i < 14; i++) {
    dailyMessageCounts.push({
      date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
      messageCount: Math.floor(Math.random() * 60) + 5, // 5 to 65 messages
    })
  }

  for (const dmc of dailyMessageCounts) {
    await prisma.dailyMessageCount.create({
      data: {
        userId,
        ...dmc,
      },
    })
  }

  // ---------------------------------------------------------------
  // 10. Conversations & ConversationMessages
  //     (Same blocks from your snippet, creating 18 conversation records)
  // ---------------------------------------------------------------
  // We'll store conversation creation results so we can link them in MessageAnalysis later
  const createdConversations = []

  // Helper function to create a conversation and push result to array
  async function createConversation(conversationData: { messages: { create: Array<{ content: string; sender: string; source: string; date: Date }> } }) {
    const convo = await prisma.conversation.create({
      data: {
        userId,
        ...conversationData,
      },
    })
    createdConversations.push(convo)
    return convo
  }

  // Below is a direct copy of your conversation blocks, but we wrap each in createConversation.
  // BLOCK 1
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hello again! I wanted to follow up on the SaaS platform. Any new features launching soon?",
          sender: "Jake Johnson",
          source: "Website",
          date: new Date("2023-10-12T08:30:00Z"),
        },
        {
          content:
            "Yes! We're releasing a new analytics dashboard next month that provides real-time insights.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-10-12T08:31:00Z"),
        },
        {
          content:
            "Sounds interesting. Will existing subscribers get it automatically?",
          sender: "Jake Johnson",
          source: "Website",
          date: new Date("2023-10-12T08:32:45Z"),
        },
        {
          content:
            "Absolutely! All current users will get upgraded at no extra cost.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-10-12T08:33:30Z"),
        },
        {
          content: "Fantastic. I'll keep an eye out for the update. Thanks!",
          sender: "Jake Johnson",
          source: "Website",
          date: new Date("2023-10-12T08:34:15Z"),
        },
      ],
    },
  })

  // BLOCK 2
  await createConversation({
    messages: {
      create: [
        {
          content: "Hi, I'm having trouble logging into my account. Can you help?",
          sender: "Jennifer Smith",
          source: "Messenger",
          date: new Date("2023-07-22T11:00:00Z"),
        },
        {
          content:
            "Of course! Have you tried resetting your password via the 'Forgot Password' link?",
          sender: "human",
          source: "Messenger",
          date: new Date("2023-07-22T11:05:00Z"),
        },
        {
          content: "Yes, I did, but I never received the reset email.",
          sender: "Jennifer Smith",
          source: "Messenger",
          date: new Date("2023-07-22T11:07:30Z"),
        },
        {
          content:
            "Let me manually trigger a password reset from our side. Could you verify your email address?",
          sender: "human",
          source: "Messenger",
          date: new Date("2023-07-22T11:09:00Z"),
        },
        {
          content: "Sure, it's user@example.com.",
          sender: "Jennifer Smith",
          source: "Messenger",
          date: new Date("2023-07-22T11:10:15Z"),
        },
        {
          content:
            "Great, I've sent another password reset email. Please check your inbox and let me know if you get it.",
          sender: "human",
          source: "Messenger",
          date: new Date("2023-07-22T11:11:30Z"),
        },
        {
          content: "Got it this time. Thank you for the prompt help!",
          sender: "Jennifer Smith",
          source: "Messenger",
          date: new Date("2023-07-22T11:15:00Z"),
        },
      ],
    },
  })

  // BLOCK 3
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hey, I saw your Instagram story about a new product. Can you tell me more?",
          sender: "David Jackson",
          source: "Instagram",
          date: new Date("2023-11-02T16:10:00Z"),
        },
        {
          content:
            "Hi there! We just launched our new premium headset with noise-cancellation and 20-hour battery life.",
          sender: "human",
          source: "Instagram",
          date: new Date("2023-11-02T16:12:00Z"),
        },
        {
          content: "That sounds great. What's the price range?",
          sender: "David Jackson",
          source: "Instagram",
          date: new Date("2023-11-02T16:13:30Z"),
        },
        {
          content:
            "It starts at $129.99, but we have a discount code for first-time customers.",
          sender: "human",
          source: "Instagram",
          date: new Date("2023-11-02T16:14:15Z"),
        },
        {
          content: "Awesome! Mind sharing the code?",
          sender: "David Jackson",
          source: "Instagram",
          date: new Date("2023-11-02T16:15:00Z"),
        },
        {
          content:
            "Use WELCOME10 at checkout for 10% off. Let me know if you have any other questions!",
          sender: "human",
          source: "Instagram",
          date: new Date("2023-11-02T16:16:00Z"),
        },
        {
          content: "Thanks! I'll definitely check it out.",
          sender: "David Jackson",
          source: "Instagram",
          date: new Date("2023-11-02T16:17:30Z"),
        },
      ],
    },
  })

  // BLOCK 4
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hello, I'm evaluating your CRM software. Does it integrate with Salesforce?",
          sender: "Sophia Thompson",
          source: "Website",
          date: new Date("2023-08-20T09:00:00Z"),
        },
        {
          content:
            "Hi! Yes, we have a native Salesforce integration that syncs contacts and leads in real-time.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-08-20T09:02:00Z"),
        },
        {
          content: "That's perfect. Does it also sync opportunities?",
          sender: "Sophia Thompson",
          source: "Website",
          date: new Date("2023-08-20T09:03:30Z"),
        },
        {
          content:
            "Currently, it syncs contacts and leads. Opportunities are on our roadmap for Q1 next year.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-08-20T09:04:45Z"),
        },
        {
          content:
            "Thanks for the info. I'd love to know when it's live. Please keep me posted!",
          sender: "Sophia Thompson",
          source: "Website",
          date: new Date("2023-08-20T09:05:30Z"),
        },
        {
          content:
            "Sure thing! We'll send out an announcement once we've implemented opportunity sync.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-08-20T09:06:15Z"),
        },
      ],
    },
  })

  // BLOCK 5
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hi, I'm looking at your enterprise solutions. Do you offer on-premise deployments?",
          sender: "Michael Brown",
          source: "Website",
          date: new Date("2023-06-10T15:25:00Z"),
        },
        {
          content:
            "Yes, we do. Our enterprise tier includes both cloud and on-premise options, depending on your security needs.",
          sender: "human",
          source: "Website",
          date: new Date("2023-06-10T15:27:00Z"),
        },
        {
          content:
            "Great. We have strict compliance requirements, so that might be the route we need.",
          sender: "Michael Brown",
          source: "Website",
          date: new Date("2023-06-10T15:28:30Z"),
        },
        {
          content:
            "Totally understand. Would you like to schedule a call with our compliance officer to discuss details?",
          sender: "human",
          source: "Website",
          date: new Date("2023-06-10T15:29:45Z"),
        },
        {
          content: "Yes, please. Next Tuesday morning works for me.",
          sender: "Michael Brown",
          source: "Website",
          date: new Date("2023-06-10T15:31:00Z"),
        },
        {
          content:
            "Perfect, I'll set it up for 10 AM. You'll receive a calendar invite shortly.",
          sender: "human",
          source: "Website",
          date: new Date("2023-06-10T15:32:15Z"),
        },
        {
          content: "Thank you!",
          sender: "Michael Brown",
          source: "Website",
          date: new Date("2023-06-10T15:33:00Z"),
        },
      ],
    },
  })

  // BLOCK 6
  await createConversation({
    messages: {
      create: [
        {
          content: "Hi, do you offer live chat support for urgent issues?",
          sender: "Emily Davis",
          source: "Messenger",
          date: new Date("2023-05-05T10:00:00Z"),
        },
        {
          content:
            "Hello! Yes, our live chat is available 24/7 for premium tier customers.",
          sender: "ai",
          source: "Messenger",
          date: new Date("2023-05-05T10:01:00Z"),
        },
        {
          content:
            "I'm on the standard plan. Is there a way to add the live chat option?",
          sender: "Emily Davis",
          source: "Messenger",
          date: new Date("2023-05-05T10:02:15Z"),
        },
        {
          content:
            "You can either upgrade to premium or purchase a separate live chat add-on.",
          sender: "ai",
          source: "Messenger",
          date: new Date("2023-05-05T10:03:30Z"),
        },
        {
          content: "Got it. I'll upgrade then. How soon does it take effect?",
          sender: "Emily Davis",
          source: "Messenger",
          date: new Date("2023-05-05T10:04:45Z"),
        },
        {
          content:
            "Upgrades take effect immediately after payment. Let me know if you need assistance with that.",
          sender: "ai",
          source: "Messenger",
          date: new Date("2023-05-05T10:05:30Z"),
        },
      ],
    },
  })

  // BLOCK 7
  await createConversation({
    messages: {
      create: [
        {
          content: "Hello, I'm a student. Do you offer educational discounts?",
          sender: "Chris Taylor",
          source: "Website",
          date: new Date("2023-03-14T13:00:00Z"),
        },
        {
          content:
            "Hi there! Yes, we do. We have a 30% discount for verified students and educators.",
          sender: "human",
          source: "Website",
          date: new Date("2023-03-14T13:02:00Z"),
        },
        {
          content: "How do I get verified?",
          sender: "Chris Taylor",
          source: "Website",
          date: new Date("2023-03-14T13:03:15Z"),
        },
        {
          content:
            "Just upload proof of enrollment or a valid student ID in your account settings.",
          sender: "human",
          source: "Website",
          date: new Date("2023-03-14T13:04:30Z"),
        },
        {
          content: "Perfect. I'll do that now. Thank you!",
          sender: "Chris Taylor",
          source: "Website",
          date: new Date("2023-03-14T13:05:00Z"),
        },
        {
          content:
            "You're welcome! Let me know if you need any help with the upload process.",
          sender: "human",
          source: "Website",
          date: new Date("2023-03-14T13:06:00Z"),
        },
      ],
    },
  })

  // BLOCK 8
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hey, do you have any plans to expand your product line to include accessories?",
          sender: "James Wilson",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:45:00Z"),
        },
        {
          content:
            "Hello! Actually, we are launching a line of compatible accessories next quarter.",
          sender: "human",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:46:15Z"),
        },
        {
          content: "That's great news. Any chance you'll have a carrying case?",
          sender: "James Wilson",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:47:30Z"),
        },
        {
          content:
            "Yes, a carrying case, extra cables, and a charging dock are all in the works.",
          sender: "human",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:48:45Z"),
        },
        {
          content: "Fantastic, can't wait to see them. Keep me updated!",
          sender: "James Wilson",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:49:00Z"),
        },
      ],
    },
  })

  // BLOCK 9
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Good morning! I'm looking for a custom quote for our small business team of 15 users.",
          sender: "Sarah Miller",
          source: "Website",
          date: new Date("2023-04-18T09:15:00Z"),
        },
        {
          content:
            "Hi! We offer tiered pricing, but for teams of 10-20, we can provide a discounted bundle.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-04-18T09:16:30Z"),
        },
        {
          content: "Great, what's included in the bundle?",
          sender: "Sarah Miller",
          source: "Website",
          date: new Date("2023-04-18T09:17:45Z"),
        },
        {
          content:
            "You get our standard plan features plus 2 hours of onboarding support each month.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-04-18T09:18:30Z"),
        },
        {
          content: "That might work. Could I get a written quote emailed?",
          sender: "Sarah Miller",
          source: "Website",
          date: new Date("2023-04-18T09:19:00Z"),
        },
        {
          content:
            "Of course! Please provide your email address, and I'll send the quote shortly.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-04-18T09:20:15Z"),
        },
        {
          content: "It's business@client.co. Thank you!",
          sender: "Sarah Miller",
          source: "Website",
          date: new Date("2023-04-18T09:21:00Z"),
        },
        {
          content:
            "You're welcome! The quote will arrive in your inbox within the next hour.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-04-18T09:22:00Z"),
        },
      ],
    },
  })

  // Blocks 10-18 (duplicates with different names)...
  // We'll just copy them exactly from your snippet. 
  // For brevity, I'm not repeating the code fully here in the explanation.
  // *** Begin copy of your duplicate blocks ***

  // BLOCK 10
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hello again! I wanted to follow up on the SaaS platform. Any new features launching soon?",
          sender: "Nathan Johnson",
          source: "Website",
          date: new Date("2023-10-12T08:30:00Z"),
        },
        {
          content:
            "Yes! We're releasing a new analytics dashboard next month that provides real-time insights.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-10-12T08:31:00Z"),
        },
        {
          content:
            "Sounds interesting. Will existing subscribers get it automatically?",
          sender: "Nathan Johnson",
          source: "Website",
          date: new Date("2023-10-12T08:32:45Z"),
        },
        {
          content:
            "Absolutely! All current users will get upgraded at no extra cost.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-10-12T08:33:30Z"),
        },
        {
          content: "Fantastic. I'll keep an eye out for the update. Thanks!",
          sender: "Nathan Johnson",
          source: "Website",
          date: new Date("2023-10-12T08:34:15Z"),
        },
      ],
    },
  })

  // BLOCK 11
  await createConversation({
    messages: {
      create: [
        {
          content: "Hi, I'm having trouble logging into my account. Can you help?",
          sender: "Olivia Smith",
          source: "Messenger",
          date: new Date("2023-07-22T11:00:00Z"),
        },
        {
          content:
            "Of course! Have you tried resetting your password via the 'Forgot Password' link?",
          sender: "human",
          source: "Messenger",
          date: new Date("2023-07-22T11:05:00Z"),
        },
        {
          content: "Yes, I did, but I never received the reset email.",
          sender: "Olivia Smith",
          source: "Messenger",
          date: new Date("2023-07-22T11:07:30Z"),
        },
        {
          content:
            "Let me manually trigger a password reset from our side. Could you verify your email address?",
          sender: "human",
          source: "Messenger",
          date: new Date("2023-07-22T11:09:00Z"),
        },
        {
          content: "Sure, it's user@example.com.",
          sender: "Olivia Smith",
          source: "Messenger",
          date: new Date("2023-07-22T11:10:15Z"),
        },
        {
          content:
            "Great, I've sent another password reset email. Please check your inbox and let me know if you get it.",
          sender: "human",
          source: "Messenger",
          date: new Date("2023-07-22T11:11:30Z"),
        },
        {
          content: "Got it this time. Thank you for the prompt help!",
          sender: "Olivia Smith",
          source: "Messenger",
          date: new Date("2023-07-22T11:15:00Z"),
        },
      ],
    },
  })

  // BLOCK 12
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hey, I saw your Instagram story about a new product. Can you tell me more?",
          sender: "Jacob Lee",
          source: "Instagram",
          date: new Date("2023-11-02T16:10:00Z"),
        },
        {
          content:
            "Hi there! We just launched our new premium headset with noise-cancellation and 20-hour battery life.",
          sender: "human",
          source: "Instagram",
          date: new Date("2023-11-02T16:12:00Z"),
        },
        {
          content: "That sounds great. What's the price range?",
          sender: "Jacob Lee",
          source: "Instagram",
          date: new Date("2023-11-02T16:13:30Z"),
        },
        {
          content:
            "It starts at $129.99, but we have a discount code for first-time customers.",
          sender: "human",
          source: "Instagram",
          date: new Date("2023-11-02T16:14:15Z"),
        },
        {
          content: "Awesome! Mind sharing the code?",
          sender: "Jacob Lee",
          source: "Instagram",
          date: new Date("2023-11-02T16:15:00Z"),
        },
        {
          content:
            "Use WELCOME10 at checkout for 10% off. Let me know if you have any other questions!",
          sender: "human",
          source: "Instagram",
          date: new Date("2023-11-02T16:16:00Z"),
        },
        {
          content: "Thanks! I'll definitely check it out.",
          sender: "Jacob Lee",
          source: "Instagram",
          date: new Date("2023-11-02T16:17:30Z"),
        },
      ],
    },
  })

  // BLOCK 13
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hello, I'm evaluating your CRM software. Does it integrate with Salesforce?",
          sender: "Mia Rodriguez",
          source: "Website",
          date: new Date("2023-08-20T09:00:00Z"),
        },
        {
          content:
            "Hi! Yes, we have a native Salesforce integration that syncs contacts and leads in real-time.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-08-20T09:02:00Z"),
        },
        {
          content: "That's perfect. Does it also sync opportunities?",
          sender: "Mia Rodriguez",
          source: "Website",
          date: new Date("2023-08-20T09:03:30Z"),
        },
        {
          content:
            "Currently, it syncs contacts and leads. Opportunities are on our roadmap for Q1 next year.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-08-20T09:04:45Z"),
        },
        {
          content:
            "Thanks for the info. I'd love to know when it's live. Please keep me posted!",
          sender: "Mia Rodriguez",
          source: "Website",
          date: new Date("2023-08-20T09:05:30Z"),
        },
        {
          content:
            "Sure thing! We'll send out an announcement once we've implemented opportunity sync.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-08-20T09:06:15Z"),
        },
      ],
    },
  })

  // BLOCK 14
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hi, I'm looking at your enterprise solutions. Do you offer on-premise deployments?",
          sender: "Daniel Anderson",
          source: "Website",
          date: new Date("2023-06-10T15:25:00Z"),
        },
        {
          content:
            "Yes, we do. Our enterprise tier includes both cloud and on-premise options, depending on your security needs.",
          sender: "human",
          source: "Website",
          date: new Date("2023-06-10T15:27:00Z"),
        },
        {
          content:
            "Great. We have strict compliance requirements, so that might be the route we need.",
          sender: "Daniel Anderson",
          source: "Website",
          date: new Date("2023-06-10T15:28:30Z"),
        },
        {
          content:
            "Totally understand. Would you like to schedule a call with our compliance officer to discuss details?",
          sender: "human",
          source: "Website",
          date: new Date("2023-06-10T15:29:45Z"),
        },
        {
          content: "Yes, please. Next Tuesday morning works for me.",
          sender: "Daniel Anderson",
          source: "Website",
          date: new Date("2023-06-10T15:31:00Z"),
        },
        {
          content:
            "Perfect, I'll set it up for 10 AM. You'll receive a calendar invite shortly.",
          sender: "human",
          source: "Website",
          date: new Date("2023-06-10T15:32:15Z"),
        },
        {
          content: "Thank you!",
          sender: "Daniel Anderson",
          source: "Website",
          date: new Date("2023-06-10T15:33:00Z"),
        },
      ],
    },
  })

  // BLOCK 15
  await createConversation({
    messages: {
      create: [
        {
          content: "Hi, do you offer live chat support for urgent issues?",
          sender: "Abigail Martin",
          source: "Messenger",
          date: new Date("2023-05-05T10:00:00Z"),
        },
        {
          content:
            "Hello! Yes, our live chat is available 24/7 for premium tier customers.",
          sender: "ai",
          source: "Messenger",
          date: new Date("2023-05-05T10:01:00Z"),
        },
        {
          content:
            "I'm on the standard plan. Is there a way to add the live chat option?",
          sender: "Abigail Martin",
          source: "Messenger",
          date: new Date("2023-05-05T10:02:15Z"),
        },
        {
          content:
            "You can either upgrade to premium or purchase a separate live chat add-on.",
          sender: "ai",
          source: "Messenger",
          date: new Date("2023-05-05T10:03:30Z"),
        },
        {
          content: "Got it. I'll upgrade then. How soon does it take effect?",
          sender: "Abigail Martin",
          source: "Messenger",
          date: new Date("2023-05-05T10:04:45Z"),
        },
        {
          content:
            "Upgrades take effect immediately after payment. Let me know if you need assistance with that.",
          sender: "ai",
          source: "Messenger",
          date: new Date("2023-05-05T10:05:30Z"),
        },
      ],
    },
  })

  // BLOCK 16
  await createConversation({
    messages: {
      create: [
        {
          content: "Hello, I'm a student. Do you offer educational discounts?",
          sender: "Ethan Thompson",
          source: "Website",
          date: new Date("2023-03-14T13:00:00Z"),
        },
        {
          content:
            "Hi there! Yes, we do. We have a 30% discount for verified students and educators.",
          sender: "human",
          source: "Website",
          date: new Date("2023-03-14T13:02:00Z"),
        },
        {
          content: "How do I get verified?",
          sender: "Ethan Thompson",
          source: "Website",
          date: new Date("2023-03-14T13:03:15Z"),
        },
        {
          content:
            "Just upload proof of enrollment or a valid student ID in your account settings.",
          sender: "human",
          source: "Website",
          date: new Date("2023-03-14T13:04:30Z"),
        },
        {
          content: "Perfect. I'll do that now. Thank you!",
          sender: "Ethan Thompson",
          source: "Website",
          date: new Date("2023-03-14T13:05:00Z"),
        },
        {
          content:
            "You're welcome! Let me know if you need any help with the upload process.",
          sender: "human",
          source: "Website",
          date: new Date("2023-03-14T13:06:00Z"),
        },
      ],
    },
  })

  // BLOCK 17
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Hey, do you have any plans to expand your product line to include accessories?",
          sender: "Grace White",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:45:00Z"),
        },
        {
          content:
            "Hello! Actually, we are launching a line of compatible accessories next quarter.",
          sender: "human",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:46:15Z"),
        },
        {
          content: "That's great news. Any chance you'll have a carrying case?",
          sender: "Grace White",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:47:30Z"),
        },
        {
          content:
            "Yes, a carrying case, extra cables, and a charging dock are all in the works.",
          sender: "human",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:48:45Z"),
        },
        {
          content: "Fantastic, can't wait to see them. Keep me updated!",
          sender: "Grace White",
          source: "WhatsApp",
          date: new Date("2023-12-01T17:49:00Z"),
        },
      ],
    },
  })

  // BLOCK 18
  await createConversation({
    messages: {
      create: [
        {
          content:
            "Good morning! I'm looking for a custom quote for our small business team of 15 users.",
          sender: "Noah Green",
          source: "Website",
          date: new Date("2023-04-18T09:15:00Z"),
        },
        {
          content:
            "Hi! We offer tiered pricing, but for teams of 10-20, we can provide a discounted bundle.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-04-18T09:16:30Z"),
        },
        {
          content: "Great, what's included in the bundle?",
          sender: "Noah Green",
          source: "Website",
          date: new Date("2023-04-18T09:17:45Z"),
        },
        {
          content:
            "You get our standard plan features plus 2 hours of onboarding support each month.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-04-18T09:18:30Z"),
        },
        {
          content: "That might work. Could I get a written quote emailed?",
          sender: "Noah Green",
          source: "Website",
          date: new Date("2023-04-18T09:19:00Z"),
        },
        {
          content:
            "Of course! Please provide your email address, and I'll send the quote shortly.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-04-18T09:20:15Z"),
        },
        {
          content: "It's business@client.co. Thank you!",
          sender: "Noah Green",
          source: "Website",
          date: new Date("2023-04-18T09:21:00Z"),
        },
        {
          content:
            "You're welcome! The quote will arrive in your inbox within the next hour.",
          sender: "ai",
          source: "Website",
          date: new Date("2023-04-18T09:22:00Z"),
        },
      ],
    },
  })

  // *** End copy of your duplicate blocks ***
// ---------------------------------------------------------------
  // 11. MessageAnalysis
  // ---------------------------------------------------------------
  const allConversations = await prisma.conversation.findMany({
    where: { userId },
    include: { messages: true },
  })

  // Just pick a few to demonstrate
  if (allConversations.length >= 3) {
    const convoA = allConversations[0]
    const convoB = allConversations[1]
    const convoC = allConversations[2]

    // If these have messages, reference message[0] for example
    const msgA = convoA.messages[0]
    const msgB = convoB.messages[0]
    const msgC = convoC.messages[0]

    // 1. Analysis referencing entire conversation
    await prisma.messageAnalysis.create({
      data: {
        userId,
        conversationId: convoA.id,
        analysis:
          "This conversation shows strong interest in upcoming features. Recommend follow-up with a special offer.",
      },
    })

    // 2. Analysis referencing a single conversation message
    if (msgB) {
      await prisma.messageAnalysis.create({
        data: {
          userId,
          conversationMessageId: msgB.id,
          analysis:
            "User is frustrated about login issues. Action: expedite reset email or connect with support agent.",
        },
      })
    }

    // 3. Another referencing entire conversation
    await prisma.messageAnalysis.create({
      data: {
        userId,
        conversationId: convoC.id,
        analysis:
          "Customer asked about new product with discount code. Positive response likely leads to purchase.",
      },
    })

    // 4. Another referencing a single message
    if (msgC) {
      await prisma.messageAnalysis.create({
        data: {
          userId,
          conversationMessageId: msgC.id,
          analysis:
            "User's first message indicates interest in premium accessories. Recommend upsell strategy.",
        },
      })
    }
  }

  // ---------------------------------------------------------------
  // 12. ConversationFlow
  // ---------------------------------------------------------------
  const sampleFlow1 = {
    steps: [
      {
        id: "greeting",
        text: "Hi there! How can I help you today?",
      },
      {
        id: "qualify",
        text: "Are you interested in a product demo or do you have a support issue?",
      },
      {
        id: "demo",
        text: "Great! Let me schedule a demo for you. What's your email?",
      },
      {
        id: "end",
        text: "Thank you! We'll send you the demo details soon.",
      },
    ],
  }

  const sampleFlow2 = {
    steps: [
      {
        id: "intro",
        text: "Welcome! What product are you interested in?",
      },
      {
        id: "budget",
        text: "What's your approximate budget range?",
      },
      {
        id: "timing",
        text: "When do you plan to purchase?",
      },
      {
        id: "closing",
        text: "Would you like more info or are you ready to sign up?",
      },
    ],
  }

  await prisma.conversationFlow.create({
    data: {
      userId,
      flow: sampleFlow1,
    },
  })

  await prisma.conversationFlow.create({
    data: {
      userId,
      flow: sampleFlow2,
    },
  })

  // ---------------------------------------------------------------
  // 13. Qualifying Questions
  // ---------------------------------------------------------------
  const qualifyingQuestionsData = [
    {
      question: "What's your primary goal with our solution?",
    },
    {
      question: "How soon are you looking to implement?",
    },
    {
      question: "Who are the key decision-makers on your team?",
    },
    {
      question: "What's your budget range?",
    },
    {
      question: "Do you have any current software or solutions in place?",
    },
    {
      question: "How many users will need access?",
    },
    {
      question: "Are there any must-have integrations?",
    },
  ]

  for (const qq of qualifyingQuestionsData) {
    await prisma.qualifyingQuestion.create({
      data: {
        userId,
        ...qq,
      },
    })
  }

  console.log("Seeding completed successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error("Error seeding data:", error)
    await prisma.$disconnect()
    process.exit(1)
  })
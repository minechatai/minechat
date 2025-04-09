import { NextResponse } from "next/server";

let conversationHistory: any = []

export async function POST(request: Request) {

    let requestParams = await request.json();

    console.log("using key", process.env.OPENAI_API_KEY)

    // Construct the prompt messages for GPT by mapping conversation messages
    const promptMessages = conversationHistory.slice();
    
    const newMessage = {
        role: "user",
        content: requestParams.message,
    };
    promptMessages.push(newMessage);

    let assistantInfo = requestParams.assistantInfo;

    // Prepend a system message containing the assistant configuration and business info
    const systemContent = 
        `Assistant Name: ${assistantInfo.assistantName}\n` +
        `Introduction Message: ${assistantInfo.introMessage}\n` +
        `Short Description of the assistant: ${assistantInfo.shortDescription}\n` +
        `Guidelines when responding: ${assistantInfo.guidelines}`;
    promptMessages.unshift({ role: 'system', content: systemContent });
    console.log('Constructed promptMessages (with system message):', promptMessages);

    // Call the GPT-4o Mini API
    console.log('Calling GPT-4o Mini API...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
        },
        body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: promptMessages,
        }),
    });

    const openaiData = await openaiResponse.json();
    console.log('GPT API response:', openaiData);
    if (!openaiData.choices || openaiData.choices.length === 0) {
        throw new Error('No choices returned from GPT API');
    }

    const gptReply = openaiData.choices[0].message.content;
    const newReplies = {
        role: "assistant",
        content: gptReply,
    };

    console.log("replying with", newReplies);
    return NextResponse.json(newReplies);
}
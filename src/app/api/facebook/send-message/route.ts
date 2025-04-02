"use server"

import { NextResponse } from "next/server"

// This API route sends a message to a Facebook user using the supplied access token and recipient ID.
// IMPORTANT: The Facebook Graph API endpoint and payload below are examples. If you have different requirements,
// please update the endpoint and request body accordingly.
export async function POST(request: Request) {
  try {
    // Parse the request body (expects conversationId, message, recipientPageScopeId, facebookAccessToken)
    const { conversationId, message, recipientPageScopeId, facebookAccessToken } = await request.json()

    if (!conversationId || !message || !recipientPageScopeId || !facebookAccessToken) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Construct the Facebook Graph API endpoint using the provided access token
    const fbApiUrl = `https://graph.facebook.com/v16.0/me/messages?access_token=${facebookAccessToken}`

    // Prepare the payload to send the message
    const payload = {
      recipient: { id: recipientPageScopeId },
      message: { text: message }
    }

    // Send the message via Facebook API
    const sendMessageResponse = await fetch(fbApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!sendMessageResponse.ok) {
      const errorData = await sendMessageResponse.json()
      console.error("Error sending message to Facebook:", errorData)
      return NextResponse.json(
        { success: false, error: "Error sending message to Facebook" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error in send-message route:", err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

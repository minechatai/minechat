import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * This script removes all data from the main tables in your database
 * so you can start fresh (and then run your seed if needed).
 *
 * Usage:
 *   npm run clear
 *
 * Make sure you REALLY want to delete everything before running this!
 */
async function main() {
  console.log("Clearing all data from your main tables...")

  // Use a transaction for consistency and to avoid potential FK issues:
  await prisma.$transaction(async (tx) => {
    // 1. Delete from tables that reference others first:
    await tx.messageAnalysis.deleteMany({}) // references Conversation & ConversationMessage

    // 2. Delete conversation messages, then conversations:
    await tx.conversationMessage.deleteMany({})
    await tx.conversation.deleteMany({})

    // 3. BusinessInfo can be deleted now (no references to or from it):
    await tx.businessInfo.deleteMany({})

    // 4. Opportunity references a Lead, so delete opportunities first:
    await tx.opportunity.deleteMany({})
    // 5. Then delete leads:
    await tx.lead.deleteMany({})

    // 6. The rest can be deleted in any order (no direct references among them):
    await tx.dailyMessageCount.deleteMany({})
    await tx.uniqueNewQuestion.deleteMany({})
    await tx.fAQ.deleteMany({})
    await tx.userMetrics.deleteMany({})
    await tx.userChannel.deleteMany({})
    await tx.aIAssistantSetup.deleteMany({})
    await tx.conversationFlow.deleteMany({})
    await tx.qualifyingQuestion.deleteMany({})
  })

  console.log("All data deleted. Now you can run `npm run seed` (if you have a seeding script) to insert fresh data.")
}

main()
  .catch((error) => {
    console.error("Error clearing data:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

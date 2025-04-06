/*
This client component provides the hero section for the landing page.
*/

"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ChevronRight, Rocket } from "lucide-react"
import Link from "next/link"
import AnimatedGradientText from "../magicui/animated-gradient-text"
import HeroVideoDialog from "../magicui/hero-video-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, Brain, MessageSquare, Zap } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel"
import { RainbowButton } from "../magicui/rainbow-button"
import { InteractiveGridPattern } from "../magicui/interactive-grid-pattern"
import { BoxReveal } from "../magicui/box-reveal"
import { OrbitingCircles } from "../magicui/orbiting-circles"
import { Facebook, Instagram, MessageSquareMore, Globe } from "lucide-react"
import Iphone15Pro from "../magicui/iphone-15-pro"

export const HeroSection = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-8 pb-20 pt-32 text-center">
      <div className="absolute inset-0 -z-10 min-h-screen w-full">
        <InteractiveGridPattern
          width={32}
          height={32}
          className="absolute left-0 top-0 min-h-screen w-full opacity-[0.15] dark:opacity-[0.25]"
          squares={[60, 40]}
          squaresClassName="fill-blue-500/10 stroke-blue-500/50 dark:fill-blue-400/10 dark:stroke-blue-400/20"
        />
      </div>

      <div className="from-background absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        <Link href="https://github.com/mckaywrigley/o1-pro-template-system">
          <AnimatedGradientText>
            🚀 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />
            <span
              className={cn(
                `animate-gradient inline bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
              )}
            >
              Book a Call with us!
            </span>
            <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedGradientText>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-8 flex max-w-2xl flex-col items-center justify-center gap-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="text-balance text-6xl font-bold"
        >
          Minechat.ai
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="max-w-xl text-balance text-xl"
        >
          Your AI Sales Co-Pilot
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          className="flex gap-4"
        >
          <Link href="https://github.com/mckaywrigley/o1-pro-template-system">
            <RainbowButton className="text-lg">
              <Rocket className="mr-2 size-5" />
              Get Started &rarr;
            </RainbowButton>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        className="mt-20 w-full max-w-6xl"
      >
        <Carousel
          opts={{
            align: "start",
            loop: true
          }}
          className="mx-auto w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {features.map((feature, index) => (
              <CarouselItem
                key={index}
                className="pl-2 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="border-2 border-transparent bg-gradient-to-br from-blue-50 to-purple-50 transition-all duration-300 hover:border-blue-200 dark:from-blue-950/30 dark:to-purple-950/30 dark:hover:border-blue-800">
                  <CardContent className="flex flex-col items-center gap-4 p-6">
                    {feature.icon}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-center text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
        className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-3"
      >
        {stats.map((stat, index) => (
          <Card key={index} className="border-none bg-transparent">
            <CardContent className="flex flex-col items-center p-6">
              <div className="text-4xl font-bold text-blue-500">
                {stat.value}
              </div>
              <div className="text-muted-foreground mt-2 text-sm">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
        className="mt-32 w-full max-w-6xl"
      >
        <BoxReveal width="100%" boxColor="#5046e6" duration={0.8}>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-4 text-left">
              <h2 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-3xl font-bold text-transparent">
                Transform Your Sales Process
              </h2>
              <p className="text-muted-foreground text-lg">
                Leverage AI to automate your sales outreach, understand customer
                needs, and close deals faster than ever before.
              </p>
              <ul className="space-y-2">
                {[
                  "24/7 Customer Engagement",
                  "Smart Lead Qualification",
                  "Automated Follow-ups",
                  "Data-Driven Insights"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative p-8">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
              <Card className="bg-background/50 relative border-2 border-blue-200/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Bot className="size-8 text-blue-500" />
                      <h3 className="text-xl font-semibold">
                        AI-Powered Assistant
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      Our AI understands context, learns from interactions, and
                      provides personalized responses to every customer inquiry.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </BoxReveal>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
        className="mt-32 w-full max-w-7xl"
      >
        <div className="relative flex flex-col items-center justify-center">
          <h2 className="mb-6 text-3xl font-bold">Connect Everywhere</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl text-center text-lg">
            Engage with your customers across all major platforms seamlessly
          </p>

          <div className="grid w-full items-center gap-12 md:grid-cols-2">
            <div className="relative flex h-[400px] items-center justify-center">
              <div className="relative size-[300px]">
                <OrbitingCircles
                  className="absolute inset-0"
                  duration={20}
                  radius={120}
                  iconSize={32}
                  path={true}
                >
                  <div className="rounded-full border border-green-500/20 bg-green-500/10 p-3 backdrop-blur-sm transition-colors hover:bg-green-500/20">
                    <MessageSquareMore className="size-6 text-green-500" />
                  </div>
                  <div className="rounded-full border border-blue-500/20 bg-blue-500/10 p-3 backdrop-blur-sm transition-colors hover:bg-blue-500/20">
                    <Facebook className="size-8 text-blue-500" />
                  </div>
                  <div className="rounded-full border border-pink-500/20 bg-pink-500/10 p-4 backdrop-blur-sm transition-colors hover:bg-pink-500/20">
                    <Instagram className="size-8 text-pink-500" />
                  </div>
                  <div className="rounded-full border border-purple-500/20 bg-purple-500/10 p-4 backdrop-blur-sm transition-colors hover:bg-purple-500/20">
                    <Globe className="size-8 text-purple-500" />
                  </div>
                </OrbitingCircles>

                <OrbitingCircles
                  className="absolute inset-0"
                  radius={70}
                  iconSize={24}
                  reverse
                  speed={2}
                  path={true}
                >
                  <div className="rounded-full border border-green-500/20 bg-green-500/10 p-2 backdrop-blur-sm transition-colors hover:bg-green-500/20">
                    <MessageSquareMore className="size-4 text-green-500" />
                  </div>
                  <div className="rounded-full border border-blue-500/20 bg-blue-500/10 p-3 backdrop-blur-sm transition-colors hover:bg-blue-500/20">
                    <Facebook className="size-6 text-blue-500" />
                  </div>
                  <div className="rounded-full border border-pink-500/20 bg-pink-500/10 p-3 backdrop-blur-sm transition-colors hover:bg-pink-500/20">
                    <Instagram className="size-6 text-pink-500" />
                  </div>
                  <div className="rounded-full border border-purple-500/20 bg-purple-500/10 p-3 backdrop-blur-sm transition-colors hover:bg-purple-500/20">
                    <Globe className="size-6 text-purple-500" />
                  </div>
                </OrbitingCircles>

                <div className="bg-background/50 absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-200/20 p-6 backdrop-blur-md">
                  <Bot className="size-12 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[150px]">
                <Iphone15Pro>
                  <div className="bg-background flex size-full flex-col">
                    <div className="flex-1 space-y-2 p-3">
                      <div className="bg-muted h-4 w-3/4 rounded-lg" />
                      <div className="space-y-1">
                        <div className="bg-muted h-2 w-full rounded-lg" />
                        <div className="bg-muted h-2 w-5/6 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </Iphone15Pro>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const features = [
  {
    title: "AI-Powered Conversations",
    description:
      "Engage in natural conversations with advanced AI that understands context and intent.",
    icon: <Bot className="size-8 text-blue-500" />
  },
  {
    title: "Smart Analytics",
    description:
      "Get deep insights into your sales conversations with real-time analytics.",
    icon: <Brain className="size-8 text-purple-500" />
  },
  {
    title: "Lightning Fast",
    description:
      "Experience instant responses and seamless interactions with our optimized platform.",
    icon: <Zap className="size-8 text-orange-500" />
  },
  {
    title: "Multi-Channel Support",
    description:
      "Connect with customers across various platforms and channels effortlessly.",
    icon: <MessageSquare className="size-8 text-green-500" />
  }
]

const stats = [
  {
    value: "10x",
    label: "Faster Response Time"
  },
  {
    value: "85%",
    label: "Customer Satisfaction"
  },
  {
    value: "24/7",
    label: "Always Available"
  }
]

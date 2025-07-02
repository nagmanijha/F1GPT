"use client";

import Image from 'next/image';
import f1gptLogo from './assets/f1gptlogofirst.jpg';
import { useChat } from 'ai/react';
import { Message } from 'ai';

const Home = () => {
    const noMessages = true; // Placeholder for no messages state
    return(
        <main>
            <Image src={f1gptLogo} width="250" alt="F1GPT Logo" />
        <section>
            {noMessages ? (
                <>
                    <p className='starter-text'>
                        The Ultimate F1 Chatbot
                         Ask me anything about F1.</p>
                    <br />
                    {/* <PromptSuggestions /> */}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold">Chat Messages</h1>
                    <div className="mt-4">
                        {/* Render chat messages here */}
                    </div>
                </div>
            )}
        </section>
        </main>
    )
}

export default Home;
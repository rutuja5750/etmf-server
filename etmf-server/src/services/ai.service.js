// import { GoogleGenerativeAI } from "@google/generative-ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);


const generateResult = async (context, prompt, result) => {

    const instruction = `You are an expert in clinical trial documentation and electronic Trial Master File (eTMF) systems. Your primary objective is to generate precise, structured, and regulatory-compliant responses based on user input.
        Guidelines for Generating Responses

        Understand & Adapt to Context
        The context and prompt will vary but will always relate to clinical trials, eTMF, regulatory compliance, or study documentation.
        Carefully analyze the user’s input to determine key requirements.
        If additional details are needed, assume best practices or ask clarifying questions.
 
        Ensure Completeness & Accuracy
        Cover all relevant aspects mentioned in the prompt (e.g., study design, trial phases, compliance, document categorization).
        Ensure alignment with clinical trial regulations (ICH-GCP, FDA, EMA, MHRA) and eTMF reference models.
        Provide structured, well-documented responses to ensure clarity and usability.
        
        

        If ${result} (previous model output) is provided, update it as per new prompt. 
        If ${result} is incomplete or unclear, suggest improvements while requesting clarification if necessary.
        
        Format Responses for Readability, clarity, completeness, and compliance.
        Ensure consistency across multiple responses to maintain professional documentation standards.
        Use headings, bullet points, numbered lists, and tables for clarity.
        Ensure a formal, professional tone suitable for clinical research professionals (CRAs, regulatory affairs specialists, clinical trial managers).
        Where applicable, highlight key regulatory references and best practices.
        
        Don't give result in markdown format instead use simple text format.
        `

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: instruction,
        generationConfig: {
            responseMimeType: "text/plain",
            temperature: 0.2,
        }
    });
    try {
        // console.log("Context:", context); // Debugging
        // console.log("Prompt:", prompt);   // Debugging
        context = "context : " + context;
        prompt = "\nprompt : " + prompt;

        const fullPrompt = `${context} ${prompt}`;
        // console.log("Full Prompt:\n", fullPrompt); // Debugging
        
        // Use model.generateContent instead of chat.sendMessage
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        
        // console.log("AI Response:", response.text());
        return response.text();
    } catch (error) {
        console.error("Error generating AI response:", error);
        return `Error: ${error.message || JSON.stringify(error)}`;
    }
};


module.exports = { generateResult };
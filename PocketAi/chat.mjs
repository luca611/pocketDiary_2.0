import OpenAI from "openai";
import { sendError, sendServerError } from "../utils/returns.mjs";
import { isValidDate } from "../utils/validator.mjs";

const token = process.env["GROQ_KEY"];

const endpoint = "https://api.groq.com/openai/v1";
const modelName = "llama-3.3-70b-versatile";

const client = new OpenAI({ baseURL: endpoint, apiKey: token });

/**
 * Get a chat completion from the AI model
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Response} - JSON response
 * @throws {Error} - Error if request fails
 */

export async function getChatCompletion(req, res) {
    try{
        if (!req.session || !req.session.logged) {
            return sendError(res, "You are not logged in");
        }

        const { message } = req.body;
        if (!message) {
            return sendServerError(res, "Message cannot be empty");
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            const response = await client.chat.completions.create(
                {
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content: message }
                    ],
                    temperature: 0.5,
                    top_p: 1.0,
                    max_tokens: 1000,
                    model: modelName,
                },
                { signal: controller.signal }
            );

            clearTimeout(timeout);

            if (!response || !response.choices?.[0]?.message?.content) {
                throw new Error("Invalid AI response");
            }

            res.status(200).json({ error: '0', message: response.choices[0].message.content });

        } catch (error) {
        clearTimeout(timeout);

        if (error.name === "AbortError") {
            sendServerError(res, "AI request timed out. Try again.");
        } else {
            console.error("Chat API Error:", error);
            sendServerError(res, "An error occurred while processing the request.");
        }
        }
    } catch (error) {
        console.error("▶ Chat API Error:", error);
        sendServerError(res, "An error occurred while processing the request.");
    }
}

/**
 * Generate a study plan based on user inputs
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Response} - JSON response
 * @throws {Error} - Error if request fails
 */

export async function setStudyPlan(req, res) {
    try{
        if (!req.session || !req.session.logged) {
            return sendError(res, "You are not logged in");
        }

        const { startDate, endDate, subject, frequency } = req.body;
        if (!startDate || !endDate || !subject || !frequency) {
            return sendServerError(res, "Missing required fields");
        }

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return sendError(res, "Invalid dates");
        }

        if (new Date(endDate) < new Date(startDate)) {
            return sendError(res, "End date cannot be before start date");
        }

        if (frequency < 1 || frequency > 5) {
            return sendServerError(res, "Frequency must be between 1 and 5");
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await client.chat.completions.create(
                {
                    messages: [
                        {
                            role: "system",
                            content: "Receive inputs from the user: start date, termination date, subject, and study frequency (1 to 5). Generate a pure and valid JSON with no special chars or extra text neither tabs and no formatting chars, response with an array named 'notes' containing objects called 'note' to represent individual study sessions. Each 'note' object must include the following fields: - 'title': A string combining the subject and session number. - 'description': A brief description for the session giving advices on what the user should do in that session.  - 'date': The session's date formatted as mm/dd/yyyy.  Distribute the 'note' objects evenly between the start and termination dates based on the provided frequency, where higher frequency values (e.g., 5) result in more frequent notes and lower frequency values (e.g., 1) result in fewer notes. Note that the frequency value does not directly define the exact number of notes but influences their distribution density across the given date range."
                        },
                        {
                            role: "user",
                            content: "Start Date:" + startDate + "End Date: " + endDate + "Frequency: " + frequency + "Subject: " + subject
                        }
                    ],
                    model: modelName,
                    temperature: 1,
                    max_tokens: 1000,
                    top_p: 1
                },
                { signal: controller.signal }
            );

            clearTimeout(timeout);

            if (!response || !response.choices?.[0]?.message?.content) {
                throw new Error("Invalid AI response");
            }

            let cleanedOutput;
            try {
                cleanedOutput = JSON.parse(response.choices[0].message.content);
            } catch (error) {
                console.error("JSON Parse Error:", error);
                return sendServerError(res, "Invalid AI response format.");
            }

            res.status(200).json({ error: '0', message: cleanedOutput });

        } catch (error) {
            clearTimeout(timeout);

            if (error.name === "AbortError") {
                sendServerError(res, "AI request timed out. Try again.");
            } else {
                console.error("Study Plan API Error:", error);
                sendServerError(res, error.message || "An error occurred while processing the request.");
            }
        }
    } catch (error) {
        console.error("▶ Study Plan API Error:", error);
        sendServerError(res, "An error occurred while processing the request.");
    }
}
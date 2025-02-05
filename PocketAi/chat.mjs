import OpenAI from "openai";
import { sendError, sendServerError } from "../utils/returns.mjs";
import { isValidDate } from "../utils/validator.mjs";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

export async function getChatCompletion(req, res) {

    //add is logged in check

    let response;

    try{
        let { message } = req.body;
        if(!message) {
            sendServerError(res, "message cannot be empty");
            return;
        }

        const client = new OpenAI({ baseURL: endpoint, apiKey: token });

        response = await client.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: message
                }
            ],

            temperature: 0.5,
            top_p: 1.0,
            max_tokens: 1000,
            model: modelName
        });
    } 
    catch (error) {
        sendServerError(res, "An error occurred while processing the request.");   
    }
    res.status(200).send({ error: '0', message: response.choices[0].message.content });
}

export async function getStudyPlan(req, res) {


    //add is logged in check
    //validate dates
    let response;

    try {
        let { startDate, endDate, subject, frequency } = req.body;

        if (!startDate || !endDate || !request || !frequency) {
            sendServerError(res, "Missing required fields");
            return;
        }

        if(!isValidDate(startDate) || !isValidDate(endDate)) {
            sendError(res, "Invalid date format");
            return;
        }

        if(frequency < 1 || frequency > 5) {

            sendServerError(res, "Frequency must be between 1 and 5");
            return;

        const client = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: token
        });
    
        response = await client.chat.completions.create({
        messages: [
                { role:"system", content: "Receive inputs from the user: start date, termination date, subject, and study frequency (1 to 5). Generate a JSON response with an array named 'notes' containing objects called 'note' to represent individual study sessions. Each 'note' object must include the following fields: - 'title': A string combining the subject and session number. - 'description': A brief description for the session.  - 'date': The session's date formatted as dd/mm/yyyy.  Distribute the 'note' objects evenly between the start and termination dates based on the provided frequency, where higher frequency values (e.g., 5) result in more frequent notes and lower frequency values (e.g., 1) result in fewer notes. Note that the frequency value does not directly define the exact number of notes but influences their distribution density across the given date range." },
                { role:"user", content: "What is the capital of France?" }
            ],
            model: "gpt-4o",
            temperature: 1,
            max_tokens: 4096,
            top_p: 1
        });
    } catch (error) {
        sendServerError(res, "An error occurred while processing the request.");
    }
    res.status(200).send({ error: '0', message: response.choices[0].message.content });
}

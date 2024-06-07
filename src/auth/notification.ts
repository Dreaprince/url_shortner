import * as ejs from 'ejs';
import axios from 'axios';
import * as path from 'path';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

interface MailData {
    [key: string]: any;
}

export const pushMail = async (data: MailData, template: string, emailSubject: string, emailRecipient: string) => {
    try {
        const html = await ejs.renderFile(path.resolve(__dirname, '..', '..', 'views', template + ".ejs"), data);
        
        const url = process.env.MAIL_URL;
        const apiData = {
            subject: emailSubject,
            recipient: emailRecipient,
            content: html
        };
        const config = {
            headers: {
               token: process.env.MAIL_SERVICE_TOKEN,
            }
        };

        console.log('Sending mail request to ' + url + ' to ==> ', emailRecipient);

        const mailServiceResponse = await axios.post(url, apiData, config);

        console.log(mailServiceResponse.data);
    } catch (error) {
        console.log('Exception send mail notification: ' + error);
    }
};


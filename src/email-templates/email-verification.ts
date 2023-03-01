import fs from "fs";

const emailVerificationTemplate = async (name: string, email: string, link: string) => {
    const template = fs.readFileSync(`${__dirname}/raw/email-verification.html`, "utf8");

    const html = template
        .replace(/{{name}}/g, name)
        .replace(/{{link}}/g, link)
        .replace(/{{email}}/g, email)
        .replace(/{{year}}/g, new Date().getFullYear().toString());

    return html;
};

export default emailVerificationTemplate;

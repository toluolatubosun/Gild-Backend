import fs from "fs";

const accountCreationTemplate = async (name: string, email: string, link: string, password: string) => {
    const template = fs.readFileSync(`${__dirname}/raw/email-verification.html`, "utf8");

    const html = template
        .replace(/{{name}}/g, name)
        .replace(/{{link}}/g, link)
        .replace(/{{email}}/g, email)
        .replace(/{{password}}/g, password)
        .replace(/{{year}}/g, new Date().getFullYear().toString());

    return html;
};

export default accountCreationTemplate;

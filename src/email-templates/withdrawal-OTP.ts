import fs from "fs";

const withdrawalOTPTemplate = async (name: string, email: string, OTP: string) => {
    const template = fs.readFileSync(`${__dirname}/raw/withdrawal-OTP.html`, "utf8");

    const html = template
        .replace(/{{OTP}}/g, OTP)
        .replace(/{{name}}/g, name)
        .replace(/{{email}}/g, email)
        .replace(/{{year}}/g, new Date().getFullYear().toString());

    return html;
};

export default withdrawalOTPTemplate;

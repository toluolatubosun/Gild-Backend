interface BusinessCreateInput {
    companySize: "1-50" | "51-100" | "101-500" | "500+";
    city: string;
    state: string;
    country: string;
    industry: string;
}

interface BusinessUpdateInput {
    companySize: "1-50" | "51-100" | "101-500" | "500+";
    city: string;
    state: string;
    country: string;
    industry: string;
}

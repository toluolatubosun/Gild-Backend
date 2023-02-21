interface BusinessCreateInput {
    city: string;
    state: string;
    country: string;
    industry: string;
    companySize: "1-50" | "51-100" | "101-500" | "500+";
}

interface BusinessUpdateInput {
    companySize: "1-50" | "51-100" | "101-500" | "500+";
    city: string;
    state: string;
    country: string;
    industry: string;
}

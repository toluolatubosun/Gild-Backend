interface BusinessCreateInput {
    city: string;
    state: string;
    country: string;
    industry: string;
    companySize: "1-50" | "51-100" | "101-500" | "500+";
}

interface BusinessUpdateInput {
    city: string;
    state: string;
    country: string;
    industry: string;
    companySize: "1-50" | "51-100" | "101-500" | "500+";
}

interface BusinessUpdateMineArgs {
    businessData: BusinessUpdateInput;
}

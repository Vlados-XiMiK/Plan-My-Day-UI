export interface CountryCode {
    name: string;
    code: string;
    flag: string; // Unicode emoji for flag
    mask: string; // Mask for number formatting
    isoCode: string; // Unique ISO country code
  }
  
  export const countryCodes: CountryCode[] = [
    { name: "Ukraine", code: "+380", flag: "🇺🇦", mask: "(##) ###-##-##", isoCode: "UA" },
    { name: "United States", code: "+1", flag: "🇺🇸", mask: "(###) ###-####", isoCode: "US" },
    { name: "Canada", code: "+1", flag: "🇨🇦", mask: "(###) ###-####", isoCode: "CA" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧", mask: "#### ######", isoCode: "GB" },
    { name: "Germany", code: "+49", flag: "🇩🇪", mask: "#### #######", isoCode: "DE" },
    { name: "France", code: "+33", flag: "🇫🇷", mask: "## ## ## ## ##", isoCode: "FR" },
    { name: "Australia", code: "+61", flag: "🇦🇺", mask: "#### ### ###", isoCode: "AU" },
    { name: "Brazil", code: "+55", flag: "🇧🇷", mask: "(##) #####-####", isoCode: "BR" },
    { name: "Japan", code: "+81", flag: "🇯🇵", mask: "##-####-####", isoCode: "JP" },
    { name: "India", code: "+91", flag: "🇮🇳", mask: "##### #####", isoCode: "IN" },
    { name: "China", code: "+86", flag: "🇨🇳", mask: "#### ### ####", isoCode: "CN" },
    { name: "Italy", code: "+39", flag: "🇮🇹", mask: "### ### ####", isoCode: "IT" },
    { name: "Spain", code: "+34", flag: "🇪🇸", mask: "### ### ###", isoCode: "ES" },
    { name: "Poland", code: "+48", flag: "🇵🇱", mask: "## ### ## ##", isoCode: "PL" },
    { name: "Netherlands", code: "+31", flag: "🇳🇱", mask: "## ### ####", isoCode: "NL" },
  ];
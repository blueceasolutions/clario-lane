import { queryOptions } from "@tanstack/react-query";

export const fetchUserCountryKey = "userCountry";
export const countryNameKey = "userCountryName";
export const countryCodeKey = "userCountryCode";

export const fetchUserCountry = queryOptions({
  queryKey: [fetchUserCountryKey],
  queryFn: async () => {
    const userCountryCode = localStorage.getItem(countryCodeKey);
    const userCountryName = localStorage.getItem(countryNameKey);

    if (userCountryCode && userCountryName) {
      return { userCountryCode, userCountryName };
    }

    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    localStorage.setItem(countryCodeKey, data.country_code);
    localStorage.setItem(countryNameKey, data.country_name);

    return {
      userCountryName: data.country_name,
      userCountryCode: data.country_code,
    };
  },
});

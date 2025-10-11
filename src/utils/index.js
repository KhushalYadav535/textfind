export const createPageUrl = (pageName) => {
  if (pageName === "Landing") return "/";
  return `/${pageName.toLowerCase()}`;
};

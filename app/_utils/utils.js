export const stringToHtml = (string, trim = true) => {
  string = trim ? string.trim() : string;
  if (!string) return null;

  // HTML5 has <template> elements which are used to declare fragments of HTML that
  // can be used in scripts. Set up a new template element.
  const template = document.createElement("template");
  template.innerHTML = string;
  const result = template.content.children;

  // Then return either an HTMLElement or HTMLCollection,
  // based on whether the input HTML had one or more roots.
  if (result.length === 1) return result[0];
  return result;
};

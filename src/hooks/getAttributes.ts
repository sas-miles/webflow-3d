export const getAttribute = (attr: string): HTMLElement | null => {
    return document.querySelector(`[${attr}]`) as HTMLElement | null;
  };
  
  export const getAttributes = (attr: string): NodeListOf<HTMLElement> => {
    return document.querySelectorAll(`[${attr}]`);
  };
  
  /**
   * Get elements with a specific attribute value
   * @param {string} attr - The attribute name to search for
   * @param {string} value - The specific value to match
   * @returns {NodeListOf<HTMLElement>} Elements matching the attribute and value
   */
  export const getAttributesWithValue = (attr: string, value: string): NodeListOf<HTMLElement> => {
    return document.querySelectorAll(`[${attr}="${value}"]`);
  };
  
  /**
   * Get a single element with a specific attribute value
   * @param {string} attr - The attribute name to search for
   * @param {string} value - The specific value to match
   * @returns {HTMLElement | null} First element matching the attribute and value
   */
  export const getAttributeWithValue = (attr: string, value: string): HTMLElement | null => {
    return document.querySelector(`[${attr}="${value}"]`) as HTMLElement | null;
  };
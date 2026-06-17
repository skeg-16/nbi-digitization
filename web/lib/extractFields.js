import { fieldsConfig } from './fieldsConfig';

export function extractFields(ocrData) {
  // ocrData is an array of { text, confidence, bounding_box: [x, y, w, h] }
  const extracted = {};

  for (const config of fieldsConfig) {
    if (config.strategy === 'label-anchored') {
      let foundValue = '';
      for (const item of ocrData) {
        const match = item.text.match(config.regex);
        if (match && match[1]) {
          foundValue = match[1].trim();
          break;
        }
      }
      extracted[config.name] = foundValue;

    } else if (config.strategy === 'zone-based') {
      let foundValue = '';
      const { x_min, y_min, x_max, y_max } = config.zone;
      
      for (const item of ocrData) {
        const [bx, by, bw, bh] = item.bounding_box;
        const center_x = bx + bw / 2;
        const center_y = by + bh / 2;
        
        // Check if the center of the text bounding box falls within the defined zone
        if (center_x >= x_min && center_x <= x_max && center_y >= y_min && center_y <= y_max) {
          foundValue += (foundValue ? ' ' : '') + item.text;
        }
      }
      extracted[config.name] = foundValue.trim();
    }
  }

  return extracted;
}

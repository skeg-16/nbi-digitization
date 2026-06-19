import { fieldsConfig } from './fieldsConfig';

export function extractFields(ocrData) {
  // ocrData is an array of { text, confidence, bounding_box: [x_min, y_min, width, height] }
  const extracted = {};

  // 1. Sort the OCR data: top-to-bottom first, then left-to-right.
  // We allow a 15-pixel margin for vertical alignment (since text on the same line might have slight y-variations)
  const sortedData = [...ocrData].sort((a, b) => {
    const yDiff = a.bounding_box[1] - b.bounding_box[1];
    if (Math.abs(yDiff) > 15) {
      return yDiff; 
    }
    return a.bounding_box[0] - b.bounding_box[0];
  });

  for (const config of fieldsConfig) {
    if (config.strategy === 'label-anchored') {
      let foundValue = '';
      
      for (let i = 0; i < sortedData.length; i++) {
        const item = sortedData[i];
        const match = item.text.match(config.regex);
        
        if (match) {
          // If the regex captured something in the first group, use it
          if (match[1] && match[1].trim() !== '') {
            foundValue = match[1].trim();
            break;
          } 
          // If the label matched but the value is empty, PaddleOCR likely split them into two boxes.
          // Grab the very next box's text as the value!
          else if (i + 1 < sortedData.length) {
            foundValue = sortedData[i + 1].text.trim();
            break;
          }
        }
      }
      extracted[config.name] = foundValue;

    } else if (config.strategy === 'zone-based') {
      let foundValue = '';
      const { x_min, y_min, x_max, y_max } = config.zone;
      
      for (const item of sortedData) {
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

  // Default acmo_no to N/A if it's not found or empty
  if (!extracted['acmo_no'] || extracted['acmo_no'].trim() === '') {
    extracted['acmo_no'] = 'N/A';
  }

  return extracted;
}

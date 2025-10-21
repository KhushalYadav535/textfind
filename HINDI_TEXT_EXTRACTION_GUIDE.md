# Hindi Text Extraction Guide

## Overview
This guide explains how to use the enhanced Hindi text extraction features in the TextFind application.

## What's New

### 1. Automatic Language Detection
- The system now automatically detects Hindi text in PDFs
- Uses specialized OCR settings for better Devanagari script recognition
- Falls back to standard processing if Hindi is not detected

### 2. Enhanced Hindi Processing
- Specialized OCR settings for Hindi characters
- Better handling of Devanagari script
- Improved text cleaning and normalization
- Support for mixed Hindi-English content

### 3. Hindi Text Statistics
- Shows percentage of Hindi characters in extracted text
- Provides confidence scores for Hindi text recognition
- Displays character counts and language analysis

## How to Use

### Method 1: Automatic Detection (Recommended)
```javascript
import { processPDF } from './utils/pdfProcessor.js';

const result = await processPDF(pdfFile, {
  autoDetectLanguage: true, // Automatically detect Hindi
  maxPages: 10,
  progressCallback: (status) => {
    console.log('Processing:', status.message);
  }
});
```

### Method 2: Force Hindi Processing
```javascript
import { processPDFWithHindi } from './utils/hindiTextProcessor.js';

const result = await processPDFWithHindi(pdfFile, {
  maxPages: 10,
  useHindiOnly: false, // Allow mixed Hindi-English
  progressCallback: (status) => {
    console.log('Processing:', status.message);
  }
});
```

### Method 3: Test Interface
1. Go to the Test page in the application
2. Click on "Hindi Text Test" tab
3. Upload your Hindi PDF
4. Test both standard and Hindi methods
5. Compare results

## Features

### Language Detection
- Automatically detects Hindi characters in PDFs
- Uses Unicode range U+0900-U+097F for Hindi detection
- Provides statistics about Hindi content percentage

### OCR Settings for Hindi
- Optimized character whitelist for Devanagari script
- Enhanced page segmentation for Hindi text
- Better handling of Hindi ligatures and conjuncts
- Improved spacing and line breaks

### Text Cleaning
- Removes common OCR errors in Hindi text
- Normalizes spacing and formatting
- Handles mixed Hindi-English content
- Preserves proper Devanagari character forms

## Troubleshooting

### If Hindi Text is Not Detected
1. Check if the PDF contains actual Hindi characters
2. Try the "Hindi Text Test" interface to compare methods
3. Ensure the PDF is not password-protected
4. Check if the text is embedded as images (scanned PDF)

### If OCR Quality is Poor
1. Use higher resolution PDFs when possible
2. Ensure good contrast between text and background
3. Try the specialized Hindi method instead of standard
4. Check if the PDF has clear, readable Hindi text

### Common Issues
- **Garbled Text**: Usually indicates the PDF is scanned or has encoding issues
- **Missing Characters**: May need to adjust OCR settings or use specialized method
- **Poor Recognition**: Try different processing methods or check PDF quality

## Technical Details

### Supported Languages
- Hindi (hin)
- English (eng)
- Mixed Hindi-English content

### OCR Engine
- Uses Tesseract.js with Hindi language pack
- Enhanced settings for Devanagari script
- Optimized for both printed and handwritten Hindi text

### Performance
- Automatic language detection adds minimal overhead
- Specialized Hindi processing may take slightly longer
- Results include confidence scores and statistics

## Examples

### Basic Usage
```javascript
// Automatic detection
const result = await processPDF(file, { autoDetectLanguage: true });

// Check if Hindi was detected
if (result.hindiStats && result.hindiStats.hindiPercentage > 0) {
  console.log('Hindi text detected:', result.hindiStats.hindiPercentage + '%');
}
```

### Advanced Usage
```javascript
// Force Hindi processing with custom settings
const result = await processPDFWithHindi(file, {
  maxPages: 5,
  useHindiOnly: true, // Hindi only, no English
  progressCallback: (status) => {
    if (status.status === 'hindi_detected') {
      console.log('Hindi text detected, using specialized processing');
    }
  }
});
```

## Best Practices

1. **Use Automatic Detection**: Let the system detect Hindi automatically
2. **Test Different Methods**: Use the test interface to compare results
3. **Check PDF Quality**: Ensure good resolution and contrast
4. **Handle Mixed Content**: Use mixed language settings for Hindi-English documents
5. **Monitor Progress**: Use progress callbacks for better user experience

## Support

If you encounter issues with Hindi text extraction:
1. Check the test interface for debugging
2. Verify PDF file quality and format
3. Try different processing methods
4. Check browser console for error messages

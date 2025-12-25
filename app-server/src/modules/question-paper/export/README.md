# Question Paper PDF Export

## Overview

This module exports question papers to PDF format using Pandoc with a CSS-based rendering approach. The system uses `wkhtmltopdf` as the PDF engine, which renders HTML with CSS just like a web browser would.

## Architecture

### How It Works

1. **HTML Generation**: The `PdfExportStrategy` converts the question paper data into clean, semantic HTML
2. **CSS Styling**: A custom CSS file (`question-paper.css`) provides all styling rules
3. **PDF Rendering**: Pandoc passes the HTML and CSS to `wkhtmltopdf`, which renders and generates the PDF

### Key Components

- **`pdf-export.strategy.ts`**: Main export strategy that orchestrates the conversion
- **`question-paper.css`**: Custom stylesheet with print-optimized CSS rules
- **Pandoc + wkhtmltopdf**: External tools that handle the actual PDF generation

## Prerequisites

### Installing wkhtmltopdf

The PDF export requires `wkhtmltopdf` to be installed on your system.

#### macOS

```bash
brew install wkhtmltopdf
```

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install wkhtmltopdf
```

#### Windows

Download from: https://wkhtmltopdf.org/downloads.html

### Installing Pandoc

```bash
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt-get install pandoc

# Windows (using Chocolatey)
choco install pandoc
```

## CSS Features

The `question-paper.css` file includes:

### Page Configuration

- **A4 paper size** with 0.5-inch margins
- **@page rules** for consistent page layout
- **Page break control** to keep questions intact

### Layout Structure

- **Tabular format** for questions with proper borders
- **Responsive columns** for Serial Number (8%), Question (82%), and Marks (10%)
- **Semantic HTML classes** for easy styling

### Print Optimization

- **Page-break-inside: avoid** on question rows to prevent splitting
- **Page-break-after: avoid** on headers and important elements
- **Color preservation** with print-color-adjust rules

### Content Styling

- **Question images** with max dimensions and borders
- **Options** with proper indentation and labels
- **Subquestions** with nested structure
- **Code blocks** with monospace font and backgrounds

## Usage

The export is automatically used when calling the question paper export endpoint:

```typescript
// Example usage in controller
@Get(':id/export')
async export(@Param('id') id: string) {
  return this.questionPaperService.export(id, 'pdf');
}
```

## Customization

### Modifying Page Layout

Edit `question-paper.css` to change the page configuration:

```css
@page {
  size: Letter; /* Change to US Letter size */
  margin: 1in; /* Increase margins */
}
```

### Adjusting Table Styling

Modify column widths in the CSS:

```css
.col-slno {
  width: 10%; /* Make serial number column wider */
}
```

### Custom Fonts

Add custom fonts to the body style:

```css
body {
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
}
```

## Alternative PDF Engines

While we use `wkhtmltopdf`, you can also use `weasyprint`:

### Installing WeasyPrint

```bash
# macOS
brew install python
pip3 install weasyprint

# Ubuntu/Debian
sudo apt-get install python3-pip
pip3 install weasyprint
```

### Switching to WeasyPrint

Modify the `convertWithPandoc` method:

```typescript
const pandoc = spawn('pandoc', [
  '-f',
  'html',
  '-o',
  '-',
  '--pdf-engine=weasyprint',
  `--css=${cssPath}`,
]);
```

## Troubleshooting

### PDF Generation Fails

1. **Check wkhtmltopdf installation**:

   ```bash
   which wkhtmltopdf
   wkhtmltopdf --version
   ```

2. **Check Pandoc installation**:

   ```bash
   which pandoc
   pandoc --version
   ```

3. **Verify CSS file path**:
   Ensure `question-paper.css` exists in the export directory

### Images Not Showing

- Ensure image URLs are accessible (not localhost URLs in production)
- Check that the `MediaService.getDownloadUrl()` returns valid URLs
- Verify image permissions and CORS settings

### Page Breaks Issues

- Adjust `page-break-inside: avoid` rules in CSS
- Test with different content lengths
- Consider using `page-break-before: always` for specific sections

### Styling Not Applied

- Verify CSS path is correct
- Check that `--css` flag is properly passed to Pandoc
- Ensure HTML classes match those in the CSS file

## Performance Considerations

- **Image Optimization**: Large images may slow down PDF generation
- **Concurrent Exports**: Consider using a queue for multiple simultaneous exports
- **Caching**: Cache generated PDFs if the same paper is exported frequently

## Future Enhancements

- [ ] Support for multiple page templates
- [ ] Configurable page headers and footers
- [ ] Watermark support
- [ ] Multiple column layouts for different question types
- [ ] Custom themes via configuration

# FontAwesome SVG Downloader

Download FontAwesome SVG icons (Pro or Free) via Puppeteer, with login support.  
Supports saving to disk or returning SVGs as strings, with optional color customization.

## Features

- Download SVG icons from FontAwesome (Pro or Free)
- Automates login for Pro accounts
- Save SVGs to disk or return as strings
- Optionally apply custom colors to icons

## Requirements

- Node.js >= 18
- FontAwesome account (for Pro icons)
- Chrome/Chromium (handled by Puppeteer)

## Installation

```bash
npm install
```

## Usage

```javascript
import { downloadFontAwesomeIcons } from "./fontawesome-svg-downloader/index.js";

const email = "your-fontawesome-email";
const password = "your-fontawesome-password";
const icons = [
  { name: "user", style: "solid", version: 6, color: "#FF0000" },
  { name: "star", style: "regular", version: 6 }
];

const options = {
  outputDir: "./svgs",      // Directory to save SVGs
  returnSvgs: false         // Set true to get SVGs as strings
};

await downloadFontAwesomeIcons(email, password, icons, options);
```

## Parameters

- `email` (string): FontAwesome account email
- `password` (string): FontAwesome account password
- `icons` (array): List of icons `{ name, style, version, color? }`
- `options` (object):
  - `outputDir` (string): Directory to save SVGs
  - `returnSvgs` (boolean): If true, returns SVGs as strings

## Example

```javascript
const icons = [
  { name: "user", style: "solid", version: 6, color: "#00FF00" },
  { name: "star", style: "regular", version: 6 }
];
```

## How to Contribute

Contributions are welcome!  
You can help by improving documentation, fixing bugs, adding features, or suggesting enhancements.

- **Bug Reports:** Please open an issue describing the problem and steps to reproduce.
- **Feature Requests:** Suggest new features or improvements via issues or pull requests.
- **Documentation:** Help improve or clarify the README and code comments.
- **Code Contributions:** Fork the repo, make your changes, and submit a pull request.

All contributions, big or small, are appreciated!

## License

MIT

## Author

Robert Bjørnstjerne Skaar  
[GitHub](https://github.com/robskaar)

## Contributors

See [`package.json`](./package.json) for contributors.

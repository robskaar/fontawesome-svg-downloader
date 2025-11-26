import puppeteer from "puppeteer";
import fs from "fs-extra";
import path from "path";

function applyColorToSVG(svgContent, color) {
  // Replace all fill attributes
  let replaced = svgContent;
  replaced = replaced.replace(/fill="#[0-9a-fA-F]{3,8}"/g, `fill="${color}"`);
  replaced = replaced.replace(/fill="currentColor"/g, `fill="${color}"`);
  // Add fill if missing in <path>
  replaced = replaced.replace(/<path((?!fill=)[^>]*)(\/?)>/g, `<path$1 fill="${color}"$2>`);
  return replaced;
}

/**
 * Download or fetch FontAwesome SVG icons (Pro or Free)
 * @param {string} email - FontAwesome account email
 * @param {string} password - FontAwesome account password
 * @param {Array<{name: string, style: string, version: string|number, color:string|undefined}>} icons - List of icons
 * @param {Object} options - Options
 * @param {string} [options.outputDir] - Directory to save SVGs (if not returning)
 * @param {boolean} [options.returnSvgs] - If true, returns SVGs as strings instead of saving
 * @returns {Promise<Array<{name: string, style: string, version: string|number, svg: string}>>|Promise<void>}
 */
export async function downloadFontAwesomeIcons(
  email,
  password,
  icons,
  options = {}
) {
  const outputDir = options.outputDir;
  const returnSvgs = !!options.returnSvgs;
  if (outputDir !== undefined) await fs.ensureDir(outputDir);
  const downloadsPath = path.join(
    process.env.USERPROFILE || process.env.HOME,
    "Downloads"
  );
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1200,800"],
    defaultViewport: null,
  });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadsPath,
  });

  // Open first icon URL and login if needed
  const firstIcon = icons[0];
  const firstUrl = `https://fontawesome.com/v${firstIcon.version}/icons/${firstIcon.name}?f=classic&s=${firstIcon.style}`;
  await page.goto(firstUrl, { waitUntil: "networkidle2" });
  const signInBtn = await page.$('a[aria-label="Sign In"]');
  if (signInBtn) {
    await signInBtn.click();
    await page.waitForSelector('input[name="email_address"]', {
      timeout: 10000,
    });
    await page.type('input[name="email_address"]', email, { delay: 50 });
    await page.type('input[name="password"]', password, { delay: 50 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await page.goto(firstUrl, { waitUntil: "networkidle2" });
  }

  const results = [];
  for (const icon of icons) {
    const url = `https://fontawesome.com/v${icon.version}/icons/${icon.name}?f=classic&s=${icon.style}`;
    await page.goto(url, { waitUntil: "networkidle2" });
    try {
      await page.waitForSelector("button.icon-action-download-svg", {
        timeout: 5000,
      });
      const beforeFiles = await fs.readdir(downloadsPath);
      await page.click("button.icon-action-download-svg");
      let svgFile = null;
      for (let i = 0; i < 20; i++) {
        await new Promise((res) => setTimeout(res, 500));
        const afterFiles = await fs.readdir(downloadsPath);
        const newFiles = afterFiles.filter(
          (f) => f.endsWith(".svg") && !beforeFiles.includes(f)
        );
        if (newFiles.length > 0) {
          svgFile = newFiles[0];
          break;
        }
      }
      if (!svgFile) throw new Error("SVG file not found in downloads");
      const srcPath = path.join(downloadsPath, svgFile);
      const destName = `${icon.name}-${icon.style}-v${icon.version}.svg`;
      const destPath = outputDir ? path.join(outputDir, destName) : undefined;
      let svgContent = await fs.readFile(srcPath, "utf8");
      // Apply color(s) if provided
      if (icon.color) {
        svgContent = applyColorToSVG(svgContent, icon.color);
      }
      if (outputDir !== undefined) {
        await fs.move(srcPath, destPath, { overwrite: true });
        await fs.writeFile(destPath, svgContent, "utf8");
      }
      results.push({
        name: icon.name,
        style: icon.style,
        version: icon.version,
        svg: svgContent,
      });
    } catch (err) {
      console.error(
        `Failed: ${icon.name} (${icon.style}) v${icon.version}:`,
        err.message
      );
    }
  }
  await browser.close();
  if (returnSvgs) return results;
}

// Hides cookie banners, chat widgets and the prototype label so screenshots
// compare only the header and footer. This changes nothing but the test's own
// page; no consent choice is made.
export async function hideOverlays(page) {
  await page.addStyleTag({
    content: `
      #transcend-consent-manager, [id*="consent" i], [class*="consent" i],
      #intercom-container, .intercom-lightweight-app, .intercom-namespace, iframe[name^="intercom"],
      [class*="hs-web-interactives"], .t-proto { display: none !important; }
      *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
    `,
  });
}

// TEMPORARY route verification entry - built with `vite build --ssr` and deleted after the run.
import { renderToString } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { NAV_LINKS, ROUTES } from "./src/constants/routes.js";
import { routes } from "./src/routes/index.jsx";

const cases = [
  [ROUTES.HOME, ["Community Forum", "Explore Discussions", "Backend Status"]],
  [ROUTES.LOGIN, ["Login Page"]],
  [ROUTES.REGISTER, ["Register Page"]],
  [ROUTES.DISCUSSIONS, ["Discussions Page"]],
  [ROUTES.CATEGORIES, ["Categories Page"]],
  [ROUTES.PROFILE, ["Profile Page"]],
  [ROUTES.MODERATION, ["Moderation Page"]],
  [ROUTES.ADMIN, ["Admin Page"]],
  ["/definitely-not-a-route", ["Page not found"]],
];

let failures = 0;

for (const [routePath, expected] of cases) {
  const router = createMemoryRouter(routes, { initialEntries: [routePath] });
  const html = renderToString(<RouterProvider router={router} />);

  const missing = expected.filter((text) => !html.includes(text));
  const missingNav = NAV_LINKS.filter((link) => !html.includes(`href="${link.to}"`)).map(
    (link) => link.label,
  );

  const ok = missing.length === 0 && missingNav.length === 0;
  if (!ok) {
    failures += 1;
  }

  console.log(
    `${ok ? "PASS" : "FAIL"}  ${routePath.padEnd(24)}${missing.length ? ` missing=${missing}` : ""}${
      missingNav.length ? ` missingNav=${missingNav}` : ""
    }`,
  );
}

const homeRouter = createMemoryRouter(routes, { initialEntries: [ROUTES.HOME] });
const homeHtml = renderToString(<RouterProvider router={homeRouter} />);
const missingClasses = ["min-h-screen", "max-w-5xl", "border-slate-200", "bg-slate-900"].filter(
  (cls) => !homeHtml.includes(cls),
);

console.log(
  `\nLayout/Tailwind classes in home markup: ${missingClasses.length === 0 ? "PASS" : `FAIL missing=${missingClasses}`}`,
);
console.log(`Navbar links rendered on every page: ${NAV_LINKS.length}`);

if (failures > 0 || missingClasses.length > 0) {
  console.log(`\nRESULT: FAILED (${failures} route(s))`);
  process.exit(1);
}

console.log(`\nRESULT: all ${cases.length} routes rendered correctly`);

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { About } from "../src/components/About";
const dest = resolve(process.cwd(), "../growth/authors");
mkdirSync(dest, { recursive: true });
const markup = renderToStaticMarkup(
  React.createElement(About, {
    illustrationSrc:
      "../../app/public/reference/daniel-mercer-editorial-v1.png",
    linkPrefix: "https://visionarytalks.com",
  }),
);
writeFileSync(
  resolve(dest, "about-preview.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>About Us — Visionary Talks</title><link rel="stylesheet" href="../../app/src/styles/reference.css"><link rel="stylesheet" href="../../app/src/styles/production.css"><link rel="stylesheet" href="../../app/src/styles/about.css"></head><body><header class="site-header page-width" id="top"><a class="skip-link" href="#main">Skip to content</a><div class="utility"><span>A MAGAZINE FOR THE BUSINESS CURIOUS</span><span class="date">BUSINESS, EXPLAINED.</span><a href="#contact">Contact ↗</a></div><div class="masthead"><a href="https://visionarytalks.com/" class="wordmark">VISIONARY<span> TALKS</span></a><p>Companies. Money. Careers.</p></div><nav class="main-nav" aria-label="Publication"><a href="https://visionarytalks.com/category/ownership/">Who owns</a><a href="https://visionarytalks.com/category/business/">Business</a><a href="https://visionarytalks.com/category/careers/">Careers</a><a href="https://visionarytalks.com/category/people/">People</a><a href="#research">Our research</a><a href="#contact">Contact</a></nav></header><main id="main" class="page-width">' +
    markup +
    '</main><footer class="footer"><div class="page-width"><div class="footer-bottom"><span>Visionary Talks · About the publication</span><a href="#top">Back to top ↑</a></div></div></footer></body></html>',
);
console.log("About preview prepared from the actual React component.");

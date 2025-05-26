import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import { shikiPlugin } from "@vuepress/plugin-shiki";
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import fs from "node:fs";

const dirpath = "docs/lesson";
const files = fs.readdirSync(dirpath);

/** @type import("@vuepress/theme-default").SidebarOptions */
const sidebar = {
  "/lesson/": files,
};

export default defineUserConfig({
  base: "/spring-framework-lesson/",
  lang: "ja",

  title: "Spring Framework講座",
  description: "Spring Frameworkを基礎から学ぶ講座です。",

  theme: defaultTheme({
    logo: "images/school_128dp_1F1F1F_FILL0_wght400_GRAD0_opsz48.svg",

    navbar: ["/"],

    sidebar: sidebar,

    themePlugins: {
      prismjs: false,
    },
  }),

  bundler: viteBundler(),

  head: [["link", { rel: "icon", href: "images/favicon.png" }]],

  plugins: [
    shikiPlugin({
      theme: "github-light",
      themes: { light: "github-light", dark: "github-dark" },
    }),
    mdEnhancePlugin({
      plantuml: true,
    }),
  ],
});

import { mountApp } from "./app.js";
import { mountLetterSection } from "./letter-section.js";

const app = mountApp(document.getElementById("app"));
mountLetterSection(document.getElementById("letter-mount"), app);

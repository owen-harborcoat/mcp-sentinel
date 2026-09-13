# Browser feature seams

This directory has no application UI yet.

Feature A owns index.html, app.js, style.css and monitor.js. Feature B owns lab.js
and lab.css. A's app.js imports mountLab from ./lab.js after both features merge;
B exports mountLab(root, {apiBase, onChange}) and scopes all CSS under .lab.

Both modules are full-stack feature surfaces. Use ordinary browser ES modules;
no build system is needed. A mounts #monitor-root and B mounts #lab-root.
Never render tool descriptions or arguments through innerHTML.

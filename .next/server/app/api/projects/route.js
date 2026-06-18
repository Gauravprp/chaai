/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/projects/route";
exports.ids = ["app/api/projects/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fprojects%2Froute&page=%2Fapi%2Fprojects%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprojects%2Froute.js&appDir=C%3A%5Cchaai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cchaai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fprojects%2Froute&page=%2Fapi%2Fprojects%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprojects%2Froute.js&appDir=C%3A%5Cchaai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cchaai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_chaai_app_api_projects_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/projects/route.js */ \"(rsc)/./app/api/projects/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/projects/route\",\n        pathname: \"/api/projects\",\n        filename: \"route\",\n        bundlePath: \"app/api/projects/route\"\n    },\n    resolvedPagePath: \"C:\\\\chaai\\\\app\\\\api\\\\projects\\\\route.js\",\n    nextConfigOutput,\n    userland: C_chaai_app_api_projects_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZwcm9qZWN0cyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGcHJvamVjdHMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZwcm9qZWN0cyUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDY2hhYWklNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNjaGFhaSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDVDtBQUNwRTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcY2hhYWlcXFxcYXBwXFxcXGFwaVxcXFxwcm9qZWN0c1xcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcHJvamVjdHMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9wcm9qZWN0c1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvcHJvamVjdHMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxjaGFhaVxcXFxhcHBcXFxcYXBpXFxcXHByb2plY3RzXFxcXHJvdXRlLmpzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fprojects%2Froute&page=%2Fapi%2Fprojects%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprojects%2Froute.js&appDir=C%3A%5Cchaai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cchaai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./app/api/projects/route.js":
/*!***********************************!*\
  !*** ./app/api/projects/route.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\nasync function GET(req) {\n    try {\n        const { searchParams } = new URL(req.url);\n        const companyId = searchParams.get('companyId') || '1';\n        const employeeId = searchParams.get('employeeId');\n        let cleanEmployeeId = employeeId;\n        if (employeeId && employeeId.includes('-')) {\n            const parts = employeeId.split('-');\n            if (parts[1] === '0000' && parts[2] === '0000' && parts[3] === '0000') {\n                const match = parts[0].match(/^([1-9][0-9]*|0)0*$/);\n                if (match) {\n                    cleanEmployeeId = match[1];\n                }\n            }\n        }\n        let url = `https://api.dyzo.ai/project/company/${companyId}/`;\n        if (cleanEmployeeId && cleanEmployeeId !== 'undefined' && cleanEmployeeId !== 'null') {\n            url = `https://api.dyzo.ai/project/company/${companyId}/${cleanEmployeeId}/`;\n        }\n        const response = await fetch(url, {\n            method: 'GET',\n            headers: {\n                'Content-Type': 'application/json',\n                'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v'\n            }\n        });\n        if (!response.ok) {\n            throw new Error(`Dyzo projects fetch responded with status: ${response.status}`);\n        }\n        const data = await response.json();\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data);\n    } catch (err) {\n        console.error(\"Proxy error fetching projects:\", err.message);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            status: 0,\n            error: err.message\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3Byb2plY3RzL3JvdXRlLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQTJDO0FBRXBDLGVBQWVDLElBQUlDLEdBQUc7SUFDM0IsSUFBSTtRQUNGLE1BQU0sRUFBRUMsWUFBWSxFQUFFLEdBQUcsSUFBSUMsSUFBSUYsSUFBSUcsR0FBRztRQUN4QyxNQUFNQyxZQUFZSCxhQUFhSSxHQUFHLENBQUMsZ0JBQWdCO1FBQ25ELE1BQU1DLGFBQWFMLGFBQWFJLEdBQUcsQ0FBQztRQUVwQyxJQUFJRSxrQkFBa0JEO1FBQ3RCLElBQUlBLGNBQWNBLFdBQVdFLFFBQVEsQ0FBQyxNQUFNO1lBQzFDLE1BQU1DLFFBQVFILFdBQVdJLEtBQUssQ0FBQztZQUMvQixJQUFJRCxLQUFLLENBQUMsRUFBRSxLQUFLLFVBQVVBLEtBQUssQ0FBQyxFQUFFLEtBQUssVUFBVUEsS0FBSyxDQUFDLEVBQUUsS0FBSyxRQUFRO2dCQUNyRSxNQUFNRSxRQUFRRixLQUFLLENBQUMsRUFBRSxDQUFDRSxLQUFLLENBQUM7Z0JBQzdCLElBQUlBLE9BQU87b0JBQ1RKLGtCQUFrQkksS0FBSyxDQUFDLEVBQUU7Z0JBQzVCO1lBQ0Y7UUFDRjtRQUVBLElBQUlSLE1BQU0sQ0FBQyxvQ0FBb0MsRUFBRUMsVUFBVSxDQUFDLENBQUM7UUFDN0QsSUFBSUcsbUJBQW1CQSxvQkFBb0IsZUFBZUEsb0JBQW9CLFFBQVE7WUFDcEZKLE1BQU0sQ0FBQyxvQ0FBb0MsRUFBRUMsVUFBVSxDQUFDLEVBQUVHLGdCQUFnQixDQUFDLENBQUM7UUFDOUU7UUFFQSxNQUFNSyxXQUFXLE1BQU1DLE1BQU1WLEtBQUs7WUFDaENXLFFBQVE7WUFDUkMsU0FBUztnQkFDUCxnQkFBZ0I7Z0JBQ2hCLGFBQWE7WUFDZjtRQUNGO1FBRUEsSUFBSSxDQUFDSCxTQUFTSSxFQUFFLEVBQUU7WUFDaEIsTUFBTSxJQUFJQyxNQUFNLENBQUMsMkNBQTJDLEVBQUVMLFNBQVNNLE1BQU0sRUFBRTtRQUNqRjtRQUVBLE1BQU1DLE9BQU8sTUFBTVAsU0FBU1EsSUFBSTtRQUNoQyxPQUFPdEIscURBQVlBLENBQUNzQixJQUFJLENBQUNEO0lBQzNCLEVBQUUsT0FBT0UsS0FBSztRQUNaQyxRQUFRQyxLQUFLLENBQUMsa0NBQWtDRixJQUFJRyxPQUFPO1FBQzNELE9BQU8xQixxREFBWUEsQ0FBQ3NCLElBQUksQ0FBQztZQUFFRixRQUFRO1lBQUdLLE9BQU9GLElBQUlHLE9BQU87UUFBQyxHQUFHO1lBQUVOLFFBQVE7UUFBSTtJQUM1RTtBQUNGIiwic291cmNlcyI6WyJDOlxcY2hhYWlcXGFwcFxcYXBpXFxwcm9qZWN0c1xccm91dGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcSkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcS51cmwpO1xuICAgIGNvbnN0IGNvbXBhbnlJZCA9IHNlYXJjaFBhcmFtcy5nZXQoJ2NvbXBhbnlJZCcpIHx8ICcxJztcbiAgICBjb25zdCBlbXBsb3llZUlkID0gc2VhcmNoUGFyYW1zLmdldCgnZW1wbG95ZWVJZCcpO1xuXG4gICAgbGV0IGNsZWFuRW1wbG95ZWVJZCA9IGVtcGxveWVlSWQ7XG4gICAgaWYgKGVtcGxveWVlSWQgJiYgZW1wbG95ZWVJZC5pbmNsdWRlcygnLScpKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGVtcGxveWVlSWQuc3BsaXQoJy0nKTtcbiAgICAgIGlmIChwYXJ0c1sxXSA9PT0gJzAwMDAnICYmIHBhcnRzWzJdID09PSAnMDAwMCcgJiYgcGFydHNbM10gPT09ICcwMDAwJykge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHBhcnRzWzBdLm1hdGNoKC9eKFsxLTldWzAtOV0qfDApMCokLyk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIGNsZWFuRW1wbG95ZWVJZCA9IG1hdGNoWzFdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHVybCA9IGBodHRwczovL2FwaS5keXpvLmFpL3Byb2plY3QvY29tcGFueS8ke2NvbXBhbnlJZH0vYDtcbiAgICBpZiAoY2xlYW5FbXBsb3llZUlkICYmIGNsZWFuRW1wbG95ZWVJZCAhPT0gJ3VuZGVmaW5lZCcgJiYgY2xlYW5FbXBsb3llZUlkICE9PSAnbnVsbCcpIHtcbiAgICAgIHVybCA9IGBodHRwczovL2FwaS5keXpvLmFpL3Byb2plY3QvY29tcGFueS8ke2NvbXBhbnlJZH0vJHtjbGVhbkVtcGxveWVlSWR9L2A7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdYLUFQSS1LZXknOiAnZHl6b19kZXZfOHdjenBqY3Z3eWp6dGM4b216emhoZnAxNzZwOTUwbXdvdnZrcDgwdicsXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYER5em8gcHJvamVjdHMgZmV0Y2ggcmVzcG9uZGVkIHdpdGggc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihkYXRhKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlByb3h5IGVycm9yIGZldGNoaW5nIHByb2plY3RzOlwiLCBlcnIubWVzc2FnZSk7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3RhdHVzOiAwLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsIkdFVCIsInJlcSIsInNlYXJjaFBhcmFtcyIsIlVSTCIsInVybCIsImNvbXBhbnlJZCIsImdldCIsImVtcGxveWVlSWQiLCJjbGVhbkVtcGxveWVlSWQiLCJpbmNsdWRlcyIsInBhcnRzIiwic3BsaXQiLCJtYXRjaCIsInJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwib2siLCJFcnJvciIsInN0YXR1cyIsImRhdGEiLCJqc29uIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwibWVzc2FnZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/projects/route.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fprojects%2Froute&page=%2Fapi%2Fprojects%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprojects%2Froute.js&appDir=C%3A%5Cchaai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cchaai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
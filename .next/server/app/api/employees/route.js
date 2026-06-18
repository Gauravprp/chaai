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
exports.id = "app/api/employees/route";
exports.ids = ["app/api/employees/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Femployees%2Froute&page=%2Fapi%2Femployees%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Femployees%2Froute.js&appDir=C%3A%5Cchaai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cchaai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Femployees%2Froute&page=%2Fapi%2Femployees%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Femployees%2Froute.js&appDir=C%3A%5Cchaai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cchaai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_chaai_app_api_employees_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/employees/route.js */ \"(rsc)/./app/api/employees/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/employees/route\",\n        pathname: \"/api/employees\",\n        filename: \"route\",\n        bundlePath: \"app/api/employees/route\"\n    },\n    resolvedPagePath: \"C:\\\\chaai\\\\app\\\\api\\\\employees\\\\route.js\",\n    nextConfigOutput,\n    userland: C_chaai_app_api_employees_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZlbXBsb3llZXMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmVtcGxveWVlcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmVtcGxveWVlcyUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDY2hhYWklNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNjaGFhaSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDUjtBQUNyRTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcY2hhYWlcXFxcYXBwXFxcXGFwaVxcXFxlbXBsb3llZXNcXFxccm91dGUuanNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2VtcGxveWVlcy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2VtcGxveWVlc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvZW1wbG95ZWVzL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcY2hhYWlcXFxcYXBwXFxcXGFwaVxcXFxlbXBsb3llZXNcXFxccm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Femployees%2Froute&page=%2Fapi%2Femployees%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Femployees%2Froute.js&appDir=C%3A%5Cchaai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cchaai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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

/***/ "(rsc)/./app/api/employees/route.js":
/*!************************************!*\
  !*** ./app/api/employees/route.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n// Server-side proxy to bypass CORS restrictions\nasync function GET(req) {\n    try {\n        const { searchParams } = new URL(req.url);\n        const companyId = searchParams.get('companyId') || '1';\n        const response = await fetch(`https://api.dyzo.ai/employee/list/${companyId}/`, {\n            method: 'GET',\n            headers: {\n                'Content-Type': 'application/json',\n                'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v'\n            }\n        });\n        if (!response.ok) {\n            throw new Error(`Dyzo backend responded with status: ${response.status}`);\n        }\n        const data = await response.json();\n        if (data && typeof data === 'object') {\n            if (Array.isArray(data.employees)) {\n                data.employees = data.employees.filter((emp)=>emp.isActive === true);\n            }\n            if (Array.isArray(data.data)) {\n                data.data = data.data.filter((emp)=>emp.isActive === true);\n            }\n            if (Array.isArray(data.results)) {\n                data.results = data.results.filter((emp)=>emp.isActive === true);\n            }\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data);\n    } catch (err) {\n        console.error(\"Proxy error fetching employees:\", err.message);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            status: 0,\n            error: err.message\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2VtcGxveWVlcy9yb3V0ZS5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUEyQztBQUUzQyxnREFBZ0Q7QUFDekMsZUFBZUMsSUFBSUMsR0FBRztJQUMzQixJQUFJO1FBQ0YsTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBRyxJQUFJQyxJQUFJRixJQUFJRyxHQUFHO1FBQ3hDLE1BQU1DLFlBQVlILGFBQWFJLEdBQUcsQ0FBQyxnQkFBZ0I7UUFFbkQsTUFBTUMsV0FBVyxNQUFNQyxNQUFNLENBQUMsa0NBQWtDLEVBQUVILFVBQVUsQ0FBQyxDQUFDLEVBQUU7WUFDOUVJLFFBQVE7WUFDUkMsU0FBUztnQkFDUCxnQkFBZ0I7Z0JBQ2hCLGFBQWE7WUFDZjtRQUNGO1FBRUEsSUFBSSxDQUFDSCxTQUFTSSxFQUFFLEVBQUU7WUFDaEIsTUFBTSxJQUFJQyxNQUFNLENBQUMsb0NBQW9DLEVBQUVMLFNBQVNNLE1BQU0sRUFBRTtRQUMxRTtRQUVBLE1BQU1DLE9BQU8sTUFBTVAsU0FBU1EsSUFBSTtRQUNoQyxJQUFJRCxRQUFRLE9BQU9BLFNBQVMsVUFBVTtZQUNwQyxJQUFJRSxNQUFNQyxPQUFPLENBQUNILEtBQUtJLFNBQVMsR0FBRztnQkFDakNKLEtBQUtJLFNBQVMsR0FBR0osS0FBS0ksU0FBUyxDQUFDQyxNQUFNLENBQUNDLENBQUFBLE1BQU9BLElBQUlDLFFBQVEsS0FBSztZQUNqRTtZQUNBLElBQUlMLE1BQU1DLE9BQU8sQ0FBQ0gsS0FBS0EsSUFBSSxHQUFHO2dCQUM1QkEsS0FBS0EsSUFBSSxHQUFHQSxLQUFLQSxJQUFJLENBQUNLLE1BQU0sQ0FBQ0MsQ0FBQUEsTUFBT0EsSUFBSUMsUUFBUSxLQUFLO1lBQ3ZEO1lBQ0EsSUFBSUwsTUFBTUMsT0FBTyxDQUFDSCxLQUFLUSxPQUFPLEdBQUc7Z0JBQy9CUixLQUFLUSxPQUFPLEdBQUdSLEtBQUtRLE9BQU8sQ0FBQ0gsTUFBTSxDQUFDQyxDQUFBQSxNQUFPQSxJQUFJQyxRQUFRLEtBQUs7WUFDN0Q7UUFDRjtRQUNBLE9BQU90QixxREFBWUEsQ0FBQ2dCLElBQUksQ0FBQ0Q7SUFDM0IsRUFBRSxPQUFPUyxLQUFLO1FBQ1pDLFFBQVFDLEtBQUssQ0FBQyxtQ0FBbUNGLElBQUlHLE9BQU87UUFDNUQsT0FBTzNCLHFEQUFZQSxDQUFDZ0IsSUFBSSxDQUFDO1lBQUVGLFFBQVE7WUFBR1ksT0FBT0YsSUFBSUcsT0FBTztRQUFDLEdBQUc7WUFBRWIsUUFBUTtRQUFJO0lBQzVFO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxjaGFhaVxcYXBwXFxhcGlcXGVtcGxveWVlc1xccm91dGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuXG4vLyBTZXJ2ZXItc2lkZSBwcm94eSB0byBieXBhc3MgQ09SUyByZXN0cmljdGlvbnNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBzZWFyY2hQYXJhbXMgfSA9IG5ldyBVUkwocmVxLnVybCk7XG4gICAgY29uc3QgY29tcGFueUlkID0gc2VhcmNoUGFyYW1zLmdldCgnY29tcGFueUlkJykgfHwgJzEnO1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZHl6by5haS9lbXBsb3llZS9saXN0LyR7Y29tcGFueUlkfS9gLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnWC1BUEktS2V5JzogJ2R5em9fZGV2Xzh3Y3pwamN2d3lqenRjOG9tenpoaGZwMTc2cDk1MG13b3Z2a3A4MHYnLFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEeXpvIGJhY2tlbmQgcmVzcG9uZGVkIHdpdGggc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIGlmIChkYXRhICYmIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YS5lbXBsb3llZXMpKSB7XG4gICAgICAgIGRhdGEuZW1wbG95ZWVzID0gZGF0YS5lbXBsb3llZXMuZmlsdGVyKGVtcCA9PiBlbXAuaXNBY3RpdmUgPT09IHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YS5kYXRhKSkge1xuICAgICAgICBkYXRhLmRhdGEgPSBkYXRhLmRhdGEuZmlsdGVyKGVtcCA9PiBlbXAuaXNBY3RpdmUgPT09IHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YS5yZXN1bHRzKSkge1xuICAgICAgICBkYXRhLnJlc3VsdHMgPSBkYXRhLnJlc3VsdHMuZmlsdGVyKGVtcCA9PiBlbXAuaXNBY3RpdmUgPT09IHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oZGF0YSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJQcm94eSBlcnJvciBmZXRjaGluZyBlbXBsb3llZXM6XCIsIGVyci5tZXNzYWdlKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdGF0dXM6IDAsIGVycm9yOiBlcnIubWVzc2FnZSB9LCB7IHN0YXR1czogNTAwIH0pO1xuICB9XG59XG5cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJHRVQiLCJyZXEiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJ1cmwiLCJjb21wYW55SWQiLCJnZXQiLCJyZXNwb25zZSIsImZldGNoIiwibWV0aG9kIiwiaGVhZGVycyIsIm9rIiwiRXJyb3IiLCJzdGF0dXMiLCJkYXRhIiwianNvbiIsIkFycmF5IiwiaXNBcnJheSIsImVtcGxveWVlcyIsImZpbHRlciIsImVtcCIsImlzQWN0aXZlIiwicmVzdWx0cyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsIm1lc3NhZ2UiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/employees/route.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Femployees%2Froute&page=%2Fapi%2Femployees%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Femployees%2Froute.js&appDir=C%3A%5Cchaai%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cchaai&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
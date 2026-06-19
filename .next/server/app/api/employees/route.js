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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n// Server-side proxy to bypass CORS restrictions\nasync function GET(req) {\n    try {\n        const { searchParams } = new URL(req.url);\n        const companyId = searchParams.get('companyId') || '1';\n        const response = await fetch(`https://api.dyzo.ai/employee/list/${companyId}/`, {\n            method: 'GET',\n            headers: {\n                'Content-Type': 'application/json',\n                'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v'\n            }\n        });\n        if (!response.ok) {\n            throw new Error(`Dyzo backend responded with status: ${response.status}`);\n        }\n        const data = await response.json();\n        if (data && typeof data === 'object') {\n            if (Array.isArray(data.employees)) {\n                data.employees = data.employees.filter((emp)=>emp.isActive === true);\n            }\n            if (Array.isArray(data.data)) {\n                data.data = data.data.filter((emp)=>emp.isActive === true);\n            }\n            if (Array.isArray(data.results)) {\n                data.results = data.results.filter((emp)=>emp.isActive === true);\n            }\n            const prefixImage = (emp)=>{\n                const field = emp.profile_picture ? 'profile_picture' : emp.profile_pic ? 'profile_pic' : emp.profilePicture ? 'profilePicture' : null;\n                if (field && emp[field] && typeof emp[field] === 'string' && !emp[field].startsWith('http')) {\n                    emp[field] = `https://api.dyzo.ai${emp[field].startsWith('/') ? '' : '/'}${emp[field]}`;\n                }\n                return emp;\n            };\n            if (Array.isArray(data.employees)) data.employees.map(prefixImage);\n            if (Array.isArray(data.data)) data.data.map(prefixImage);\n            if (Array.isArray(data.results)) data.results.map(prefixImage);\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data);\n    } catch (err) {\n        console.error(\"Proxy error fetching employees:\", err.message);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            status: 0,\n            error: err.message\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2VtcGxveWVlcy9yb3V0ZS5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUEyQztBQUUzQyxnREFBZ0Q7QUFDekMsZUFBZUMsSUFBSUMsR0FBRztJQUMzQixJQUFJO1FBQ0YsTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBRyxJQUFJQyxJQUFJRixJQUFJRyxHQUFHO1FBQ3hDLE1BQU1DLFlBQVlILGFBQWFJLEdBQUcsQ0FBQyxnQkFBZ0I7UUFFbkQsTUFBTUMsV0FBVyxNQUFNQyxNQUFNLENBQUMsa0NBQWtDLEVBQUVILFVBQVUsQ0FBQyxDQUFDLEVBQUU7WUFDOUVJLFFBQVE7WUFDUkMsU0FBUztnQkFDUCxnQkFBZ0I7Z0JBQ2hCLGFBQWE7WUFDZjtRQUNGO1FBRUEsSUFBSSxDQUFDSCxTQUFTSSxFQUFFLEVBQUU7WUFDaEIsTUFBTSxJQUFJQyxNQUFNLENBQUMsb0NBQW9DLEVBQUVMLFNBQVNNLE1BQU0sRUFBRTtRQUMxRTtRQUVBLE1BQU1DLE9BQU8sTUFBTVAsU0FBU1EsSUFBSTtRQUNoQyxJQUFJRCxRQUFRLE9BQU9BLFNBQVMsVUFBVTtZQUNwQyxJQUFJRSxNQUFNQyxPQUFPLENBQUNILEtBQUtJLFNBQVMsR0FBRztnQkFDakNKLEtBQUtJLFNBQVMsR0FBR0osS0FBS0ksU0FBUyxDQUFDQyxNQUFNLENBQUNDLENBQUFBLE1BQU9BLElBQUlDLFFBQVEsS0FBSztZQUNqRTtZQUNBLElBQUlMLE1BQU1DLE9BQU8sQ0FBQ0gsS0FBS0EsSUFBSSxHQUFHO2dCQUM1QkEsS0FBS0EsSUFBSSxHQUFHQSxLQUFLQSxJQUFJLENBQUNLLE1BQU0sQ0FBQ0MsQ0FBQUEsTUFBT0EsSUFBSUMsUUFBUSxLQUFLO1lBQ3ZEO1lBQ0EsSUFBSUwsTUFBTUMsT0FBTyxDQUFDSCxLQUFLUSxPQUFPLEdBQUc7Z0JBQy9CUixLQUFLUSxPQUFPLEdBQUdSLEtBQUtRLE9BQU8sQ0FBQ0gsTUFBTSxDQUFDQyxDQUFBQSxNQUFPQSxJQUFJQyxRQUFRLEtBQUs7WUFDN0Q7WUFDQSxNQUFNRSxjQUFjLENBQUNIO2dCQUNuQixNQUFNSSxRQUFRSixJQUFJSyxlQUFlLEdBQUcsb0JBQXFCTCxJQUFJTSxXQUFXLEdBQUcsZ0JBQWlCTixJQUFJTyxjQUFjLEdBQUcsbUJBQW1CO2dCQUNwSSxJQUFJSCxTQUFTSixHQUFHLENBQUNJLE1BQU0sSUFBSSxPQUFPSixHQUFHLENBQUNJLE1BQU0sS0FBSyxZQUFZLENBQUNKLEdBQUcsQ0FBQ0ksTUFBTSxDQUFDSSxVQUFVLENBQUMsU0FBUztvQkFDM0ZSLEdBQUcsQ0FBQ0ksTUFBTSxHQUFHLENBQUMsbUJBQW1CLEVBQUVKLEdBQUcsQ0FBQ0ksTUFBTSxDQUFDSSxVQUFVLENBQUMsT0FBTyxLQUFLLE1BQU1SLEdBQUcsQ0FBQ0ksTUFBTSxFQUFFO2dCQUN6RjtnQkFDQSxPQUFPSjtZQUNUO1lBQ0EsSUFBSUosTUFBTUMsT0FBTyxDQUFDSCxLQUFLSSxTQUFTLEdBQUdKLEtBQUtJLFNBQVMsQ0FBQ1csR0FBRyxDQUFDTjtZQUN0RCxJQUFJUCxNQUFNQyxPQUFPLENBQUNILEtBQUtBLElBQUksR0FBR0EsS0FBS0EsSUFBSSxDQUFDZSxHQUFHLENBQUNOO1lBQzVDLElBQUlQLE1BQU1DLE9BQU8sQ0FBQ0gsS0FBS1EsT0FBTyxHQUFHUixLQUFLUSxPQUFPLENBQUNPLEdBQUcsQ0FBQ047UUFDcEQ7UUFDQSxPQUFPeEIscURBQVlBLENBQUNnQixJQUFJLENBQUNEO0lBQzNCLEVBQUUsT0FBT2dCLEtBQUs7UUFDWkMsUUFBUUMsS0FBSyxDQUFDLG1DQUFtQ0YsSUFBSUcsT0FBTztRQUM1RCxPQUFPbEMscURBQVlBLENBQUNnQixJQUFJLENBQUM7WUFBRUYsUUFBUTtZQUFHbUIsT0FBT0YsSUFBSUcsT0FBTztRQUFDLEdBQUc7WUFBRXBCLFFBQVE7UUFBSTtJQUM1RTtBQUNGIiwic291cmNlcyI6WyJDOlxcY2hhYWlcXGFwcFxcYXBpXFxlbXBsb3llZXNcXHJvdXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcblxuLy8gU2VydmVyLXNpZGUgcHJveHkgdG8gYnlwYXNzIENPUlMgcmVzdHJpY3Rpb25zXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcSkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcS51cmwpO1xuICAgIGNvbnN0IGNvbXBhbnlJZCA9IHNlYXJjaFBhcmFtcy5nZXQoJ2NvbXBhbnlJZCcpIHx8ICcxJztcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmR5em8uYWkvZW1wbG95ZWUvbGlzdC8ke2NvbXBhbnlJZH0vYCwge1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ1gtQVBJLUtleSc6ICdkeXpvX2Rldl84d2N6cGpjdnd5anp0YzhvbXp6aGhmcDE3NnA5NTBtd292dmtwODB2JyxcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRHl6byBiYWNrZW5kIHJlc3BvbmRlZCB3aXRoIHN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICBpZiAoZGF0YSAmJiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEuZW1wbG95ZWVzKSkge1xuICAgICAgICBkYXRhLmVtcGxveWVlcyA9IGRhdGEuZW1wbG95ZWVzLmZpbHRlcihlbXAgPT4gZW1wLmlzQWN0aXZlID09PSB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEuZGF0YSkpIHtcbiAgICAgICAgZGF0YS5kYXRhID0gZGF0YS5kYXRhLmZpbHRlcihlbXAgPT4gZW1wLmlzQWN0aXZlID09PSB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEucmVzdWx0cykpIHtcbiAgICAgICAgZGF0YS5yZXN1bHRzID0gZGF0YS5yZXN1bHRzLmZpbHRlcihlbXAgPT4gZW1wLmlzQWN0aXZlID09PSB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByZWZpeEltYWdlID0gKGVtcCkgPT4ge1xuICAgICAgICBjb25zdCBmaWVsZCA9IGVtcC5wcm9maWxlX3BpY3R1cmUgPyAncHJvZmlsZV9waWN0dXJlJyA6IChlbXAucHJvZmlsZV9waWMgPyAncHJvZmlsZV9waWMnIDogKGVtcC5wcm9maWxlUGljdHVyZSA/ICdwcm9maWxlUGljdHVyZScgOiBudWxsKSk7XG4gICAgICAgIGlmIChmaWVsZCAmJiBlbXBbZmllbGRdICYmIHR5cGVvZiBlbXBbZmllbGRdID09PSAnc3RyaW5nJyAmJiAhZW1wW2ZpZWxkXS5zdGFydHNXaXRoKCdodHRwJykpIHtcbiAgICAgICAgICBlbXBbZmllbGRdID0gYGh0dHBzOi8vYXBpLmR5em8uYWkke2VtcFtmaWVsZF0uc3RhcnRzV2l0aCgnLycpID8gJycgOiAnLyd9JHtlbXBbZmllbGRdfWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVtcDtcbiAgICAgIH07XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhLmVtcGxveWVlcykpIGRhdGEuZW1wbG95ZWVzLm1hcChwcmVmaXhJbWFnZSk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhLmRhdGEpKSBkYXRhLmRhdGEubWFwKHByZWZpeEltYWdlKTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEucmVzdWx0cykpIGRhdGEucmVzdWx0cy5tYXAocHJlZml4SW1hZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oZGF0YSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJQcm94eSBlcnJvciBmZXRjaGluZyBlbXBsb3llZXM6XCIsIGVyci5tZXNzYWdlKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdGF0dXM6IDAsIGVycm9yOiBlcnIubWVzc2FnZSB9LCB7IHN0YXR1czogNTAwIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiR0VUIiwicmVxIiwic2VhcmNoUGFyYW1zIiwiVVJMIiwidXJsIiwiY29tcGFueUlkIiwiZ2V0IiwicmVzcG9uc2UiLCJmZXRjaCIsIm1ldGhvZCIsImhlYWRlcnMiLCJvayIsIkVycm9yIiwic3RhdHVzIiwiZGF0YSIsImpzb24iLCJBcnJheSIsImlzQXJyYXkiLCJlbXBsb3llZXMiLCJmaWx0ZXIiLCJlbXAiLCJpc0FjdGl2ZSIsInJlc3VsdHMiLCJwcmVmaXhJbWFnZSIsImZpZWxkIiwicHJvZmlsZV9waWN0dXJlIiwicHJvZmlsZV9waWMiLCJwcm9maWxlUGljdHVyZSIsInN0YXJ0c1dpdGgiLCJtYXAiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJtZXNzYWdlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/employees/route.js\n");

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
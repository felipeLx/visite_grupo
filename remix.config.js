const {flatRoutes} = require('remix-flat-routes')

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
	future: {
		v2_errorBoundary: true,
		v2_headers: true,
		v2_meta: true,
		v2_normalizeFormMethod: true,
		v2_routeConvention: true,
	},
	ignoredRouteFiles: ["**/.*", "**/*.test.{js,jsx,ts,tsx}"],
	postcss: true,
	serverModuleFormat: "cjs",
	tailwind: true,routes: async defineRoutes => {
		return flatRoutes('routes', defineRoutes, {
			ignoredRouteFiles: [
				'.*',
				'**/*.css',
				'**/*.test.{js,jsx,ts,tsx}',
				'**/__*.*',
			],
		})
	},
}


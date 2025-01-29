/**
 * Get all available routes in the app
 * 
 * @param {Express} app - Express app instance
 * @returns {Array} - Array of objects containing path and methods
 */

export function getAvailableRoutes(app) {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push(middleware.route);
        }
        else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                const route = handler.route;
                route && routes.push(route);
            });
        }
    });
    return routes.map((route) => ({
        path: route.path,
        methods: Object.keys(route.methods).join(', ').toUpperCase(),
    }));
}


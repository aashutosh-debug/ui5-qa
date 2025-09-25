sap.ui.define([
    "sap/ui/core/UIComponent",
], function (UIComponent) {
    "use strict";
    return {
        logout: function (that) {
            localStorage.removeItem("token");
            var oRouter = UIComponent.getRouterFor(that);
            oRouter.navTo("RouteView1");
        },

        _decodeToken: function (token) {
            try {
                var base64Url = token.split('.')[1]; // get payload part
                var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                return JSON.parse(jsonPayload); 
            } catch (e) {
                console.error("Invalid JWT:", e);
                return null;
            }
        }

    };
});

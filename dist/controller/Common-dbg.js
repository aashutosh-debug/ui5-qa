sap.ui.define([
    "sap/ui/core/UIComponent",
], function (UIComponent) {
    "use strict";
    return {
        logout: function (that) {
            var oRouter = UIComponent.getRouterFor(that);
            oRouter.navTo("RouteView1"); 
        },

        addNumbers: function (a, b) {
            return a + b;
        }
    };
});

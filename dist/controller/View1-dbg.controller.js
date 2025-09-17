sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "sap/ui/core/UIComponent"
], (Controller, UIComponent) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.View1", {
        onInit() {
        },

        onLogin: function(){
            // Get the router instance
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Login"); 
        },

        onRegister: function(){
            // Get the router instance
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Register"); 
        },

        onCandidateLogin: function(){
            // Get the router instance
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("CandidateLogin"); 
        },

        onCandidateRegister: function(){
            // Get the router instance
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("CandidateRegister"); 
        },
    });
});
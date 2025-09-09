sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (Controller, UIComponent) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.CandidateLogin", {
        onInit() {
        },

        onLoginPress: function () {
            var oView = this.getView();
            var bValid = true;

            // Validate email
            var emailInput = oView.byId("email");
            if (!emailInput.getValue().trim()) {
                emailInput.setValueState("Error");
                bValid = false;
            } else {
                emailInput.setValueState("None");
            }

            // Validate password
            var passwordInput = oView.byId("password");
            if (!passwordInput.getValue().trim()) {
                passwordInput.setValueState("Error");
                bValid = false;
            } else {
                passwordInput.setValueState("None");
            }

            if(!bValid) return;

            var oPayload = {
                "email": emailInput.getValue(),
                "password": passwordInput.getValue()
            };

            return;

            fetch("https://ui5-qa-node-service.onrender.com/auth/company/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oPayload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                   this.navToCompanyDashboard();
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.error("Error:", err);
                });
        },

        navToCompanyDashboard: function(){
             var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("CompanyDashboard"); 
        }
    });
});
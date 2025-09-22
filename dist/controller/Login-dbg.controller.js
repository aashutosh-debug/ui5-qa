sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
], (Controller, UIComponent, MessageBox) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.Login", {
        onInit() {
        },

        onSignUpPress: function () {
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

            if (!bValid) return;

            var oPayload = {
                "email": emailInput.getValue(),
                "password": passwordInput.getValue()
            };

            fetch("https://ui5-qa-node-service.onrender.com/auth/company/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oPayload)
            })
                .then((response) => {
                    // if (!response.ok) {
                    //     throw new Error("HTTP error " + response.status);
                    // }
                    return response.json();
                })
                .then(data => {
                    if(!data.success){
                        MessageBox.error(data.message); 
                    }
                    else{
                        localStorage.setItem("token", data.token);
                        // this.getOwnerComponent().getModel("globalModel").setProperty("/company", data.value);
                        this.navToCompanyDashboard();
                    }
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                });
        },

        navToCompanyDashboard: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("CompanyDashboard");
        },

        onForgotPassword: function(){
             var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("ForgotPassword", {
                    type: "C"
            }); 
        },
    });
});
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (Controller, UIComponent) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.Register", {
        onInit() {
        },

        onSignUpPress: function () {

            var oView = this.getView();
            var bValid = true;

            // Validate Company Name
            var oCompanyNameInput = oView.byId("companyName");
            if (!oCompanyNameInput.getValue().trim()) {
                oCompanyNameInput.setValueState("Error");
                bValid = false;
            } else {
                oCompanyNameInput.setValueState("None");
            }

            // Validate Industry 
            var industryInput = oView.byId("industry");
            if (!industryInput.getValue().trim()) {
                industryInput.setValueState("Error");
                bValid = false;
            } else {
                industryInput.setValueState("None");
            }

            // Validate website
            var websiteInput = oView.byId("website");
            if (!websiteInput.getValue().trim()) {
                websiteInput.setValueState("Error");
                bValid = false;
            } else {
                websiteInput.setValueState("None");
            }

            // Validate location
            var locationInput = oView.byId("location");
            if (!locationInput.getValue().trim()) {
                locationInput.setValueState("Error");
                bValid = false;
            } else {
                locationInput.setValueState("None");
            }

            // Validate contactPerson
            var contactPersonInput = oView.byId("contactPerson");
            if (!contactPersonInput.getValue().trim()) {
                contactPersonInput.setValueState("Error");
                bValid = false;
            } else {
                contactPersonInput.setValueState("None");
            }

            // Validate phone
            var phoneInput = oView.byId("phone");
            if (!phoneInput.getValue().trim()) {
                phoneInput.setValueState("Error");
                bValid = false;
            } else {
                phoneInput.setValueState("None");
            }

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
                "company": oCompanyNameInput.getValue(),
                "industry": industryInput.getValue(),
                "website": websiteInput.getValue(),
                "location": locationInput.getValue(),
                "name": contactPersonInput.getValue(),
                "phone": phoneInput.getValue(),
                "email": emailInput.getValue(),
                "password": passwordInput.getValue(),
            };

            fetch("https://ui5-qa-node-service.onrender.com/auth/company/signup", {
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
                    return response.json();
                })
                .then(data => {
                    sap.m.MessageToast.show("Company Registered Successfully. Please Login to continue!");
                    console.log("Response:", data);
                    this.onLogin();
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.error("Error:", err);
                });
        },

        onLogin: function(){
            // Get the router instance
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Login"); 
        },

    });
});
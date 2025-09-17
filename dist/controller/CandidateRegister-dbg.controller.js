sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (Controller, UIComponent) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.CandidateRegister", {
        onInit() {
        },

        onAfterRendering: function(){
            var skillsInput = this.getView().byId("skillsInput");
                    if (skillsInput) {
                        skillsInput.addValidator(function (args) {
                            return new sap.m.Token({
                                key: args.text,
                                text: args.text
                            });
                        });
                    }
        },

        onSignUpPress: function () {

            var oView = this.getView();
            var bValid = true;

            // Validate Company Name
            var fullName = oView.byId("fullName");
            if (!fullName.getValue().trim()) {
                fullName.setValueState("Error");
                bValid = false;
            } else {
                fullName.setValueState("None");
            }

            // Validate Industry 
            var phone = oView.byId("phone");
            if (!phone.getValue().trim()) {
                phone.setValueState("Error");
                bValid = false;
            } else {
                phone.setValueState("None");
            }

            // Validate website
            var location = oView.byId("location");
            if (!location.getValue().trim()) {
                location.setValueState("Error");
                bValid = false;
            } else {
                location.setValueState("None");
            }

            // Validate location
            var experience = oView.byId("experience");
            if (!experience.getValue().trim()) {
                experience.setValueState("Error");
                bValid = false;
            } else {
                experience.setValueState("None");
            }

            // Validate contactPerson
            var email = oView.byId("email");
            if (!email.getValue().trim()) {
                email.setValueState("Error");
                bValid = false;
            } else {
                email.setValueState("None");
            }

            // Validate phone
            var password = oView.byId("password");
            if (!password.getValue().trim()) {
                password.setValueState("Error");
                bValid = false;
            } else {
                password.setValueState("None");
            }

            // Validate email
            var skillsInput = oView.byId("skillsInput");
            if (!skillsInput.getTokens().length === 0) {
                skillsInput.setValueState("Error");
                bValid = false;
            } else {
                skillsInput.setValueState("None");
            }

            if(!bValid) return;

            var oPayload = {
                name : fullName.getValue(),
                email : email.getValue(),
                password : password.getValue(),
                phone : phone.getValue(),
                experience : experience.getValue(),
                location : location.getValue(),
                skills : skillsInput.getTokens().map(function (oToken) { return oToken.getText(); })
            };

            fetch("https://ui5-qa-node-service.onrender.com/auth/candidate/signup", {
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
                    sap.m.MessageToast.show("Registered Successfully. Please Login to continue!");
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
            oRouter.navTo("CandidateLogin"); 
        },

        onLogout: function(){ Common.logout(this)},

    });
});
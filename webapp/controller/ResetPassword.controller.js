sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "com/questionanswer/controller/Common"
], (Controller, MessageBox, UIComponent, Common) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.ResetPassword", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("ResetPassword").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: async function (oEvent) {
            this.token = oEvent.getParameter("arguments").token;

            //let res = await this.verifyToken(token);

            if(!this.token){
                MessageBox.error("Invalid URL or token expired. Please try again forgetting password.");
            }
        },

        // verifyToken: function(token){

        // },

        onResetPassword: function(){

            var oView = this.getView();

            var password = oView.byId("password");
            if (!password.getValue().trim()) {
                password.setValueState("Error");
                return;
            } else {
                password.setValueState("None");
            }

            var confirmPassword = oView.byId("confirmPassword");
            if (!confirmPassword.getValue().trim()) {
                confirmPassword.setValueState("Error");
                return;
            } else {
                confirmPassword.setValueState("None");
            }

             var oPayload = {
                password: password.getValue(),
                token: this.token
            };

            fetch("https://ui5-qa-node-service.onrender.com/resetpassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oPayload)
            })
                .then(response => {
                    if(response.status === 403){
                        MessageBox.error("Link expired! Try again forgetting password."); 
                        return;
                    }
                    return response.json();
                })
                 .then(data => {

                    if(!data.success){
                        MessageBox.error(data.message); 
                    }
                    else{
                        sap.m.MessageToast.show("Password reset successfully."); 
                        this.navToMainView();

                    }
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                });
        },

        navToMainView: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView1");
        },

    });
});
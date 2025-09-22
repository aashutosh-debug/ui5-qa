sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "com/questionanswer/controller/Common"
], (Controller, MessageBox, UIComponent, Common) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.ForgotPassword", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("ForgotPassword").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this.typeUser = oEvent.getParameter("arguments").type;
        },

        onContinue: function(){

            if(["C", "D"].indexOf(this.typeUser) === -1) {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteView1"); 
                return;
            }

            var oView = this.getView();

            var emailInput = oView.byId("email");
            if (!emailInput.getValue().trim()) {
                emailInput.setValueState("Error");
                return;
            } else {
                emailInput.setValueState("None");
            }

             var oPayload = {
                "email": emailInput.getValue(),
                "type": this.typeUser
            };

            fetch("https://ui5-qa-node-service.onrender.com/forgotpassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oPayload)
            })
                .then(response => {
                    return response.json();
                })
                 .then(data => {

                    if(!data.success){
                        MessageBox.error(data.message); 
                    }
                    else{
                        MessageBox.success("If email is registered, Password reset link is sent to your email id."); 
                    }
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                });
        }

    });
});
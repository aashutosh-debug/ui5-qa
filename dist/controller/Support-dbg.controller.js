sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "com/questionanswer/controller/Common"
], (Controller, UIComponent, MessageBox, Common) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.Support", {
        onInit() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Support").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this.onRefreshSupportTicket();
        },

        onRefreshSupportTicket: function(){
            this.user = Common._decodeToken(localStorage.getItem("token"));
            this.getSupportTickets(this.user.user.id);
        },

        getSupportTickets: function (id) {

            fetch("https://ui5-qa-node-service.onrender.com/getsupport/" + id, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    var supportModel = new sap.ui.model.json.JSONModel({ rows: data.value });
                    this.getView().setModel(supportModel, "supportModel");
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Fetch GET error:", err);
                    this.onLogout();
                });
        },

        onCreateSupportTicket: function () {
            var oView = this.getView();

            if (!this._pDialog) {
                this._pDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.questionanswer.view.CreateSupportTicket", // <-- path to Dialog.fragment.xml
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCancelDialog: function () {
            this.byId("myDialogCS").close();
        },

        onDialogClose: function () {
            // Cleanup if required
        },

         onSaveDialog: function () {
            
            var id = this.user.user.id;
            var type = (this.user.user.company ? "C" : "D");
            var oView = this.getView();
            var bValid = true;

            // Validate email
            var titleInput = oView.byId("subject");
            if (!titleInput.getValue().trim()) {
                titleInput.setValueState("Error");
                bValid = false;
            } else {
                titleInput.setValueState("None");
            }

            // Validate descInput
            var descInput = oView.byId("description");
            if (!descInput.getValue().trim()) {
                descInput.setValueState("Error");
                bValid = false;
            } else {
                descInput.setValueState("None");
            }

            if (!bValid) return;

            var oPayload = {
                "subject": titleInput.getValue(),
                "description": descInput.getValue(),
                "user_id": id,
                "user_type": type
            };

            fetch("https://ui5-qa-node-service.onrender.com/support", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
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
                    MessageBox.success("Your support request has been received. Our team will get back to you within 24 hours. Thank you for reaching out!");
                    this.onRefreshSupportTicket();
                    this.onCancelDialog();
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                });
        },

        onLogout: function(){ Common.logout(this)},
    });
});
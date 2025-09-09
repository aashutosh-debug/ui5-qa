sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/f/library"
], (Controller, UIComponent, fioriLibrary) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.CompDbList", {
        onInit() {
            //Write code to bind jobs data to list
            var id = this.getOwnerComponent().getModel("globalModel").getProperty("/company/id");
            id=7
            this.getJobs(id);

            this.oRouter = this.getOwnerComponent().getRouter();
        },

        getJobs: function (id) {
            fetch("https://ui5-qa-node-service.onrender.com/jobs/" + id, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Users from backend:", data);
                    var ocompanyJobModel = new sap.ui.model.json.JSONModel(data);
                    this.getView().setModel(ocompanyJobModel, "JobModel");
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.error("Fetch GET error:", err);
                });
        },

        onRefresh: function () {
            var id = this.getOwnerComponent().getModel("globalModel").getProperty("/company/id");
            this.getJobs(id);
        },

        onCreateJobOpenDialog: function () {
            var oView = this.getView();

            if (!this._pDialog) {
                this._pDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.questionanswer.view.AddJobs", // <-- path to Dialog.fragment.xml
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);

                    // Add validator for MultiInput after dialog is created
                    var oMultiInput = oView.byId("tagsInput");
                    if (oMultiInput) {
                        oMultiInput.addValidator(function (args) {
                            return new sap.m.Token({
                                key: args.text,
                                text: args.text
                            });
                        });
                    }

                    return oDialog;
                });
            }

            this._pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCancelDialog: function () {
            this.byId("myDialog").close();
        },

        onDialogClose: function () {
            // Cleanup if required
        },

        onSaveDialog: function () {
            var id = this.getOwnerComponent().getModel("globalModel").getProperty("/company/id");
            var oView = this.getView();
            var bValid = true;

            // Validate email
            var titleInput = oView.byId("titleInput");
            if (!titleInput.getValue().trim()) {
                titleInput.setValueState("Error");
                bValid = false;
            } else {
                titleInput.setValueState("None");
            }

            // Validate descInput
            var descInput = oView.byId("descInput");
            if (!descInput.getValue().trim()) {
                descInput.setValueState("Error");
                bValid = false;
            } else {
                descInput.setValueState("None");
            }

            if (!bValid) return;

            var oPayload = {
                "title": titleInput.getValue(),
                "description": descInput.getValue(),
                "company_id": id
            };

            fetch("https://ui5-qa-node-service.onrender.com/addjobs", {
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
                    console.log(data);
                    this.onRefresh();
                    // Close dialog
                    this.onCancelDialog();
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.error("Error:", err);
                });
        },

        openQuestionView: function(oEvent){
            
            // var jobPath = oEvent.getSource().getBindingContext("JobModel").getPath(),
			// 	job = jobPath.split("/").slice(-1).pop();

            // this.getOwnerComponent().getModel("globalModel").setProperty("/navToJob", job);

            var oFCL = this.getView().getParent().getParent();
			// oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

            var oContext = oEvent.getSource().getBindingContext("JobModel");

            if(!this.oDetailView){
                this.oDetailView = sap.ui.view({
                    viewName: "com.questionanswer.view.Question",
                    type: "XML"
                });
                this.oDetailView.setModel(this.getView().getModel("JobModel"));
                oFCL.removeAllMidColumnPages();
                oFCL.addMidColumnPage(this.oDetailView);
            }

            this.oDetailView.setBindingContext(oContext);
           
            oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
        }
    });
});
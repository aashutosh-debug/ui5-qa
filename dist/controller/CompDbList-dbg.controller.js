sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/f/library",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
     "com/questionanswer/controller/Common"

], (Controller, UIComponent, fioriLibrary, Filter, FilterOperator, Common) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.CompDbList", {
        
        onInit() {
            //Write code to bind jobs data to list
            this.user = Common._decodeToken(localStorage.getItem("token"));// this.getOwnerComponent().getModel("globalModel").getProperty("/company/id");
            this.getJobs(this.user.user.id);
            this.oRouter = this.getOwnerComponent().getRouter();
            sap.ui.getCore().getEventBus().subscribe("jobChannel", "refreshjobList", this._onRefreshMasterList, this);
        },

        onLogout: function(){ Common.logout(this)},

        _onRefreshMasterList: function(){
             this.onRefresh();
        },

        getJobs: function (id) {
            fetch("https://ui5-qa-node-service.onrender.com/jobs/" + id, {
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
                    var ocompanyJobModel = new sap.ui.model.json.JSONModel(data);
                    this.getView().setModel(ocompanyJobModel, "JobModel");
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.error("Fetch GET error:", err);
                });
        },

        onRefresh: function () {
            // var id = this.getOwnerComponent().getModel("globalModel").getProperty("/company/id");
            this.getJobs(this.user.user.id);
        },

        onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();

            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");

			if (sQuery && sQuery.length > 0) {
                var aFilters = [
                    new sap.ui.model.Filter("id", sap.ui.model.FilterOperator.EQ, sQuery.toString()),
                    new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sQuery.toString()),
                    new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sQuery.toString())
                ];

                 var oCombinedFilter = new sap.ui.model.Filter({
                    filters: aFilters,
                    and: false // OR condition
                    });
                oBinding.filter(oCombinedFilter);
			}
            else {
                oBinding.filter([]); // clear filters
            }

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
            
            var id = this.user.user.id;//this.getOwnerComponent().getModel("globalModel").getProperty("/company/id");
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
                    this.onRefresh();
                    this.onCancelDialog();
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                });
        },

        openQuestionView: function(oEvent){
            
            // var jobPath = oEvent.getSource().getBindingContext("JobModel").getPath(),
			// 	job = jobPath.split("/").slice(-1).pop();

            // this.getOwnerComponent().getModel("globalModel").setProperty("/navToJob", job);

            var oFCL = this.getView().getParent().getParent();
			// oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

            var oContext = oEvent.getSource().getBindingContext("JobModel");

                var oDetailView = sap.ui.view({
                    viewName: "com.questionanswer.view.Question",
                    type: "XML"
                });
                oDetailView.setModel(this.getView().getModel("JobModel"));
                oFCL.removeAllMidColumnPages();
                oFCL.addMidColumnPage(oDetailView);
                oDetailView.setBindingContext(oContext);
                oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
                sap.ui.getCore().getEventBus().publish("QuestionChannel", "refreshQuestionsOnLoad");

        }
    });
});
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
     "sap/ui/core/UIComponent",
     "com/questionanswer/controller/Common"
], (Controller, MessageBox, UIComponent, Common) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.CandidateDashboard", {
        onInit() {
             var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("CandidateDashboard").attachPatternMatched(this._onObjectMatched, this);
            
        },

        _onObjectMatched: function (oEvent) {
           this.onRefreshCandidates();
        },

        navToCandidateLogin: function(){
             var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("CandidateLogin"); 
        },

        navToWizard: function(job_post_id, test_id, job){
             var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Wizard",{
                id: job_post_id,
                testid: test_id,
                job: encodeURIComponent(job)
            }); 
        },

        onRefreshCandidates: function(){
            this.user = Common._decodeToken(localStorage.getItem("token"));
            // var context = this.getOwnerComponent().getModel("globalModel").getProperty("/candidate");
            // if(!this.user.user.id){
            //     this.navToCandidateLogin();
            //     return;
            // }
            this.getCandidateForJob(this.user.user.email);
        },

        getCandidateForJob: function (candidate_Id) {

            var oPayload = {
                id: candidate_Id
            };

            fetch("https://ui5-qa-node-service.onrender.com/test/candidate/", {
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
                    var oCandidatesTestModel = new sap.ui.model.json.JSONModel({ rows: data.value });
                    this.getView().setModel(oCandidatesTestModel, "candidatesTestModel");
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Fetch GET error:", err);
                    this.onLogout();
                });
        },

        onStartTest: function(oEvent){
             MessageBox.information(
                "Do not navigate back or close the tab while taking test.",
                {
                    icon: MessageBox.Icon.information,
                    title: "Confirm Start",
                    actions: ["Start Test", MessageBox.Action.CANCEL],
                    emphasizedAction: "Start Test",
                    initialFocus: MessageBox.Action.CANCEL,
                    dependentOn: this.getView(),
                    onClose: function (sAction) {
                        if (sAction === "Start Test") {
                            var obj = oEvent.getSource().getBindingContext("candidatesTestModel").getObject();
                            this.navToWizard(obj.job_post_id, obj.test_id, obj.title);
                        }
                    }.bind(this),
                });
            
        },

        onLogout: function(){ Common.logout(this)},

        navToSupport: function(){
             var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Support"); 
        }
    });
});
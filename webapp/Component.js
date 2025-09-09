sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/questionanswer/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.questionanswer.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

              // Create and set the global JSON Model
            var oGlobalModel = new sap.ui.model.json.JSONModel();
            this.setModel(oGlobalModel, "globalModel");

            // Load data into the global model
            var oData = {
                company: {}
            };
            oGlobalModel.setData(oData);

            // enable routing
            this.getRouter().initialize();

           
        }
    });
});
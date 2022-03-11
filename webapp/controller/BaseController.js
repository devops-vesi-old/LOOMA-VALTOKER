sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (Controller, JSONModel, DateFormat, Spreadsheet, MessageToast, Fragment, Filter, FilterOperator, MessageBox) {
	"use strict";
	return Controller.extend("com.vesi.zfioac4_site.controller.BaseController", {
		fnGetRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		fnSetModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		fnSetJSONModel: function (oJson, sName) {
			return this.fnSetModel(new JSONModel(oJson), sName);
		},
		fnGetModel: function (sName) {
			return this.getView().getModel(sName);
		},
		fnGetResourceBundle: function (sKey) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		fnGetODataModel: function (sName) {
			if (!sName || sName === "") {
				return this.getOwnerComponent().getModel();
			}
			return this.getOwnerComponent().getModel(sName);
		}
	});
});
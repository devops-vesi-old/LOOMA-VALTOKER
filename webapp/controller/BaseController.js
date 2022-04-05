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
		},
		
		/*
		 * Called from method "_initFilter" to initialize User Status Description model
		 */
		_initStatusDesc: function (sObjectFilter) {
			var mParams = {
				filters: [new Filter({
					path: "Object",
					operator: "EQ",
					value1: sObjectFilter
				})],
				success: function (oData) {
					var oStatusDesc = {};
					for (var idx in oData.results) {
						var oLine = oData.results[idx];
						oStatusDesc[oLine.StatusInternalId] = oLine.StatusDesc;
					}
					this.fnSetJSONModel(oStatusDesc, "mStatusDesc");
				}.bind(this)
			};
			this.fnGetODataModel("VH").read("/UserStatusSet", mParams);
		}
	});
});
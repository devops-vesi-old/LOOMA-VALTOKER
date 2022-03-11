sap.ui.define([
	"com/vesi/zfioac4_valpec/controller/BaseController",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
], function (Controller, Formatter, Filter, FilterOperator, Fragment) {
	"use strict";

	return Controller.extend("com.vesi.zfioac4_valpec.controller.Home", {
		formatter: Formatter,
		//--------------------------------------------
		// Standard method
		//--------------------------------------------
		onInit: function () {
			//Init local model for filters
			this._initFilter();
		},

		onAfterRendering: function () {
			//Fire press search
			this.onFiltersSearch();
		},

		//--------------------------------------------
		// Internal functions
		//--------------------------------------------
		/*
		 * Called from method "onInit" to initialize local model named mFilter
		 */
		_initFilter: function () {
			var oFilter = {};
			//Set default filter for active/inactive
			this._initFilterActive(oFilter);
			//Set JSON model
			this.fnSetJSONModel(oFilter, "mFilter");

			//Set model for formatter Type description
			this._initTypeDesc();
			//Set model for formatter Status description
			this._initLocationStatusDesc();

			//Set Tokens model
			this._initTokensModel();
		},

		/*
		 * Called from method "_initFilter" to initialize select list for filter activ/inactiv
		 */
		_initFilterActive: function (oFilter) {
			oFilter.active = {
				SelectedKey: "false",
				List: [{
					Id: 0,
					Text: this.fnGetResourceBundle().getText("filterActiveAll")
				}, {
					Id: "false",
					Text: this.fnGetResourceBundle().getText("filterActiveYes")
				}, {
					Id: "true",
					Text: this.fnGetResourceBundle().getText("filterActiveNo")
				}]
			};
		},

		/*
		 * Called from method "_initFilter" to initialize Type Description model
		 */
		_initTypeDesc: function () {
			var mParams = {
				filters: [new Filter({
					path: "CharactId",
					operator: "EQ",
					value1: "YLO_SITE_TYPE"
				})],
				success: function (oData) {
					var oTypeDesc = {};
					for (var idx in oData.results) {
						var oLine = oData.results[idx];
						oTypeDesc[oLine.CharactValueChar] = oLine.CharactValueDescription;
					}
					this.fnSetJSONModel(oTypeDesc, "mTypeDesc");
				}.bind(this)
			};
			this.fnGetODataModel("VH").read("/CharacteristicValueListSet", mParams);
		},

		/*
		 * Called from method "_initFilter" to initialize Type Description model
		 */
		_initLocationStatusDesc: function () {
			var mParams = {
				filters: [new Filter({
					path: "Object",
					operator: "EQ",
					value1: "LoomaLocation"
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
		},

		/*
		 * Called from method "_initFilter" to initialize Tokens model
		 */
		_initTokensModel: function () {
			var oTokens = {
				ContractId: [],
				SiteId: []
			};
			this.fnSetJSONModel(oTokens, "mTokens");
		},

		/*
		 * Method to get data with filter from VH
		 */
		_searchVH: function (oEvent) {
			var aFilters = this._getVHDefaultFilters(oEvent.getSource().getId().split("-id").pop().split("Dialog").shift());

			var oSettings = {
				oEvent: oEvent,
				oSrc: this.byId(oEvent.getSource().getId().split("-").pop()),
				aFilters: aFilters
			};
			this._searchData(oSettings);
		},

		/*
		 * Method to get filters for VH from others VH
		 */
		_getVHDefaultFilters: function (id) {
			var oFiltersToGet = {
				SiteId: ["ContractId"]
			};
			if (!oFiltersToGet[id]) {
				return [];
			}
			var aFilters = [];
			var aFilterBarFilters = this.byId("homeFilterBar").getAllFilterItems();
			for (var oLine of aFilterBarFilters) {
				if (oLine.getGroupName() === "MultiInput") {
					if (oFiltersToGet[id].indexOf(oLine.getName()) !== -1) {
						for (var oToken of oLine.getControl().getTokens()) {
							aFilters.push(new Filter(oLine.getName(), FilterOperator.EQ, oToken.getKey()));
						}
					}
				}
			}

			if (aFilters.length > 0) {
				return aFilters;
			}
			return [];

		},

		/*
		 * Method to get filters for VH from others VH
		 */
		_searchData: function (oSearchConfig) {
			let oBinding = oSearchConfig.oSrc.getBinding("items");
			// Additionnal "search" parameter for odata request
			this._setBindingCustomParams(oBinding, oSearchConfig.oEvent.getParameter("value"), oSearchConfig.oSrc.getModel());
			oBinding.filter(oSearchConfig.aFilters, "Application");
		},

		/*
		 * Setter of sCustomParams to add "search=..." to the Odata request
		 */
		_setBindingCustomParams: function (oBinding, sValue, oModel) {
			if (sValue === "") {
				oBinding.sCustomParams = sValue;
			} else {
				oBinding.sCustomParams = oModel.createCustomParams({
					custom: {
						search: sValue
					}
				});
			}
		},

		/*
		 * Get filters from home filter bar
		 */
		_getFilters: function () {
			var aFiltersAll = [];
			var aFilterBarFilters = this.byId("homeFilterBar").getAllFilterItems();
			for (var oLine of aFilterBarFilters) {
				var aFilters = [];
				switch (oLine.getGroupName()) {
				case ("MultiInput"):
					for (var oToken of oLine.getControl().getTokens()) {
						aFilters.push(new Filter(oLine.getName(), FilterOperator.EQ, oToken.getKey()));
					}
					break;

				case ("ComboBoxBoolean"):
					if (oLine.getControl().getSelectedKey() && oLine.getControl().getSelectedKey() !== "0") {
						aFilters.push(new Filter(oLine.getName(), FilterOperator.EQ, oLine.getControl().getSelectedKey() === "true"));
					}
					break;
				case ("MultiComboBox"):
					for (var oSelectedKey of oLine.getControl().getSelectedKeys()) {
						aFilters.push(new Filter(oLine.getName(), FilterOperator.EQ, oSelectedKey));
					}
					break;
				}
				if (aFilters.length > 0) {
					aFiltersAll.push(new Filter(aFilters, false));
				}
			}

			if (aFiltersAll.length > 0) {
				return aFiltersAll;
			}
			return false;

		},

		//--------------------------------------------
		// Event functions
		//--------------------------------------------
		/*
		 * Method to open the right dialog for value help request
		 */
		onValueHelpRequested: function (oEvent) {

			var oView = this.getView();

			var sCurrId = oEvent.getSource().getId().split("-").pop();
			sCurrId = sCurrId.split("filter").pop();
			this._sCurrId = sCurrId;

			if (!this["_" + sCurrId]) {

				this["_" + sCurrId] = Fragment.load({
					id: oView.getId(),
					name: "com.vesi.zfioac4_valpec.view.fragment.Home.valueHelp." + sCurrId,
					controller: this

				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;

				});
			}
			this["_" + sCurrId].then(function (oDialog) {
				var oBinding = oDialog.getBinding("items");
				var aDefaultFilters = this._getVHDefaultFilters(this._sCurrId);
				oBinding.filter(aDefaultFilters, "Application");
				oDialog.open();
			}.bind(this));
		},

		/*
		 * Event on TokenUpdate from MultiInput
		 */
		onUpdateToken: function (oEvent) {
			var bAdded = true;
			var sProperty = "addedTokens";
			var sIdVH = oEvent.getSource().getId().split("--").pop();
			var aModelTokensData = this.getView().getModel("mTokens").getData()[sIdVH];
			if (oEvent.getParameter("type") === "removed") {
				bAdded = false;
				sProperty = "removedTokens";
			}

			var aTokens = oEvent.getParameter(sProperty);
			for (var oToken of aTokens) {
				var iIndexLine = aModelTokensData.map(function (a) {
					return a.Id;
				}).indexOf(oToken.getKey());
				switch (bAdded) {
				case true:
					//Add new entry in array
					if (iIndexLine === -1) {
						aModelTokensData.push({
							Id: oToken.getKey()
						});
					}
					break;
				case false:
					//Delete already existing entry in array
					if (iIndexLine !== -1) {
						aModelTokensData.splice(iIndexLine, 1);
					}
					break;
				}
			}
			//refresh model
			this.getView().getModel("mTokens").refresh(true);
		},

		/*
		 * Event on Confirm from VH Dialog
		 */
		onValueHelpConfirm: function (oEvent) {

			var aSelectedItems = oEvent.getParameter("selectedItems"),
				sIdMultiInput = oEvent.getSource().getId().split("--").pop().split("Dialog").shift(),
				oTokens = this.fnGetModel("mTokens"),
				iId = 0,
				iText = 1;

			//Delete previous Ids
			oTokens.getData()[sIdMultiInput] = [];

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					var sText = oItem.getCells()[iText].getText();
					if (sText === "") {
						sText = oItem.getCells()[iId].getText();
					}
					oTokens.getData()[sIdMultiInput].push({
						Id: oItem.getCells()[iId].getText(),
						Text: sText
					});
				});
			}

			oTokens.refresh(true);

			// Reset search parameters for next run
			this._setBindingCustomParams(oEvent.getSource().getBinding("items"), "", null);

		},

		/*
		 * Event on Close from VH Dialog
		 */
		onValueHelpClose: function (oEvent) {
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([], "Application");
			// Reset search parameters for next run
			this._setBindingCustomParams(oEvent.getSource().getBinding("items"), "", null);
		},

		/*
		 * Event on Search from VH Dialog
		 */
		onValueHelpSearch: function (oEvent) {
			this._searchVH(oEvent);
		},

		/*
		 * Event on Search in filter bar
		 */
		onFiltersSearch: function (oEvent) {
			var aFilters = this._getFilters();
			if (aFilters.length > 0) {
				var mainFilter = new Filter({
					filters: aFilters,
					and: true
				});
			}

			var oTableBinding = this.getView().byId("TableSite").getBinding("rows");
			oTableBinding.filter(aFilters, "Application");
		}
	});
});
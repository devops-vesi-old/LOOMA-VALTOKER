sap.ui.define([
	"com/vesi/zfac4_valtoker/controller/BaseController",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, Formatter, Filter, FilterOperator, Fragment, MessageBox, JSONModel) {
	"use strict";
	return Controller.extend("com.vesi.zfac4_valtoker.controller.Home", {
		formatter: Formatter,
		//--------------------------------------------
		// Standard method
		//--------------------------------------------
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vesi.zfac4_valtoker.view.Home
		 */
		onInit: function () {
			//Set model for formatter Type description
			this._initTypeDesc();
			//Set model for formatter Status description
			this._initLocationStatusDesc();
			//Init local model for filters
			this._initFilter();
			// 14168 - BEGIN
			let oTreeTableModel = new JSONModel({});
			this.getView().setModel(oTreeTableModel, "oTreeDataModel");
			this._initFilterContextModel();
			// 14168 - END
		},
		// 14168 - BEGIN
		_initFilterContextModel: function () {
			const oModel = new JSONModel({
				ContractId: []
			});
			this.fnSetModel(oModel, "filterContext");
		},
		// 14168 - END
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
			//Set default filter for takeover in progress
			this._initFilterTakeoverInProgress(oFilter);
			//Set JSON model
			this.fnSetJSONModel(oFilter, "mFilter");
			//Set Tokens model
			this._initTokensModel();
		},
		/*
		 * Called from method "_initFilter" to initialize select list for filter activ/inactiv
		 */
		_initFilterActive: function (oFilter) {
			this._initFilterboolean(oFilter, "Active", true);
		},
		/*
		 * Called from method "_initFilter" to initialize select list for filter takeover in progress
		 */
		_initFilterTakeoverInProgress: function (oFilter) {
			this._initFilterboolean(oFilter, "TakeoverInProgress", false);
		},
		/*
		 * Called from method to initialize boolean select list for filter takeover in progress
		 */
		_initFilterboolean: function (oFilter, sProperty, bInvertBoolean) {
			var sYesId = "true",
				sNoId = "false",
				sSelectedKey = "true";
			if (bInvertBoolean) {
				sYesId = "false";
				sNoId = "true";
				sSelectedKey = "false";
			}
			oFilter[sProperty] = {
				SelectedKey: sSelectedKey,
				List: [{
					Id: 0,
					Text: this.fnGetResourceBundle("filter" + sProperty + "All")
				}, {
					Id: sYesId,
					Text: this.fnGetResourceBundle("filter" + sProperty + "Yes")
				}, {
					Id: sNoId,
					Text: this.fnGetResourceBundle("filter" + sProperty + "No")
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
		 * Called from method "_initFilter" to initialize Location User Status Description model
		 */
		_initLocationStatusDesc: function () {
			this._initStatusDesc("LoomaLocation");
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
			for (var idx in aFilterBarFilters) {
				var oToken = aFilterBarFilters[idx];
				if (oToken.getGroupName() === "MultiInput") {
					if (oFiltersToGet[id].indexOf(oToken.getName()) !== -1) {
						var aTokens = oToken.getControl().getTokens();
						for (var iTok in aTokens) {
							aFilters.push(new Filter(oToken.getName(), FilterOperator.EQ, aTokens[iTok].getKey()));
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
			var oBinding = oSearchConfig.oSrc.getBinding("items");
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
					name: "com.vesi.zfac4_valtoker.view.fragment.Home.valueHelp." + sCurrId,
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
		// 14168 - BEGIN
		onUpdateToken: function (oEvent) {
			let bAdded = true;
			let sProperty = "addedTokens";
			let sIdVH = oEvent.getSource().getId().split("-").pop();
			let aModelTokensData = this.getView().getModel("mTokens").getData()[sIdVH];
			if (oEvent.getParameter("type") === "removed") {
				bAdded = false;
				sProperty = "removedTokens";
			}
			let aTokens = oEvent.getParameter(sProperty);
			for (let oToken of aTokens) {
				switch (bAdded) {
				case true:
					if (aModelTokensData.indexOf(oToken.getText()) === -1) {
						aModelTokensData.push(oToken.getText());
					}
					break;
				case false:
					if (aModelTokensData.indexOf(oToken.getText()) !== -1) {
						aModelTokensData.splice(aModelTokensData.indexOf(oToken.getText()), 1);
					}
					break;
				}
			}
			let sTokenToRemove = aTokens[0].mProperties.text;
			this._fnUpdateTokens(sIdVH, sTokenToRemove);
		},
		// onUpdateToken: function (oEvent) {
		// 	var bAdded = true;
		// 	var sProperty = "addedTokens";
		// 	var sIdVH = oEvent.getSource().getId().split("--").pop();
		// 	var aModelTokensData = this.getView().getModel("mTokens").getData()[sIdVH];
		// 	if (oEvent.getParameter("type") === "removed") {
		// 		bAdded = false;
		// 		sProperty = "removedTokens";
		// 	}
		// 	var aTokens = oEvent.getParameter(sProperty);
		// 	for (var iTok in aTokens) {
		// 		var oToken = aTokens[iTok];
		// 		var iIndexLine = aModelTokensData.map(function (a) {
		// 			return a.Id;
		// 		}).indexOf(oToken.getKey());
		// 		switch (bAdded) {
		// 		case true:
		// 			//Add new entry in array
		// 			if (iIndexLine === -1) {
		// 				aModelTokensData.push({
		// 					Id: oToken.getKey()
		// 				});
		// 			}
		// 			break;
		// 		case false:
		// 			//Delete already existing entry in array
		// 			if (iIndexLine !== -1) {
		// 				aModelTokensData.splice(iIndexLine, 1);
		// 			}
		// 			break;
		// 		}
		// 	}
		// 	//refresh model
		// 	this.getView().getModel("mTokens").refresh(true);
		// },
		_fnUpdateTokens: function (sTokenId, sTokenToRemove) {
			let oContextModel = this.getView().getModel("filterContext");
			let oTokensModel = this.getView().getModel("mTokens");
			if (sTokenId) {
				switch (sTokenId) {
					case "ContractId":
						if (sTokenToRemove) {
							try {
								let aContractFilters = [...this.contractFilters];
								let aUpdatedContractFilters = aContractFilters.filter(contractFilter => contractFilter.oValue1 !== sTokenToRemove);
								if (aUpdatedContractFilters.length > 0 && aUpdatedContractFilters) {
									this.contractFilters = aUpdatedContractFilters;
									oContextModel.setProperty(`/${sTokenId}`, aUpdatedContractFilters);
								} else {
									this.contractFilters = null;
									oContextModel.setProperty(`/${sTokenId}`, []);
								}
							} catch (error) {
								this.contractFilters = null;
								oContextModel.setProperty(`/${sTokenId}`, []);
							}
						} else {
							this.contractFilters = null;
							oContextModel.setProperty(`/${sTokenId}`, []);
							oTokensModel.setProperty(`/${sTokenId}`, []);
						}
						break;
				}
				this._fnUpdateContractSearchHelpSelectedItemsUponTokenDeletion(sTokenToRemove);
			}
		},
		_fnUpdateContractSearchHelpSelectedItemsUponTokenDeletion: function (sTokenToRemove) {
			let oTreeTableModel = this.getView().getModel("oTreeDataModel");
			let oTreeTableModelData = oTreeTableModel.getData();
			let aCopyOfTreeTableModelContractData = [];
			let aChildContract = [];
			let aParentContract = [];
			let aIndependentContract = [];
			oTreeTableModelData.contractData.forEach(contract => {
				if (contract.ContractId == sTokenToRemove) {
					if (contract.ContractParent == "" && contract.ContractType == "YLMO") {
						aIndependentContract.push(contract);
					} else {
						aParentContract.push(contract);
					}
				}
			});
			if (aIndependentContract.length > 0) {
				oTreeTableModelData.contractData.forEach(contract => {
					if (contract.ContractId == sTokenToRemove) {
						aCopyOfTreeTableModelContractData.push({...contract, selected: false, partiallySelected: false});
					} else {
						aCopyOfTreeTableModelContractData.push(contract);
					}
				});
			} else if (aParentContract.length > 0) {
				let aChildContracts = [];
				aParentContract[0].ChildContracts.forEach(childContract => {
					aChildContracts.push({...childContract, selected: false, partiallySelected: false});
				});
				let aSortedChildContracts = aChildContracts.sort((a, b) => a.ContractId - b.ContractId);
				oTreeTableModelData.contractData.forEach(contract => {
					if (contract.ContractId == sTokenToRemove) {
						aCopyOfTreeTableModelContractData.push({...contract, ChildContracts: aSortedChildContracts, selected: false, partiallySelected: false});
					} else {
						aCopyOfTreeTableModelContractData.push(contract);
					}
				});
			} 
			if (aParentContract.length == 0 && aIndependentContract.length == 0) {
				let aAllParentContracts = [];
				oTreeTableModelData.contractData.forEach(contract => {
					if (contract.ContractParent == "" && contract.ContractType == "YLMP") {
						aAllParentContracts.push(contract);
						}
					}
				);
				let aAllChildContracts = [];
				aAllParentContracts.forEach(parentContract => {
					aAllChildContracts.push(parentContract.ChildContracts);
				});
				aAllChildContracts.forEach(childContracts => {
					childContracts.forEach(childContract => {
						if (childContract.ContractId == sTokenToRemove) {
							aChildContract.push(childContract);
						}
					});
				});
			}
			if (aChildContract.length > 0) {
				let aParentContract = oTreeTableModelData.contractData.filter(contract => contract.ContractId == aChildContract[0]["ContractParent"]);
				let aSiblingChildContracts = [];
				aParentContract[0].ChildContracts.filter(childContract => {
					if (childContract.ContractId != aChildContract[0]["ContractId"]) {
						aSiblingChildContracts.push(childContract);
					}
				});
				let aSelectedChildContracts = [];
				let aCopyOfParentContract;
				let aChildContracts = [];
				aChildContracts.push({...aChildContract[0], selected: false});
				if (aSiblingChildContracts.length > 0) {
					aSelectedChildContracts = aSiblingChildContracts.filter(contract => contract.selected == true);
				}
				aSiblingChildContracts.forEach(siblingContract => {
					aChildContracts.push(siblingContract);
				})
				let aSortedChildContracts = aChildContracts.sort((a, b) => a.ContractId - b.ContractId);
				if (aSelectedChildContracts.length > 0) {
					aCopyOfParentContract = [{...aParentContract[0], selected: true, partiallySelected: true, ChildContracts: aSortedChildContracts}];
				} else {
					aCopyOfParentContract = [{...aParentContract[0], selected: false, partiallySelected: false, ChildContracts: aSortedChildContracts}];
				}
				oTreeTableModelData.contractData.forEach(contract => {
					if (contract.ContractId == aCopyOfParentContract[0].ContractId) {
						aCopyOfTreeTableModelContractData.push({...contract, ChildContracts: aCopyOfParentContract[0].ChildContracts,
							selected: aCopyOfParentContract[0].selected, partiallySelected: aCopyOfParentContract[0].partiallySelected});
					} else {
						aCopyOfTreeTableModelContractData.push(contract);
					}
				});
			}
			let aSortedContractData = aCopyOfTreeTableModelContractData.sort((a, b) => a.ContractId - b.ContractId);
			oTreeTableModel.setProperty("/contractData", aSortedContractData);
			oTreeTableModel.refresh(true);
		},
		onIdContractValueHelpRequest: async function () {
			let oView = this.getView();
			// let oi18n = this.fnGetResourceBundle();
			if (!this._treeTableDialog) {
				this._treeTableDialog = new sap.m.Dialog({
					id: "ContractIdDialog",
					title: this.fnGetResourceBundle("TableSelectDialogTitleContract"),
					content: sap.ui.xmlfragment(oView.getId(), "com.vesi.zfac4_valtoker.view.fragment.Home.valueHelp.ContractId", this),
					contentWidth: "65%",
					titleAlignment: "Center"
				});
				oView.addDependent(this._treeTableDialog);
				await this._fnGetContractSearchHelpData();
				this._fnHandleContractSearchHelpData();
			}
			this._treeTableDialog.open();
		},
		onContractSearchHelpClose: function (oEvent) {
			this._treeTableDialog.close();
		},
		_fnGetContractSearchHelpData: function () {
			let oTreeTableModel = this.getView().getModel("oTreeDataModel");
			return new Promise((resolve, reject) => {
				let oModel = this.getOwnerComponent().getModel("VH");
				oModel.read("/ContractSet", {
					success: function (oData) {
						if (oData) {
							oTreeTableModel.setProperty("/results", oData.results);
						}
						resolve();
					}.bind(this),
					error: function (oError) {
						MessageBox.error(oError);
						resolve();
					}.bind(this)
				})
			})
		},
		_fnHandleContractSearchHelpData: function () {
			let oTreeTableModel = this.getView().getModel("oTreeDataModel");
			let oTreeTableModelData = oTreeTableModel.getData();
			let aIndependentContracts = oTreeTableModelData.results.filter(contract => contract.ContractParent == "" && contract.ContractType == "YLMO");
			let aParentContracts = oTreeTableModelData.results.filter(contract => contract.ContractType == "YLMP");
			let aChildContracts = oTreeTableModelData.results.filter(contract => contract.ContractParent != "" && contract.ContractType == "YLMO");
			let aContractGroups = [];
			let aNestedContracts = [];
			let aIndependentContractWithSelection = [];
			for (let parentContract of aParentContracts) {
				aNestedContracts = [];
				for (let childContract of aChildContracts) {
					if (parentContract.ContractId == childContract.ContractParent) {
						aNestedContracts.push({...childContract, selected: false});
					}
				}
				aContractGroups.push({...parentContract, ChildContracts: aNestedContracts, selected: false});
			}
			for (let independentContract of aIndependentContracts) {
				aIndependentContractWithSelection.push({...independentContract, selected: false})
			}
			let aFormattedContracts = aContractGroups.concat(aIndependentContractWithSelection);
			let aSortedFormattedContracts = aFormattedContracts.sort((a, b) => a.ContractId - b.ContractId);
			oTreeTableModel.setProperty("/contractData", aSortedFormattedContracts);
			this._treeTableDialog.setModel(oTreeTableModel, "oTreeTableModel");
		},
		// 14168 - END
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
			var aFilters = this._fnGetFilters("homeFilterBar");
			if (aFilters.length > 0) {
				var mainFilter = new Filter({
					filters: aFilters,
					and: true
				});
			}
			var mParams = {
				urlParameters: {
					$inlinecount: "allpages"
				},
				filters: [mainFilter],
				success: function (oData) {
					var oSite = {
						count: oData.__count,
						list: oData.results
					};
					this.fnHideBusyIndicator();
					this.fnSetJSONModel(oSite, "mSite");
				}.bind(this),
				error: function (oData) {
					var oSite = {
						count: 0,
						list: []
					};
					this.fnHideBusyIndicator();
					this.fnSetJSONModel(oSite, "mSite");
				}.bind(this)
			};
			this.fnShowBusyIndicator(null, 0);
			this.fnGetODataModel().read("/SiteSet", mParams);
		},
		/*
		 * Event on Clear in filter bar
		 */
		onFiltersClear: function (oEvent) {
			// Reset model for filters
			this._initFilter();
			// Reset MultiCombox
			var aFilterBarFilters = this.byId("homeFilterBar").getAllFilterItems();
			for (var iTok in aFilterBarFilters) {
				var oFilter = aFilterBarFilters[iTok];
				if (oFilter.getGroupName() === "MultiComboBox") {
					oFilter.getControl().removeAllSelectedItems();
				}
			}
		},
		/*
		 * Event on Personalization for Site Table
		 */
		onSitesTablePersonalizationPress: function () {
			this._onTablePersonalizePress("/model/Config/Home/SiteTable.json", "TableSite");
		},
		/*
		 * Event on press button naviguate to detail
		 */
		onPressNavigateToDetail: function (oEvent) {
			var oCustomData = oEvent.getSource().getCustomData();
			if (oCustomData) {
				var oRouter = this.fnGetRouter();
				oRouter.navTo("Detail", {
					SiteId: oCustomData ? encodeURIComponent(oCustomData[0].getKey()) : ""
				});
			}
		}
	});
});
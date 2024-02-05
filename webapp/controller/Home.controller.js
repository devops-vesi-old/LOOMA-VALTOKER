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
			let oTreeTableModel = new JSONModel({});
			this.getView().setModel(oTreeTableModel, "oTreeDataModel");
			this._initFilterContextModel();
			let oResetContractFilterModel = new JSONModel({bReset: true});
			this.getView().setModel(oResetContractFilterModel, "oContractFilterResetStatus");
		},
		_initFilterContextModel: function () {
			const oModel = new JSONModel({
				ContractId: []
			});
			this.fnSetModel(oModel, "filterContext");
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
			let oFilter = {};
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
			let sYesId = "true",
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
			let mParams = {
				filters: [new Filter({
					path: "CharactId",
					operator: "EQ",
					value1: "YLO_SITE_TYPE"
				})],
				success: function (oData) {
					let oTypeDesc = {};
					for (let idx in oData.results) {
						let oLine = oData.results[idx];
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
			let oTokens = {
				ContractId: [],
				SiteId: []
			};
			this.fnSetJSONModel(oTokens, "mTokens");
		},
		/*
		 * Method to get data with filter from VH
		 */
		_searchVH: function (oEvent, bIsFromContractSH) {
			let aFilters = this._getVHDefaultFilters(oEvent.getSource().getId().split("-id").pop().split("Dialog").shift());
			let oSettings = {
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
			let oFiltersToGet = {
				SiteId: ["ContractId"]
			};
			if (!oFiltersToGet[id]) {
				return [];
			}
			let aFilters = [];
			let aFilterBarFilters = this.byId("homeFilterBar").getAllFilterItems();
			for (let idx in aFilterBarFilters) {
				let oToken = aFilterBarFilters[idx];
				if (oToken.getGroupName() === "MultiInput") {
					if (oFiltersToGet[id].indexOf(oToken.getName()) !== -1) {
						let aTokens = oToken.getControl().getTokens();
						for (let iTok in aTokens) {
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
		//--------------------------------------------
		// Event functions
		//--------------------------------------------
		/*
		 * Method to open the right dialog for value help request
		 */
		onValueHelpRequested: function (oEvent) {
			let oView = this.getView();
			let sCurrId = oEvent.getSource().getId().split("-").pop();
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
				let oBinding = oDialog.getBinding("items");
				let aDefaultFilters = this._getVHDefaultFilters(this._sCurrId);
				oBinding.filter(aDefaultFilters, "Application");
				oDialog.open();
			}.bind(this));
		},
		/*
		 * Event on TokenUpdate from MultiInput
		 */
		_fnRemoveDuplicateEntriesFromParentContractArray: function (aArray) {
			return aArray.filter((value, index) => aArray.indexOf(value) === index);
		},
		_fnDetermineFilteredParentContractsUponContractSearchHelpSearchEvent: function (aAllMatchingChildContracts, aAllParentContracts) {
			let aSelectedParentContractIndicesWithPossibleDuplicates = [];
			aAllMatchingChildContracts.forEach(childContract => {
				aSelectedParentContractIndicesWithPossibleDuplicates.push(childContract.IdParentContract);
			});
			let aSelectedParentContractIndices = this._fnRemoveDuplicateEntriesFromParentContractArray(aSelectedParentContractIndicesWithPossibleDuplicates);
			let aParentContracts = [];
			aAllParentContracts.forEach(parentContract => {
				aSelectedParentContractIndices.forEach(idParentContract => {
					if (parentContract.ContractId == idParentContract) {
						aParentContracts.push(parentContract);
					}
				});
			});
			let aCustomParentContracts = [];
			let aFilteredChildContracts = [];
			aParentContracts.forEach(parentContract => {
				parentContract.ChildContracts.forEach(parentContractChildContract => {
					aAllMatchingChildContracts.forEach(childContract => {
						if (parentContractChildContract.ContractId == childContract.ContractId) {
							aFilteredChildContracts.push(childContract);
						}
					})
				});
				aCustomParentContracts.push({...parentContract, ChildContracts: aFilteredChildContracts});
			});
			return aCustomParentContracts;
		},
		_fnSearchForContractObjectContainingQueryInfo: function (aContractObject, sSearchQuery) {
			let aFilteredArray = [];
			aContractObject.forEach(contract => {
				if (contract["ContractId"].toLowerCase().includes(sSearchQuery.toLowerCase()) ||
				contract["ContractParent"].toLowerCase().includes(sSearchQuery.toLowerCase()) ||
				contract["ContractPTitle"].toLowerCase().includes(sSearchQuery.toLowerCase()) ||
				contract["ContractName"].toLowerCase().includes(sSearchQuery.toLowerCase())) {
					aFilteredArray.push(contract);
				}
			});
			return aFilteredArray;
		},
		_searchContracts: async function (oEvent) {
			let sSearchQuery = "";
			let oTreeDataModel = this.getView().getModel("oTreeDataModel");
			try {
				sSearchQuery = oEvent.getParameter("query");
			} catch (error) {
				// do nothing
			}
			if (sSearchQuery != "") {
				await this._fnGetContractSearchHelpData();
				this._fnHandleContractSearchHelpData();
				oTreeDataModel = this.getView().getModel("oTreeDataModel");
				let oTreeDataModelContractData = oTreeDataModel.getData().contractData;
				let aAllNonChildContracts = [...oTreeDataModelContractData];
				let aAllParentContracts = this._fnGetContractsByType(oTreeDataModelContractData, "ParentContracts");
				let aAllChildContracts = [];
				aAllParentContracts.forEach(parentContract => {
					parentContract.ChildContracts.forEach(childContract => {
						aAllChildContracts.push(childContract);
					})
				});
				let aAllMatchingNonChildContracts = [], aAllMatchingChildContracts = [];
				aAllMatchingNonChildContracts = this._fnSearchForContractObjectContainingQueryInfo(aAllNonChildContracts, sSearchQuery);
				aAllMatchingChildContracts = this._fnSearchForContractObjectContainingQueryInfo(aAllChildContracts, sSearchQuery);
				if (aAllMatchingNonChildContracts.length > 0 && aAllMatchingChildContracts.length == 0) {
					oTreeDataModel.setProperty("/contractData", aAllMatchingNonChildContracts);
					oTreeDataModel.refresh(true);
				} else if (aAllMatchingNonChildContracts.length == 0 && aAllMatchingChildContracts.length > 0) {
					let aCustomParentContracts = this._fnDetermineFilteredParentContractsUponContractSearchHelpSearchEvent(aAllMatchingChildContracts, aAllParentContracts);
					oTreeDataModel.setProperty("/contractData", aCustomParentContracts);
					oTreeDataModel.refresh(true);
				} else if (aAllMatchingNonChildContracts.length > 0 && aAllMatchingChildContracts.length > 0) {
					let aCustomParentContracts = this._fnDetermineFilteredParentContractsUponContractSearchHelpSearchEvent(aAllMatchingChildContracts, aAllParentContracts);
					let aFilteredContracts;
					let bNonChildContractsAreNotParentContracts = [];
					aAllMatchingNonChildContracts.forEach(nonChildContract => {
						aCustomParentContracts.forEach(parentContract => {
							if (nonChildContract.ContractId == parentContract.ContractId) {
								bNonChildContractsAreNotParentContracts.push(parentContract);
							}
						});
					})
					if (bNonChildContractsAreNotParentContracts.length == 0) {
						aFilteredContracts = aAllMatchingNonChildContracts.concat(aCustomParentContracts);
					} else {
						aFilteredContracts = aCustomParentContracts;
					}
					let aSortedFilteredContracts = aFilteredContracts.sort((a, b) => a.ContractId - b.ContractId);
					oTreeDataModel.setProperty("/contractData", aSortedFilteredContracts);
					oTreeDataModel.refresh(true);
				}
			} else {
				await this._fnGetContractSearchHelpData();
				this._fnHandleContractSearchHelpData();
				oTreeDataModel.refresh(true);
			}
		},
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
		_fnHandleIndependentAndParentContractsTokenUpdate: function (oTreeTableModelData, sTokenToRemove) {
			let aIndependentContract = [];
			let aParentContract = [];
			oTreeTableModelData.contractData.forEach(contract => {
				if (contract.ContractId == sTokenToRemove) {
					if (contract.ContractParent == "" && contract.ContractType == "YLMO") {
						aIndependentContract.push(contract);
					} else if (contract.DisplayAsParent) {
						aIndependentContract.push(contract);
					} else {
						aParentContract.push(contract);
					}
				}
			});
			return [aIndependentContract, aParentContract];
		},
		_fnUpdateContractSearchHelpSelectedItemsUponTokenDeletion: function (sTokenToRemove) {
			let oTreeTableModel = this.getView().getModel("oTreeDataModel");
			let oTreeTableModelData = oTreeTableModel.getData();
			let aCopyOfTreeTableModelContractData = [];
			let aChildContract = [];
			let aParentContract = [];
			let aIndependentContract = [];
			let aFilteredIndependentAndParentContracts = this._fnHandleIndependentAndParentContractsTokenUpdate(oTreeTableModelData, sTokenToRemove);
			aIndependentContract = aFilteredIndependentAndParentContracts[0];
			aParentContract = aFilteredIndependentAndParentContracts[1];
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
			try {
				const oSearchField = this.getView().byId("ContractIdDialog").getExtension()[0].getContent()[0];
				oSearchField.setValue("");
			} catch (error) {
				// do nothing
			}
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
			let oResetContractFilterModel = this.getView().getModel("oContractFilterResetStatus");
			let bResetFilter = oResetContractFilterModel.getProperty("/bReset");
			if (bResetFilter) {
				await this._fnGetContractSearchHelpData();
				this._fnHandleContractSearchHelpData();
				oResetContractFilterModel.setProperty("/bReset", false);
			}
			this._treeTableDialog.open();
		},
		onContractSearchHelpClose: function (oEvent) {
			this._treeTableDialog.close();
		},
		_fnGetParentContracts: function (aCopyOfTreeTableModelContractData) {
			let aParentContracts = [];
			aCopyOfTreeTableModelContractData.filter(contract => {
				try {
					if (contract.ChildContracts.length > 0) {
						aParentContracts.push(contract);
					}
				} catch (error) {
					return aParentContracts;
				}
			});
			return aParentContracts;
		},
		_fnHandleChildContractSelection: function (aCopyOfTreeTableModelContractData, oSelectedContract, bSelectedValue, oTreeTableModel) {
			let aParentContracts = this._fnGetParentContracts(aCopyOfTreeTableModelContractData);
			let oParentContractOfSelectedChildContract;
			let aSiblingChildContracts = [];
			let aChildContracts = [];
			for (let parentContract of aParentContracts) {
				for (let childContract of parentContract.ChildContracts) {
					if (childContract.ContractId == oSelectedContract.ContractId) {
						aChildContracts.push(childContract);
						oParentContractOfSelectedChildContract = parentContract;
					} else if (childContract.ContractParent == oSelectedContract.ContractParent) {
						aSiblingChildContracts.push(childContract);
						aChildContracts.push(childContract);
					}
				}
			}
			let aSelectedSiblingChildContracts = [];
			for (let siblingChildContract of aSiblingChildContracts) {
				if (siblingChildContract.selected == true) {
					aSelectedSiblingChildContracts.push(siblingChildContract);
				}
			}
			let oUpdatedParentContractOfSelectedChildContract;
			if (aSelectedSiblingChildContracts.length > 0) {
				let iNumberOfUnselectedChildrendContracts = aChildContracts.length - aSelectedSiblingChildContracts.length;
				if (oParentContractOfSelectedChildContract.selected == true && oParentContractOfSelectedChildContract.partiallySelected == true) {
					if (bSelectedValue) {
						if (iNumberOfUnselectedChildrendContracts == 1) {
							oUpdatedParentContractOfSelectedChildContract = { ...oParentContractOfSelectedChildContract, selected: true, partiallySelected: false };
						} else if (iNumberOfUnselectedChildrendContracts > 1) {
							oUpdatedParentContractOfSelectedChildContract = { ...oParentContractOfSelectedChildContract, selected: true, partiallySelected: true };
						}
					} else {
						oUpdatedParentContractOfSelectedChildContract = { ...oParentContractOfSelectedChildContract, selected: true, partiallySelected: true };
					}
				} else if (oParentContractOfSelectedChildContract.selected == true && oParentContractOfSelectedChildContract.partiallySelected == false) {
					if (!bSelectedValue) {
						oUpdatedParentContractOfSelectedChildContract = { ...oParentContractOfSelectedChildContract, selected: true, partiallySelected: true };
					}
				}
			} else {
				let iNumberOfChildrendContracts = aChildContracts.length - 1;
				if (iNumberOfChildrendContracts == 0) {
					if (bSelectedValue) {
						oUpdatedParentContractOfSelectedChildContract = { ...oParentContractOfSelectedChildContract, selected: true, partiallySelected: false };
					} else {
						oUpdatedParentContractOfSelectedChildContract = { ...oParentContractOfSelectedChildContract, selected: false, partiallySelected: false };
					}
				} else if (iNumberOfChildrendContracts > 0) {
					if (bSelectedValue) {
						oUpdatedParentContractOfSelectedChildContract = { ...oParentContractOfSelectedChildContract, selected: true, partiallySelected: true };
					} else {
						oUpdatedParentContractOfSelectedChildContract = { ...oParentContractOfSelectedChildContract, selected: false, partiallySelected: false };
					}
				}
			}
			let aSelectedChildContractsToUpdate = [];
			for (let childContract of oUpdatedParentContractOfSelectedChildContract.ChildContracts) {
				if (childContract.ContractId != oSelectedContract.ContractId) {
					aSelectedChildContractsToUpdate.push(childContract);
				}
			}
			aSelectedChildContractsToUpdate.push(oSelectedContract);
			let aSortedUpdatedChildContract = aSelectedChildContractsToUpdate.sort((a, b) => a.ContractId - b.ContractId);
			oUpdatedParentContractOfSelectedChildContract.ChildContracts = aSortedUpdatedChildContract;
			let aCopyOfTreeTableModelContractDataParentContracts = aCopyOfTreeTableModelContractData.filter(contract => contract.ContractId != oUpdatedParentContractOfSelectedChildContract.ContractId);
			aCopyOfTreeTableModelContractDataParentContracts.push(oUpdatedParentContractOfSelectedChildContract);
			let aSortedChildData = aCopyOfTreeTableModelContractDataParentContracts.sort((a, b) => a.ContractId - b.ContractId);
			oTreeTableModel.setProperty("/contractData", aSortedChildData);
			oTreeTableModel.refresh(true);
		},
		_fnHandleIndependentContractSelection: function (aCopyOfTreeTableModelContractData, oSelectedContract, oTreeTableModel) {
			let aCopyOfTreeTableModelContractDataIndependentContracts = aCopyOfTreeTableModelContractData.filter(contract => contract.ContractId != oSelectedContract.ContractId);
			aCopyOfTreeTableModelContractDataIndependentContracts.push(oSelectedContract);
			let aSortedIndependentData = aCopyOfTreeTableModelContractDataIndependentContracts.sort((a, b) => a.ContractId - b.ContractId);
			oTreeTableModel.setProperty("/contractData", aSortedIndependentData);
			oTreeTableModel.refresh(true);
		},
		_fnHandleParentContractSelection: function (aCopyOfTreeTableModelContractData, oSelectedContract, oTreeTableModel) {
			let aCopyOfTreeTableModelContractDataParentContracts = aCopyOfTreeTableModelContractData.filter(contract => contract.ContractId != oSelectedContract.ContractId);
			let oSelectedParentContract = { ...oSelectedContract };
			let aUpdatedChildContracts = [];
			for (let childContract of oSelectedParentContract.ChildContracts) {
				aUpdatedChildContracts.push({ ...childContract, selected: oSelectedParentContract.selected });
			}
			let aSortedChildContracts = aUpdatedChildContracts.sort((a, b) => a.ContractId - b.ContractId);
			let oUpdatedSelectedParentContract = { ...oSelectedParentContract, ChildContracts: aSortedChildContracts };
			aCopyOfTreeTableModelContractDataParentContracts.push(oUpdatedSelectedParentContract);
			let oSortedParentData = aCopyOfTreeTableModelContractDataParentContracts.sort((a, b) => a.ContractId - b.ContractId);
			oTreeTableModel.setProperty("/contractData", oSortedParentData);
			oTreeTableModel.refresh(true);
		},
		onContractSearchHelpCheckBoxSelect: function (oEvent) {
			let oTreeTableModel = this.getView().getModel("oTreeDataModel");
			let oTreeTableModelData = oTreeTableModel.getData();
			let aCopyOfTreeTableModelContractData = [...oTreeTableModelData.contractData];
			let oContext = oEvent.getSource().getParent().getBindingContext("oTreeTableModel");
			let sPath = oContext.getPath();
			let oSelectedContract = oContext.getModel().getProperty(sPath);
			oSelectedContract.partiallySelected = false;
			let bSelectedValue = oSelectedContract.selected;
			this._fnUpdateTokens("ContractId", bSelectedValue);
			if (oSelectedContract.ContractParent != "" && oSelectedContract.ContractType == "YLMO") {
				if (oSelectedContract.DisplayAsParent) {
					this._fnHandleIndependentContractSelection(aCopyOfTreeTableModelContractData, oSelectedContract, oTreeTableModel);
				} else {
					this._fnHandleChildContractSelection(aCopyOfTreeTableModelContractData, oSelectedContract, bSelectedValue, oTreeTableModel);
				}
			} else if (oSelectedContract.ContractParent == "" && oSelectedContract.ContractType == "YLMO") {
				this._fnHandleIndependentContractSelection(aCopyOfTreeTableModelContractData, oSelectedContract, oTreeTableModel);
			} else {
				this._fnHandleParentContractSelection(aCopyOfTreeTableModelContractData, oSelectedContract, oTreeTableModel);
			}
			if (oSelectedContract.selected == false) {
				oTreeTableModel.setProperty("/selectAll", false);
			}
		},
		_fnRemoveDuplicateEntriesFromArray: function (aArray) {
			const uniqueSet = new Set(aArray.map(JSON.stringify));
			return Array.from(uniqueSet).map(JSON.parse);
		},
		fnFillInContractParents: function (aRawContractData) {
			let aParentContractsWithDuplicateEntries = [];
			aRawContractData.forEach(contract => {
				if (contract.ContractParent !== "" && !contract.DisplayAsParent) {
					aParentContractsWithDuplicateEntries.push({
							ContractId: contract.ContractParent,
							ContractName: contract.ContractPTitle,
							ContractPTitle: "",
							ContractParent: "",
							ContractType: "YLMP",
							IsActive: "",
							selected: false,
							partiallySelected: false
						});
				}
			});
			let aParentContracts = this._fnRemoveDuplicateEntriesFromArray(aParentContractsWithDuplicateEntries);
			return aRawContractData.concat(aParentContracts);
		},
		_fnHandleIndependentAndParentContractSelectionUponConfirmPress: function (oTreeDataModelContractData) {
			let aSelectedParentContracts = [];
			let aPartiallySelectedParentContracts = [];
			let aSelectedIndependentContracts = [];
			for (let contract of oTreeDataModelContractData) {
				if (contract.selected == true && contract.partiallySelected == false && contract.ContractType == "YLMP") {
					aSelectedParentContracts.push(contract);
				} else if (contract.selected == true && contract.partiallySelected == true && contract.ContractType == "YLMP") {
					aPartiallySelectedParentContracts.push(contract);
				} else if (contract.selected == true && contract.ContractType == "YLMO" && contract.ContractParent == "") {
					aSelectedIndependentContracts.push(contract);
				} else if (contract.selected && contract.DisplayAsParent) {
					aSelectedIndependentContracts.push(contract);
				}
			}
			return [aSelectedParentContracts, aPartiallySelectedParentContracts, aSelectedIndependentContracts];
		},
		onContractSearchHelpConfirm: function (oEvent) {
			if (!oEvent) {
				return;
			} else {
				let oTreeDataModelContractData = this.getView().getModel("oTreeDataModel").getData().contractData;
				let aSelectedParentContracts = [];
				let aPartiallySelectedParentContracts = [];
				let aSelectedIndependentContracts = [];
				let aSelectedIndependentAndParentContracts = this._fnHandleIndependentAndParentContractSelectionUponConfirmPress(oTreeDataModelContractData);
				aSelectedParentContracts = aSelectedIndependentAndParentContracts[0];
				aPartiallySelectedParentContracts = aSelectedIndependentAndParentContracts[1];
				aSelectedIndependentContracts = aSelectedIndependentAndParentContracts[2];
				if (aSelectedParentContracts.length == 0 && aPartiallySelectedParentContracts.length == 0 && aSelectedIndependentContracts.length == 0) {
					this.onContractSearchHelpClose();
				} else {
					let aChildContractsFromSelectedParentContractsArray = [];
					aSelectedParentContracts.forEach(parentContract => aChildContractsFromSelectedParentContractsArray.push(parentContract.ChildContracts));
					let aChildContractsFromSelectedParentContracts = [];
					aChildContractsFromSelectedParentContractsArray.forEach(childContracts => {
						childContracts.forEach(childContract => {
							aChildContractsFromSelectedParentContracts.push(childContract);
						});
					});
					let aChildrenContractFromPartiallySelectedParentContracts = [];
					aPartiallySelectedParentContracts.forEach(partiallySelectedParentContract => aChildrenContractFromPartiallySelectedParentContracts.push(partiallySelectedParentContract.ChildContracts));
					let aSelectedChildrenContractFromPartiallySelectedParentContracts = [];
					aChildrenContractFromPartiallySelectedParentContracts.forEach(childContractArray => {
						aSelectedChildrenContractFromPartiallySelectedParentContracts = childContractArray.filter(childContract => childContract.selected == true);
					})
					let aSelectedContracts = [];
					aSelectedContracts = aSelectedParentContracts.concat(aChildContractsFromSelectedParentContracts.concat(aSelectedChildrenContractFromPartiallySelectedParentContracts.concat(aSelectedIndependentContracts)));
					this.onValueHelpConfirm(null, aSelectedContracts, oEvent.getSource().getParent().getParent());
					this.onContractSearchHelpClose();
				}
			}
		},
		_fnGetContractSearchHelpData: function () {
			let oTreeTableModel = this.getView().getModel("oTreeDataModel");
			return new Promise((resolve, reject) => {
				let oModel = this.getOwnerComponent().getModel("VH");
				oModel.read("/ContractSet", {
					success: function (oData) {
						if (oData) {
							let aFormattedContractDataWithParentContracts = this.fnFillInContractParents(oData.results);
							oTreeTableModel.setProperty("/results", aFormattedContractDataWithParentContracts);
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
		_fnGetContractsByType: function (oTreeTableModelData, sType) {
			switch (sType) {
				case "IndependentContracts":
					let aOnlyIndependentContracts = oTreeTableModelData.filter(contract => contract.ContractParent == "" && contract.ContractType == "YLMO");
					let aChildContractsToDisplayAsIndependent = oTreeTableModelData.filter(contract => contract.DisplayAsParent);
					return aOnlyIndependentContracts.concat(aChildContractsToDisplayAsIndependent);
				case "ParentContracts":
					return oTreeTableModelData.filter(contract => contract.ContractType == "YLMP");
				case "ChildContracts":
					return oTreeTableModelData.filter(contract => contract.ContractParent != "" && contract.ContractType == "YLMO");
			}
		},
		_fnHandleContractSearchHelpData: function () {
			let oTreeTableModel = this.getView().getModel("oTreeDataModel");
			let oTreeTableModelData = oTreeTableModel.getData();
			let aIndependentContracts = this._fnGetContractsByType(oTreeTableModelData.results, "IndependentContracts");
			let aParentContracts = this._fnGetContractsByType(oTreeTableModelData.results, "ParentContracts");
			let aChildContracts = this._fnGetContractsByType(oTreeTableModelData.results, "ChildContracts");
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
				aContractGroups.push({...parentContract, ChildContracts: aNestedContracts.sort((a, b) => a.ContractId - b.ContractId), selected: false});
			}
			for (let independentContract of aIndependentContracts) {
				aIndependentContractWithSelection.push({...independentContract, selected: false})
			}
			let aFormattedContracts = aContractGroups.concat(aIndependentContractWithSelection);
			let aSortedFormattedContracts = aFormattedContracts.sort((a, b) => a.ContractId - b.ContractId);
			oTreeTableModel.setProperty("/contractData", aSortedFormattedContracts);
			this._treeTableDialog.setModel(oTreeTableModel, "oTreeTableModel");
		},
		/*
		 * Event on Confirm from VH Dialog
		 */
		onValueHelpConfirm: function (oEvent, aSelectedContracts, oContractEvent) {
			let aSelectedItems;
			let sIdMultiInput;
			let oTokens = this.fnGetModel("mTokens");
			let iId = 0;
			let iText = 1;
			try {
				aSelectedItems = oEvent.getParameter("selectedItems");
				sIdMultiInput = oEvent.getSource().getId().split("--").pop().split("Dialog").shift();
			} catch (error) {
				aSelectedItems = aSelectedContracts;
				sIdMultiInput = oContractEvent.getId().split("--").pop().split("Dialog").shift();
			}
			//Delete previous Ids
			oTokens.getData()[sIdMultiInput] = [];
			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					try {
						let sText = oItem.getCells()[iText].getText();
						if (sText === "") {
							sText = oItem.getCells()[iId].getText();
						}
						oTokens.getData()[sIdMultiInput].push({
							Id: oItem.getCells()[iId].getText(),
							Text: sText
						});
					} catch (error) {
						oTokens.getData()[sIdMultiInput].push({
							Id: oItem.ContractId,
							Text: oItem.ContractName
						});
					}
				});
			}
			oTokens.refresh(true);
			// // Reset search parameters for next run
			try {
				this._setBindingCustomParams(oEvent.getSource().getBinding("items"), "", null);
			} catch (error) {
				this._setBindingCustomParams(aSelectedContracts, "", null);
			}
		},
		/*
		 * Event on Close from VH Dialog
		 */
		onValueHelpClose: function (oEvent) {
			// reset the filter
			let oBinding = oEvent.getSource().getBinding("items");
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
			let aFilters = this._fnGetFilters("homeFilterBar");
			let mainFilter;
			if (aFilters.length > 0) {
				mainFilter = new Filter({
					filters: aFilters,
					and: true
				});
			}
			let mParams = {
				urlParameters: {
					$inlinecount: "allpages"
				},
				filters: [mainFilter],
				success: function (oData) {
					let oSite = {
						count: oData.__count,
						list: oData.results
					};
					this.fnHideBusyIndicator();
					this.fnSetJSONModel(oSite, "mSite");
				}.bind(this),
				error: function (oData) {
					let oSite = {
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
			let aFilterBarFilters = this.byId("homeFilterBar").getAllFilterItems();
			for (let iTok in aFilterBarFilters) {
				let oFilter = aFilterBarFilters[iTok];
				if (oFilter.getGroupName() === "MultiComboBox") {
					oFilter.getControl().removeAllSelectedItems();
				}
			}
			let oResetContractFilterModel = this.getView().getModel("oContractFilterResetStatus");
			oResetContractFilterModel.setProperty("/bReset", true);
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
			let oCustomData = oEvent.getSource().getCustomData();
			if (oCustomData) {
				let oRouter = this.fnGetRouter();
				oRouter.navTo("Detail", {
					SiteId: oCustomData ? encodeURIComponent(oCustomData[0].getKey()) : ""
				});
			}
		}
	});
});
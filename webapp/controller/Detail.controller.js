sap.ui.define([
	"com/vesi/zfioac4_valpec/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/UriParameters",
	"sap/ui/core/Fragment",
	"com/vesi/zfioac4_valpec/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, JSONModel, UriParameters, Fragment, formatter, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("com.vesi.zfioac4_valpec.controller.Detail", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vesi.zfioac4_equihier.view.Home
		 */
		onInit: function () {
			this.fnGetRouter().getRoute("Detail").attachPatternMatched(this._onPatternMatched, this);
			// var oViewModel = new JSONModel({
			// 	bEquiListTableVisible: false
			// });
			// this.fnSetModel(oViewModel, "viewModel");
			// var oCreateModel = new JSONModel();
			// this.fnSetModel(oCreateModel, "createModel");
			// var oComponentData = this.getOwnerComponent().getComponentData();
			// var sObjectId;
			// if (oComponentData && oComponentData.startupParameters && oComponentData.startupParameters.SiteId) {
			// 	sObjectId = oComponentData.startupParameters.SiteId[0] || "";
			// } else {
			// 	var oUriParameters = new UriParameters(window.location.href);
			// 	sObjectId = oUriParameters.get("SiteId") || "";
			// }
			// this._SiteId = decodeURIComponent(this._sObjectId);
			// this._initFilterActive();
		},
		
	_onPatternMatched: function (oEvent) {
			// this.byId("detailPageLayout").setShowFooter(false);
			// BusyIndicator.hide();
			// this.byId("detailPageLayout").scrollToSection("generalDataSec");
			// this._showFormFragment("GeneralDataDisplay");
			// this._viewModel.setProperty("/editVisible", true);
			// this._viewModel.setProperty("/genDataActionVisible", true);
			// this._viewModel.setProperty("/editAttachments", true);
			// this._viewModel.setProperty("/attachmentsEditBtnVisible", true);

			// this._viewModel.setProperty("/bFuncLocTeamTblVisible", true);
			// this._viewModel.setProperty("/bContactTblVisible", false);
			// //End of visibility
			var sObjectId = oEvent.getParameter("arguments").SiteId;
			this._SiteId = decodeURIComponent(sObjectId);
			this.fnBindTreeTable();
			// this._viewModel.setProperty("/IdSite", this._sObjectId);
			// this.fnGetODataModel().metadataLoaded().then(function () {
			// 	var sObjectPath = this.fnGetODataModel().createKey("Site", {
			// 		IdSite: this._sObjectId
			// 	});
			// 	this._bindView("/" + sObjectPath);
			// }.bind(this));
		},		
		/*
		 * Called to instantiate the Domain Dialog and open the Value Help for selection
		 */
		// onDomainValueHelpRequest: function () {
		// 	var oView = this.getView(),
		// 		oViewModel = this.fnGetModel("viewModel"),
		// 		aFilters = [];
		// 	if (!this._domainValueHelpDialog) {
		// 		this._domainValueHelpDialog = Fragment.load({
		// 			id: oView.getId(),
		// 			name: "com.vesi.zfioac4_equihier.view.fragments.valuehelpfragments.DomainDialog",
		// 			controller: this
		// 		}).then(function (oDomainValueHelpDialog) {
		// 			oView.addDependent(oDomainValueHelpDialog);
		// 			return oDomainValueHelpDialog;
		// 		});
		// 	}
		// 	var sFunction = oViewModel.getProperty("/FunctionId");
		// 	var sFamily = oViewModel.getProperty("/FamilyId");
		// 	if (sFunction) {
		// 		aFilters.push(new Filter("IvIdFunction", FilterOperator.EQ, sFunction));
		// 	}
		// 	if (sFamily) {
		// 		aFilters.push(new Filter("IvIdFamily", FilterOperator.EQ, sFamily));
		// 	}
		// 	this._domainValueHelpDialog.then(function (oDomainValueHelpDialog) {
		// 		oDomainValueHelpDialog.getBinding("items").filter(aFilters);
		// 		oDomainValueHelpDialog.open();
		// 	});
		// },
		// /*
		//  * Event Called from DomainDialog.fragment to search for Domains in Value Help.
		//  * Method calls private method _searchDomains to filter domains based on search criteria
		//  */
		// onDomainValueHelpSearch: function (oEvent) {
		// 	this._searchDomains(oEvent, false);
		// },
		// /*
		//  * Event Called from suggest event of Domain Input field in filter bar
		//  * Method calls private method _searchDomains to filter domains based on search criteria
		//  */
		// onDomainSuggest: function (oEvent) {
		// 	this._searchDomains(oEvent, true);
		// },
		// /*
		//  * Event Called from DomainDialog.fragment once domain is selected from Value Help.
		//  * Method calls private method _prepareDomainFilters to prepare domain filters to filter Tree table
		//  */
		// onDomainValueHelpConfirm: function (oEvent) {
		// 	var oContext = oEvent.getParameter("selectedItem").getBindingContext();
		// 	this._prepareDomainFilters(oContext);
		// },
		// /*
		//  * Called from suggestionItemSelected event of Domain Input field in filter bar
		//  * Method calls private method _prepareDomainFilters to prepare domain filters to filter Tree table
		//  */
		// onDomainsuggestionItemSelected: function (oEvent) {
		// 	var oContext = oEvent.getParameter("selectedItem").getBindingContext();
		// 	this._prepareDomainFilters(oContext);
		// },
		// /*
		//  * Called from change event of Domain Input field in filter bar
		//  * Method calls private method _prepareDomainFilters to prepare domain filters to filter Tree table
		//  */
		// onDomainChange: function () {
		// 	this._prepareDomainFilters(null);
		// },
		// /*
		//  * Called to instantiate the Function Dialog and open the Value Help for selection
		//  */
		// onFunctionValueHelpRequest: function () {
		// 	var oView = this.getView(),
		// 		oViewModel = this.fnGetModel("viewModel"),
		// 		aFilters = [];
		// 	if (!this._functionValueHelpDialog) {
		// 		this._functionValueHelpDialog = Fragment.load({
		// 			id: oView.getId(),
		// 			name: "com.vesi.zfioac4_equihier.view.fragments.valuehelpfragments.FunctionDialog",
		// 			controller: this
		// 		}).then(function (oFunctionValueHelpDialog) {
		// 			oView.addDependent(oFunctionValueHelpDialog);
		// 			return oFunctionValueHelpDialog;
		// 		});
		// 	}
		// 	var sDomain = oViewModel.getProperty("/DomainId");
		// 	var sFamily = oViewModel.getProperty("/FamilyId");
		// 	if (sDomain) {
		// 		aFilters.push(new Filter("IvIdDomain", FilterOperator.EQ, sDomain));
		// 	}
		// 	if (sFamily) {
		// 		aFilters.push(new Filter("IvIdFamily", FilterOperator.EQ, sFamily));
		// 	}
		// 	this._functionValueHelpDialog.then(function (oFunctionValueHelpDialog) {
		// 		oFunctionValueHelpDialog.getBinding("items").filter(aFilters);
		// 		oFunctionValueHelpDialog.open();
		// 	});
		// },
		// /*
		//  * Event Called from FunctionDialog.fragment to search for Functions in Value Help.
		//  * Method calls private method _searchFunctions to filter functions based on search criteria
		//  */
		// onFunctionValueHelpSearch: function (oEvent) {
		// 	this._searchFunctions(oEvent, false);
		// },
		// /*
		//  * Event Called from suggest event of Function Input field in filter bar
		//  * Method calls private method _searchFunctions to filter functions based on search criteria
		//  */
		// onFunctionSuggest: function (oEvent) {
		// 	this._searchFunctions(oEvent, true);
		// },
		// /*
		//  * Event Called from FunctionDialog.fragment once function is selected from Value Help.
		//  * Method calls private method _prepareFunctionFilters to prepare function filters to filter Tree table
		//  */
		// onFunctionValueHelpConfirm: function (oEvent) {
		// 	var oContext = oEvent.getParameter("selectedItem").getBindingContext();
		// 	this._prepareFunctionFilters(oContext);
		// },
		// /*
		//  * Called from suggestionItemSelected event of Function Input field in filter bar
		//  * Method calls private method _prepareFunctionFilters to prepare function filters to filter Tree table
		//  */
		// onFunctionsuggestionItemSelected: function (oEvent) {
		// 	var oContext = oEvent.getParameter("selectedItem").getBindingContext();
		// 	this._prepareFunctionFilters(oContext);
		// },
		// /*
		//  * Called from change event of Function Input field in filter bar
		//  * Method calls private method _prepareFunctionFilters to prepare function filters to filter Tree table
		//  */
		// onFunctionChange: function () {
		// 	this._prepareFunctionFilters(null);
		// },
		// /*
		//  * Called to instantiate the Family Dialog and open the Value Help for selection
		//  */
		// onFamilyValueHelpRequest: function () {
		// 	var oView = this.getView(),
		// 		oViewModel = this.fnGetModel("viewModel"),
		// 		aFilters = [];
		// 	if (!this._familyValueHelpDialog) {
		// 		this._familyValueHelpDialog = Fragment.load({
		// 			id: oView.getId(),
		// 			name: "com.vesi.zfioac4_equihier.view.fragments.valuehelpfragments.FamilyDialog",
		// 			controller: this
		// 		}).then(function (oFamilyValueHelpDialog) {
		// 			oView.addDependent(oFamilyValueHelpDialog);
		// 			return oFamilyValueHelpDialog;
		// 		});
		// 	}
		// 	var sDomain = oViewModel.getProperty("/DomainId");
		// 	var sFunction = oViewModel.getProperty("/FunctionId");
		// 	if (sDomain) {
		// 		aFilters.push(new Filter("Domain", FilterOperator.EQ, sDomain));
		// 	}
		// 	if (sFunction) {
		// 		aFilters.push(new Filter("Function", FilterOperator.EQ, sFunction));
		// 	}
		// 	this._familyValueHelpDialog.then(function (oFamilyValueHelpDialog) {
		// 		oFamilyValueHelpDialog.getBinding("items").filter(aFilters);
		// 		oFamilyValueHelpDialog.open();
		// 	});
		// },
		// /*
		//  * Event Called from FamilyDialog.fragment to search for Families in Value Help.
		//  * Method calls private method _searchFamily to filter family based on search criteria
		//  */
		// onFamilyValueHelpSearch: function (oEvent) {
		// 	this._searchFamily(oEvent, false);
		// },
		// /*
		//  * Event Called from suggest event of Family Input field in filter bar
		//  * Method calls private method _searchFamily to filter family based on search criteria
		//  */
		// onFamilySuggest: function (oEvent) {
		// 	this._searchFamily(oEvent, true);
		// },
		// /*
		//  * Event Called from FamilyDialog.fragment once family is selected from Value Help.
		//  * Method calls private method _prepareFamilyFilters to prepare family filters to filter Tree table
		//  */
		// onFamilyValueHelpConfirm: function (oEvent) {
		// 	var oContext = oEvent.getParameter("selectedItem").getBindingContext();
		// 	this._prepareFamilyFilters(oContext);
		// },
		// /*
		//  * Called from suggestionItemSelected event of Family Input field in filter bar
		//  * Method calls private method _prepareFamilyFilters to prepare family filters to filter Tree table
		//  */
		// onFamilysuggestionItemSelected: function (oEvent) {
		// 	var oContext = oEvent.getParameter("selectedItem").getBindingContext();
		// 	this._prepareFamilyFilters(oContext);
		// },
		// /*
		//  * Called from change event of Family Input field in filter bar
		//  * Method calls private method _prepareFamilyFilters to prepare family filters to filter Tree table
		//  */
		// onFamilyChange: function (oEvent) {
		// 	this._prepareFamilyFilters(null);
		// },
		// /*
		//  * This is common event called for all Value Help Dialogs to close te dialog
		//  */
		// onValueHelpClose: function (oEvent) {
		// 	// reset the filter
		// 	var oBinding = oEvent.getSource().getBinding("items");
		// 	oBinding.filter([], "Application");
		// },
		// /*
		//  * Handler called on search event of Filter Bar. Method is used to filter the tree table
		//  */
		// onFilterHierarchyGo: function () {
		// 	var aFilters = [];
		// 	var oViewModel = this.getView().getModel("viewModel");
		// 	oViewModel.setProperty("/bEquiListTableVisible", false);
		// 	var sDomainId = oViewModel.getProperty("/DomainId");
		// 	if (sDomainId) {
		// 		aFilters.push(new Filter("DomainId", FilterOperator.EQ, sDomainId));
		// 	}
		// 	var sFunctionId = oViewModel.getProperty("/FunctionId");
		// 	if (sFunctionId) {
		// 		aFilters.push(new Filter("FunctionId", FilterOperator.EQ, sFunctionId));
		// 	}
		// 	var sFamilyId = oViewModel.getProperty("/FamilyId");
		// 	if (sFamilyId) {
		// 		aFilters.push(new Filter("FamilyId", FilterOperator.EQ, sFamilyId));
		// 	}
		// 	var sActiveFilter = this.getView().getModel("activeFilter").getProperty("/SelectedKey");
		// 	if (sActiveFilter && sActiveFilter !== "0") {
		// 		aFilters.push(new Filter("IsActive", FilterOperator.EQ, sActiveFilter === "true"));
		// 	}
		// 	this.fnBindTreeTable(aFilters);
		// },
		// /*
		//  * Handler called on clear event of Filter Bar. 
		//  * Method is used to clear the filter fields and rebind the tree table without filters
		//  */
		// onFilterBarClear: function () {
		// 	var oViewModel = this.getView().getModel("viewModel");
		// 	oViewModel.setProperty("/bEquiListTableVisible", false);
		// 	oViewModel.setProperty("/DomainId", "");
		// 	oViewModel.setProperty("/DomainDesc", "");
		// 	oViewModel.setProperty("/FunctionId", "");
		// 	oViewModel.setProperty("/FunctionDescription", "");
		// 	oViewModel.setProperty("/FamilyId", "");
		// 	oViewModel.setProperty("/FamilyDescription", "");
		// 	var oActiveFilterModel = this.getView().getModel("activeFilter");
		// 	oActiveFilterModel.setProperty("/SelectedKey", "0");
		// 	this.fnBindTreeTable([]);
		// },
		// /*
		//  * Method is called on Submit button of Create Fragment. It is used to open the Create dialog
		//  * Private method _changeCreateLayout is called to dispaly necessary based on whether Building/Floor/Room to be created
		//  * Private method _resetDialogValueStates is called to reset all error states on input fields before opening the dialog
		//  */
		// onCreateFuncionalLocPress: function (oEvent) {
		// 	var oView = this.getView(),
		// 		oViewModel = this.fnGetModel("viewModel");
		// 	oViewModel.setProperty("/bSensitiveFieldsVisible", false);
		// 	oViewModel.setProperty("/bMoreFieldsVisible", false);
		// 	var oContext = oEvent.getSource().getBindingContext("equiHierarchy");
		// 	this.fnFetchZones(oContext.getProperty("IdSite"));
		// 	if (!this._createDialog) {
		// 		this._createDialog = Fragment.load({
		// 			id: oView.getId(),
		// 			name: "com.vesi.zfioac4_equihier.view.fragments.CreateFuncLoc",
		// 			controller: this
		// 		}).then(function (oCreateDialog) {
		// 			var oCreateDialogMod = this._setStyleClassForPopup(oCreateDialog);
		// 			oView.addDependent(oCreateDialogMod);
		// 			return oCreateDialogMod;
		// 		}.bind(this));
		// 	}
		// 	this._createDialog.then(function (oCreateDialog) {
		// 		this._changeCreateLayout(oContext, oCreateDialog);
		// 		this._resetDialogValueStates(oCreateDialog, ["validationFields", "deadlineFields"]);
		// 		oCreateDialog.open();
		// 	}.bind(this));
		// },
		// /*
		//  * Method is use to do cross app navigation to view details of respective funtional location d
		//  */
		// onNavigateToFuncionalLocPress: function (oEvent) {
		// 	var oContext = oEvent.getSource().getBindingContext("equiHierarchy");
		// 	var sFuncLocType = oContext.getProperty("FuncLocType");
		// 	var sFuncLoc = oContext.getProperty("IdFuncLoc");
		// 	var oParamObject;
		// 	switch (sFuncLocType) {
		// 	case "BUILDING":
		// 		oParamObject = {
		// 			"buildingId": sFuncLoc
		// 		};
		// 		this._crossAppNav("ZBLDG_LOOMA", "display", oParamObject);
		// 		break;
		// 	case "FLOOR":
		// 		oParamObject = {
		// 			"floorId": sFuncLoc
		// 		};
		// 		this._crossAppNav("ZFLOOR_LOOMA", "display", oParamObject);
		// 		break;
		// 	case "ROOM":
		// 		oParamObject = {
		// 			"roomId": sFuncLoc
		// 		};
		// 		this._crossAppNav("ZROOM_LOOMA", "display", oParamObject);
		// 		break;
		// 	}
		// },
		// /*
		//  * Event is called on change event of Sensitive switch field 
		//  * It is used to hide or unhide deadline fields based on the Switch state
		//  */
		// onSensitiveSwitchChange: function (oEvent) {
		// 	var bState = oEvent.getParameter("state"),
		// 		oViewModel = this.fnGetModel("viewModel"),
		// 		oCreateModel = this.fnGetModel("createModel");
		// 	if (bState) {
		// 		oViewModel.setProperty("/bSensitiveFieldsVisible", true);
		// 	} else {
		// 		oViewModel.setProperty("/bSensitiveFieldsVisible", false);
		// 		this._createDialog.then(function (oCreateDialog) {
		// 			this._resetDialogValueStates(oCreateDialog, ["deadlineFields"]);
		// 		}.bind(this));
		// 		oCreateModel.setProperty("/LeadTimesReaction", "");
		// 		oCreateModel.setProperty("/LeadTimesOnSite", "");
		// 		oCreateModel.setProperty("/LeadTimesPartialRes", "");
		// 		oCreateModel.setProperty("/LeadTimesFinalRes", "");
		// 		oCreateModel.setProperty("/LeadTimesOnSiteOnCall", "");
		// 		oCreateModel.setProperty("/LeadTimesPartialResOnCall", "");

		// 	}
		// },
		// /*
		//  * Method is used to unhide the additional fields when user click on "More" link inside Create dialog
		//  */
		// onClickMore: function () {
		// 	var oViewModel = this.fnGetModel("viewModel");
		// 	oViewModel.setProperty("/bMoreFieldsVisible", true);
		// },
		// /*
		//  * Method is used to hide the additional fields when user click on "More" link inside Create dialog
		//  */
		// onClickHide: function () {
		// 	var oViewModel = this.fnGetModel("viewModel"),
		// 		oCreateModel = this.fnGetModel("createModel");
		// 	oViewModel.setProperty("/bMoreFieldsVisible", false);
		// 	oCreateModel.setProperty("/IdLocationFree", "");
		// 	oCreateModel.setProperty("/QrCode", "");
		// 	oCreateModel.setProperty("/LongText", "");
		// },
		// /*
		//  * Method is called on the close event of Create Dialog to close the dialog
		//  * It also initialises the "createModel" 
		//  */
		// onCloseCreateDialog: function () {
		// 	this._createDialog.then(function (oCreateDialog) {
		// 		var oCreateModel = this.fnGetModel("createModel");
		// 		oCreateModel.setData({});
		// 		oCreateDialog.close();
		// 	}.bind(this));
		// 	this.fnGetModel("viewModel").setProperty("/bCreateDialogSubmitBtnEnabled", false);

		// },
		// /*
		//  * Method is called on the column click of "Type" Column in Tree table
		//  * It Filters the tree table based on the functional location selected
		//  */
		// onCallFilters: function (oEvent, oBinding) {
		// 	var oItem = oEvent.getParameter("item");
		// 	var sIcon = oItem.getIcon();
		// 	var aFilter = [];
		// 	var oFirstFilterIcons = {
		// 		"sap-icon://functional-location": "SITE",
		// 		"sap-icon://building": "BUILDING",
		// 		"sap-icon://heatmap-chart": "FLOOR",
		// 		"sap-icon://machine": "ROOM"
		// 	};
		// 	var oSecondFilterIcons = {
		// 		"sap-icon://status-positive": "1",
		// 		"sap-icon://status-negative": "2",
		// 		"sap-icon://locked": "3",
		// 		"sap-icon://status-inactive": "4",
		// 		"sap-icon://status-critical": "5",
		// 		"sap-icon://add-equipment": "6"
		// 	};
		// 	var sFirstFilterType = oFirstFilterIcons[sIcon];
		// 	var sSecondFilterType = oSecondFilterIcons[sIcon];
		// 	if (sFirstFilterType) {
		// 		aFilter.push(new Filter("FuncLocType", FilterOperator.EQ, sFirstFilterType));
		// 	} else if (sSecondFilterType) {
		// 		aFilter.push(new Filter("UsageId", FilterOperator.EQ, sSecondFilterType));
		// 	} else if (sIcon === "sap-icon://warning") {
		// 		aFilter.push(new Filter("Sensitive", FilterOperator.EQ, "true"));
		// 	} else if (sIcon === "sap-icon://clear-filter") {
		// 		oBinding.filter([]);
		// 	}
		// 	oBinding.filter(aFilter);
		// },
		// onFilterFuncLoc: function (oEvent) {
		// 	var oBinding = this.byId("treeTable").getBinding("rows");
		// 	this.onCallFilters(oEvent, oBinding);
		// },
		// onFilterSensible: function (oEvent) {
		// 	var oBinding = this.byId("treeTable").getBinding("rows");
		// 	this.onCallFilters(oEvent, oBinding);
		// },
		// onVEStatusFiltered: function (oEvent) {
		// 	var oBinding = this.byId("equiTable").getBinding("rows");
		// 	this.onCallFilters(oEvent, oBinding);
		// },
		// /*
		// Method is called on change event of Type ComboBox. It is used to validate free text entered on ComboBox
		// */
		// onFuncLocTypeChange: function (oEvent) {
		// 	var bError = this._validateComboBoxValues(oEvent.getSource(), "/Type");
		// 	if (!bError) {
		// 		var oCreateModel = this.fnGetModel("createModel"),
		// 			sType = oCreateModel.getProperty("/Type"),
		// 			sName = "",
		// 			sFloorLevel = "";
		// 		sFloorLevel = oCreateModel.getProperty("/FloorLevel");
		// 		if (sFloorLevel) {
		// 			var sFirstChar = sFloorLevel.substr(0, 1);
		// 			sFloorLevel = (sFirstChar === "+" || sFirstChar === "-") ? "R" + sFloorLevel : "R+" + sFloorLevel;
		// 		}
		// 		var sFuncLocToBeCreated = oCreateModel.getProperty("/FuncLocToBeCreated");
		// 		if (sFuncLocToBeCreated === "Floor") {
		// 			if (sType === "FLOOR") {
		// 				sName = sFloorLevel;
		// 			} else {
		// 				sName = sType;
		// 			}
		// 			oCreateModel.setProperty("/Name", sName);
		// 			var oSource = this.byId("NameInput");
		// 			oSource.setValueState("None");
		// 			oSource.setValueStateText("");
		// 		}
		// 	}
		// },
		// /*
		// Method is called on change event of FlooringType ComboBox. It is used to validate free text entered on ComboBox
		// */
		// onFlooringTypeChange: function (oEvent) {
		// 	this._validateComboBoxValues(oEvent.getSource(), "/FlooringType");
		// },
		// /*
		// Method is called on change event of Floor No ComboBox. It is used to validate free text entered on ComboBox
		// */
		// onFloorNoChange: function (oEvent) {
		// 	var oCreateModel = this.fnGetModel("createModel"),
		// 		sType = oCreateModel.getProperty("/Type"),
		// 		sName = "",
		// 		sFloorLevel = "",
		// 		oInputControl,
		// 		bError,
		// 		oSource = oEvent.getSource();
		// 	var sValue = oSource.getValue();
		// 	if (sValue) {
		// 		var sFirstChar = sValue.substr(0, 1);
		// 		if (sFirstChar && (sFirstChar !== "+" && sFirstChar !== "-") && sValue.length > 3) {
		// 			bError = true;
		// 			this._setFloorErrorMessage(oSource);
		// 		} else {
		// 			sFloorLevel = (sFirstChar === "+" || sFirstChar === "-") ? "R" + sValue : "R+" + sValue;
		// 		}
		// 		var iValue = parseInt(sValue, 10);
		// 		var bIsInteger = Number.isInteger(iValue); //Check if only integer is inserted in the field
		// 		if (bIsInteger) {
		// 			if (sType === "FLOOR") {
		// 				sName = sFloorLevel;
		// 			} else {
		// 				sName = sType;
		// 			}
		// 			oCreateModel.setProperty("/Name", sName);
		// 			oInputControl = this.byId("NameInput");
		// 			oInputControl.setValueState("None");
		// 			oInputControl.setValueStateText("");
		// 			this.fnGetModel("viewModel").setProperty("/bCreateDialogSubmitBtnEnabled", true);
		// 		} else {
		// 			bError = true;
		// 			this._setFloorErrorMessage(oSource);
		// 		}
		// 	} else {
		// 		if (sType === "FLOOR") {
		// 			oCreateModel.setProperty("/Name", "");
		// 			oInputControl = this.byId("NameInput");
		// 			oInputControl.setValueState("None");
		// 			oInputControl.setValueStateText("");
		// 			this.fnGetModel("viewModel").setProperty("/bCreateDialogSubmitBtnEnabled", true);
		// 		}
		// 	}
		// 	if (!bError) {
		// 		oSource.setValueState("None");
		// 		oSource.setValueStateText("");
		// 		this.fnGetModel("viewModel").setProperty("/bCreateDialogSubmitBtnEnabled", true);
		// 	}
		// },
		// /*
		// Method is called on change event of Glass Coating Type ComboBox. 
		// It is used to validate free text entered on ComboBox
		// */
		// onGlassCoatingTypeChange: function (oEvent) {
		// 	this._validateComboBoxValues(oEvent.getSource(), "/GlassCoatingType");
		// },
		// /*
		// Method is called on change event of Certfication ComboBox. 
		// It is used to validate free text entered on ComboBox
		// */
		// onCertificationChange: function (oEvent) {
		// 	this._validateComboBoxValues(oEvent.getSource(), "/Certification");
		// },
		// /*
		// Method is called on change event of Zone1 ComboBox. 
		// It is used to truncate the text to 40 characters
		// */
		// onZone1Change: function (oEvent) {
		// 	var oSource = oEvent.getSource();
		// 	this._checkZoneValue(oSource, "zone1TruncateMessage");
		// },
		// /*
		// Method is called on change event of Zone2 ComboBox. 
		// It is used to truncate the text to 40 characters
		// */
		// onZone2Change: function (oEvent) {
		// 	var oSource = oEvent.getSource();
		// 	this._checkZoneValue(oSource, "zone2TruncateMessage");
		// },
		// /*
		// Method is called on change event of All Numeric.
		// It is used to validate if entered values in the field contains only numbers
		// */
		// onNumericFieldValidation: function (oEvent) {
		// 	var oInput = oEvent.getSource();
		// 	if (oInput.getValue()) {
		// 		var iRegEx = /^[0-9]+$/;
		// 		if (iRegEx.test(oInput.getValue())) {
		// 			oInput.setValueStateText("");
		// 			oInput.setValueState("None");
		// 			this._checkCreateDialogErrorFields();
		// 		} else {
		// 			var sText = this.fnGetResourceBundle().getText("deadlineTimeMess");
		// 			oInput.setValueStateText(sText);
		// 			oInput.setValueState("Error");
		// 			this.fnGetModel("viewModel").setProperty("/bCreateDialogSubmitBtnEnabled", false);
		// 		}
		// 	} else {
		// 		oInput.setValueStateText("");
		// 		oInput.setValueState("None");
		// 		this._checkCreateDialogErrorFields();
		// 	}
		// },
		// /*
		//  * Method is called when a link on "Description" column of tree table is clicked
		//  * Used to fetch equipments for selected functional location and binded to Equipments table
		//  */
		// onGetEquiForFuncLocPress: function (oEvent) {
		// 	this.byId("filterBar").setFilterBarExpanded(false);
		// 	var oContext = oEvent.getSource().getBindingContext("equiHierarchy");
		// 	var sFuncLocId = oContext.getProperty("IdFuncLoc");
		// 	this.fnBindEquipmentsTable(sFuncLocId);
		// },
		// /*
		//  * Method is called on click of Submit button of Create Dialog.
		//  * Same method is used to create Building/Floor/Room.
		//  * On successfull creation,tree table is refreshed with new functional location
		//  */
		// onSubmitFuncLoc: function () {
		// 	var oPayload = {},
		// 		sUrl,
		// 		sSuccessMsgI18nKey,
		// 		oCreateModel = this.fnGetModel("createModel"),
		// 		oResourceBundle = this.fnGetResourceBundle(),
		// 		oViewModel = this.fnGetModel("viewModel"),
		// 		iOriginalDelay = this.getView().getBusyIndicatorDelay();
		// 	var bError = this._validateMandatoryFields();
		// 	if (!bError) {
		// 		oViewModel.setProperty("/delay", 0);
		// 		oViewModel.setProperty("/busy", true);
		// 		var sFuncType = oCreateModel.getProperty("/FuncLocToBeCreated");
		// 		oPayload = this.createPayload(sFuncType);
		// 		sUrl = "/" + sFuncType;
		// 		sSuccessMsgI18nKey = "s" + sFuncType + "CreationSuccessMsg";
		// 		this.getOwnerComponent().getModel().create(sUrl, oPayload, {
		// 			success: function (oData, response) {
		// 				if (response.data.IdLocation) {
		// 					var sSuccessMsg = oResourceBundle.getText(sSuccessMsgI18nKey, [response.data.IdLocation]);
		// 					MessageToast.show(sSuccessMsg);
		// 				}
		// 				this.onFilterHierarchyGo();
		// 				this.onCloseCreateDialog();
		// 				oViewModel.setProperty("/busy", false);
		// 				oViewModel.setProperty("/delay", iOriginalDelay);
		// 			}.bind(this),
		// 			error: function (oError) {
		// 				oViewModel.setProperty("/busy", false);
		// 				oViewModel.setProperty("/delay", iOriginalDelay);
		// 				this.fnODataError(oError);
		// 			}.bind(this)
		// 		});
		// 	} else {
		// 		var sMsg = oResourceBundle.getText("enterMandatoryFields");
		// 		MessageBox.error(sMsg);
		// 	}
		// },
		// /*
		//  * Method is called on close button of Message Dialog to close the dialog
		//  */
		// onMessageDialogClose: function () {
		// 	this._messageDialog.then(function (oMessageDialog) {
		// 		oMessageDialog.close();
		// 	});
		// },
		// /*
		//  * Method is called from method "onGetEquiForFuncLocPress".
		//  * It fetched equipments for selected functional location and bind it to Equipment table
		//  */
		// fnBindEquipmentsTable: function (sSelectedFuncLocId) {
		// 	var aFilters = [],
		// 		oViewModel = this.fnGetModel("viewModel"),
		// 		sDomainId = oViewModel.getProperty("/DomainId"),
		// 		sFunctionId = oViewModel.getProperty("/FunctionId"),
		// 		sFamilyId = oViewModel.getProperty("/FamilyId");
		// 	oViewModel.setProperty("/bEquiListTableVisible", true);
		// 	this.fnCallBusyIndicatorForEquiTable();
		// 	aFilters.push(new Filter("IdFuncLoc", FilterOperator.EQ, sSelectedFuncLocId));
		// 	if (sDomainId) {
		// 		aFilters.push(new Filter("DomainId", FilterOperator.EQ, sDomainId));
		// 	}
		// 	if (sFunctionId) {
		// 		aFilters.push(new Filter("FunctionId", FilterOperator.EQ, sFunctionId));
		// 	}
		// 	if (sFamilyId) {
		// 		aFilters.push(new Filter("FamilyId", FilterOperator.EQ, sFamilyId));
		// 	}
		// 	this.byId("equiTable").bindAggregation("rows", {
		// 		path: "/HierarchyEquipmentSet",
		// 		filters: aFilters
		// 	});
		// },
		// /*
		//  * Method is called from method "oCreateFuncLocPress".
		//  * It fetches existing zones from functional locations
		//  */
		// fnFetchZones: function (sSiteId) {
		// 	var aFilters = [],
		// 		oViewModel = this.fnGetModel("viewModel"),
		// 		iOriginalDelay = this.getView().getBusyIndicatorDelay();
		// 	oViewModel.setProperty("/delay", 0);
		// 	oViewModel.setProperty("/busy", true);
		// 	aFilters.push(new Filter("IvFunction", FilterOperator.EQ, "ZONE"));
		// 	aFilters.push(new Filter("IvIdFuncLoc", FilterOperator.EQ, sSiteId));
		// 	this.getOwnerComponent().getModel().read("/VH_ZoneSet", {
		// 		filters: aFilters,
		// 		success: function (oData, response) {
		// 			var oZoneModel = new JSONModel();
		// 			oZoneModel.setData(oData.results);
		// 			this.fnSetModel(oZoneModel, "zones");
		// 			oViewModel.setProperty("/delay", iOriginalDelay);
		// 			oViewModel.setProperty("/busy", false);
		// 		}.bind(this),
		// 		error: function (oError) {
		// 			this.fnODataError(oError);
		// 		}.bind(this)
		// 	});
		// },
		/*
		 * Method is used to fetch Equipment hierarchy for a functional location
		 * Once data is fetched,_transformTreeData is called to tranform data to tree and bound to tree table
		 */
		fnBindTreeTable: function (aTableFilters) {
			// var oViewModel = this.fnGetModel("viewModel");
			// var iOriginalDelay = this.getView().getBusyIndicatorDelay();
			// oViewModel.setProperty("/delay", 0);
			// oViewModel.setProperty("/busy", true);
			var aFilters = [];
			aFilters.push(new Filter("SiteId", FilterOperator.EQ, this._SiteId));
			if (aTableFilters && aTableFilters.length > 0) {
				aFilters = aFilters.concat(aTableFilters);
			}
			this.getOwnerComponent().getModel().read("/LocationHierarchySet", {
				filters: aFilters,
				success: function (oData, response) {
					var aNodes = this._transformTreeData(oData.results);
					this._setTreeModelData(aNodes);
					// oViewModel.setProperty("/delay", iOriginalDelay);
					// oViewModel.setProperty("/busy", false);
				}.bind(this),
				error: function (oError) {
					this.fnODataError(oError);
				}.bind(this)
			});
		},
		// /*
		//  * Method is use to register method fnBindingEventHandler on onAfterRendering
		//  */
		// fnCallBusyIndicatorForEquiTable: function () {
		// 	this.byId("equiTable").addEventDelegate({
		// 		onAfterRendering: function () {
		// 			this.fnBindingEventHandler();
		// 		}.bind(this)
		// 	});
		// },
		// /*
		//  * Method is registered on "onAfterRendering" event of Equipments table to Hide or Unhide busy indicator
		//  */
		// fnBindingEventHandler: function () {
		// 	var oTable = this.byId("equiTable");
		// 	var oBinding = oTable.getBinding("rows");
		// 	var iBusyIndicatorDelay = this.getView().getBusyIndicatorDelay();
		// 	var oViewModel = this.fnGetModel("viewModel");
		// 	oBinding.attachDataRequested(function () {
		// 		oViewModel.setProperty("/delay", 0);
		// 		oViewModel.setProperty("/busy", true);
		// 	});
		// 	oBinding.attachDataReceived(function () {
		// 		oViewModel.setProperty("/delay", iBusyIndicatorDelay);
		// 		oViewModel.setProperty("/busy", false);
		// 	});
		// },
		/*
		 * Common method called in all OData calls to parse backend errors and display on Message Dialog
		 */
		fnODataError: function (oError) {
			var oViewModel = this.fnGetModel("viewModel");
			var iOriginalDelay = this.getView().getBusyIndicatorDelay();
			var sMsg;
			oViewModel.setProperty("/delay", iOriginalDelay);
			oViewModel.setProperty("/busy", false);
			if (oError.responseText) {
				var oInnerError = JSON.parse(oError.responseText).error.innererror;
				if (oInnerError && oInnerError.errordetails && oInnerError.errordetails.length > 0) {
					this._openErrorDialog(oInnerError.errordetails);
				} else {
					sMsg = JSON.parse(oError.responseText).error.message.value;
				}
			} else if (oError.response) {
				sMsg = JSON.parse(oError.response.body).error.message.value;
			} else if (oError.message) {
				sMsg = oError.message;
			}
			if (sMsg) {
				MessageBox.error(sMsg);
			}
		},
		
		/*
		 * Called from method "fnBindTreeTable" to transform equipment hierarchy to tree structure 
		 */
		_transformTreeData: function (aNodesIn) {
			var aNodes = []; //'deep' object structure
			var mNodeMap = {}; //'map', each node is an attribute
			if (aNodesIn) {
				var oNodeOut;
				var sSuperiorLocationId;
				for (var i in aNodesIn) {
					var oNodeIn = aNodesIn[i];
					oNodeOut = {
						// HierarchyLevel: oNodeIn.HierarchyLevel,
						// HierarchyType: oNodeIn.HierarchyType,
						LocationId: oNodeIn.LocationId,
						SuperiorLocationId: oNodeIn.SuperiorLocationId,
						SiteId: oNodeIn.SiteId,
						LoomaTypeId: oNodeIn.LoomaTypeId,
						LoomaTypeDesc: oNodeIn.LoomaTypeDesc,
						// HasSubEquipment: oNodeIn.HasSubEquipment,
						LocationName: oNodeIn.LocationName,
						DrillState: oNodeIn.DrillState,
						// NbEquipment: oNodeIn.NbEquipment,
						// LegalApplication: oNodeIn.LegalApplication,
						// SurfaceM2: oNodeIn.SurfaceM2,
						Sensitive: oNodeIn.Sensitive,
						UserStatusDesc : oNodeIn.UserStatusDesc,
						// IsActive: oNodeIn.IsActive,
						children: []
					};
					sSuperiorLocationId = oNodeIn.SuperiorLocationId;
					// if (oNodeIn.HierarchyLevel !== 0 && sSuperiorLocationId && sSuperiorLocationId.length > 0) {
					if (sSuperiorLocationId && sSuperiorLocationId.length > 0) {
						var oParent = mNodeMap[oNodeIn.SuperiorLocationId];
						if (oParent) {
							oParent.children.push(oNodeOut);
						}
					} else {
						//there is no parent, must be top level
						aNodes.push(oNodeOut);
					}
					//add the node to the node map, which is a simple 1-level list of all nodes
					mNodeMap[oNodeOut.LocationId] = oNodeOut;
				}

			}
			return aNodes;
		},
		/*
		 * Called from method "fnBindTreeTable" to bind the tree data to JSON Model 
		 */
		_setTreeModelData: function (aNodes) {
			var oLocationHierarchyModel = new JSONModel();
			oLocationHierarchyModel.setData({
				nodeRoot: {
					children: aNodes
				}
			});
			this.fnSetModel(oLocationHierarchyModel, "mLocationHierarchy");
		}
		// /*
		//  * Called from method "onInit" to initialize slect list for filter activ/inactiv
		//  */
		// _initFilterActive: function () {
		// 	var oModel = new JSONModel({
		// 		SelectedKey: "0",
		// 		List: [{
		// 			Id: 0,
		// 			Text: this.fnGetResourceBundle().getText("filterActiveAll")
		// 		}, {
		// 			Id: "true",
		// 			Text: this.fnGetResourceBundle().getText("filterActiveYes")
		// 		}]
		// 	});
		// 	this.fnSetModel(oModel, "activeFilter");
		// },
		// /*
		//  * Called from methods onDomainValueHelpConfirm,onDomainsuggestionItemSelected,onDomainChange 
		//  * to prepare domain filters to filter Tree table
		//  */
		// _prepareDomainFilters: function (oContext) {
		// 	var oViewModel = this.getView().getModel("viewModel");
		// 	if (oContext) {
		// 		var sSelectedDomainDesc = oContext.getProperty("DomainDescription");
		// 		var sSelectedDomainId = oContext.getProperty("Zdomain");
		// 		if (sSelectedDomainId) {
		// 			oViewModel.setProperty("/DomainId", sSelectedDomainId);
		// 			oViewModel.setProperty("/DomainDesc", sSelectedDomainDesc);
		// 		} else {
		// 			oViewModel.setProperty("/DomainId", "");
		// 			oViewModel.setProperty("/DomainDesc", "");
		// 		}
		// 	} else {
		// 		oViewModel.setProperty("/DomainId", "");
		// 		oViewModel.setProperty("/DomainDesc", "");
		// 	}
		// },
		// /*
		//  * Called from methods onDomainValueHelpSearch,onDomainSuggest to filter Domain data. 
		//  * It internally calls _searchData method to apply filters on the binding
		//  * "aFilters" in oSettings object accepts the array of proprties on which filters should be applied for search or suggestion event
		//  * "defaultFilters" in oSettings object accepts the array of properties and its values in format [ {property, propertyValue},.. ] 
		//  * All the Properties by which the Value help or Suggestions should be filtered by defualt should be passed in defaultFilters array
		//  * "compositeFilters" should be set to true if length of aFilters + defaultFilters is > 1.Else it shouldbe set to false.
		//  */
		// _searchDomains: function (oEvent, bFrmSuggestion) {
		// 	var aDefaultFilterModelProperty = ["/FunctionId", "/FamilyId"],
		// 		aDefaultFilterOdataProperty = ["IvIdFunction", "IvIdFamily"],
		// 		aDefaultFilters = this._searchDefaultFilters(aDefaultFilterModelProperty, aDefaultFilterOdataProperty);
		// 	var oSettings = {
		// 		oEvent: oEvent,
		// 		bFrmSuggestion: bFrmSuggestion,
		// 		oSrc: this.byId("idDomainDialog"),
		// 		aFilters: ["DomainDescription"],
		// 		defaultFilters: aDefaultFilters,
		// 		compositeFilters: true,
		// 		aggregation: "suggestionItems"
		// 	};
		// 	this._searchData(oSettings);
		// },
		// /*
		//  * Called from methods onFunctionValueHelpConfirm,onFunctionsuggestionItemSelected,onFunctionChange 
		//  * to prepare function filters to filter Tree table
		//  */
		// _prepareFunctionFilters: function (oContext) {
		// 	var oViewModel = this.getView().getModel("viewModel");
		// 	if (oContext) {
		// 		var sSelectedFuncDesc = oContext.getProperty("FunctionDescription");
		// 		var sSelectedFuncId = oContext.getProperty("Function");
		// 		if (sSelectedFuncId) {
		// 			oViewModel.setProperty("/FunctionId", sSelectedFuncId);
		// 			oViewModel.setProperty("/FunctionDescription", sSelectedFuncDesc);
		// 		} else {
		// 			oViewModel.setProperty("/FunctionId", "");
		// 			oViewModel.setProperty("/FunctionDescription", "");
		// 		}
		// 	} else {
		// 		oViewModel.setProperty("/FunctionId", "");
		// 		oViewModel.setProperty("/FunctionDescription", "");
		// 	}
		// },
		// /*
		//  * Called from methods onFunctionValueHelpSearch,onFunctionSuggest to filter Function data. 
		//  * It internally calls _searchData method to apply filters on the binding
		//  * "aFilters" in oSettings object accepts the array of proprties on which filters should be applied for search or suggestion event
		//  * "defaultFilters" in oSettings object accepts the array of properties and its values in format [ {property, propertyValue},.. ] 
		//  * All the Properties by which the Value help or Suggestions should be filtered by defualt should be passed in defaultFilters array
		//  * "compositeFilters" should be set to true if length of aFilters + defaultFilters is > 1.Else it shouldbe set to false.
		//  */
		// _searchFunctions: function (oEvent, bFrmSuggestion) {
		// 	var aDefaultFilterModelProperty = ["/DomainId", "/FamilyId"],
		// 		aDefaultFilterOdataProperty = ["IvIdDomain", "IvIdFamily"],
		// 		aDefaultFilters = this._searchDefaultFilters(aDefaultFilterModelProperty, aDefaultFilterOdataProperty);
		// 	var oSettings = {
		// 		oEvent: oEvent,
		// 		bFrmSuggestion: bFrmSuggestion,
		// 		oSrc: this.byId("idFunctionDialog"),
		// 		aFilters: ["FunctionDescription"],
		// 		defaultFilters: aDefaultFilters,
		// 		compositeFilters: true,
		// 		aggregation: "suggestionItems"
		// 	};
		// 	this._searchData(oSettings);
		// },
		// /*
		//  * Called from methods onFamilyValueHelpConfirm,onFamilysuggestionItemSelected,onFamilyChange 
		//  * to prepare family filters to filter Tree table
		//  */
		// _prepareFamilyFilters: function (context) {
		// 	var oViewModel = this.getView().getModel("viewModel");
		// 	if (context) {
		// 		var sSelectedFamilyDesc = context.getProperty("FamilyDescription");
		// 		var sSelectedFamilyId = context.getProperty("Family");
		// 		if (sSelectedFamilyId) {
		// 			oViewModel.setProperty("/FamilyId", sSelectedFamilyId);
		// 			oViewModel.setProperty("/FamilyDescription", sSelectedFamilyDesc);
		// 		} else {
		// 			oViewModel.setProperty("/FamilyId", "");
		// 			oViewModel.setProperty("/FamilyDescription", "");
		// 		}
		// 		oViewModel.setProperty("/DomainId", context.getProperty("Domain"));
		// 		oViewModel.setProperty("/DomainDesc", context.getProperty("DomainDescription"));
		// 		oViewModel.setProperty("/FunctionId", context.getProperty("Function"));
		// 		oViewModel.setProperty("/FunctionDescription", context.getProperty("FunctionDescription"));
		// 	} else {
		// 		oViewModel.setProperty("/FamilyId", "");
		// 		oViewModel.setProperty("/FamilyDescription", "");
		// 	}
		// },
		// /*
		//  * Called from methods onFamilyValueHelpSearch,onFamilySuggest to filter Domain data. 
		//  * It internally calls _searchData method to apply filters on the binding
		//  * "aFilters" in oSettings object accepts the array of proprties on which filters should be applied for search or suggestion event
		//  * "defaultFilters" in oSettings object accepts the array of properties and its values in format [ {property, propertyValue},.. ] 
		//  * All the Properties by which the Value help or Suggestions should be filtered by defualt should be passed in defaultFilters array
		//  * "compositeFilters" should be set to true if length of aFilters + defaultFilters is > 1.Else it shouldbe set to false.
		//  */
		// _searchFamily: function (oEvent, bFrmSuggestion) {
		// 	var aDefaultFilterModelProperty = ["/DomainId", "/FunctionId"],
		// 		aDefaultFilterOdataProperty = ["IvIdDomain", "Function"],
		// 		aDefaultFilters = this._searchDefaultFilters(aDefaultFilterModelProperty, aDefaultFilterOdataProperty);
		// 	var oSettings = {
		// 		oEvent: oEvent,
		// 		bFrmSuggestion: bFrmSuggestion,
		// 		oSrc: this.byId("idFamilyDialog"),
		// 		aFilters: ["FamilyDescription"],
		// 		defaultFilters: aDefaultFilters,
		// 		compositeFilters: true,
		// 		aggregation: "suggestionItems"
		// 	};
		// 	this._searchData(oSettings);
		// },
		// /*
		//  * Common method used to filter the data for Value Help as well as suggestions
		//  */
		// _searchData: function (oSearchConfig) {
		// 	var sQuery, allFilters = [],
		// 		aFilters = [],
		// 		oBinding;
		// 	if (oSearchConfig.bFrmSuggestion) {
		// 		sQuery = oSearchConfig.oEvent.getParameter("suggestValue");
		// 		oBinding = oSearchConfig.oEvent.getSource().getBinding(oSearchConfig.aggregation);
		// 		if (oSearchConfig.defaultFilters) {
		// 			for (var j = 0; j < oSearchConfig.defaultFilters.length; j++) {
		// 				aFilters.push(new Filter(oSearchConfig.defaultFilters[j].property, FilterOperator.EQ, oSearchConfig.defaultFilters[j].value));
		// 			}
		// 		}
		// 	} else {
		// 		sQuery = oSearchConfig.oEvent.getParameter("value");
		// 		oBinding = oSearchConfig.oSrc.getBinding("items");
		// 	}
		// 	if (sQuery) {
		// 		if (oSearchConfig.compositeFilters) {
		// 			for (var i = 0; i < oSearchConfig.aFilters.length; i++) {
		// 				aFilters.push(new Filter(oSearchConfig.aFilters[i], FilterOperator.Contains, sQuery));
		// 			}
		// 			allFilters.push(new Filter(aFilters, true));
		// 		} else {
		// 			allFilters.push(new Filter(oSearchConfig.aFilters[0], FilterOperator.Contains, sQuery));
		// 		}
		// 	}
		// 	oBinding.filter(allFilters, "Application");
		// },
		// /*
		//  * Common method used to add style class to the dialog based on the device
		//  */
		// _setStyleClassForPopup: function (oPopup) {
		// 	var oDeviceData = this.getOwnerComponent().getModel("device").getData();
		// 	if (oDeviceData.system.desktop) {
		// 		oPopup.addStyleClass("sapUiSizeCompact");
		// 	} else {
		// 		oPopup.addStyleClass("sapUiSizeCozy");
		// 	}
		// 	return oPopup;
		// },
		// /*
		//  * Common method used to fetch characteristics data for dropdown list on Create fragment for Bldg/Floor/Room
		//  */
		// _fetchCharacteristicsData: function (sChar, sModelName) {
		// 	var oViewModel = this.fnGetModel("viewModel");
		// 	var iOriginalDelay = this.getView().getBusyIndicatorDelay();
		// 	oViewModel.setProperty("/delay", 0);
		// 	oViewModel.setProperty("/busy", true);
		// 	var aFilters = [];
		// 	aFilters.push(new Filter("IvCharactName", FilterOperator.EQ, sChar));
		// 	this.getOwnerComponent().getModel().read("/VH_CharacteristicSet", {
		// 		filters: aFilters,
		// 		success: function (oData, response) {
		// 			var oModel = new JSONModel();
		// 			if (oData && oData.results) {
		// 				oModel.setData(oData.results);
		// 			} else {
		// 				oModel.setData([]);
		// 			}
		// 			this.fnSetModel(oModel, sModelName);
		// 			oViewModel.setProperty("/delay", iOriginalDelay);
		// 			oViewModel.setProperty("/busy", false);
		// 		}.bind(this)
		// 	});
		// },
		// /*
		//  * Private Method called from "onCreateFuncionalLocPress" to hide or unhide fields in Create Fragment
		//  * based on whether Building / Floor / Room is created
		//  */
		// _changeCreateLayout: function (oContext, oCreateDialog) {
		// 	var oViewModel = this.fnGetModel("viewModel"),
		// 		oCreateModel = this.fnGetModel("createModel"),
		// 		oResourceBundle = this.fnGetResourceBundle();
		// 	var sFuncLocType = oContext.getProperty("FuncLocType");
		// 	switch (sFuncLocType) {
		// 	case "SITE": //Clicking Add button on Site, show Building related fields
		// 		oCreateDialog.setTitle(oResourceBundle.getText("createDialogTitleBuilding"));
		// 		var oInitialBldgObject = this._getInitialBuildingObject();
		// 		oCreateModel.setData(oInitialBldgObject);
		// 		this._fetchCharacteristicsData("YLO_TYPE_BATIMENT", "FuncLocType");
		// 		this._fetchCharacteristicsData("YLO_REGLEMENTATION", "LegalApplication");
		// 		oViewModel.setProperty("/bFloorFieldsVisible", false);
		// 		oViewModel.setProperty("/bBldgRoomCommonFieldsVisible", true);
		// 		oViewModel.setProperty("/bBldgFloorCommonFieldsVisible", true);
		// 		oViewModel.setProperty("/bRoomFieldsVisible", false);
		// 		oCreateModel.setProperty("/FuncLocToBeCreated", "Building");
		// 		oCreateModel.setProperty("/IdSite", oContext.getProperty("IdSite"));
		// 		oCreateModel.setProperty("/IdSuperior", oContext.getProperty("IdSite"));
		// 		break;
		// 	case "BUILDING": //Clicking Add button on Site, show Floor related fields
		// 		oCreateDialog.setTitle(oResourceBundle.getText("createDialogTitleFloor"));
		// 		var oInitialFloorObject = this._getInitialFloorObject();
		// 		oCreateModel.setData(oInitialFloorObject);
		// 		this._fetchCharacteristicsData("YLO_TYPE_ETAGE", "FuncLocType");
		// 		oViewModel.setProperty("/bFloorFieldsVisible", true);
		// 		oViewModel.setProperty("/bBldgRoomCommonFieldsVisible", false);
		// 		oViewModel.setProperty("/bBldgFloorCommonFieldsVisible", true);
		// 		oViewModel.setProperty("/bRoomFieldsVisible", false);
		// 		oCreateModel.setProperty("/FuncLocToBeCreated", "Floor");
		// 		oCreateModel.setProperty("/IdSite", oContext.getProperty("IdSite"));
		// 		oCreateModel.setProperty("/IdSuperior", oContext.getProperty("IdFuncLoc"));
		// 		break;
		// 	case "FLOOR": //Clicking Add button on Site, show Room related fields
		// 		oCreateDialog.setTitle(oResourceBundle.getText("createDialogTitleRoom"));
		// 		var oInitialRoomObject = this._getInitialRoomObject();
		// 		oCreateModel.setData(oInitialRoomObject);
		// 		this._fetchCharacteristicsData("YLO_TYPE_LOCAL", "FuncLocType");
		// 		this._fetchCharacteristicsData("YLO_REGLEMEN_LOCAL", "LegalApplication");
		// 		oViewModel.setProperty("/bFloorFieldsVisible", false);
		// 		oViewModel.setProperty("/bBldgRoomCommonFieldsVisible", true);
		// 		oViewModel.setProperty("/bBldgFloorCommonFieldsVisible", false);
		// 		oViewModel.setProperty("/bRoomFieldsVisible", true);
		// 		oCreateModel.setProperty("/FuncLocToBeCreated", "Room");
		// 		oCreateModel.setProperty("/IdSite", oContext.getProperty("IdSite"));
		// 		oCreateModel.setProperty("/IdSuperior", oContext.getProperty("IdFuncLoc"));
		// 		break;
		// 	}
		// },
		// /*
		//  * Common method used on change event of ComboBox to validate if correct value is entered from dropdown
		//  */
		// _validateComboBoxValues: function (oSource, sProperty) {
		// 	var sSelectedKey = oSource.getSelectedKey();
		// 	var oViewModel = this.fnGetModel("viewModel");
		// 	var oCreateModel = this.fnGetModel("createModel");
		// 	var bError = false;
		// 	if (!oSource.getSelectedItem() && oSource.getValue()) {
		// 		oCreateModel.setProperty(sProperty, "");
		// 		oSource.setValueState("Error");
		// 		oSource.setValueStateText(this.fnGetResourceBundle().getText("comboBoxInvalidValueMsg"));
		// 		oViewModel.setProperty("/bCreateDialogSubmitBtnEnabled", false);
		// 		bError = true;
		// 	} else {
		// 		oSource.setValueState("None");
		// 		oSource.setValueStateText("");
		// 		oCreateModel.setProperty(sProperty, sSelectedKey);
		// 		this._checkCreateDialogErrorFields();
		// 	}
		// 	return bError;
		// },

		// onFuncLocNameChange: function (oEvent) {
		// 	var oViewModel = this.fnGetModel("viewModel");
		// 	var oSource = oEvent.getSource();
		// 	if (!oSource.getValue()) {
		// 		oSource.setValueState("Error");
		// 		oSource.setValueStateText(this.fnGetResourceBundle().getText("FuncLocNameEmptyMsg"));
		// 		oViewModel.setProperty("/bCreateDialogSubmitBtnEnabled", false);
		// 	} else {
		// 		oSource.setValueState("None");
		// 		oSource.setValueStateText("");
		// 		this._checkCreateDialogErrorFields();
		// 	}
		// },
		// /*
		//  * Method used to check if mandatory field is entered on Create Dialog
		//  */
		// _validateMandatoryFields: function () {
		// 	var oTypeComboBox = this.byId("typeCombobox"),
		// 		oNameInput = this.byId("NameInput"),
		// 		oItem1 = oNameInput.getValue(),
		// 		bError = false,
		// 		cbError = false,
		// 		InError = false,
		// 		oItem = oTypeComboBox.getSelectedItem();
		// 	if (!oItem) {
		// 		oTypeComboBox.setValueState("Error");
		// 		cbError = true;
		// 	} else {
		// 		oTypeComboBox.setValueState("None");
		// 	}
		// 	if (oItem1 === "") {
		// 		oNameInput.setValueState("Error");
		// 		InError = true;
		// 	} else {
		// 		oNameInput.setValueState("None");
		// 	}
		// 	if (cbError || InError) {
		// 		bError = true;
		// 	}
		// 	return bError;
		// },
		// /*
		//  * Method used to reset the error states of input fields on Create Dialog before opening the dialog.
		//  * Called from method "onCreateFuncionalLocPress"
		//  */
		// _resetDialogValueStates: function (oCreateDialog, aFieldGroupIds) {
		// 	var aControls;
		// 	aFieldGroupIds.forEach(function (el) {
		// 		if (aControls && aControls.length > 0) {
		// 			aControls = aControls.concat(oCreateDialog.getControlsByFieldGroupId(el));
		// 		} else {
		// 			aControls = oCreateDialog.getControlsByFieldGroupId(el);
		// 		}
		// 	});
		// 	for (var i = 0; i < aControls.length; i++) {
		// 		var aValidationField = aControls[i].getProperty("fieldGroupIds");
		// 		if (aValidationField.length > 0 && (aControls[i].getValueState() === "Error")) {
		// 			aControls[i].setValueState("None");
		// 		}
		// 	}
		// },
		// /*
		//  * Method used to set the error states for Floor No input field on Create Dialog and disable Submit button
		//  */
		// _setFloorErrorMessage: function (oSource) {
		// 	var sText = this.fnGetResourceBundle().getText("floorLevelErrMess");
		// 	oSource.setValueStateText(sText);
		// 	oSource.setValueState("Error");
		// 	this.fnGetModel("viewModel").setProperty("/bCreateDialogSubmitBtnEnabled", false);
		// },
		// /*
		//  * Method used in multiple methods to check if any input fields are in error state. 
		//  * If any fields are in error, disable the Submit button else enable the Submit button
		//  */
		// _checkCreateDialogErrorFields: function () {
		// 	this._createDialog.then(function (oCreateDialog) {
		// 		var bErrorExists = false,
		// 			oViewModel = this.fnGetModel("viewModel");
		// 		var aControls = oCreateDialog.getControlsByFieldGroupId("validationFields");
		// 		aControls = aControls.concat(oCreateDialog.getControlsByFieldGroupId("deadlineFields"));
		// 		for (var i = 0; i < aControls.length; i++) {
		// 			var aValidationField = aControls[i].getProperty("fieldGroupIds");
		// 			if (aValidationField.length > 0 && (aControls[i].getValueState() === "Error")) {
		// 				bErrorExists = true;
		// 				break;
		// 			}
		// 		}
		// 		if (bErrorExists) {
		// 			oViewModel.setProperty("/bCreateDialogSubmitBtnEnabled", false);
		// 		} else {
		// 			oViewModel.setProperty("/bCreateDialogSubmitBtnEnabled", true);
		// 		}
		// 	}.bind(this));
		// },
		// /*
		//  * Method called from onZoneChange event of Zone 1 and Zone 2 fields to check no.of characters enetred
		//  * If number of characters entered are greater than 40,truncate the characters to 40
		//  */
		// _checkZoneValue: function (oSource, sZonei18nKey) {
		// 	var sValue = oSource.getValue();
		// 	var oItem = oSource.getSelectedItem();
		// 	if (!oItem && sValue.length > 40) {
		// 		oSource.setValue(sValue.substring(0, 40));
		// 		var sText = this.fnGetResourceBundle().getText(sZonei18nKey);
		// 		MessageToast.show(sText);
		// 	}
		// },
		// /*
		//  * Method used to get the Initial building object to be set to Create Model
		//  */
		// _getInitialBuildingObject: function () {
		// 	return {
		// 		"IdLocation": "",
		// 		"IdLocationFree": "",
		// 		"IdSite": "",
		// 		"IdSuperior": "",
		// 		"QrCode": "",
		// 		"Name": "",
		// 		"Type": "",
		// 		"LegalApplication": "",
		// 		"SurfaceM2": "",
		// 		"PeopleCapacity": "",
		// 		"FlooringType": "",
		// 		"FlooringSurface": "",
		// 		"GlassCoatingType": "",
		// 		"GlassCoatingSurface": "",
		// 		"CustomerCategory": "",
		// 		"Certification": "",
		// 		"Sensitive": false,
		// 		"LeadTimesReaction": "",
		// 		"LeadTimesOnSite": "",
		// 		"LeadTimesPartialRes": "",
		// 		"LeadTimesFinalRes": "",
		// 		"LeadTimesOnSiteOnCall": "",
		// 		"LeadTimesPartialResOnCall": "",
		// 		"LongText": "",
		// 		"Zone1": "",
		// 		"Zone2": ""
		// 	};
		// },
		// /*
		//  * Method used to get the Initial floor object to be set to Create Model
		//  */
		// _getInitialFloorObject: function () {
		// 	return {
		// 		"IdLocation": "",
		// 		"IdLocationFree": "",
		// 		"IdSite": "",
		// 		"IdSuperior": "",
		// 		"QrCode": "",
		// 		"Name": "",
		// 		"Type": "",
		// 		"FloorLevel": "",
		// 		"SurfaceM2": "",
		// 		"CustomerCategory": "",
		// 		"Certification": "",
		// 		"Sensitive": false,
		// 		"LeadTimesReaction": "",
		// 		"LeadTimesOnSite": "",
		// 		"LeadTimesPartialRes": "",
		// 		"LeadTimesFinalRes": "",
		// 		"LeadTimesOnSiteOnCall": "",
		// 		"LeadTimesPartialResOnCall": "",
		// 		"LongText": "",
		// 		"Zone1": "",
		// 		"Zone2": ""
		// 	};
		// },
		// /*
		//  * Method used to get the Initial room object to be set to Create Model
		//  */
		// _getInitialRoomObject: function () {
		// 	return {
		// 		"IdLocation": "",
		// 		"IdLocationFree": "",
		// 		"IdSite": "",
		// 		"IdSuperior": "",
		// 		"QrCode": "",
		// 		"Name": "",
		// 		"Type": "",
		// 		"LegalApplication": "",
		// 		"SurfaceM2": "",
		// 		"PeopleCapacity": "",
		// 		"FlooringType": "",
		// 		"FlooringSurface": "",
		// 		"GlassCoatingType": "",
		// 		"GlassCoatingSurface": "",
		// 		"VolumeM3": "",
		// 		"Certification": "",
		// 		"Sensitive": false,
		// 		"LeadTimesReaction": "",
		// 		"LeadTimesOnSite": "",
		// 		"LeadTimesPartialRes": "",
		// 		"LeadTimesFinalRes": "",
		// 		"LeadTimesOnSiteOnCall": "",
		// 		"LeadTimesPartialResOnCall": "",
		// 		"LongText": "",
		// 		"Zone1": "",
		// 		"Zone2": ""
		// 	};
		// },

		// createPayload: function (payloadtype) {
		// 	var oCreateModel = this.fnGetModel("createModel");
		// 	var oCreateData = oCreateModel.getData();

		// 	var oPayload = {
		// 		"IdLocation": oCreateData.IdLocation,
		// 		"IdLocationFree": oCreateData.IdLocationFree,
		// 		"IdSite": oCreateData.IdSite,
		// 		"IdSuperior": oCreateData.IdSuperior,
		// 		"QrCode": oCreateData.QrCode,
		// 		"Name": oCreateData.Name,
		// 		"Type": oCreateData.Type,
		// 		"SurfaceM2": oCreateData.SurfaceM2,
		// 		"Certification": oCreateData.Certification,
		// 		"Sensitive": oCreateData.Sensitive,
		// 		"LeadTimesReaction": oCreateData.LeadTimesReaction,
		// 		"LeadTimesOnSite": oCreateData.LeadTimesOnSite,
		// 		"LeadTimesPartialRes": oCreateData.LeadTimesPartialRes,
		// 		"LeadTimesFinalRes": oCreateData.LeadTimesFinalRes,
		// 		"LeadTimesOnSiteOnCall": oCreateData.LeadTimesOnSiteOnCall,
		// 		"LeadTimesPartialResOnCall": oCreateData.LeadTimesPartialResOnCall,
		// 		"Zone1": oCreateData.Zone1,
		// 		"Zone2": oCreateData.Zone2
		// 	};
		// 	if (payloadtype === "Building" || payloadtype === "Room") {
		// 		if (payloadtype === "Building") {
		// 			var sLegalApp = "";
		// 			if (oCreateData.LegalApplication && oCreateData.LegalApplication.length > 0) {
		// 				sLegalApp = oCreateData.LegalApplication.join(" - ");
		// 			}
		// 			oPayload.CustomerCategory = oCreateData.CustomerCategory;
		// 		} else if (payloadtype === "Room") {
		// 			oPayload.VolumeM3 = oCreateData.VolumeM3;
		// 		}
		// 		oPayload.LegalApplication = sLegalApp;
		// 		oPayload.PeopleCapacity = oCreateData.PeopleCapacity;
		// 		oPayload.FlooringType = oCreateData.FlooringType;
		// 		oPayload.FlooringSurface = oCreateData.FlooringSurface;
		// 		oPayload.GlassCoatingType = oCreateData.GlassCoatingType;
		// 		oPayload.CustomerCategory = oCreateData.CustomerCategory;
		// 	} else {
		// 		oPayload.FloorLevel = oCreateData.FloorLevel ? parseInt(oCreateData.FloorLevel, 10) : 0;
		// 		oPayload.CustomerCategory = oCreateData.CustomerCategory;
		// 	}

		// 	return oPayload;
		// },
		// /*
		//  * Method called from fnODataError to instantiate Message Dialog 
		//  * Displays error messages received from OData service
		//  */
		// _openErrorDialog: function (oErrorDet) {
		// 	var oErrorModel = new JSONModel(oErrorDet);
		// 	oErrorModel.setData(oErrorDet);
		// 	var oView = this.getView();
		// 	if (!this._messageDialog) {
		// 		this._messageDialog = Fragment.load({
		// 			id: oView.getId(),
		// 			name: "com.vesi.zfioac4_equihier.view.fragments.MessageDialog",
		// 			controller: this
		// 		}).then(function (oMessageDialog) {
		// 			oView.addDependent(oMessageDialog);
		// 			return oMessageDialog;
		// 		});
		// 	}
		// 	this._messageDialog.then(function (oMessageDialog) {
		// 		oMessageDialog.setModel(oErrorModel, "errorMsg");
		// 		oMessageDialog.addStyleClass("sapUiSizeCompact");
		// 		oMessageDialog.open();
		// 	});
		// },
		// /*
		//  * Method is used to navigate to Building, Floor or Room application
		//  */
		// _crossAppNav: function (oSemanticObject, sSemanticAction, oParamObject) {
		// 	if (sap.ushell) {
		// 		sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oService) {
		// 			var sHref = oService.hrefForExternal({
		// 				target: {
		// 					semanticObject: oSemanticObject,
		// 					action: sSemanticAction
		// 				},
		// 				params: oParamObject
		// 			}) || "";
		// 			oService.toExternal({
		// 				target: {
		// 					shellHash: sHref
		// 				}
		// 			});
		// 		});
		// 	} else {
		// 		var sText = this.fnGetResourceBundle().getText("crossAppNavigationError");
		// 		MessageBox.error(sText);
		// 	}
		// },
		// onNavToEquipment: function (oEvent) {
		// 	var sLinkType = oEvent.getSource().getId();
		// 	var oContext = oEvent.getSource().getBindingContext();
		// 	var oParamObject;
		// 	if (sLinkType.includes("idLinkEquipment")) {
		// 		var sEquipmentId = oContext.getProperty("IdEquipment");
		// 		oParamObject = {
		// 			"equipmentId": sEquipmentId
		// 		};
		// 	} else {
		// 		var sSuperEquipmentId = oContext.getProperty("IdSuperiorEquipment");
		// 		oParamObject = {
		// 			"equipmentId": sSuperEquipmentId
		// 		};
		// 	}
		// 	this._crossAppNav("ZEQUI_LOOMA", "display", oParamObject);
		// },
		// onEquipmentsDownloadToExcelPress: function () {
		// 	var aSrcId = "equiTable";
		// 	var oi18n = this.fnGetResourceBundle();
		// 	var sRootPath = sap.ui.require.toUrl("com/vesi/zfioac4_equihier");
		// 	var aCols = this.fnCreateColumnConfig(sRootPath + "/model/EquipmentExcelDownloadConfig.json");
		// 	var sFileName = oi18n.getText("equiListTblTitle");
		// 	this.fnDataExport(aSrcId, aCols, sFileName);
		// },
		// _searchDefaultFilters: function (aDefaultFilterModelProperty, aDefaultFilterOdataProperty) {
		// 	var oViewModel = this.fnGetModel("viewModel"),
		// 		aDefaultFilters = [];
		// 	for (var j = 0; j < aDefaultFilterModelProperty.length; j++) {
		// 		var sFilterValue = oViewModel.getProperty(aDefaultFilterModelProperty[j]);
		// 		if (sFilterValue) {
		// 			aDefaultFilters.push({
		// 				property: aDefaultFilterOdataProperty,
		// 				value: sFilterValue
		// 			});
		// 		}
		// 	}
		// 	return aDefaultFilters;
		// }
	});

});
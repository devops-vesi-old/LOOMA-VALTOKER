sap.ui.define([
	"com/vesi/zfioac4_valpec/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/UriParameters",
	"sap/ui/core/Fragment",
	"com/vesi/zfioac4_valpec/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"com/vesi/zaclib/controls/Excel"
], function (Controller, Filter, FilterOperator, JSONModel, UriParameters, Fragment, formatter, MessageBox, MessageToast, Excel) {
	"use strict";

	return Controller.extend("com.vesi.zfioac4_valpec.controller.Detail", {
		formatter: formatter,
		_oFormatDate: sap.ui.core.format.DateFormat.getDateInstance({
			pattern: "dd/MM/yyyy"
		}),
		//--------------------------------------------
		// Standard method
		//--------------------------------------------		
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.vesi.zfioac4_valpec.view.Detail
		 */
		onInit: function () {
			this.fnGetRouter().getRoute("Detail").attachPatternMatched(this._onPatternMatched, this);
			//Set model for formatter Status description
			this._initEquipementStatusDesc();
			this._initDetailPageModel();
			//Set models for VHs
			this._initVHModels();
			//set models for Property and characteristics modified
			this._initGlobalModels();
			//Set icon tab bar density
			this.byId("SiteIconTabBar").setHeaderMode("Inline");
		},

		//--------------------------------------------
		// Internal functions
		//--------------------------------------------
		_onPatternMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").SiteId;
			this.fnSetJSONModel({}, "mSite");
			this.fnSetJSONModel({}, "mLocationHierarchy");
			this.fnSetJSONModel({}, "mEquipment");
			this._SiteId = decodeURIComponent(sObjectId);
			this._bindSiteData();
			this._bindTreeTable();
		},

		/*
		 * Called from method "onInit" to initialize Equipement User Status Description model
		 */
		_initEquipementStatusDesc: function () {
			this._initStatusDesc("LoomaEquipment");
		},

		/*
		 * Called from method "onInit" to initialize models for global data
		 */
		_initGlobalModels: function () {
			// Get value property depending DDIC
			this._getDDICDomainValue();
			// Get value characteristic
			this._getFamilyCharacteristic();
			// Get Type Location description
			this._getLocationTypeDescription();

		},

		/*
		 * Called from method "onInit" to initialize DDIC properties model
		 */
		_getDDICDomainValue: function () {
			var aFilters = [];
			aFilters.push(new Filter("Scope", FilterOperator.EQ, "LOOMA"));
			var mParams = {
				filters: aFilters,
				success: function (oData) {
					var oDDICValue = {};
					var aData = oData.results;
					for (var idx in aData) {
						var oLine = aData[idx];
						if (!oDDICValue[oLine.Object + "Id"]) {
							oDDICValue[oLine.Object + "Id"] = {};
						}

						oDDICValue[oLine.Object + "Id"][oLine.ValueId] = oLine;
					}
					var oVHJsonModel = new JSONModel(oDDICValue);
					this.fnSetModel(oVHJsonModel, "mDDICValue");
				}.bind(this)
			};
			this.fnGetODataModel("VH").read("/DDICDomainValueListSet", mParams);
		},

		/*
		 * Called from method "onInit" to initialize Characteristic information model
		 */
		_getFamilyCharacteristic: function () {
			var mParams = {
				urlParameters: {
					"$expand": "CharacteristicValueList"
				},
				success: function (oData) {
					var oCharacteristic = {
						Class: {},
						Characteristic: {},
						ValueList: {}
					};
					var aData = oData.results;
					for (var idx in aData) {
						//Fill Class information
						var oLine = aData[idx];
						if (!oCharacteristic.Class[oLine.ClassId]) {
							oCharacteristic.Class[oLine.ClassId] = {};
						}

						oCharacteristic.Class[oLine.ClassId][oLine.CharactId] = {
							CharactImportant: oLine.CharactImportant
						};

						// Fill Characteristic information
						if (!oCharacteristic.Characteristic[oLine.CharactId]) {
							oCharacteristic.Characteristic[oLine.CharactId] = {
								CharactName: oLine.CharactName,
								CharactDataType: oLine.CharactDataType,
								CharactLength: oLine.CharactLength,
								CharactDecimal: oLine.CharactDecimal,
								CharactUnit: oLine.CharactUnit,
								CharactListOfValue: oLine.CharactListOfValue
							};
						}

						//Fill ValueList is needed
						if (oLine.CharactListOfValue && !oCharacteristic.ValueList[oLine.CharactId]) {
							if (!oCharacteristic.ValueList[oLine.CharactId]) {
								oCharacteristic.ValueList[oLine.CharactId] = {};
							}
							for (var iVal in oLine.CharacteristicValueList.results) {
								var oVal = oLine.CharacteristicValueList.results[iVal];
								oCharacteristic.ValueList[oLine.CharactId][oVal.CharactValueChar] = oVal;
							}
						}
					}
					var oVHJsonModel = new JSONModel(oCharacteristic);
					this.fnSetModel(oVHJsonModel, "mFamilyCharacteristic");
				}.bind(this)
			};
			this.fnGetODataModel("VH").read("/FamilyCharacteristicSet", mParams);
		},

		/*
		 *
		 */
		_getLocationTypeDescription: function () {
			var aFilters = [];
			aFilters.push(new Filter("CharactId", FilterOperator.EQ, "YLO_SITE_TYPE"));
			aFilters.push(new Filter("CharactId", FilterOperator.EQ, "YLO_TYPE_BATIMENT"));
			aFilters.push(new Filter("CharactId", FilterOperator.EQ, "YLO_TYPE_ETAGE"));
			aFilters.push(new Filter("CharactId", FilterOperator.EQ, "YLO_TYPE_LOCAL"));
			var mParams = {
				filters: aFilters,
				success: function (oData) {
					var oLocationType = {};
					var aData = oData.results;
					for (var idx in aData) {
						var oLine = aData[idx];
						switch (oLine.CharactId) {
						case "YLO_SITE_TYPE":
							var sType = "SITE";
							break;
						case "YLO_TYPE_BATIMENT":
							sType = "BUILDING";
							break;
						case "YLO_TYPE_ETAGE":
							sType = "FLOOR";
							break;
						case "YLO_TYPE_LOCAL":
							sType = "ROOM";
							break;
						}
						if (!oLocationType[sType]) {
							oLocationType[sType] = {};
						}

						oLocationType[sType][oLine.CharactValueChar] = oLine;
					}
					var oVHJsonModel = new JSONModel(oLocationType);
					this.fnSetModel(oVHJsonModel, "mLocationType");
				}.bind(this)
			};
			this.fnGetODataModel("VH").read("/CharacteristicValueListSet", mParams);
		},

		/*
		 * Called from method "onInit" to initialize VHs model
		 */
		_initVHModels: function () {
			var mParams = {
				success: function (oData) {
					var oVH = {
						Domain: {},
						Function: {},
						Family: {}
					};
					var aData = oData.results;
					for (var idx in aData) {
						//Manage Domain
						if (!oVH.Domain[aData[idx].DomainId]) {
							oVH.Domain[aData[idx].DomainId] = {
								Id: aData[idx].DomainId,
								Desc: aData[idx].DomainDesc
							};
						}
						//Manage Function
						if (!oVH.Function[aData[idx].FunctionId]) {
							oVH.Function[aData[idx].FunctionId] = {
								Id: aData[idx].FunctionId,
								Desc: aData[idx].FunctionDesc
							};
						}
						//Manage Family
						oVH.Family[aData[idx].FamilyId] = {
							Id: aData[idx].FamilyId,
							Desc: aData[idx].FamilyDesc
						};
					}
					var oVHJsonModel = new JSONModel(oVH);
					oVHJsonModel.setSizeLimit(aData.length ? aData.length : oVHJsonModel.iSizeLimit);
					this.fnSetModel(oVHJsonModel, "mVH");
				}.bind(this)
			};
			this.fnGetODataModel("VH").read("/FamilySet", mParams);
		},

		/*
		 * Called from method "onInit" to initialize model mDetailPage 
		 */
		_initDetailPageModel: function () {
			var oDetailPage = {
				"bSwitchDirect": true,
				"bEquipmentSelected": false
			};
			this.fnSetJSONModel(oDetailPage, "mDetailPage");
			this._mDetailPage = this.fnGetModel("mDetailPage");
			this._mDetailPage.refresh(true);
		},
		/*
		 * Called from method "_bindTreeTable" to transform equipment hierarchy to tree structure 
		 */
		_transformTreeData: function (aNodesIn) {
			var aNodes = [], //'deep' object structure
				mNodeMap = {}, //'map', each node is an attribute
				oLocationType = this.fnGetModel("mLocationType").getData();
			if (aNodesIn) {
				var oNodeOut;
				var sSuperiorLocationId;
				for (var i in aNodesIn) {
					var oNodeIn = aNodesIn[i],
						sTypeDesc = oLocationType[oNodeIn.LoomaTypeId][oNodeIn.TypeId].CharactValueDescription;
					if (!sTypeDesc) {
						sTypeDesc = "";
					}
					oNodeOut = {
						LocationId: oNodeIn.LocationId,
						SuperiorLocationId: oNodeIn.SuperiorLocationId,
						SiteId: oNodeIn.SiteId,
						LoomaTypeId: oNodeIn.LoomaTypeId,
						LoomaTypeDesc: oNodeIn.LoomaTypeDesc,
						TypeDesc: sTypeDesc === "" ? oNodeIn.TypeId : sTypeDesc,
						LocationName: oNodeIn.LocationName,
						DrillState: oNodeIn.DrillState,
						Sensitive: oNodeIn.Sensitive,
						IsActive: oNodeIn.IsActive,
						IsCreatedDuringPec: oNodeIn.IsCreatedDuringPec,
						UserStatusId: oNodeIn.UserStatusId,
						UserStatusDesc: oNodeIn.UserStatusDesc,
						EqTotal: oNodeIn.EquipmentNumber.Total,
						EqTotalDirect: oNodeIn.EquipmentNumber.TotalDirect,
						EqRemaining: oNodeIn.EquipmentNumber.Remaining,
						EqRemainingDirect: oNodeIn.EquipmentNumber.RemainingDirect,
						EqToValidate: oNodeIn.EquipmentNumber.ToValidate,
						EqToValidateDirect: oNodeIn.EquipmentNumber.ToValidateDirect,
						children: []
					};
					sSuperiorLocationId = oNodeIn.SuperiorLocationId;
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
		 * Method is used to fetch site Information
		 */
		_bindSiteData: function () {
			var sRequest = this.getOwnerComponent().getModel().createKey("/SiteSet", {
				SiteId: this._SiteId
			});

			this.getOwnerComponent().getModel().read(sRequest, {
				urlParameters: {
					"$expand": "SiteContact"
				},
				success: function (oData, response) {
					oData.SiteContact = oData.SiteContact.results;
					oData.SiteContactCount = oData.SiteContact.length;
					oData.SiteAddress = this._fnSetSiteAddress(oData);
					this.fnSetJSONModel(oData, "mSite");
				}.bind(this),
				error: function (oError) {
					this.fnSetJSONModel({}, "mSite");
					this._oDataError(oError);
				}.bind(this)
			});
		},

		/*
		 * Method is used to generate site address to display from site Information
		 */
		_fnSetSiteAddress: function (oData) {
			var sAddress = "";
			if (oData.AddressStreetNo !== "") {
				sAddress = oData.AddressStreetNo + " ";
			}
			if (oData.AddressStreet !== "") {
				sAddress = sAddress + oData.AddressStreet + "\r\n";
			}
			if (oData.AddressStreet2 !== "") {
				sAddress = sAddress + oData.AddressStreet2 + "\r\n";
			}
			if (oData.AddressPostalCode !== "") {
				sAddress = sAddress + oData.AddressPostalCode + " ";
				if (oData.AddressCity === "") {
					sAddress = sAddress + "\r\n";
				}
			}
			if (oData.AddressCity !== "") {
				sAddress = sAddress + oData.AddressCity + "\r\n";
			}
			if (oData.AddressCountryId !== "") {
				sAddress = sAddress + oData.AddressCountryId;
			}
			return sAddress;
		},

		/*
		 * Method is used to fetch Location hierarchy for a Site
		 * Once data is fetched,_transformTreeData is called to tranform data to tree and bound to tree table
		 */
		_bindTreeTable: function () {
			var aTableFilters = this._fnGetFilters("detailFilterBar");
			var aFilters = [];
			aFilters.push(new Filter("SiteId", FilterOperator.EQ, this._SiteId));
			if (aTableFilters && aTableFilters.length > 0) {
				aFilters = aFilters.concat(aTableFilters);
			}
			this.getOwnerComponent().getModel().read("/LocationHierarchySet", {
				filters: aFilters,
				urlParameters: {
					"$expand": "EquipmentNumber"
				},
				success: function (oData, response) {
					var aNodes = this._transformTreeData(oData.results);
					if (this._bRefreshHierarchy) {
						//Only refresh hierarchy (status and equipment's number)
						this._updateHierarchy(oData, aNodes);
					} else {
						//Set hierarchy from scratch
						this._setTreeModelData(aNodes);
						this._setLocationDescription(oData.results);
					}
				}.bind(this),
				error: function (oError) {
					this._oDataError(oError);
				}.bind(this)
			});
		},

		/*
		 * Method to update values in already existing hierarchy
		 */
		_updateHierarchy: function (oData, oNewHierarchy) {
			var oLocationHierarchyModel = this.fnGetModel("mLocationHierarchy");
			var oLocationHierarchyData = oLocationHierarchyModel.getData();
			for (var idx in oLocationHierarchyData.nodeRoot.children) {
				oLocationHierarchyData.nodeRoot.children[idx] = this._setUpdateFields(oLocationHierarchyData.nodeRoot.children[idx],
					oNewHierarchy[idx]);
			}

			oLocationHierarchyModel.refresh(true);
		},

		/*
		 * Method call from _updateHierarchy to update values in already existing hierarchy recursively
		 */
		_setUpdateFields: function (oBase, oNewHierarchy) {
			oBase.EqRemaining = oNewHierarchy.EqRemaining;
			oBase.EqRemainingDirect = oNewHierarchy.EqRemainingDirect;
			oBase.EqToValidate = oNewHierarchy.EqToValidate;
			oBase.EqToValidateDirect = oNewHierarchy.EqToValidateDirect;
			oBase.EqTotal = oNewHierarchy.EqTotal;
			oBase.EqTotalDirect = oNewHierarchy.EqTotalDirect;
			oBase.UserStatusId = oNewHierarchy.UserStatusId;
			oBase.UserStatusDesc = oNewHierarchy.UserStatusDesc;
			for (var idx in oBase.children) {
				oBase.children[idx] = this._setUpdateFields(oBase.children[idx], oNewHierarchy.children[idx]);
			}
			return oBase;
		},

		/*
		 * Common method called in all OData calls to parse backend errors and display on Message Dialog
		 */
		_oDataError: function (oError) {
			var sMsg;
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
		 * Called from method "_bindTreeTable" to bind the tree data to JSON Model 
		 */
		_setTreeModelData: function (aNodes) {
			var oLocationHierarchyModel = new JSONModel();
			oLocationHierarchyModel.setData({
				nodeRoot: {
					children: aNodes
				}
			});
			this.fnSetModel(oLocationHierarchyModel, "mLocationHierarchy");
		},

		/*
		 * Called from method "_bindTreeTable" to set location description for equipment
		 */
		_setLocationDescription: function (aLocation) {
			var oModel = {};

			for (var iLoc in aLocation) {
				var oLocation = aLocation[iLoc];
				if (!oModel[oLocation.LocationId]) {
					oModel[oLocation.LocationId] = {
						LocationId: oLocation.LocationId,
						LocationName: oLocation.LocationName,
						SuperiorLocationId: oLocation.SuperiorLocationId
					};
				}

				//Concatenate Superior Location Names with current Location Name
				if (oLocation.SuperiorLocationId !== "") {
					var oSuperiorLocation = oModel[oLocation.SuperiorLocationId];
					oModel[oLocation.LocationId].LocationName = oSuperiorLocation.LocationName + "/" + oModel[oLocation.LocationId].LocationName;
				}
			}

			this.fnSetJSONModel(oModel, "mLocationDescription");
		},

		/*
		 * Method is called from method "onGetEquiForFuncLocPress".
		 * It fetched equipments for selected functional location and bind it to Equipment table
		 */
		_bindEquipmentTable: function (sLocationId, sLocationType) {
			var aFilters = [],
				sLocationFilter = "LocationId";
			if (!this.fnGetModel("mDetailPage").getData().bSwitchDirect) {
				switch (sLocationType) {
				case "SITE":
					sLocationFilter = "SiteId";
					break;
				case "BUILDING":
					sLocationFilter = "BuildingId";
					break;
				case "FLOOR":
					sLocationFilter = "FloorId";
					break;
				case "Room":
					sLocationFilter = "RoomId";
					break;
				}
			}
			aFilters.push(new Filter(sLocationFilter, FilterOperator.EQ, sLocationId));
			var aFilterBarFilters = this._fnGetFilters("detailFilterBar");
			if (aFilterBarFilters && aFilterBarFilters.length > 0) {
				aFilters = aFilters.concat(aFilterBarFilters);
			}
			this.getOwnerComponent().getModel().read("/EquipmentSet", {
				filters: aFilters,
				urlParameters: {
					$expand: "ModifiedInfo",
					$inlinecount: "allpages"
				},
				success: function (oData, response) {
					//Reset Selection
					var aBooleanField = [
							"PecDeepAnalysisNeeded",
							"PecQuote",
							"PecTrainingReq",
							"Critical"
						],
						aDateField = [
							"WarrantyEndDate"
						],
						oFamilyCharacteristic = this.fnGetModel("mFamilyCharacteristic").getData(),
						oLocationDescription = this.fnGetModel("mLocationDescription").getData(),
						oDDICValue = this.fnGetModel("mDDICValue").getData(),
						oVH = this.fnGetModel("mVH").getData(),
						oEquipment = {
							count: oData.__count,
							list: oData.results
						},
						sYes = this.fnGetResourceBundle().getText("yes"),
						sNo = this.fnGetResourceBundle().getText("no");
					this.byId("EquipmentTable").setSelectedIndex(-1);
					for (var i in oEquipment.list) {
						var oLine = oEquipment.list[i];
						//Manage descriptions (needed for extract excel)
						oLine.CompleteLocationName = oLocationDescription[oLine.LocationId].LocationName;
						oLine.IsCreatedDuringPecDesc = oLine.IsCreatedDuringPec ? sYes : sNo;
						oLine.PecDeepAnalysisNeededDesc = oLine.PecDeepAnalysisNeededId ? sYes : sNo;
						oLine.PecQuoteDesc = oLine.PecQuoteId ? sYes : sNo;
						oLine.PecTrainingReqDesc = oLine.PecTrainingReqId ? sYes : sNo;
						oLine.Critical = oLine.CriticalId ? sYes : sNo;
						oLine.DomainDesc = oLine.DomainId === "" ? "" : oVH["Domain"][oLine.DomainId].Desc;
						oLine.FunctionDesc = oLine.FunctionId === "" ? "" : oVH["Function"][oLine.FunctionId].Desc;
						oLine.FamilyDesc = oLine.FamilyId === "" ? "" : oVH["Family"][oLine.FamilyId].Desc;
						oLine.WarrantyEndDateText = oLine.WarrantyEndDate === null ? "" : this._oFormatDate.format(oLine.WarrantyEndDate);
						for (var sPorperty in oLine) {
							if (oDDICValue[sPorperty]) { //Manage only properties with value list (from DDIC)
								var sLink = sPorperty.split("Id").shift();
								oLine[sLink + "Desc"] = oLine[sPorperty] === "" ? "" : oDDICValue[sPorperty][oLine[sPorperty]].ValueDesc;
							}
						}

						//Manage Modified info
						oLine.ModifiedInfo = oLine.ModifiedInfo.results;
						oLine.ModifiedProperty = [];
						for (var iLine in oLine.ModifiedInfo) {
							var oLineMod = oLine.ModifiedInfo[iLine];
							if(oLineMod.IsProperty) { //Line is a property
								oLine.ModifiedProperty.push(oLineMod.FieldI18n); //Save was property was changed
								if (oDDICValue[oLineMod.FieldI18n]) { //Manage only properties with value list (from DDIC)
									oLineMod.ValueOldDesc = oLineMod.ValueOld === "" ? "" : oDDICValue[oLineMod.FieldI18n][oLineMod.ValueOld].ValueDesc;
									oLineMod.ValueNewDesc = oLineMod.ValueNew === "" ? "" : oDDICValue[oLineMod.FieldI18n][oLineMod.ValueNew].ValueDesc;

								} else if (oLineMod.FieldI18n === "DomainId" ||
									oLineMod.FieldI18n === "FunctionId" ||
									oLineMod.FieldI18n === "FamilyId") { // Manage description from VH (Family Function, Domain)

									sLink = oLineMod.FieldI18n.split("Id").shift();
									oLineMod.ValueOldDesc = oLineMod.ValueOld === "" ? "" : oVH[sLink][oLineMod.ValueOld].Desc;
									oLineMod.ValueNewDesc = oLineMod.ValueNew === "" ? "" : oVH[sLink][oLineMod.ValueNew].Desc;

								} else if (aBooleanField.indexOf(oLineMod.FieldI18n) !== -1) { // Manage boolean field
									oLineMod.ValueOldDesc = oLineMod.ValueOld === "X" ? sYes : sNo;
									oLineMod.ValueNewDesc = oLineMod.ValueNew === "X" ? sYes : sNo;

								} else if (oLineMod.FieldI18n === "LocationId") { // Manage Location Description
									oLineMod.ValueOldDesc = oLineMod.ValueOld === "" ? "" : oLocationDescription[oLineMod.ValueOld].LocationName;
									oLineMod.ValueNewDesc = oLineMod.ValueNew === "" ? "" : oLocationDescription[oLineMod.ValueNew].LocationName;

								} else if (aDateField.indexOf(oLineMod.FieldI18n) !== -1) { //Manage date field
									oLineMod.ValueOldDesc = oLineMod.ValueOld === "00000000" ? "" : this._oFormatDate.format(
										new Date(oLineMod.ValueOld.slice(0, 4),
											oLineMod.ValueOld.slice(4, 6) - 1,
											oLineMod.ValueOld.slice(6, 8)));
									oLineMod.ValueNewDesc = oLineMod.ValueNew === "00000000" ? "" : this._oFormatDate.format(
										new Date(oLineMod.ValueNew.slice(0, 4),
											oLineMod.ValueNew.slice(4, 6) - 1,
											oLineMod.ValueNew.slice(6, 8)));

								} else { // Free field
									oLineMod.ValueOldDesc = oLineMod.ValueOld;
									oLineMod.ValueNewDesc = oLineMod.ValueNew;
								}
							} else { //Line is a characteristic
								if (oFamilyCharacteristic.ValueList[oLineMod.FieldId]) { //Manage Chararacteristic with value list
									var oValueList = oFamilyCharacteristic.ValueList[oLineMod.FieldId];
									oLineMod.ValueOldDesc = oValueList[oLineMod.ValueOld] ? oValueList[oLineMod.ValueOld].CharactValueDescription : oLineMod.ValueOld;
									oLineMod.ValueNewDesc = oValueList[oLineMod.ValueNew] ? oValueList[oLineMod.ValueNew].CharactValueDescription : oLineMod.ValueNew;

								} else if (oFamilyCharacteristic.Characteristic[oLineMod.FieldId] &&
									oFamilyCharacteristic.Characteristic[oLineMod.FieldId].CharactDataType === "DATE") { //Manage date characteristic

									oLineMod.ValueOldDesc = oLineMod.ValueOld === "00000000" ? "" : this._oFormatDate.format(
										new Date(oLineMod.ValueOld.slice(0, 4),
											oLineMod.ValueOld.slice(4, 6) - 1,
											oLineMod.ValueOld.slice(6, 8)));
									oLineMod.ValueNewDesc = oLineMod.ValueNew === "00000000" ? "" : this._oFormatDate.format(
										new Date(oLineMod.ValueNew.slice(0, 4),
											oLineMod.ValueNew.slice(4, 6) - 1,
											oLineMod.ValueNew.slice(6, 8)));

								} else if (oFamilyCharacteristic.Characteristic[oLineMod.FieldId] &&
									oFamilyCharacteristic.Characteristic[oLineMod.FieldId].CharactDataType === "NUM") { //Manage date characteristic
									oLineMod.ValueOldDesc = oLineMod.ValueOld;
									oLineMod.ValueNewDesc = oLineMod.ValueNew;
									oLineMod.CharactUnit = oFamilyCharacteristic.Characteristic[oLineMod.FieldId].CharactUnit;

								} else { // Free field characteristic
									oLineMod.ValueOldDesc = oLineMod.ValueOld;
									oLineMod.ValueNewDesc = oLineMod.ValueNew;
								}
							}
						}

					}
					this.fnSetJSONModel(oEquipment, "mEquipment");
				}.bind(this),
				error: function (oError) {
					var oEquipment = {
						count: 0,
						list: []
					};
					this.fnSetJSONModel(oEquipment, "mEquipment");
				}.bind(this)
			});
		},

		_ApplyLocationStatus: function (oEvent, sNewStatus) {
			var oParameters = {
				async: false,
				success: function (oData, resp) {
					this._bRefreshHierarchy = true;
					this._bindTreeTable();
				}.bind(this),
				error: function (oData, resp) {

				}.bind(this)
			};

			var payload = {
				Scope: "PEC",
				LocationId: oEvent.getSource().getParent().getParent().getRowBindingContext().getObject().LocationId,
				UserStatusId: sNewStatus
			};

			this.getOwnerComponent().getModel().create("/UserStatusSet", payload, oParameters);
		},

		/*
		 * Method is called to update status for 1 equipment
		 */
		_ApplyEquipmentStatus: function (oEvent, sNewStatus) {
			var oParameters = {
				async: false,
				success: function (oData, resp) {
					this._bRefreshHierarchy = true;
					this._bindTreeTable();
					this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
				}.bind(this),
				error: function (oData, resp) {
					this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
				}.bind(this)
			};

			var payload = {
				Scope: "PEC",
				EquipmentId: oEvent.getSource().getParent().getParent().getRowBindingContext().getObject().EquipmentId,
				UserStatusId: sNewStatus
			};

			this.getOwnerComponent().getModel().create("/UserStatusSet", payload, oParameters);
		},

		/*
		 * Method is called to update status for a list of equipment
		 */
		_ApplyEquipmentMassStatus: function (oEvent, sNewStatus) {
			// Initialize Id for mass call
			var sId = oEvent.getSource().getId().split("-").pop();

			// Set parameters for singles calls
			var oSingleParameters = {
				async: false,
				groupId: sId,
				error: function (oData, resp) {
					var i = 1;
				}.bind(this)
			};

			//Set parameters for mass cal
			var oMassParameters = {
				async: false,
				groupId: sId,
				success: function (oData, resp) {
					this._bRefreshHierarchy = true;
					this._bindTreeTable();
					this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
				}.bind(this),
				error: function (oData, resp) {
					this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
				}.bind(this)
			};

			// Set deferred group for mass call
			var oModel = this.getOwnerComponent().getModel();
			oModel.setDeferredGroups([sId]);
			// Get indices selected
			var aIndexSelected = this.byId("EquipmentTable").getSelectedIndices();
			// Get rows
			var oEquipmentTable = this.byId("EquipmentTable");

			// this.byId("EquipmentTable").getContextByIndex(1).getObject();

			//Initialize the call by Indicies selected
			for (var iInd in aIndexSelected) {
				var oEquipmentSelected = oEquipmentTable.getContextByIndex(aIndexSelected[iInd]).getObject();

				var payload = {
					Scope: "PEC",
					EquipmentId: oEquipmentSelected.EquipmentId,
					UserStatusId: sNewStatus
				};

				oModel.create("/UserStatusSet", payload, oSingleParameters);
			}

			if (aIndexSelected.length > 0) {
				oModel.submitChanges(oMassParameters);
			}
		},

		/*
		 * Method is called to return the right user status id for equipment
		 */
		_fnSetEquipmentUserStatusId: function (oEvent) {

			switch (oEvent.getSource().getType()) {
			case "Accept": // Validated Status to apply
				return "E0005";

			case "Emphasized": // Return to take over to apply
				return "E0008";

			case "Reject": // Deleted Status to apply
				return "E0006";
			}

			return "";
		},

		/*
		 * Set Columns to Excel File
		 */
		_setExcelColumns: function (oExcel, aColSize, oColumnProperties) {
			var iHeaderStyle = oExcel.generateNewStyle({
					font: "Calibri 12 B",
					fill: "#F2F2F2"
				}),
				iSheetProperties = 0,
				iRow = 0;

			// Set first sheet with properties
			for (var idx in oColumnProperties) {
				var oCol = oColumnProperties[idx];
				oExcel.addCell(iSheetProperties, oCol.colIndex, iRow, this.formatter.setPropertyDescription.call(this, oCol.i18n), iHeaderStyle,
					aColSize["Sheet" +
						iSheetProperties]);
			}
		},

		/*
		 * Generate file to save
		 */
		_generateExcel: function (oExcel) {
			var dDate = new Date(),
				iMonth = parseInt(dDate.getMonth(), 10) + 1,
				sFileName = dDate.getFullYear() + "-" + iMonth + "-" + dDate.getDate() + "_" + dDate.getHours() +
				":" + dDate.getMinutes() + ":" + dDate.getSeconds() + ".xlsx";

			oExcel.generate(sFileName);
		},

		/*
		 * Set Rows to Excel File
		 */
		_setExcelRows: function (oExcel, aData, aColSize, oColumnProperties) {
			var iDefaultStyle = oExcel.generateNewStyle({
					align: "L T W" //Left Top Wrap
				}),
				iGreenStyle = oExcel.generateNewStyle({
					font: "Calibri 12 " + "#00B050" + " B",
					align: "L T W" //Left Top Wrap
				}),
				iModifiedStyle = oExcel.generateNewStyle({
					font: "Calibri 12 B",
					fill: "#C6E0B4",
					align: "L T W" //Left Top Wrap
				}),
				iFirstRow = 1, // Start To 1 because Row 0 is Header
				iRow = iFirstRow;

			for (var iEquip in aData) {
				var oEquipment = aData[iEquip];
				for (var sProp in oEquipment) {
					var oProprerty = oEquipment[sProp];
					var oColProperty = oColumnProperties[sProp];
					if (oColProperty) { //Property is customize to export excel
						var iStyle = iDefaultStyle;
						if (sProp === "IsCreatedDuringPecDesc" && oEquipment.IsCreatedDuringPec) {
							iStyle = iGreenStyle;
						}
						if (oEquipment.ModifiedProperty.indexOf(oColProperty.propertyId) !== -1) {
							iStyle = iModifiedStyle;
						}
						oExcel.addCell(0, oColProperty.colIndex, iRow, oProprerty, iStyle, aColSize.Sheet0);
					}
				}
				iRow++;
			}
		},

		//--------------------------------------------
		// Event functions
		//--------------------------------------------
		/*
		 * Method is called when a link on "LocationId" column of tree table is clicked
		 * Used to fetch equipments for selected functional location and binded to Equipments table
		 */
		onGetEquiForLocationPress: function (oEvent) {
			// this.byId("filterBar").setFilterBarExpanded(false);
			var oContext = oEvent.getSource().getBindingContext("mLocationHierarchy");

			this._sSelectedLocationId = oContext.getProperty("LocationId");
			this._sSelectedLocationType = oContext.getProperty("LoomaTypeId");

			this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
		},

		/*
		 * Method is called when press on Modified Info icone
		 */
		onDisplayModifiedInfoPopoverPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView(),
				sModifiedInfo = oEvent.getSource().getParent().getParent().getRowBindingContext().getObject();

			this.fnSetJSONModel(sModifiedInfo.ModifiedInfo, "mModifiedInfo");

			if (!this._ModPopover) {
				this._ModPopover = Fragment.load({
					id: oView.getId(),
					name: "com.vesi.zfioac4_valpec.view.fragment.Detail.ModifiedInfo",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					oPopover.bindElement("/ProductCollection/0");
					return oPopover;
				});
			}
			this._ModPopover.then(function (oPopover) {
				oPopover.openBy(oButton);
			});
		},
		/*
		 * Method is called when press on close button from popover
		 */
		onClosePopoverPress: function (oEvent) {

			this.byId("ModifiedInfo").close();

		},

		/*
		 * Method is called when press on location single button
		 */
		onApplyLocationStatus: function (oEvent) {

			switch (oEvent.getSource().getType()) {
			case "Accept": // Validated Status to apply
				var sUserStatusId = "E0003";
				break;

			case "Reject": // Deleted Status to apply
				sUserStatusId = "E0004";
				break;
			}

			this._ApplyLocationStatus(oEvent, sUserStatusId);
		},

		/*
		 * Method is called when press on equipment single button
		 */
		onApplyEquipmentStatus: function (oEvent) {
			var sUserStatusId = this._fnSetEquipmentUserStatusId(oEvent);
			this._ApplyEquipmentStatus(oEvent, sUserStatusId);
		},

		/*
		 * Method is called when press on equipment mass button
		 */
		onApplyEquipmentMassStatus: function (oEvent) {
			if (this.byId("EquipmentTable").getSelectedIndices().length > 0) {
				var sUserStatusId = this._fnSetEquipmentUserStatusId(oEvent);
				this._ApplyEquipmentMassStatus(oEvent, sUserStatusId);
			}
		},

		/*
		 * Event on Search in filter bar
		 */
		onFiltersSearch: function (oEvent) {
			this._bRefreshHierarchy = false;
			this._bindTreeTable();
		},

		/*
		 * Event on Clear in filter bar
		 */
		onFiltersClear: function (oEvent) {
			// Reset model for filters
			this._initDetailPageModel();

			// Reset MultiCombox
			var aFilterBarFilters = this.byId("detailFilterBar").getAllFilterItems();
			for (var iFil in aFilterBarFilters) {
				var oFilter = aFilterBarFilters[iFil];
				if (oFilter.getGroupName() === "MultiComboBox") {
					oFilter.getControl().removeAllSelectedItems();
				}
			}
		},

		/*
		 * Event on Personalization for Equipment Table
		 */
		onEquipmentTablePersonalizationPress: function () {
			this._onTablePersonalizePress("/model/Config/Detail/EquipmentTable.json", "EquipmentTable");
		},

		/*
		 * Event fire on Selection change on Equipment Table
		 */
		onSelectionChangeEquipmentTable: function (oEvent) {
			var oDetailPageModel = this.fnGetModel("mDetailPage");
			if (oEvent.getSource().getSelectedIndices().length > 0) {
				oDetailPageModel.getData().bEquipmentSelected = true;
			} else {
				oDetailPageModel.getData().bEquipmentSelected = false;
			}

			oDetailPageModel.refresh(true);
		},

		/*
		 * Event fire on press on icon photo
		 */
		onPhotoDownload: function (oEvent) {
			var oObject = oEvent.getSource().getParent().getRowBindingContext().getObject();
			var downloadUrl = "/sap/opu/odata/sap/ZSRC4_PEC_SRV/PhotoSet('" + oObject.PhotoId + "')/$value";
			sap.m.URLHelper.redirect(downloadUrl, true);
		},

		/*
		 * Event fire for excel export
		 */
		onExportXLS: function (oEvent) {
			if (!this.fnGetModel("mEquipment")) {
				return;
			}

			var oExcel = new Excel("Calibri 12", [{
					name: "Tab",
					bFreezePane: true,
					iCol: 0,
					iRow: 2
				}]),
				oData = this.fnGetModel("mEquipment").getData(),
				aColSize = {
					"Sheet0": [] //Sheet 1
				},
				sRootPath = sap.ui.require.toUrl("com/vesi/zfioac4_valpec"),
				oColumnProperties = new JSONModel();

			if (!oData.list || (oData.list && oData.list.length === 0)) {
				return;
			}

			oColumnProperties.loadData(sRootPath + "/model/Config/Detail/ExcelExportedProperties.json", null, false); // Config for properties
			oColumnProperties = oColumnProperties.getData();

			this._setExcelColumns(oExcel, aColSize, oColumnProperties);

			this._setExcelRows(oExcel, oData.list, aColSize, oColumnProperties);
			//Because we use bold for the font we have to had 1 to the colsize
			for (var i in aColSize.Sheet0) {
				aColSize.Sheet0[i] += 1;
			}
			oExcel.manageColSize(0, aColSize.Sheet0);
			this._generateExcel(oExcel);
		}
	});

});
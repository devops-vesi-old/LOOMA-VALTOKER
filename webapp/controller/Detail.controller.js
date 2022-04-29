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
			this._initEquipmentStatusDesc();
			this._initDetailPageModel();
			//Set models for VHs
			this._initVHModels();
			// Set default filter for multicombobox
			this._initDefaultFilterMCB();
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
		 * Called from method "onInit" to initialize Equipment User Status Description model
		 */
		_initEquipmentStatusDesc: function () {
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
			// Get Country Region and Department description
			this._getAddressDescription();

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
							oCharacteristic.Class[oLine.ClassId] = {
								_iImportant: 0
							};
						}

						oCharacteristic.Class[oLine.ClassId][oLine.CharactId] = {
							CharactImportant: oLine.CharactImportant
						};

						if (oLine.CharactImportant) {
							oCharacteristic.Class[oLine.ClassId]._iImportant++;
						}

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
		 * Called from method "onInit" to initialize Country, Region and Department descriptionmodel
		 */
		_getAddressDescription: function () {
			var mParams = {
				success: function (oData) {
					var oAddress = {
						Country: {},
						Region: {},
						Department: {}
					};
					var aData = oData.results;
					for (var idx in aData) {
						//Manage Country
						if (!oAddress.Country[aData[idx].CountryId]) {
							oAddress.Country[aData[idx].CountryId] = {
								Id: aData[idx].CountryId,
								Desc: aData[idx].CountryDesc
							};
						}
						//Manage Region
						if (!oAddress.Region[aData[idx].RegionId]) {
							oAddress.Region[aData[idx].RegionId] = {
								Id: aData[idx].RegionId,
								Desc: aData[idx].RegionDesc
							};
						}
						//Manage Department
						oAddress.Department[aData[idx].DepartmentId] = {
							Id: aData[idx].DepartmentId,
							Desc: aData[idx].DepartmentDesc
						};
					}
					var oVHJsonModel = new JSONModel(oAddress);
					oVHJsonModel.setSizeLimit(aData.length ? aData.length : oVHJsonModel.iSizeLimit);
					this.fnSetModel(oVHJsonModel, "mAddress");
				}.bind(this)
			};
			this.fnGetODataModel("VH").read("/DepartmentSet", mParams);
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
							Desc: aData[idx].FamilyDesc,
							ClassId: aData[idx].ClassId
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
		 * Called from method "onInit" to initialize default selected keys for MultiComboBox
		 */
		_initDefaultFilterMCB: function () {
			var aDefault = {
				filterStatusInternalId: ["E0002", "E0004", "E0009", "E0003"],
				filterDomainId: [],
				filterFunctionId: [],
				filterFamilyId: []

			};
			for (var sIdMCB in aDefault) {
				this.byId(sIdMCB).setSelectedKeys(aDefault[sIdMCB]);
			}
		},

		/*
		 * Called from method "onInit" to initialize model mDetailPage 
		 */
		_initDetailPageModel: function () {
			var oDetailPage = {
				"bSwitchDirect": false,
				"bEquipmentSelected": false,
				"bLocationSelected": false
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
				oDetailPageModel = this.fnGetModel("mDetailPage"),
				oLocationType = this.fnGetModel("mLocationType").getData(),
				oLocationFSM = {
					AllForFSM: true
				};
			oDetailPageModel.getData().SynchroniseFSM = false;
			if (aNodesIn) {
				var oNodeOut,
					sSuperiorLocationId;
				for (var i in aNodesIn) {
					var oNodeIn = aNodesIn[i],
						sTypeDesc = oNodeIn.TypeId === "" ? "" : oLocationType[oNodeIn.LoomaTypeId][oNodeIn.TypeId].CharactValueDescription;
					//Check and set Status for sending to FSM
					oLocationFSM[oNodeIn.LocationId] = {
						SuperiorLocationId: oNodeIn.SuperiorLocationId,
						StatusFSM: 0
					};
					//Set FSM status
					oLocationFSM[oNodeIn.LocationId].StatusFSM = this._setLocationStatusFSM(oLocationFSM, oNodeIn);

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
						StatusFSM: oLocationFSM[oNodeIn.LocationId].StatusFSM,
						children: []
					};

					if (oNodeOut.LoomaTypeId === "SITE" && oNodeOut.StatusFSM === 1) {
						oDetailPageModel.getData().SynchroniseFSM = true;
					}
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
			this._oLocationFSM = oLocationFSM;
			this.fnSetJSONModel(oLocationFSM, "mLocationFSM");
			oDetailPageModel.refresh(true);
			return aNodes;
		},

		/*
		 * Set the property status FSM for Location
		 * 0 = Not validate and not sent
		 * 1 = Validate and sent
		 * 2 = Validate but not sent
		 */
		_setLocationStatusFSM: function (oLocationFSM, oCurrentLocation) {
			if (oCurrentLocation.UserStatusId === "E0003" || oCurrentLocation.UserStatusId === "E0004") { // Current Location is validated or deleted
				if (oCurrentLocation.SuperiorLocationId === "") { // No superior location
					return 1; //Current Location validated and will be sent to FSM
				} else {
					var SuperiorLocationStatusFSM = oLocationFSM[oCurrentLocation.SuperiorLocationId].StatusFSM;
					if (SuperiorLocationStatusFSM === 1) { //Superior Location will be sent to FSM
						return 1; //Current Location validated and will be sent to FSM
					} else { //Superior Location will be not sent to FSM
						oLocationFSM.AllForFSM = false;
						return 2; //Current Location validated but will be not sent to FSM because of superior location
					}
				}
			}
			oLocationFSM.AllForFSM = false;
			return 0; //Current Location not validated

		},

		/*
		 * Set the property status FSM for Equipment
		 * 0 = Not validate and not sent
		 * 1 = Validate and sent
		 * 2 = Validate but not sent
		 */
		_setEquipmentStatusFSM: function (oEquipment, oCurrentEquipment) {
			var iLocationStatusFSM = this._oLocationFSM[oCurrentEquipment.LocationId].StatusFSM;
			if (oCurrentEquipment.UserStatusId === "E0005" || oCurrentEquipment.UserStatusId === "E0006") { // Current Equipment is validated or deleted
				if (iLocationStatusFSM === 1) {
					return 1; //Current Equipment validated and will be sent to FSM
				} else { //Location will be not sent to FSM
					return 2; //Current Equipment validated but will be not sent to FSM because of Location Equipment
				}
			}
			return 0; //Current Equipment not validated

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
			var sAddress = "",
				oCountry = this.fnGetModel("mAddress").getData().Country;
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
				var sCountry = oCountry[oData.AddressCountryId] ? oCountry[oData.AddressCountryId].Desc : oData.AddressCountryId;
				sAddress = sAddress + sCountry;
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
			this.byId("LocationHierarchyTreeTable").setSelectedIndex(-1);
			this.fnShowBusyIndicator(null, 0);
			this.getOwnerComponent().getModel().read("/LocationHierarchySet", {
				filters: aFilters,
				urlParameters: {
					"$expand": "EquipmentNumber"
				},
				success: function (oData, response) {
					var aNodes = this._transformTreeData(oData.results);
					this.fnHideBusyIndicator();
					if (this._bRefreshHierarchy) {
						//Only refresh hierarchy (status and equipment's number)
						this._updateHierarchy(oData, aNodes);
					} else {
						//Set hierarchy from scratch
						this._setTreeModelData(aNodes);
						this._setLocationDescription(oData.results);
						var oEquipment = {
							count: 0,
							list: []
						};
						this.fnSetJSONModel(oEquipment, "mEquipment");
					}

				}.bind(this),
				error: function (oError) {
					this.fnHideBusyIndicator();
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
			oBase.StatusFSM = oNewHierarchy.StatusFSM;
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

		_MessageError: function (sDialogName, sText) {
			if (!this[sDialogName]) {
				this[sDialogName] = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Error",
					state: sap.m.ValueState.Error,
					content: sText,
					beginButton: new sap.m.Button({
						type: "Emphasized",
						text: this.getResourceBundle("close"),
						press: function () {
							this.oErrorMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this[[sDialogName]].open();
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
				case "ROOM":
					sLocationFilter = "RoomId";
					break;
				}
			}
			aFilters.push(new Filter(sLocationFilter, FilterOperator.EQ, sLocationId));
			var aFilterBarFilters = this._fnGetFilters("detailFilterBar");
			if (aFilterBarFilters && aFilterBarFilters.length > 0) {
				aFilters = aFilters.concat(aFilterBarFilters);
			}
			this.fnShowBusyIndicator(null, 0);
			this.getOwnerComponent().getModel().read("/EquipmentSet", {
				filters: aFilters,
				urlParameters: {
					$expand: "ModifiedInfo,FamilyCharacteristic",
					$inlinecount: "allpages"
				},
				success: function (oData, response) {
					var oEquipment = this._buildEquipmentModel(oData);
					this.fnHideBusyIndicator();
					this.fnSetJSONModel(oEquipment, "mEquipment");
				}.bind(this),
				error: function (oError) {
					var oEquipment = {
						count: 0,
						list: []
					};
					this.fnHideBusyIndicator();
					this.fnSetJSONModel(oEquipment, "mEquipment");
				}.bind(this)
			});
		},

		/*
		 * Called from _bindEquipmentTable to build equipment model
		 */
		_buildEquipmentModel: function (oData) {
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
				oEquipmentFSM = {},
				sYes = this.fnGetResourceBundle("yes"),
				sNo = this.fnGetResourceBundle("no");
			this.byId("EquipmentTable").setSelectedIndex(-1);
			for (var i in oEquipment.list) {
				var oLine = oEquipment.list[i];
				oEquipmentFSM[oLine.EquipmentId] = {
					LocationId: oLine.LocationId,
					SuperiorEquiId: oLine.SuperiorEquiId,
					StatusFSM: 0
				};
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
				oLine.UserStatusDesc = this.formatter.setStatusDescription.call(this, oLine.UserStatusId);
				for (var sPorperty in oLine) {
					if (oDDICValue[sPorperty]) { //Manage only properties with value list (from DDIC)
						var sLink = sPorperty.split("Id").shift();
						oLine[sLink + "Desc"] = oLine[sPorperty] === "" ? "" : oDDICValue[sPorperty][oLine[sPorperty]].ValueDesc;
					}
				}
				this._fnSetAmdecCounter(oLine, sYes, sNo); // Set Amdec counter and boolean for all amdec value filled
				oLine.StatusFSM = this._setEquipmentStatusFSM(oEquipmentFSM, oLine); // Set 

				//Manage Modified info
				oLine.ModifiedInfo = oLine.ModifiedInfo.results;
				oLine.ModifiedProperty = [];
				for (var iLine in oLine.ModifiedInfo) {
					var oLineMod = oLine.ModifiedInfo[iLine];
					if (oLineMod.IsProperty) { //Line is a property
						this._fnSetPropertyDescription(oLine, oLineMod, oDDICValue, oVH, aBooleanField, oLocationDescription, aDateField, sYes, sNo);

					} else { //Line is a characteristic
						this._fnSetCharactisticDescription(oLineMod, oFamilyCharacteristic);
					}
				}

				//Manage Family Characteristic
				oLine.FamilyCharacteristic = oLine.FamilyCharacteristic.results;
				this._fnSetFamilyImportantCounter(oLine, oFamilyCharacteristic.Class, oVH.Family[oLine.FamilyId], sYes, sNo); // Set Family Characteristic Important counter and boolean

			}
			return oEquipment;
		},

		/*
		 * Called from _buildEquipmentModel to set description on modified info from property
		 */
		_fnSetPropertyDescription: function (oLine, oLineMod, oDDICValue, oVH, aBooleanField, oLocationDescription, aDateField, sYes, sNo) {
			oLine.ModifiedProperty.push(oLineMod.FieldI18n); //Save was property was changed
			if (oDDICValue[oLineMod.FieldI18n]) { //Manage only properties with value list (from DDIC)
				oLineMod.ValueOldDesc = oLineMod.ValueOld === "" ? "" : oDDICValue[oLineMod.FieldI18n][oLineMod.ValueOld].ValueDesc;
				oLineMod.ValueNewDesc = oLineMod.ValueNew === "" ? "" : oDDICValue[oLineMod.FieldI18n][oLineMod.ValueNew].ValueDesc;

			} else if (oLineMod.FieldI18n === "DomainId" ||
				oLineMod.FieldI18n === "FunctionId" ||
				oLineMod.FieldI18n === "FamilyId") { // Manage description from VH (Family Function, Domain)

				var sLink = oLineMod.FieldI18n.split("Id").shift();
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
		},

		/*
		 * Called from _buildEquipmentModel to set description on modified info from characteristic
		 */
		_fnSetCharactisticDescription: function (oLineMod, oFamilyCharacteristic) {
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
		},

		/*
		 * Called from _buildEquipmentModel to set counter and boolean for missing Amdec
		 */
		_fnSetAmdecCounter: function (oLine, sYes, sNo) {
			var aAmdecProp = [
					"AmdecStateId",
					"AmdecDisrepairId",
					"AmdecAccessibilityId",
					"AmdecReliabilityId",
					"AmdecCriticityId",
					"AmdecDetectabilityId",
					"AmdecFunctionningId"
				],
				iTot = 0,
				iCount = 0;

			for (var idx in aAmdecProp) {
				var sVal = oLine[aAmdecProp[idx]];
				iTot++;
				if (sVal !== "") {
					iCount++;
				}
			}

			oLine.AmdecCounter = iCount + "/" + iTot;
			oLine.IsAmdecComplete = (iTot === iCount);
			oLine.IsAmdecCompleteDesc = oLine.IsAmdecComplete ? sYes : sNo;
			oLine.AmdecSorter = iCount;
		},

		/*
		 * Called from _buildEquipmentModel to set counter and boolean for missing important Family Characteristic
		 */
		_fnSetFamilyImportantCounter: function (oLine, oClass, oFamily, sYes, sNo) {
			var iCount = 0,
				iTot = 0;

			if (!oFamily || oFamily.ClassId === "") {
				oLine.FamilyCharactImportantCounter = "-";
				oLine.IsFamilyCharactImportantComplete = true;
				oLine.IsFamilyCharactImportantCompleteDesc = "";
				oLine.FamilyCharactImportantSorter = 10;
				return;
			} else {
				iTot = oClass[oFamily.ClassId]._iImportant;
			}

			for (var idx in oLine.FamilyCharacteristic) {
				if (oLine.FamilyCharacteristic[idx].CharactImportant) {
					iCount++;
				}
			}

			oLine.FamilyCharactImportantCounter = iCount + "/" + iTot;
			oLine.IsFamilyCharactImportantComplete = (iTot === iCount);
			oLine.IsFamilyCharactImportantCompleteDesc = oLine.IsFamilyCharactImportantComplete ? sYes : sNo;
			oLine.FamilyCharactImportantSorter = iTot === 0 ? 1 : iCount / iTot;
		},

		/*
		 * Method is called to update status for 1 object
		 */
		_ApplyStatus: function (oEvent, sNewStatus, sEquipmentId, sLocationId) {
			var sObjectName = sEquipmentId === "" ? "Location" : "Equipement";
			var oParameters = {
				async: false,
				success: function (oData, resp) {
					this._bRefreshHierarchy = true;
					this.fnHideBusyIndicator();
					this._bindTreeTable();
					if (sEquipmentId !== "") {
						this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
					}
					sap.m.MessageToast.show(this.fnGetResourceBundle("ToastSuccessStatusChange"));
				}.bind(this),
				error: function (oData, resp) {
					this.fnHideBusyIndicator();
					if (sEquipmentId !== "") {
						this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
					}
					this._MessageError("oError" + sObjectName + "Status", this.fnGetResourceBundle("DialogErrorStatusChange"));
				}.bind(this)
			};

			var payload = {
				Scope: "PEC",
				EquipmentId: sEquipmentId,
				LocationId: sLocationId,
				UserStatusId: sNewStatus
			};

			this.fnShowBusyIndicator(null, 0);
			this.getOwnerComponent().getModel().create("/UserStatusSet", payload, oParameters);
		},

		/*
		 * Method is called to update status for 1 location
		 */
		_ApplyLocationStatus: function (oEvent, sNewStatus) {
			var sLocationId = oEvent.getSource().getParent().getParent().getRowBindingContext().getObject().LocationId;
			this._ApplyStatus(oEvent, sNewStatus, "", sLocationId);
		},

		/*
		 * Method is called to update status for 1 equipment
		 */
		_ApplyEquipmentStatus: function (oEvent, sNewStatus) {
			var sEquipmentId = oEvent.getSource().getParent().getParent().getRowBindingContext().getObject().EquipmentId;
			this._ApplyStatus(oEvent, sNewStatus, sEquipmentId, "");
		},

		/*
		 * Method is called to update status for a list of Object
		 */
		_ApplyMassStatus: function (oEvent, sNewStatus, bIsEquipments) {
			// Initialize Id for mass call
			var sId = oEvent.getSource().getId().split("-").pop(),
				sObjectName = bIsEquipments ? "Equipment" : "Location",
				sTableName = bIsEquipments ? "EquipmentTable" : "LocationHierarchyTreeTable";

			// Set parameters for singles calls
			var oSingleParameters = {
				async: false,
				groupId: sId
			};

			//Set parameters for mass cal
			var oMassParameters = {
				async: false,
				groupId: sId,
				success: function (oData, resp) {
					this._bRefreshHierarchy = true;
					this.fnHideBusyIndicator();
					this._bindTreeTable();
					if (bIsEquipments) {
						this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
					}
					sap.m.MessageToast.show(this.fnGetResourceBundle("ToastSuccessStatusChange"));
				}.bind(this),
				error: function (oData, resp) {
					this.fnHideBusyIndicator();
					if (bIsEquipments) {
						this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
					}
					this._MessageError("oErrorMass" + sObjectName, this.fnGetResourceBundle("DialogErrorStatusChange"));
				}.bind(this)
			};

			// Set deferred group for mass call
			var oModel = this.getOwnerComponent().getModel();
			oModel.setDeferredGroups([sId]);
			// Get rows
			var oObjectTable = this.byId(sTableName);
			// Get indices selected
			var aIndexSelected = oObjectTable.getSelectedIndices();

			//Initialize the call by Indices selected
			for (var iInd in aIndexSelected) {
				var oObjectSelected = oObjectTable.getContextByIndex(aIndexSelected[iInd]).getObject();

				var payload = {
					Scope: "PEC",
					EquipmentId: bIsEquipments ? oObjectSelected.EquipmentId : "",
					LocationId: bIsEquipments ? "" : oObjectSelected.LocationId,
					UserStatusId: sNewStatus
				};

				this.fnShowBusyIndicator(null, 0);
				oModel.create("/UserStatusSet", payload, oSingleParameters);
			}

			if (aIndexSelected.length > 0) {
				oModel.submitChanges(oMassParameters);
			}
		},

		/*
		 * Method is called to update status for a list of equipment
		 */
		_ApplyEquipmentMassStatus: function (oEvent, sNewStatus) {
			this._ApplyMassStatus(oEvent, sNewStatus, true);
			// // Initialize Id for mass call
			// var sId = oEvent.getSource().getId().split("-").pop();

			// // Set parameters for singles calls
			// var oSingleParameters = {
			// 	async: false,
			// 	groupId: sId
			// };

			// //Set parameters for mass cal
			// var oMassParameters = {
			// 	async: false,
			// 	groupId: sId,
			// 	success: function (oData, resp) {
			// 		this._bRefreshHierarchy = true;
			// 		this.fnHideBusyIndicator();
			// 		this._bindTreeTable();
			// 		this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
			// 		sap.m.MessageToast.show(this.fnGetResourceBundle("ToastSuccessStatusChange"));
			// 	}.bind(this),
			// 	error: function (oData, resp) {
			// 		this.fnHideBusyIndicator();
			// 		this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
			// 		this._MessageError("oErrorMassEquipement", this.fnGetResourceBundle("DialogErrorStatusChange"));
			// 	}.bind(this)
			// };

			// // Set deferred group for mass call
			// var oModel = this.getOwnerComponent().getModel();
			// oModel.setDeferredGroups([sId]);
			// // Get indices selected
			// var aIndexSelected = this.byId("EquipmentTable").getSelectedIndices();
			// // Get rows
			// var oEquipmentTable = this.byId("EquipmentTable");

			// //Initialize the call by Indices selected
			// for (var iInd in aIndexSelected) {
			// 	var oEquipmentSelected = oEquipmentTable.getContextByIndex(aIndexSelected[iInd]).getObject();

			// 	var payload = {
			// 		Scope: "PEC",
			// 		EquipmentId: oEquipmentSelected.EquipmentId,
			// 		UserStatusId: sNewStatus
			// 	};

			// 	this.fnShowBusyIndicator(null, 0);
			// 	oModel.create("/UserStatusSet", payload, oSingleParameters);
			// }

			// if (aIndexSelected.length > 0) {
			// 	oModel.submitChanges(oMassParameters);
			// }
		},

		/*
		 * Method is called to update status for a list of location
		 */
		_ApplyLocationMassStatus: function (oEvent, sNewStatus) {
			this._ApplyMassStatus(oEvent, sNewStatus, false);
			// // Initialize Id for mass call
			// var sId = oEvent.getSource().getId().split("-").pop();

			// // Set parameters for singles calls
			// var oSingleParameters = {
			// 	async: false,
			// 	groupId: sId
			// };

			// //Set parameters for mass cal
			// var oMassParameters = {
			// 	async: false,
			// 	groupId: sId,
			// 	success: function (oData, resp) {
			// 		this._bRefreshHierarchy = true;
			// 		this.fnHideBusyIndicator();
			// 		this._bindTreeTable();
			// 		sap.m.MessageToast.show(this.fnGetResourceBundle("ToastSuccessStatusChange"));
			// 	}.bind(this),
			// 	error: function (oData, resp) {
			// 		this.fnHideBusyIndicator();
			// 		this._MessageError("oErrorMassLocation", this.fnGetResourceBundle("DialogErrorStatusChange"));
			// 	}.bind(this)
			// };

			// // Set deferred group for mass call
			// var oModel = this.getOwnerComponent().getModel();
			// oModel.setDeferredGroups([sId]);
			// // Get location table
			// var oLocationTable = this.byId("LocationHierarchyTreeTable");
			// // Get indices selected
			// var aIndexSelected = oLocationTable.getSelectedIndices();

			// //Initialize the call by Indices selected
			// for (var iInd in aIndexSelected) {
			// 	var oLocationSelected = oLocationTable.getContextByIndex(aIndexSelected[iInd]).getObject();

			// 	var payload = {
			// 		Scope: "PEC",
			// 		LocationId: oLocationSelected.LocationId,
			// 		UserStatusId: sNewStatus
			// 	};

			// 	this.fnShowBusyIndicator(null, 0);
			// 	oModel.create("/UserStatusSet", payload, oSingleParameters);
			// }

			// if (aIndexSelected.length > 0) {
			// 	oModel.submitChanges(oMassParameters);
			// }
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
		 * Method is called to return the right user status id for equipment
		 */
		_fnSetLocationUserStatusId: function (oEvent) {

			switch (oEvent.getSource().getType()) {
			case "Accept": // Validated Status to apply
				return "E0003";

			case "Reject": // Deleted Status to apply
				return "E0004";
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
				iOrangeStyle = oExcel.generateNewStyle({
					font: "Calibri 12 " + "#E9730C" + " B",
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
						if (sProp === "IsAmdecCompleteDesc" && !oEquipment.IsAmdecComplete) {
							iStyle = iOrangeStyle;
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
			var oIcon = oEvent.getSource(),
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
					return oPopover;
				});
			}
			this._ModPopover.then(function (oPopover) {
				oPopover.openBy(oIcon);
			});
		},
		/*
		 * Method is called when press on close button from popover
		 */
		onClosePopoverPress: function (oEvent) {
			this.byId("ModifiedInfo").close();
		},

		/*
		 * Method is called when press on close button from dialog
		 */
		onCloseDialogPress: function (oEvent) {
			this.byId(oEvent.getSource().getParent().getId().split("-").pop()).close();
		},

		/*
		 * Method is called when press on location single button
		 */
		onApplyLocationStatus: function (oEvent) {
			var sUserStatusId = this._fnSetLocationUserStatusId(oEvent);
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
		 * Method is called when press on object
		 */
		onApplyMassStatus: function (oEvent, sTableName, sObjectName, sFunctionName, sUserStatusId) {
			if (this.byId(sTableName).getSelectedIndices().length > 0) {
				var sStatusText = oEvent.getSource().getText(),
					sMassDialog = "_MassDialog" + sObjectName + sUserStatusId;
				this._oEvent = oEvent;
				this._sUserStatusId = sUserStatusId;
				if (!this[sMassDialog]) {
					this[sMassDialog] = new sap.m.Dialog({
						type: sap.m.DialogType.Message,
						title: this.fnGetResourceBundle("DialogMass" + sObjectName + "Title"),
						content: new sap.m.Text({
							text: this.fnGetResourceBundle("DialogMass" + sObjectName + "Message", [sStatusText])
						}),
						beginButton: new sap.m.Button({
							type: sap.m.ButtonType.Emphasized,
							text: this.fnGetResourceBundle("yes"),
							press: function () {
									this[sFunctionName](this._oEvent, this._sUserStatusId);
								this[sMassDialog].close();
							}.bind(this)
						}),
						endButton: new sap.m.Button({
							text: this.fnGetResourceBundle("no"),
							press: function () {
								this[sMassDialog].close();
							}.bind(this)
						})
					});
				}

				this[sMassDialog].open();
			}
		},

		/*
		 * Method is called when press on Location hierarchy mass button
		 */
		onApplyLocationMassStatus: function (oEvent) {
			var sUserStatusId = this._fnSetLocationUserStatusId(oEvent);
			this.onApplyMassStatus(oEvent, "LocationHierarchyTreeTable", "Location", "_ApplyLocationMassStatus", sUserStatusId);
			// if (this.byId("LocationHierarchyTreeTable").getSelectedIndices().length > 0) {
			// 	var sStatusText = oEvent.getSource().getText(),
			// 		sUserStatusId = this._fnSetLocationUserStatusId(oEvent),
			// 		sMassDialog = "_MassLocationDialog" + sUserStatusId;
			// 	this._oEventLocation = oEvent;
			// 	this._sUserStatusIdLocation = sUserStatusId;
			// 	if (!this[sMassDialog]) {
			// 		this[sMassDialog] = new sap.m.Dialog({
			// 			type: sap.m.DialogType.Message,
			// 			title: this.fnGetResourceBundle("DialogMassLocationTitle"),
			// 			content: new sap.m.Text({
			// 				text: this.fnGetResourceBundle("DialogMassLocationMessage", [sStatusText])
			// 			}),
			// 			beginButton: new sap.m.Button({
			// 				type: sap.m.ButtonType.Emphasized,
			// 				text: this.fnGetResourceBundle("yes"),
			// 				press: function () {
			// 					this._ApplyLocationMassStatus(this._oEventLocation, this._sUserStatusIdLocation);
			// 					this[sMassDialog].close();
			// 				}.bind(this)
			// 			}),
			// 			endButton: new sap.m.Button({
			// 				text: this.fnGetResourceBundle("no"),
			// 				press: function () {
			// 					this[sMassDialog].close();
			// 				}.bind(this)
			// 			})
			// 		});
			// 	}

			// 	this[sMassDialog].open();
			// }
		},

		/*
		 * Method is called when press on equipment mass button
		 */
		onApplyEquipmentMassStatus: function (oEvent) {
			var sUserStatusId = this._fnSetEquipmentUserStatusId(oEvent);
			this.onApplyMassStatus(oEvent, "EquipmentTable", "Equipment", "_ApplyEquipmentMassStatus", sUserStatusId);
			// if (this.byId("EquipmentTable").getSelectedIndices().length > 0) {
			// 	var sStatusText = oEvent.getSource().getText(),
			// 		sUserStatusId = this._fnSetEquipmentUserStatusId(oEvent),
			// 		sMassDialog = "_MassEquipmentDialog" + sUserStatusId;
			// 	this._oEventEquipment = oEvent;
			// 	this._sUserStatusIdEquipment = sUserStatusId;
			// 	if (!this[sMassDialog]) {
			// 		this[sMassDialog] = new sap.m.Dialog({
			// 			type: sap.m.DialogType.Message,
			// 			title: this.fnGetResourceBundle("DialogMassEquipmentTitle"),
			// 			content: new sap.m.Text({
			// 				text: this.fnGetResourceBundle("DialogMassEquipmentMessage", [sStatusText])
			// 			}),
			// 			beginButton: new sap.m.Button({
			// 				type: sap.m.ButtonType.Emphasized,
			// 				text: this.fnGetResourceBundle("yes"),
			// 				press: function () {
			// 					this._ApplyEquipmentMassStatus(this._oEventEquipment, this._sUserStatusIdEquipment);
			// 					this[sMassDialog].close();
			// 				}.bind(this)
			// 			}),
			// 			endButton: new sap.m.Button({
			// 				text: this.fnGetResourceBundle("no"),
			// 				press: function () {
			// 					this[sMassDialog].close();
			// 				}.bind(this)
			// 			})
			// 		});
			// 	}

			// 	this[sMassDialog].open();
			// }
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
			// Reser default selected keys for multicombobox
			this._initDefaultFilterMCB();
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
		 * Event fire on Selection change on Location hierarchy Tree Table
		 */
		onSelectionChangeLocationTable: function (oEvent) {
			var oDetailPageModel = this.fnGetModel("mDetailPage");
			if (oEvent.getSource().getSelectedIndices().length > 0) {
				oDetailPageModel.getData().bLocationSelected = true;
			} else {
				oDetailPageModel.getData().bLocationSelected = false;
			}

			oDetailPageModel.refresh(true);
		},

		/*
		 * Event fire on press on icon photo
		 */
		onPhotoDownload: function (oEvent) {
			var oObject = oEvent.getSource().getParent().getRowBindingContext().getObject(),
				// downloadUrl = "/sap/opu/odata/sap/ZSRC4_PEC_SRV/PhotoSet('" + oObject.PhotoId + "')/$value",
				oView = this.getView(),
				oPhoto = oObject;
			// sap.m.URLHelper.redirect(downloadUrl, true);

			this.fnSetJSONModel(oPhoto, "mPhoto");

			if (!this._PhotoDialog) {
				this._PhotoDialog = Fragment.load({
					id: oView.getId(),
					name: "com.vesi.zfioac4_valpec.view.fragment.Detail.PhotoDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._PhotoDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		onDisplayComment: function (oEvent) {
			var oIcon = oEvent.getSource(),
				oView = this.getView(),
				oObject = oEvent.getSource().getParent().getRowBindingContext().getObject(),
				iCols = 20,
				iRows = 1;

			if (oObject.Comments.length > 100) {
				iCols = 100;
				iRows = Math.floor(oObject.Comments.length / 100) + 1;
			} else if (oObject.Comments.length > 20) {
				iCols = oObject.Comments.length;
			}

			iRows = iRows > 30 ? 30 : iRows;

			this.fnSetJSONModel({
				Comment: oObject.Comments,
				CommentCols: iCols,
				CommentRows: iRows
			}, "mLongTexts");

			if (!this._ComPopover) {
				this._ComPopover = Fragment.load({
					id: oView.getId(),
					name: "com.vesi.zfioac4_valpec.view.fragment.Detail.Comment",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this._ComPopover.then(function (oPopover) {
				oPopover.openBy(oIcon);
			});
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
		},

		/*
		 * Event fire when press on collapse all
		 */
		onLocationHierarchyCollapseAll: function (oEvent) {
			this.byId("LocationHierarchyTreeTable").collapseAll();
		},

		/*
		 * Event fire when press on expand all
		 */
		onLocationHierarchyExpandAll: function (oEvent) {
			this.byId("LocationHierarchyTreeTable").expandToLevel(4);
		},

		/*
		 *
		 */
		onSynchroniseWithFSM: function () {
			if (!this._oSynchroniseDialog) {
				this._oSynchroniseDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: this.fnGetResourceBundle("DialogSynchronizeTitle"),
					content: new sap.m.Text({
						text: this.fnGetResourceBundle("DialogSynchronizeMessage")
					}),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: this.fnGetResourceBundle("yes"),
						press: function () {
							this.fnGetModel().callFunction("/SynchronizeWithFSMFull", // function import name
								{
									method: "POST", // http method
									urlParameters: {
										SiteId: this._SiteId
									}, // function import parameters
									success: function (oData, response) {
											sap.m.MessageToast.show(this.fnGetResourceBundle("ToastSuccessSynchronizeMessage"));
										}.bind(this) // callback function for success
								}); // callback function for error
							this._oSynchroniseDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: this.fnGetResourceBundle("no"),
						press: function () {
							this._oSynchroniseDialog.close();
						}.bind(this)
					})
				});
			}

			this._oSynchroniseDialog.open();

		}

	});

});
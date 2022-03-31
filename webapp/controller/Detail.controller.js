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
		},

		//--------------------------------------------
		// Internal functions
		//--------------------------------------------
		_onPatternMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").SiteId;
			this._SiteId = decodeURIComponent(sObjectId);
			this._bindTreeTable();

		},

		/*
		 * Called from method "_initFilter" to initialize Equipement User Status Description model
		 */
		_initEquipementStatusDesc: function () {
			this._initStatusDesc("LoomaEquipment");
		},
		/*
		 * Called from method "onInit" to initialize model mDetailPage 
		 */
		_initDetailPageModel: function () {
			var oDetailPage = {
				"bSwitchDirect": true
			};
			this.fnSetJSONModel(oDetailPage, "mDetailPage");
			this._mDetailPage = this.fnGetModel("mDetailPage");
			this._mDetailPage.refresh(true);
		},
		/*
		 * Called from method "_bindTreeTable" to transform equipment hierarchy to tree structure 
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
						LocationId: oNodeIn.LocationId,
						SuperiorLocationId: oNodeIn.SuperiorLocationId,
						SiteId: oNodeIn.SiteId,
						LoomaTypeId: oNodeIn.LoomaTypeId,
						LoomaTypeDesc: oNodeIn.LoomaTypeDesc,
						LocationName: oNodeIn.LocationName,
						DrillState: oNodeIn.DrillState,
						Sensitive: oNodeIn.Sensitive,
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
		 * Method is used to fetch Equipment hierarchy for a functional location
		 * Once data is fetched,_transformTreeData is called to tranform data to tree and bound to tree table
		 */
		_bindTreeTable: function (aTableFilters) {
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
					this._setTreeModelData(aNodes);
				}.bind(this),
				error: function (oError) {
					this._oDataError(oError);
				}.bind(this)
			});
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

			this.getOwnerComponent().getModel().read("/EquipmentSet", {
				filters: aFilters,
				urlParameters: {
					"$expand": "ModifiedInfo"
				},
				success: function (oData, response) {
					var aModel = oData.results;
					for (var i in aModel) {
						aModel[i].ModifiedInfo = aModel[i].ModifiedInfo.results;
					}
					this.fnSetJSONModel(aModel, "mEquipment");
				}.bind(this),
				error: function (oError) {
					this._oDataError(oError);
				}.bind(this)
			});
		},

		_ApplyEquipmentStatus: function (oEvent, sNewStatus) {
			var oParameters = {
				async: false,
				success: function (oData, resp) {
					this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
				}.bind(this),
				error: function (oData, resp) {
					this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
				}.bind(this)
			};

			var payload = {
				Scope: "PEC",
				EquipmentId: oEvent.getSource().getParent().getParent().getParent().getRowBindingContext().getObject().EquipmentId,
				UserStatusId: sNewStatus
			};

			this.getOwnerComponent().getModel().create("/UserStatusSet", payload, oParameters);
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
				sModifiedInfo = oEvent.getSource().getParent().getRowBindingContext().getObject();

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
		 * Method is called when press on equipment single button
		 */
		onApplyEquipmentStatus: function (oEvent) {

			switch (oEvent.getSource().getType()) {
			case "Accept": // Validated Status to apply
				var sUserStatusId = "E0005";
				break;

			case "Emphasized": // Return to take over to apply
				sUserStatusId = "E0008";
				break;

			case "Reject": // Deleted Status to apply
				sUserStatusId = "E0006";
				break;
			}

			this._ApplyEquipmentStatus(oEvent, sUserStatusId);
		}
	});

});
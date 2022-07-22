/**
 * @class formatter
 * @classdesc This is the controller for common formatter functions
 * @name com.vesi.zfioac4_valpec.model.formatter
 */
sap.ui.define([],
	function () {
		"use strict";

		return {
			/*
			 * Set Type Description depending of Type Id
			 */
			setTypeDescription: function (typeId) {
				var oTypeDesc = this.fnGetModel("mTypeDesc");
				if (!oTypeDesc || !oTypeDesc.getData) {
					return "";
				}
				var sDescription = oTypeDesc.getData()[typeId];
				if (sDescription && sDescription !== "") {
					return sDescription;
				}
				if (typeId) {
					return typeId;
				}
				return "";
			},

			/*
			 * Set Status Description depending of Type Id
			 */
			setStatusDescription: function (statusInternalId) {
				var oStatusDesc = this.fnGetModel("mStatusDesc");
				if (!oStatusDesc || !oStatusDesc.getData) {
					return "";
				}
				var sDescription = oStatusDesc.getData()[statusInternalId];
				if (sDescription && sDescription !== "") {
					return sDescription;
				}
				if (statusInternalId) {
					return statusInternalId;
				}
				return "";
			},

			/*
			 * Set selected Items in VH depending of data in MultiInput
			 */
			setVHSelectedItem: function (sId, tokenModel) {
				var oMultiInputTokens = this.byId(this._sCurrId).getTokens();
				for (var iTok in oMultiInputTokens) {
					var oToken = oMultiInputTokens[iTok];
					if (oToken.getKey() === sId) {
						return true;
					}
				}
				return false;
			},

			/*
			 * Set usage icon
			 */
			fnUsageIcon: function (sUsageId) {
				var sIcon;
				switch (sUsageId) {
				case "1":
					sIcon = "sap-icon://status-positive";
					break;
				case "2":
					sIcon = "sap-icon://status-negative";
					break;
				case "3":
					sIcon = "sap-icon://locked";
					break;
				case "4":
					sIcon = "sap-icon://status-inactive";
					break;
				case "5":
					sIcon = "sap-icon://status-critical";
					break;
				case "6":
					sIcon = "sap-icon://add-equipment";
					break;
				default:
					sIcon = null;
				}
				return sIcon;
			},

			/*
			 * Set usage icon color
			 */
			fnUsageIconColor: function (sUsageId) {
				var sColor;
				switch (sUsageId) {
				case "1":
					sColor = "green";
					break;
				case "2":
					sColor = "red";
					break;
				case "3":
					sColor = "black";
					break;
				case "4":
					sColor = "blue";
					break;
				case "5":
					sColor = "orange";
					break;
				case "6":
					sColor = "black";
					break;
				default:
					sColor = "";
				}
				return sColor;
			},

			/*
			 * Set usage icon tooltip
			 */
			fnUsageIconTooltip: function (sUsageId) {
				var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				var sTooltip;
				switch (sUsageId) {
				case "1":
					sTooltip = oResourceBundle.getText("EquipmentTableTblUtilTooltipActive");
					break;
				case "2":
					sTooltip = oResourceBundle.getText("EquipmentTableTblUtilTooltipOutofser");
					break;
				case "3":
					sTooltip = oResourceBundle.getText("EquipmentTableTblUtilTooltipConsigned");
					break;
				case "4":
					sTooltip = oResourceBundle.getText("EquipmentTableTblUtilTooltipSeasonalStop");
					break;
				case "5":
					sTooltip = oResourceBundle.getText("EquipmentTableTblUtilTooltipUnused");
					break;
				case "6":
					sTooltip = oResourceBundle.getText("EquipmentTableTblUtilTooltipdéposé");
					break;
				default:
					sTooltip = "";
				}
				return sTooltip;
			},

			/*
			 * Set visibility of the modified info icon 
			 */
			setVisibleModifiedInfoIcon: function (aModifiedInfo) {
				if (aModifiedInfo && aModifiedInfo.length > 0) {
					return true;
				}
				return false;
			},

			/*
			 * Set property description depending id from backend
			 */
			setPropertyDescription: function (sIdProperty) {
				if (!sIdProperty) {
					return "";
				}
				return this.fnGetResourceBundle("ModifiedInfoLbl" + sIdProperty, []);

			},

			/*
			 * Set link enabled
			 */
			fnSetLinkEnabled: function (bDirect, sNbEquipmentDirect, sNbEquipment) {
				if (bDirect === undefined || sNbEquipmentDirect === undefined || sNbEquipment === undefined) {
					return false;
				}
				var iNbEquipmentDirect = parseInt(sNbEquipmentDirect, 10);
				var iNbEquipment = parseInt(sNbEquipment, 10);
				if (bDirect) {
					if (iNbEquipmentDirect > 0) {
						return true;
					}
				} else {
					if (iNbEquipment > 0) {
						return true;
					}
				}

				return false;
			},

			/*
			 * Set link enabled
			 */
			fnImageUrlFormatter: function (sPhotoId) {
				var src = "";
				if (sPhotoId) {
					src = "/sap/opu/odata/sap/ZSRC4_PEC_SRV/PhotoSet('" + encodeURIComponent(sPhotoId) + "')/$value";
				}
				return src;
			},

			/*
			 * Set the highlight indicator for object in tree table and equipement table
			 */
			fnSetHighlight: function (iStatusFSM) {
				switch (iStatusFSM) {
				case 0:
					return "None";
				case 1:
					return "Success";
				case 2:
					return "Warning";
				default:
					return "None";
				}
			},

			/*
			 * Set the status FSM icon for object in tree table and equipement table
			 */
			fnSetIconFSM: function (iStatusFSM) {
				switch (iStatusFSM) {
				case 1:
					return "sap-icon://connected";
				case 2:
					return "sap-icon://disconnected";
				default:
					return null;
				}
			},

			/*
			 * Set the status FSM tooltip for object in tree table and equipement table
			 */
			fnSetIconTooltipFSM: function (iStatusFSM) {
				switch (iStatusFSM) {
				case 1:
					return this.fnGetResourceBundle("IconStatusFSMTooltipConnected");
				case 2:
					return this.fnGetResourceBundle("IconStatusFSMTooltipDisconnected");
				default:
					return "";
				}
			},

			/*
			 * Set the status FSM icon type for object in tree table and equipement table
			 */
			fnSetIconColorFSM: function (iStatusFSM) {
				switch (iStatusFSM) {
				case 1:
					return "Positive";
				case 2:
					return "Critical";
				default:
					return "Default";
				}
			},

			/*
			 * Method to filter Function multi combobox
			 */
			fnFilterFunction: function (a) {
				var aSelectedDomain = this.byId("filterDomainId").getSelectedKeys();
				if (aSelectedDomain.length > 0 && aSelectedDomain.indexOf(a.DomainId) === -1) {
					return false; // hide
				}
				return true; // visible
			},

			/*
			 * Method to filter Family multi combobox
			 */
			fnFilterFamily: function (a) {
				var aSelectedDomain = this.byId("filterDomainId").getSelectedKeys(),
					aSelectedFunction = this.byId("filterFunctionId").getSelectedKeys();
				if ((aSelectedDomain.length > 0 && aSelectedDomain.indexOf(a.DomainId) === -1) ||
					(aSelectedFunction.length > 0 && aSelectedFunction.indexOf(a.FunctionId) === -1)) {
					return false; // hide
				}
				return true; // visible
			},

			/*
			 * Method to set icon for linked object
			 * It can be for superior equipment if current equipment has an superior equipment
			 * or ofr sub equipment if current equipment has the flag hasSubEquipment = true
			 */
			fnSetLinkedObjectIcon: function (oEquipmentInfo) {
				if (!oEquipmentInfo) {
					//Object undefined= no icon, it will be not visible
					return "sap-icon://circle-task-2";
				}
				if (oEquipmentInfo.SuperiorEquiId !== "") {
					// Current equipment has superior equipment					
					return "sap-icon://arrow-top";
				} else if (oEquipmentInfo.HasSubEquipment) {
					// Current equipment has sub-equipments
					return "sap-icon://org-chart";
				}
				// Other case = no icon, it will be not visible
				return "sap-icon://circle-task-2";
			},

			/*
			 * Method to set tooltip for linked object
			 * It can be for superior equipment if current equipment has an superior equipment
			 * or ofr sub equipment if current equipment has the flag hasSubEquipment = true
			 */
			fnSetLinkedObjectTooltip: function (oEquipmentInfo) {
				if (!oEquipmentInfo) {
					//Object undefined
					return "";
				}

				if (oEquipmentInfo.SuperiorEquiId !== "") {
					// Current equipment has superior equipment					
					return this.fnGetResourceBundle("IconLinkedObjectSuperior");
				} else if (oEquipmentInfo.HasSubEquipment) {
					// Current equipment has sub-equipments
					return this.fnGetResourceBundle("IconLinkedObjectSubEquipment");
				}
				// Other case = empty string
				return "";
			},

			/*
			 * Method to set tooltip for linked object
			 * It can be for superior equipment if current equipment has an superior equipment
			 * or ofr sub equipment if current equipment has the flag hasSubEquipment = true
			 */
			fnSetLinkedObjectVisible: function (oEquipmentInfo) {
				if (!oEquipmentInfo) {
					//Object undefined
					return false;
				}

				if (oEquipmentInfo.SuperiorEquiId !== "" || oEquipmentInfo.HasSubEquipment) {
					// Visible
					return true;
				}
				// Hide
				return false;
			}

		};

	});
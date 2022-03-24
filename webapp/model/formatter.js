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
			var sDescription = oTypeDesc?.getData()[typeId];
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
			var sDescription = oStatusDesc?.getData()[statusInternalId];
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
			for (var oToken of oMultiInputTokens) {
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
		setVisibleModifiedInfoIcon:function (aModifiedInfo) {
			if (aModifiedInfo?.length > 0) {
				return true;
			}	
			return false;
		}
	};

});
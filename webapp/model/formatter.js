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
	};

});
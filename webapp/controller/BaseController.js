sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (Controller, JSONModel, DateFormat, Spreadsheet, MessageToast, Fragment, Filter, FilterOperator, MessageBox) {
	"use strict";
	return Controller.extend("com.vesi.zfioac4_site.controller.BaseController", {
		fnGetRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		fnSetModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		fnSetJSONModel: function (oJson, sName) {
			return this.fnSetModel(new JSONModel(oJson), sName);
		},
		fnGetModel: function (sName) {
			return this.getView().getModel(sName);
		},
		fnGetResourceBundle: function (sKey) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		fnGetODataModel: function (sName) {
			if (!sName || sName === "") {
				return this.getOwnerComponent().getModel();
			}
			return this.getOwnerComponent().getModel(sName);
		},

		/*
		 * Called from method "_initFilter" to initialize User Status Description model
		 */
		_initStatusDesc: function (sObjectFilter) {
			var mParams = {
				filters: [new Filter({
					path: "Object",
					operator: "EQ",
					value1: sObjectFilter
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

		/********** Manage Personalization **********/
		/*
		 * Method is used to open the Personalization dialog to personalize table when personalization button is pressed
		 * This is the common method used by all the tables in Home and Detail controller that require personlization
		 * Method requires Personalisation JSON Path and Table Id as importing parameter to work
		 */
		_onTablePersonalizePress: function (sConfigJSONPath, sTableId) {
			var sRootPath = sap.ui.require.toUrl("com/vesi/zfioac4_valpec");
			var oPersoData = this._fnGetTablePersoConfigData(sRootPath + sConfigJSONPath, sTableId);
			this._fnOpenPersoDialog(oPersoData, sTableId);
		},

		_fnGetTablePersoConfigData: function (configPath, tableId) {
			var oColumnItemsModel = new JSONModel();
			oColumnItemsModel.loadData(configPath, null, false);
			var aColumnData = oColumnItemsModel.getData();
			var aItems = this._getItemAggrDataForPerso(aColumnData);
			var oPersoData = {
				Table: tableId,
				Type: "grid",
				Items: aItems,
				ColumnsItems: aColumnData,
				ShowResetEnabled: false
			};
			return oPersoData;
		},
		_getItemAggrDataForPerso: function (aColumnData) {
			var aItems = [];
			var oi18n = this.fnGetResourceBundle();
			aColumnData.forEach(function (el) {
				aItems.push({
					columnKey: el.columnKey,
					text: oi18n.getText(el.text)
				});
			});
			return aItems;
		},
		_fnOpenPersoDialog: function (oPersoData, sOrigTableId) {
			var oInitialPersoModel, oMainPersoModel;
			oInitialPersoModel = new JSONModel(Object.assign({}, oPersoData));
			oInitialPersoModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			var sInitialModelName = "initialPersoModel" + sOrigTableId;
			var sMainPersoModelName = "mainPersoModel" + sOrigTableId;
			var sPersoDataBeforeOpenModelName = "persoDataBeforeOpenModel" + sOrigTableId;
			this.getView().setModel(oInitialPersoModel, sInitialModelName);
			oMainPersoModel = this.getView().getModel(sMainPersoModelName);
			if (!oMainPersoModel) {
				oMainPersoModel = new JSONModel(Object.assign({}, oPersoData));
				oMainPersoModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				this.getView().setModel(oMainPersoModel, sMainPersoModelName);
			}
			var oDataBeforeOpenPersoDialogModel = new JSONModel(Object.assign({}, oMainPersoModel.getData()));
			this.getView().setModel(oDataBeforeOpenPersoDialogModel, sPersoDataBeforeOpenModelName);
			var oView = this.getView();
			if (!this.oPersonalizationDialog) {
				this.oPersonalizationDialog = Fragment.load({
					id: oView.getId(),
					name: "com.vesi.zfioac4_valpec.view.fragment.PersonalizationDialog",
					controller: this
				}).then(function (oPersonalizationDialog) {
					var oPersonalizationDialogMod = this._setStyleClassForPopup(oPersonalizationDialog);
					return oPersonalizationDialogMod;
				}.bind(this));
			}
			this.oPersonalizationDialog.then(function (oPersonalizationDialog) {
				oPersonalizationDialog.setModel(oMainPersoModel);
				oMainPersoModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems(oPersonalizationDialog));
				oMainPersoModel.updateBindings(true);
				oPersonalizationDialog.setModel(oMainPersoModel);
				this.getView().addDependent(oPersonalizationDialog);
				oPersonalizationDialog.open();
			}.bind(this));
		},
		_setStyleClassForPopup: function (oPopup) {
			var oDeviceData = this.getOwnerComponent().getModel("device").getData();
			if (oDeviceData.system.desktop) {
				oPopup.addStyleClass("sapUiSizeCompact");
			} else {
				oPopup.addStyleClass("sapUiSizeCozy");
			}
			return oPopup;
		},
		_isChangedColumnsItems: function (oPersonalizationDialog) {
			var fnGetArrayElementByKey = function (sKey, sValue, aArray) {
				var aElements = aArray.filter(function (oElement) {
					return oElement[sKey] !== undefined && oElement[sKey] === sValue;
				});
				return aElements.length ? aElements[0] : null;
			};
			var fnGetUnion = function (aDataBase, aData) {
				if (!aData) {
					return Object.assign([], aDataBase);
				}
				var aUnion = Object.assign([], aData);
				aDataBase.forEach(function (oMItemBase) {
					var oMItemUnion = fnGetArrayElementByKey("columnKey", oMItemBase.columnKey, aUnion);
					if (!oMItemUnion) {
						aUnion.push(oMItemBase);
						return;
					}
					if (oMItemUnion.visible === undefined && oMItemBase.visible !== undefined) {
						oMItemUnion.visible = oMItemBase.visible;
					}
					if (oMItemUnion.width === undefined && oMItemBase.width !== undefined) {
						oMItemUnion.width = oMItemBase.width;
					}
					if (oMItemUnion.total === undefined && oMItemBase.total !== undefined) {
						oMItemUnion.total = oMItemBase.total;
					}
					if (oMItemUnion.index === undefined && oMItemBase.index !== undefined) {
						oMItemUnion.index = oMItemBase.index;
					}
				});
				return aUnion;
			};
			var fnIsEqual = function (aDataBase, aData) {
				if (!aData) {
					return true;
				}
				if (aDataBase.length !== aData.length) {
					return false;
				}
				var fnSort = function (a, b) {
					if (a.columnKey < b.columnKey) {
						return -1;
					} else if (a.columnKey > b.columnKey) {
						return 1;
					} else {
						return 0;
					}
				};
				aDataBase.sort(fnSort);
				aData.sort(fnSort);
				var aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
					return oDataBase.columnKey !== aData[iIndex].columnKey || oDataBase.visible !== aData[iIndex].visible || oDataBase.index !==
						aData[iIndex].index || oDataBase.width !== aData[iIndex].width || oDataBase.total !== aData[iIndex].total;
				});
				return aItemsNotEqual.length === 0;
			};
			var oPersoDialogModel = oPersonalizationDialog.getModel();
			var sTableId = oPersoDialogModel.getProperty("/Table");
			var sInitialPersoModelName = "initialPersoModel" + sTableId;
			var oInitialPersoModel = this.getView().getModel(sInitialPersoModelName);
			var sMainPersoModelName = "mainPersoModel" + sTableId;
			var oMainPersoModel = this.getView().getModel(sMainPersoModelName);
			var aDataRuntime = fnGetUnion(oInitialPersoModel.getProperty("/ColumnsItems"), oMainPersoModel.getProperty("/ColumnsItems"));
			return !fnIsEqual(aDataRuntime, oInitialPersoModel.getProperty("/ColumnsItems"));
		},
		onPersonalizeOkPress: function (oEvent) {
			var oLocalEvent = oEvent.getParameter("payload").columns.tableItems;
			var oSrc = oEvent.getSource();
			this.oPersonalizationDialog.then(function (oPersonalizationDialog) {
				var oPersoDialogModel = oPersonalizationDialog.getModel();
				var sTableId = oPersoDialogModel.getProperty("/Table");
				var sTableType = oPersoDialogModel.getProperty("/Type");
				var oTable = this.byId(sTableId);
				var aColumns = this.byId(sTableId).getColumns();
				var aPersonalizedCols = oLocalEvent;
				if (sTableType !== "grid") {
					aPersonalizedCols.forEach(function (item, index) {
						var sColKey = item.columnKey;
						var oColumn = aColumns.find(function (oCol) {
							var aSplitStrings = oCol.getId().split("--");
							var sColId = aSplitStrings && aSplitStrings.length > 0 ? aSplitStrings[aSplitStrings.length - 1] : "";
							return (sColId === sColKey);
						});
						oColumn.setVisible(item.visible);
						oColumn.setOrder(item.index);
					});
					oTable.invalidate();
				} else {
					oTable.removeAllColumns();
					aPersonalizedCols.forEach(function (item, index) {
						var sColKey = item.columnKey;
						var oColumn = aColumns.find(function (oCol) {
							var aSplitStrings = oCol.getId().split("--");
							var sColId = aSplitStrings && aSplitStrings.length > 0 ? aSplitStrings[aSplitStrings.length - 1] : "";
							return (sColId === sColKey);
						});
						oColumn.setVisible(item.visible);
						oTable.addColumn(oColumn);
					});
				}
				oSrc.close();
			}.bind(this));
		},
		onPersonalizeCancelPress: function (oEvent) {
			var oSrc = oEvent.getSource();
			this.oPersonalizationDialog.then(function (oPersonalizationDialog) {
				var oPersoData = oPersonalizationDialog.getModel().getData();
				var sTableId = oPersoData.Table;
				var sPersoDataBeforeOpenModelName = "persoDataBeforeOpenModel" + sTableId;
				var oPersoDataBeforeOpenModel = this.getView().getModel(sPersoDataBeforeOpenModelName);
				var sMainPersoModelName = "mainPersoModel" + sTableId;
				var oMainPersoModel = this.getView().getModel(sMainPersoModelName);
				oMainPersoModel.setProperty("/", Object.assign([], oPersoDataBeforeOpenModel.getData()));
				oMainPersoModel.updateBindings(true);
				oPersoDataBeforeOpenModel.setData({});
				oPersoDataBeforeOpenModel.updateBindings(true);
				oSrc.close();
			}.bind(this));
		},
		onPersonalizeResetPress: function () {
			this.oPersonalizationDialog.then(function (oPersonalizationDialog) {
				var oPersoDialogModel = oPersonalizationDialog.getModel();
				var sTableId = oPersoDialogModel.getProperty("/Table");
				var sInitialPersoModelName = "initialPersoModel" + sTableId;
				var oInitialPersoModel = this.getView().getModel(sInitialPersoModelName);
				var sMainPersoModelName = "mainPersoModel" + sTableId;
				var oMainPersoModel = this.getView().getModel(sMainPersoModelName);
				var aInitialData = oInitialPersoModel.getData();
				oMainPersoModel.setProperty("/", Object.assign([], aInitialData));
				oMainPersoModel.updateBindings(true);
			}.bind(this));
		}
	});
});
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    JSONModel,
    DateFormat,
    Spreadsheet,
    MessageToast,
    Fragment,
    Filter,
    FilterOperator,
    MessageBox
  ) {
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
      fnGetResourceBundle: function (sKey, aParam) {
        let aParamText = [];
        if (aParam && aParam.length) {
          aParamText = aParam;
        }
        return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aParamText);
      },
      fnGetODataModel: function (sName) {
        if (!sName || sName === "") {
          return this.getOwnerComponent().getModel();
        }
        return this.getOwnerComponent().getModel(sName);
      },
      /*
       * Called to show busy Indicator
       */
      fnShowBusyIndicator: function (iDuration, iDelay) {
        sap.ui.core.BusyIndicator.show(iDelay);
        if (iDuration && iDuration > 0) {
          if (this._sTimeoutId) {
            window.clearTimeout(this._sTimeoutId);
            this._sTimeoutId = null;
          }
          this._sTimeoutId = window.setTimeout(
            function () {
              this.fnHideBusyIndicator();
            }.bind(this),
            iDuration
          );
        }
      },

      /*
       * Called to hide busy Indicator
       */
      fnHideBusyIndicator: function () {
        sap.ui.core.BusyIndicator.hide();
      },
      /*
       * Called from method "_initFilter" to initialize User Status Description model
       */
      _initStatusDesc: function (sObjectFilter) {
        let mParams = {
          filters: [
            new Filter({
              path: "Object",
              operator: "EQ",
              value1: sObjectFilter,
            }),
          ],
          success: function (oData) {
            let oStatusDesc = {};
            for (let idx in oData.results) {
              let oLine = oData.results[idx];
              oStatusDesc[oLine.StatusInternalId] = oLine.StatusDesc;
            }
            this.fnSetJSONModel(oStatusDesc, "mStatusDesc");
          }.bind(this),
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
        let sRootPath = sap.ui.require.toUrl("com/vesi/zfac4_valtoker");
        let oPersoData = this._fnGetTablePersoConfigData(sRootPath + sConfigJSONPath, sTableId);
        this._fnOpenPersoDialog(oPersoData, sTableId);
      },
      _fnGetTablePersoConfigData: function (configPath, tableId) {
        let oColumnItemsModel = new JSONModel();
        oColumnItemsModel.loadData(configPath, null, false);
        let aColumnData = oColumnItemsModel.getData();
        let aItems = this._getItemAggrDataForPerso(aColumnData);
        let oPersoData = {
          Table: tableId,
          Type: "grid",
          Items: aItems,
          ColumnsItems: aColumnData,
          ShowResetEnabled: false,
        };
        return oPersoData;
      },
      _getItemAggrDataForPerso: function (aColumnData) {
        let aItems = [];
        for (let iCol in aColumnData) {
          let oCol = aColumnData[iCol];
          aItems.push({
            columnKey: oCol.columnKey,
            text: this.fnGetResourceBundle(oCol.text),
          });
        }
        return aItems;
      },
      _fnOpenPersoDialog: function (oPersoData, sOrigTableId) {
        let oInitialPersoModel, oMainPersoModel;
        oInitialPersoModel = new JSONModel(Object.assign({}, oPersoData));
        oInitialPersoModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
        let sInitialModelName = "initialPersoModel" + sOrigTableId;
        let sMainPersoModelName = "mainPersoModel" + sOrigTableId;
        let sPersoDataBeforeOpenModelName = "persoDataBeforeOpenModel" + sOrigTableId;
        this.getView().setModel(oInitialPersoModel, sInitialModelName);
        oMainPersoModel = this.getView().getModel(sMainPersoModelName);
        if (!oMainPersoModel) {
          oMainPersoModel = new JSONModel(Object.assign({}, oPersoData));
          oMainPersoModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
          this.getView().setModel(oMainPersoModel, sMainPersoModelName);
        }
        let oDataBeforeOpenPersoDialogModel = new JSONModel(Object.assign({}, oMainPersoModel.getData()));
        this.getView().setModel(oDataBeforeOpenPersoDialogModel, sPersoDataBeforeOpenModelName);
        let oView = this.getView();
        if (!this.oPersonalizationDialog) {
          this.oPersonalizationDialog = Fragment.load({
            id: oView.getId(),
            name: "com.vesi.zfac4_valtoker.view.fragment.PersonalizationDialog",
            controller: this,
          }).then(
            function (oPersonalizationDialog) {
              let oPersonalizationDialogMod = this._setStyleClassForPopup(oPersonalizationDialog);
              return oPersonalizationDialogMod;
            }.bind(this)
          );
        }
        this.oPersonalizationDialog.then(
          function (oPersonalizationDialog) {
            oPersonalizationDialog.setModel(oMainPersoModel);
            oMainPersoModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems(oPersonalizationDialog));
            oMainPersoModel.updateBindings(true);
            oPersonalizationDialog.setModel(oMainPersoModel);
            this.getView().addDependent(oPersonalizationDialog);
            oPersonalizationDialog.open();
          }.bind(this)
        );
      },
      _setStyleClassForPopup: function (oPopup) {
        let oDeviceData = this.getOwnerComponent().getModel("device").getData();
        if (oDeviceData.system.desktop) {
          oPopup.addStyleClass("sapUiSizeCompact");
        } else {
          oPopup.addStyleClass("sapUiSizeCozy");
        }
        return oPopup;
      },
      _isChangedColumnsItems: function (oPersonalizationDialog) {
        let fnGetArrayElementByKey = function (sKey, sValue, aArray) {
          let aElements = aArray.filter(function (oElement) {
            return oElement[sKey] !== undefined && oElement[sKey] === sValue;
          });
          return aElements.length ? aElements[0] : null;
        };
        let fnGetUnion = function (aDataBase, aData) {
          if (!aData) {
            return Object.assign([], aDataBase);
          }
          let aUnion = Object.assign([], aData);
          aDataBase.forEach(function (oMItemBase) {
            let oMItemUnion = fnGetArrayElementByKey("columnKey", oMItemBase.columnKey, aUnion);
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
        let fnIsEqual = function (aDataBase, aData) {
          if (!aData) {
            return true;
          }
          if (aDataBase.length !== aData.length) {
            return false;
          }
          let fnSort = function (a, b) {
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
          let aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
            return (
              oDataBase.columnKey !== aData[iIndex].columnKey ||
              oDataBase.visible !== aData[iIndex].visible ||
              oDataBase.index !== aData[iIndex].index ||
              oDataBase.width !== aData[iIndex].width ||
              oDataBase.total !== aData[iIndex].total
            );
          });
          return aItemsNotEqual.length === 0;
        };
        let oPersoDialogModel = oPersonalizationDialog.getModel();
        let sTableId = oPersoDialogModel.getProperty("/Table");
        let sInitialPersoModelName = "initialPersoModel" + sTableId;
        let oInitialPersoModel = this.getView().getModel(sInitialPersoModelName);
        let sMainPersoModelName = "mainPersoModel" + sTableId;
        let oMainPersoModel = this.getView().getModel(sMainPersoModelName);
        let aDataRuntime = fnGetUnion(
          oInitialPersoModel.getProperty("/ColumnsItems"),
          oMainPersoModel.getProperty("/ColumnsItems")
        );
        return !fnIsEqual(aDataRuntime, oInitialPersoModel.getProperty("/ColumnsItems"));
      },
      onPersonalizeOkPress: function (oEvent) {
        let oLocalEvent = oEvent.getParameter("payload").columns.tableItems;
        let oSrc = oEvent.getSource();
        this.oPersonalizationDialog.then(
          function (oPersonalizationDialog) {
            let oPersoDialogModel = oPersonalizationDialog.getModel();
            let sTableId = oPersoDialogModel.getProperty("/Table");
            let sTableType = oPersoDialogModel.getProperty("/Type");
            let oTable = this.byId(sTableId);
            let aColumns = this.byId(sTableId).getColumns();
            let aPersonalizedCols = oLocalEvent;
            if (sTableType !== "grid") {
              aPersonalizedCols.forEach(function (item, index) {
                let sColKey = item.columnKey;
                let oColumn = aColumns.find(function (oCol) {
                  let aSplitStrings = oCol.getId().split("--");
                  let sColId = aSplitStrings && aSplitStrings.length > 0 ? aSplitStrings[aSplitStrings.length - 1] : "";
                  return sColId === sColKey;
                });
                oColumn.setVisible(item.visible);
                oColumn.setOrder(item.index);
              });
              oTable.invalidate();
            } else {
              oTable.removeAllColumns();
              aPersonalizedCols.forEach(function (item, index) {
                let sColKey = item.columnKey;
                let oColumn = aColumns.find(function (oCol) {
                  let aSplitStrings = oCol.getId().split("--");
                  let sColId = aSplitStrings && aSplitStrings.length > 0 ? aSplitStrings[aSplitStrings.length - 1] : "";
                  return sColId === sColKey;
                });
                oColumn.setVisible(item.visible);
                oTable.addColumn(oColumn);
              });
            }
            oSrc.close();
          }.bind(this)
        );
      },
      onPersonalizeCancelPress: function (oEvent) {
        let oSrc = oEvent.getSource();
        this.oPersonalizationDialog.then(
          function (oPersonalizationDialog) {
            let oPersoData = oPersonalizationDialog.getModel().getData();
            let sTableId = oPersoData.Table;
            let sPersoDataBeforeOpenModelName = "persoDataBeforeOpenModel" + sTableId;
            let oPersoDataBeforeOpenModel = this.getView().getModel(sPersoDataBeforeOpenModelName);
            let sMainPersoModelName = "mainPersoModel" + sTableId;
            let oMainPersoModel = this.getView().getModel(sMainPersoModelName);
            oMainPersoModel.setProperty("/", Object.assign([], oPersoDataBeforeOpenModel.getData()));
            oMainPersoModel.updateBindings(true);
            oPersoDataBeforeOpenModel.setData({});
            oPersoDataBeforeOpenModel.updateBindings(true);
            oSrc.close();
          }.bind(this)
        );
      },
      onPersonalizeResetPress: function () {
        this.oPersonalizationDialog.then(
          function (oPersonalizationDialog) {
            let oPersoDialogModel = oPersonalizationDialog.getModel();
            let sTableId = oPersoDialogModel.getProperty("/Table");
            let sInitialPersoModelName = "initialPersoModel" + sTableId;
            let oInitialPersoModel = this.getView().getModel(sInitialPersoModelName);
            let sMainPersoModelName = "mainPersoModel" + sTableId;
            let oMainPersoModel = this.getView().getModel(sMainPersoModelName);
            let aInitialData = oInitialPersoModel.getData();
            oMainPersoModel.setProperty("/", Object.assign([], aInitialData));
            oMainPersoModel.updateBindings(true);
          }.bind(this)
        );
      },
      /*
       * Get filters from home filter bar
       */
      _fnGetFilters: function (sIdFilterBar) {
        let aFiltersAll = [];
        let aFilterBarFilters = this.byId(sIdFilterBar).getAllFilterItems();
        for (let idx in aFilterBarFilters) {
          let oFilter = aFilterBarFilters[idx];
          let aFilters = [];
          switch (oFilter.getGroupName()) {
            case "MultiInput":
              let aTokens = oFilter.getControl().getTokens();
              for (let iTok in aTokens) {
                let oToken = aTokens[iTok];
                if (oFilter.getName() == "ContractId") {
                  aFilters.push(new Filter(oFilter.getName(), FilterOperator.EQ, oToken.getProperty("text")));
                } else {
                  aFilters.push(new Filter(oFilter.getName(), FilterOperator.EQ, oToken.getKey()));
                }
              }
              break;
            case "ComboBoxBoolean":
              if (oFilter.getControl().getSelectedKey() && oFilter.getControl().getSelectedKey() !== "0") {
                aFilters.push(
                  new Filter(oFilter.getName(), FilterOperator.EQ, oFilter.getControl().getSelectedKey() === "true")
                );
              }
              break;
            case "MultiComboBox":
              let aSelectedKeys = oFilter.getControl().getSelectedKeys();
              for (let iSel in aSelectedKeys) {
                let oSelectedKey = aSelectedKeys[iSel];
                aFilters.push(new Filter(oFilter.getName(), FilterOperator.EQ, oSelectedKey));
              }
              break;
          }
          if (aFilters.length > 0) {
            aFiltersAll.push(new Filter(aFilters, false));
          }
        }
        if (aFiltersAll.length > 0) {
          return aFiltersAll;
        }
        return false;
      },
      fnOpenDialog: async function (sDialog, sFragmentPath, aFilters) {
        this[sDialog] ??= await Fragment.load({
          id: this.getView().getId(),
          name: `com.vesi.zfac4_valtoker.view.fragment.${sFragmentPath}`,
          controller: this,
        });
        this.getView().addDependent(this[sDialog]);
        let oBinding = this[sDialog].getBinding("items");
        if (oBinding) {
          oBinding.filter(aFilters);
        }
        this[sDialog].open();
      },
      fnExtractError: function (oError) {
        let sMsg = "";
        if (oError.responseText) {
          let oInnerError = JSON.parse(oError.responseText).error.innererror;
          if (oInnerError && oInnerError.errordetails && oInnerError.errordetails.length > 0) {
            sMsg = oInnerError.errordetails[0].message;
          } else {
            sMsg = JSON.parse(oError.responseText).error.message.value;
          }
        } else if (oError.response) {
          sMsg = JSON.parse(oError.response.body).error.message.value;
        } else if (oError.message) {
          sMsg = oError.message;
        }
        return sMsg;
      },
    });
  }
);

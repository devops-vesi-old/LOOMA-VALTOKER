sap.ui.define(
  [
    "com/vesi/zfac4_valtoker/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/base/util/UriParameters",
    "sap/ui/core/Fragment",
    "com/vesi/zfac4_valtoker/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/vesi/zaclib/controls/Excel",
    "sap/m/Panel",
    "sap/m/OverflowToolbar",
    "sap/m/Title",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/ui/core/BusyIndicator",
    "sap/m/ObjectStatus",
    "sap/ui/model/Sorter",
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    JSONModel,
    UriParameters,
    Fragment,
    formatter,
    MessageBox,
    MessageToast,
    Excel,
    Panel,
    OverflowToolbar,
    Title,
    VBox,
    HBox,
    Text,
    BusyIndicator,
    ObjectStatus,
    Sorter
  ) {
    "use strict";
    const FRAGMENT_PATH = "com.vesi.zfac4_valtoker.view.fragment.Detail.";
    return BaseController.extend("com.vesi.zfac4_valtoker.controller.Detail", {
      formatter: formatter,
      _oFormatDate: sap.ui.core.format.DateFormat.getDateInstance({
        pattern: "dd/MM/yyyy",
      }),
      //--------------------------------------------
      // Standard method
      //--------------------------------------------
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       * @memberOf com.vesi.zfac4_valtoker.view.Detail
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
        this._fnInitMeasureModel();
        const oSelectAllLocModel = new JSONModel({
          aSelectedIndices: [],
          aSelectedLocations: [],
          bSelectAll: false,
          aNestedLocations: [],
        });
        this.getView().setModel(oSelectAllLocModel, "oSelectAllLocationsModel");
        const oAnomalyModel = new JSONModel({
          noAnomaly: true,
          measuringPoints: [],
        });
        this.getView().setModel(oAnomalyModel, "oEquipmentAnomalyModel");
      },
      //--------------------------------------------
      // Internal functions
      //--------------------------------------------
      _onPatternMatched: function (oEvent) {
        let sObjectId = oEvent.getParameter("arguments").SiteId;
        this._bRefreshHierarchy = false;
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
        let aFilters = [];
        aFilters.push(new Filter("Scope", FilterOperator.EQ, "LOOMA"));
        let mParams = {
          filters: aFilters,
          success: function (oData) {
            let oDDICValue = {};
            let aData = oData.results;
            for (let idx in aData) {
              let oLine = aData[idx];
              if (!oDDICValue[oLine.Object + "Id"]) {
                oDDICValue[oLine.Object + "Id"] = {};
              }
              oDDICValue[oLine.Object + "Id"][oLine.ValueId] = oLine;
            }
            let oVHJsonModel = new JSONModel(oDDICValue);
            this.fnSetModel(oVHJsonModel, "mDDICValue");
          }.bind(this),
        };
        this.fnGetODataModel("VH").read("/DDICDomainValueListSet", mParams);
      },
      /*
       * Called from method "onInit" to initialize Characteristic information model
       */
      _getFamilyCharacteristic: function () {
        let mParams = {
          urlParameters: {
            $expand: "CharacteristicValueList",
          },
          success: function (oData) {
            let oCharacteristic = {
              Class: {},
              Characteristic: {},
              ValueList: {},
            };
            let aData = oData.results;
            for (let idx in aData) {
              //Fill Class information
              let oLine = aData[idx];
              if (!oCharacteristic.Class[oLine.ClassId]) {
                oCharacteristic.Class[oLine.ClassId] = {
                  _iImportant: 0,
                };
              }
              oCharacteristic.Class[oLine.ClassId][oLine.CharactId] = {
                CharactImportant: oLine.CharactImportant,
                CharactName: oLine.CharactName,
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
                  CharactListOfValue: oLine.CharactListOfValue,
                  CharactInterval: oLine.CharactInterval,
                };
              }
              //Fill ValueList is needed
              if (oLine.CharactListOfValue && !oCharacteristic.ValueList[oLine.CharactId]) {
                if (!oCharacteristic.ValueList[oLine.CharactId]) {
                  oCharacteristic.ValueList[oLine.CharactId] = {};
                }
                for (let iVal in oLine.CharacteristicValueList.results) {
                  let oVal = oLine.CharacteristicValueList.results[iVal];
                  oCharacteristic.ValueList[oLine.CharactId][oVal.CharactValueChar] = oVal;
                }
              }
            }
            let oVHJsonModel = new JSONModel(oCharacteristic);
            this.fnSetModel(oVHJsonModel, "mFamilyCharacteristic");
          }.bind(this),
        };
        this.fnGetODataModel("VH").read("/FamilyCharacteristicSet", mParams);
      },
      /*
       * Called from method "onInit" to initialize Country, Region and Department descriptionmodel
       */
      _getAddressDescription: function () {
        let mParams = {
          success: function (oData) {
            let oAddress = {
              Country: {},
              Region: {},
              Department: {},
            };
            let aData = oData.results;
            for (let idx in aData) {
              //Manage Country
              if (!oAddress.Country[aData[idx].CountryId]) {
                oAddress.Country[aData[idx].CountryId] = {
                  Id: aData[idx].CountryId,
                  Desc: aData[idx].CountryDesc,
                };
              }
              //Manage Region
              if (!oAddress.Region[aData[idx].RegionId]) {
                oAddress.Region[aData[idx].RegionId] = {
                  Id: aData[idx].RegionId,
                  Desc: aData[idx].RegionDesc,
                };
              }
              //Manage Department
              oAddress.Department[aData[idx].DepartmentId] = {
                Id: aData[idx].DepartmentId,
                Desc: aData[idx].DepartmentDesc,
              };
            }
            let oVHJsonModel = new JSONModel(oAddress);
            oVHJsonModel.setSizeLimit(aData.length ? aData.length : oVHJsonModel.iSizeLimit);
            this.fnSetModel(oVHJsonModel, "mAddress");
          }.bind(this),
        };
        this.fnGetODataModel("VH").read("/DepartmentSet", mParams);
      },
      /*
       *
       */
      _getLocationTypeDescription: function () {
        let aFilters = [];
        aFilters.push(new Filter("CharactId", FilterOperator.EQ, "YLO_SITE_TYPE"));
        aFilters.push(new Filter("CharactId", FilterOperator.EQ, "YLO_TYPE_BATIMENT"));
        aFilters.push(new Filter("CharactId", FilterOperator.EQ, "YLO_TYPE_ETAGE"));
        aFilters.push(new Filter("CharactId", FilterOperator.EQ, "YLO_TYPE_LOCAL"));
        let mParams = {
          filters: aFilters,
          success: function (oData) {
            let oLocationType = {};
            let aData = oData.results;
            for (let idx in aData) {
              let oLine = aData[idx];
              let sType;
              switch (oLine.CharactId) {
                case "YLO_SITE_TYPE":
                  sType = "SITE";
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
            let oVHJsonModel = new JSONModel(oLocationType);
            this.fnSetModel(oVHJsonModel, "mLocationType");
          }.bind(this),
        };
        this.fnGetODataModel("VH").read("/CharacteristicValueListSet", mParams);
      },
      /*
       * Called from method "onInit" to initialize VHs model
       */
      _initVHModels: function () {
        let mParams = {
          success: function (oData) {
            let oVH = {
              Domain: {},
              Function: {},
              Family: {},
            };
            let aData = oData.results;
            for (let idx in aData) {
              //Manage Domain
              if (!oVH.Domain[aData[idx].DomainId]) {
                oVH.Domain[aData[idx].DomainId] = {
                  Id: aData[idx].DomainId,
                  Desc: aData[idx].DomainDesc,
                };
              }
              //Manage Function
              if (!oVH.Function[aData[idx].FunctionId]) {
                oVH.Function[aData[idx].FunctionId] = {
                  DomainId: aData[idx].DomainId,
                  Id: aData[idx].FunctionId,
                  Desc: aData[idx].FunctionDesc,
                };
              }
              //Manage Family
              oVH.Family[aData[idx].FamilyId] = {
                DomainId: aData[idx].DomainId,
                FunctionId: aData[idx].FunctionId,
                Id: aData[idx].FamilyId,
                Desc: aData[idx].FamilyDesc,
                ClassId: aData[idx].ClassId,
              };
            }
            let oVHJsonModel = new JSONModel(oVH);
            oVHJsonModel.setSizeLimit(aData.length ? aData.length : oVHJsonModel.iSizeLimit);
            this.fnSetModel(oVHJsonModel, "mVH");
          }.bind(this),
        };
        this.fnGetODataModel("VH").read("/FamilySet", mParams);
      },
      /*
       * Called from method "onInit" to initialize default selected keys for MultiComboBox
       */
      _initDefaultFilterMCB: function () {
        let aDefault = {
          filterStatusInternalId: [
            "E0004", // To be deleted
            "E0003", // Takeover done
          ],
          filterDomainId: [],
          filterFunctionId: [],
          filterFamilyId: [],
        };
        for (let sIdMCB in aDefault) {
          this.byId(sIdMCB).setSelectedKeys(aDefault[sIdMCB]);
        }
      },
      /*
       * Called from method "onInit" to initialize model mDetailPage
       */
      _initDetailPageModel: function () {
        let oDetailPage = {
          bSwitchDirect: false,
          bEquipmentSelected: false,
          bEquipmentSelectedDeletable: false,
          bLocationSelected: false,
          bLocationSelectedDeletable: false,
        };
        this.fnSetJSONModel(oDetailPage, "mDetailPage");
        this._mDetailPage = this.fnGetModel("mDetailPage");
        this._mDetailPage.refresh(true);
      },
      /*
       * Called from method "_bindTreeTable" to transform equipment hierarchy to tree structure
       */
      _transformTreeData: function (aNodesIn) {
        let aNodes = [], //'deep' object structure
          mNodeMap = {}, //'map', each node is an attribute
          oDetailPageModel = this.fnGetModel("mDetailPage"),
          oLocationType = this.fnGetModel("mLocationType").getData(),
          oLocationFSM = {
            AllForFSM: true,
          };
        oDetailPageModel.getData().SynchroniseFSM = false;
        if (aNodesIn) {
          let oNodeOut, sSuperiorLocationId;
          for (let i in aNodesIn) {
            let oNodeIn = aNodesIn[i],
              sTypeDesc =
                oNodeIn.TypeId === ""
                  ? ""
                  : oLocationType[oNodeIn.LoomaTypeId][oNodeIn.TypeId].CharactValueDescription;
            //Check and set Status for sending to FSM
            oLocationFSM[oNodeIn.LocationId] = {
              SuperiorLocationId: oNodeIn.SuperiorLocationId,
              StatusFSM: 0,
            };
            //Set FSM status
            oLocationFSM[oNodeIn.LocationId].StatusFSM = this._setLocationStatusFSM(
              oLocationFSM,
              oNodeIn
            );
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
              Deletable: oNodeIn.Deletable,
              SiteHierPecCompleted: oNodeIn.SiteHierPecCompleted,
              SitePecInProgress: oNodeIn.SitePecInProgress,
              children: [],
            };
            if (oNodeOut.LoomaTypeId === "SITE" && oNodeOut.StatusFSM === 1) {
              oDetailPageModel.getData().SynchroniseFSM = true;
            }
            sSuperiorLocationId = oNodeIn.SuperiorLocationId;
            if (sSuperiorLocationId && sSuperiorLocationId.length > 0) {
              let oParent = mNodeMap[oNodeIn.SuperiorLocationId];
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
        if (
          oCurrentLocation.UserStatusId === "E0003" ||
          oCurrentLocation.UserStatusId === "E0004"
        ) {
          // Current Location is validated or deleted
          if (oCurrentLocation.SuperiorLocationId === "") {
            // No superior location
            return 1; //Current Location validated and will be sent to FSM
          } else {
            let SuperiorLocationStatusFSM =
              oLocationFSM[oCurrentLocation.SuperiorLocationId].StatusFSM;
            if (SuperiorLocationStatusFSM === 1) {
              //Superior Location will be sent to FSM
              return 1; //Current Location validated and will be sent to FSM
            } else {
              //Superior Location will be not sent to FSM
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
        let iLocationStatusFSM = this._oLocationFSM[oCurrentEquipment.LocationId].StatusFSM;
        if (
          oCurrentEquipment.UserStatusId === "E0005" ||
          oCurrentEquipment.UserStatusId === "E0006"
        ) {
          // Current Equipment is validated or deleted
          if (iLocationStatusFSM === 1) {
            return 1; //Current Equipment validated and will be sent to FSM
          } else {
            //Location will be not sent to FSM
            return 2; //Current Equipment validated but will be not sent to FSM because of Location Equipment
          }
        }
        return 0; //Current Equipment not validated
      },
      /*
       * Method is used to fetch site Information
       */
      _bindSiteData: function () {
        let sRequest = this.getOwnerComponent().getModel().createKey("/SiteSet", {
          SiteId: this._SiteId,
        });
        this.getOwnerComponent()
          .getModel()
          .read(sRequest, {
            urlParameters: {
              $expand: "SiteContact",
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
            }.bind(this),
          });
      },
      /*
       * Method is used to generate site address to display from site Information
       */
      _fnSetSiteAddress: function (oData) {
        let sAddress = "",
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
          let sCountry = oCountry[oData.AddressCountryId]
            ? oCountry[oData.AddressCountryId].Desc
            : oData.AddressCountryId;
          sAddress = sAddress + sCountry;
        }
        return sAddress;
      },
      /*
       * Method is used to fetch Location hierarchy for a Site
       * Once data is fetched,_transformTreeData is called to tranform data to tree and bound to tree table
       */
      _bindTreeTable: function () {
        let aTableFilters = this._fnGetFilters("detailFilterBar");
        let aFilters = [];
        aFilters.push(new Filter("SiteId", FilterOperator.EQ, this._SiteId));
        if (aTableFilters && aTableFilters.length > 0) {
          aFilters = aFilters.concat(aTableFilters);
        }
        this.byId("LocationHierarchyTreeTable").setSelectedIndex(-1);
        this.fnShowBusyIndicator(null, 0);
        this.getOwnerComponent()
          .getModel()
          .read("/LocationHierarchySet", {
            filters: aFilters,
            urlParameters: {
              $expand: "EquipmentNumber",
            },
            success: function (oData, response) {
              let aNodes = this._transformTreeData(oData.results);
              this.fnHideBusyIndicator();
              if (this._bRefreshHierarchy) {
                //Only refresh hierarchy (status and equipment's number)
                this._updateHierarchy(oData, aNodes);
              } else {
                //Set hierarchy from scratch
                this._setTreeModelData(aNodes);
                this._setLocationDescription(oData.results);
                let oEquipment = {
                  count: 0,
                  list: [],
                };
                this.fnSetJSONModel(oEquipment, "mEquipment");
              }
            }.bind(this),
            error: function (oError) {
              this.fnHideBusyIndicator();
              this._oDataError(oError);
            }.bind(this),
          });
      },
      /*
       * Method to update values in already existing hierarchy
       */
      _updateHierarchy: function (oData, oNewHierarchy) {
        let oLocationHierarchyModel = this.fnGetModel("mLocationHierarchy");
        let oLocationHierarchyData = oLocationHierarchyModel.getData();
        for (let idx in oLocationHierarchyData.nodeRoot.children) {
          oLocationHierarchyData.nodeRoot.children[idx] = this._setUpdateFields(
            oLocationHierarchyData.nodeRoot.children[idx],
            oNewHierarchy[idx]
          );
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
        oBase.Deletable = oNewHierarchy.Deletable;
        oBase.SiteHierPecCompleted = oNewHierarchy.SiteHierPecCompleted;
        oBase.SitePecInProgress = oNewHierarchy.SitePecInProgress;
        for (let idx in oBase.children) {
          oBase.children[idx] = this._setUpdateFields(
            oBase.children[idx],
            oNewHierarchy.children[idx]
          );
        }
        return oBase;
      },
      /*
       * Common method called in all OData calls to parse backend errors and display on Message Dialog
       */
      _oDataError: function (oError) {
        let sMsg;
        if (oError.responseText) {
          let oInnerError = JSON.parse(oError.responseText).error.innererror;
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
              }.bind(this),
            }),
          });
        }
        this[[sDialogName]].open();
      },
      /*
       * Called from method "_bindTreeTable" to bind the tree data to JSON Model
       */
      _setTreeModelData: function (aNodes) {
        let oLocationHierarchyModel = new JSONModel();
        oLocationHierarchyModel.setData({
          nodeRoot: {
            children: aNodes,
          },
        });
        this.fnSetModel(oLocationHierarchyModel, "mLocationHierarchy");
      },
      /*
       * Called from method "_bindTreeTable" to set location description for equipment
       */
      _setLocationDescription: function (aLocation) {
        let oModel = {};
        for (let iLoc in aLocation) {
          let oLocation = aLocation[iLoc];
          if (!oModel[oLocation.LocationId]) {
            oModel[oLocation.LocationId] = {
              LocationId: oLocation.LocationId,
              LocationName: oLocation.LocationName,
              SuperiorLocationId: oLocation.SuperiorLocationId,
            };
          }
          //Concatenate Superior Location Names with current Location Name
          if (oLocation.SuperiorLocationId !== "") {
            let oSuperiorLocation = oModel[oLocation.SuperiorLocationId];
            oModel[oLocation.LocationId].LocationName =
              oSuperiorLocation.LocationName + "/" + oModel[oLocation.LocationId].LocationName;
          }
        }
        this.fnSetJSONModel(oModel, "mLocationDescription");
      },
      /*
       * Method is called from method "onGetEquiForFuncLocPress".
       * It fetched equipments for selected functional location and bind it to Equipment table
       */
      _bindEquipmentTable: function (sLocationId, sLocationType) {
        let aFilters = [],
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
        let aFilterBarFilters = this._fnGetFilters("detailFilterBar");
        if (aFilterBarFilters && aFilterBarFilters.length > 0) {
          aFilters = aFilters.concat(aFilterBarFilters);
        }
        this.fnShowBusyIndicator(null, 0);
        this.getOwnerComponent()
          .getModel()
          .read("/EquipmentSet", {
            filters: aFilters,
            urlParameters: {
              $expand: "ModifiedInfo,FamilyCharacteristic,Anomaly",
              $inlinecount: "allpages",
            },
            success: async function (oData, response) {
              let oEquipment = await this._buildEquipmentModel(oData);
              this.fnHideBusyIndicator();
              this.fnSetJSONModel(oEquipment, "mEquipment");
            }.bind(this),
            error: function (oError) {
              let oEquipment = {
                count: 0,
                list: [],
              };
              this.fnHideBusyIndicator();
              this.fnSetJSONModel(oEquipment, "mEquipment");
            }.bind(this),
          });
      },
      _getMeasuringPoints: function () {
        const oModel = this.getOwnerComponent().getModel();
        const { SiteId: sSiteId } = this.fnGetModel("mSite").getData();
        const aFilters = [new Filter("SiteId", FilterOperator.EQ, sSiteId)];
        return new Promise((res, rej) => {
          oModel.read("/MeasuringPointSet", {
            filters: aFilters,
            success: (oData) => {
              res(oData.results);
            },
            error: (oError) => {
              rej(oError);
            },
          });
        });
      },
      /*
       * Called from _bindEquipmentTable to build equipment model
       */
      _buildEquipmentModel: async function (oData) {
        try {
          const aMeasuringPoints = await this._getMeasuringPoints();
          this.fnGetModel("oEquipmentAnomalyModel").setProperty(
            "/measuringPoints",
            aMeasuringPoints
          );
          //Reset Selection
          let aBooleanField = ["PecDeepAnalysisNeeded", "PecQuote", "PecTrainingReq", "Critical"],
            aDateField = ["WarrantyEndDate"],
            oFamilyCharacteristic = this.fnGetModel("mFamilyCharacteristic").getData(),
            oLocationDescription = this.fnGetModel("mLocationDescription").getData(),
            oDDICValue = this.fnGetModel("mDDICValue").getData(),
            oVH = this.fnGetModel("mVH").getData(),
            oEquipment = {
              count: oData.__count,
              list: oData.results,
            },
            oEquipmentFSM = {},
            sYes = this.fnGetResourceBundle("yes"),
            sNo = this.fnGetResourceBundle("no");
          this.byId("EquipmentTable").setSelectedIndex(-1);
          for (let i in oEquipment.list) {
            let oLine = oEquipment.list[i];
            oEquipmentFSM[oLine.EquipmentId] = {
              LocationId: oLine.LocationId,
              SuperiorEquiId: oLine.SuperiorEquiId,
              StatusFSM: 0,
            };
            oLine.AnomalyId = this._fnCreateStringWithBreakLine(oLine.Anomaly.results, "AnomalyId");
            //Manage descriptions (needed for extract excel)
            oLine.CompleteLocationName = oLocationDescription[oLine.LocationId].LocationName;
            oLine.IsCreatedDuringPecDesc = oLine.IsCreatedDuringPec ? sYes : sNo;
            oLine.PecDeepAnalysisNeededDesc = oLine.PecDeepAnalysisNeeded ? sYes : sNo;
            oLine.PecQuoteDesc = oLine.PecQuote ? sYes : sNo;
            oLine.PecTrainingReqDesc = oLine.PecTrainingReq ? sYes : sNo;
            oLine.Critical = oLine.Critical ? sYes : sNo;
            oLine.DomainDesc = oLine.DomainId === "" ? "" : oVH.Domain[oLine.DomainId].Desc;
            oLine.FunctionDesc = oLine.FunctionId === "" ? "" : oVH.Function[oLine.FunctionId].Desc;
            oLine.FamilyDesc = oLine.FamilyId === "" ? "" : oVH.Family[oLine.FamilyId].Desc;
            oLine.WarrantyEndDateText =
              oLine.WarrantyEndDate === null ? "" : this._oFormatDate.format(oLine.WarrantyEndDate);
            oLine.UserStatusDesc = this.formatter.setStatusDescription.call(
              this,
              oLine.UserStatusId
            );
            oLine.AmdecAccessibilityDesc =
              oLine.AmdecAccessibilityId === ""
                ? ""
                : oDDICValue.AmdecAccessibilityId[oLine.AmdecAccessibilityId].ValueDesc;
            oLine.AmdecCriticityDesc =
              oLine.AmdecCriticityId === ""
                ? ""
                : oDDICValue.AmdecCriticityId[oLine.AmdecCriticityId].ValueDesc;
            oLine.AmdecDetectabilityDesc =
              oLine.AmdecDetectabilityId === ""
                ? ""
                : oDDICValue.AmdecDetectabilityId[oLine.AmdecDetectabilityId].ValueDesc;
            oLine.AmdecDisrepairDesc =
              oLine.AmdecDisrepairId === ""
                ? ""
                : oDDICValue.AmdecDisrepairId[oLine.AmdecDisrepairId].ValueDesc;
            oLine.AmdecFunctionningDesc =
              oLine.AmdecFunctionningId === ""
                ? ""
                : oDDICValue.AmdecFunctionningId[oLine.AmdecFunctionningId].ValueDesc;
            oLine.AmdecReliabilityDesc =
              oLine.AmdecReliabilityId === ""
                ? ""
                : oDDICValue.AmdecReliabilityId[oLine.AmdecReliabilityId].ValueDesc;
            oLine.AmdecStateDesc =
              oLine.AmdecStateId === ""
                ? ""
                : oDDICValue.AmdecStateId[oLine.AmdecStateId].ValueDesc;
            oLine.UsageDesc =
              oLine.UsageId === "" ? "" : oDDICValue.UsageId[oLine.UsageId].ValueDesc;
            oLine.Anomaly = oLine.Anomaly.length > 0 ? oLine.Anomaly : "";
            oLine.HasAnomaly = oLine.HasAnomaly === true ? true : false;
            let iLine = null;
            let oLineMod = null;
            for (let sPorperty in oLine) {
              if (oDDICValue[sPorperty]) {
                //Manage only properties with value list (from DDIC)
                let sLink = sPorperty.split("Id").shift();
                oLine[sLink + "Desc"] =
                  oLine[sPorperty] === "" ? "" : oDDICValue[sPorperty][oLine[sPorperty]].ValueDesc;
              }
            }
            this._fnSetAmdecCounter(oLine, sYes, sNo); // Set Amdec counter and boolean for all amdec value filled
            oLine.StatusFSM = this._setEquipmentStatusFSM(oEquipmentFSM, oLine); // Set
            //Manage Modified info
            oLine.ModifiedInfoTmp = oLine.ModifiedInfo.results;
            oLine.ModifiedInfo = [];
            oLine.ModifiedProperty = [];
            //Manage Modified info on characteristics with multi value
            for (iLine in oLine.ModifiedInfoTmp) {
              oLineMod = oLine.ModifiedInfoTmp[iLine];
              if (oLineMod.IsCharacteristic) {
                //Line is a characteristic
                let sSplitOld = oLineMod.ValueOld.split("¤");
                let sSplitNew = oLineMod.ValueNew.split("¤");
                let sToDeleteOld = [];
                for (let iOld in sSplitOld) {
                  let sCurrentOld = sSplitOld[iOld];
                  let indexToDeleteNew = sSplitNew.indexOf(sCurrentOld);
                  if (indexToDeleteNew !== -1) {
                    sToDeleteOld.push(sCurrentOld);
                    sSplitNew.splice(indexToDeleteNew, 1);
                  }
                }
                for (iOld in sToDeleteOld) {
                  let indexToDeleteOld = sSplitOld.indexOf(sToDeleteOld[iOld]);
                  sSplitOld.splice(indexToDeleteOld, 1);
                }
                let sNewLine = JSON.parse(JSON.stringify(oLineMod));
                let iMax = Math.max(sSplitOld.length, sSplitNew.length);
                let iLoop = 0;
                //Generate as many rows as needed
                while (iLoop < iMax) {
                  let sOld = sSplitOld[iLoop] ? sSplitOld[iLoop] : "";
                  let sNew = sSplitNew[iLoop] ? sSplitNew[iLoop] : "";
                  sNewLine.ValueOld = sOld;
                  sNewLine.ValueNew = sNew;
                  //flag to hide description
                  sNewLine.bHideDescription = iLoop === 0 ? false : true;
                  oLine.ModifiedInfo.push(JSON.parse(JSON.stringify(sNewLine)));
                  iLoop++;
                }
              } else {
                oLineMod.sDescription = this.formatter.setPropertyDescription.call(
                  this,
                  oLineMod.FieldI18n
                );
                oLine.ModifiedInfo.push(oLineMod);
              }
            }
            //Manage Modified info description
            for (iLine in oLine.ModifiedInfo) {
              oLineMod = oLine.ModifiedInfo[iLine];
              if (oLineMod.IsProperty) {
                //Line is a property
                this._fnSetPropertyDescription(
                  oLine,
                  oLineMod,
                  oDDICValue,
                  oVH,
                  aBooleanField,
                  oLocationDescription,
                  aDateField,
                  sYes,
                  sNo
                );
              } else {
                //Line is a characteristic
                this._fnSetCharactisticDescription(oLineMod, oFamilyCharacteristic);
              }
            }
            //Manage the new way to display modified info
            oLine.ModifiedInfoProperty = [];
            oLine.ModifiedInfoFamilyCharact = [];
            oLine.bDisplayModifiedInfoProperty = false;
            oLine.bDisplayModifiedInfoFamilyCharact = false;
            for (iLine in oLine.ModifiedInfo) {
              oLineMod = oLine.ModifiedInfo[iLine];
              if (oLineMod.IsProperty) {
                //Line is a property
                oLine.ModifiedInfoProperty.push(oLineMod);
                oLine.bDisplayModifiedInfoProperty = true;
              } else {
                //Line is a characteristic
                oLine.ModifiedInfoFamilyCharact.push(oLineMod);
                oLine.bDisplayModifiedInfoFamilyCharact = true;
              }
            }
            //Manage Family Characteristic
            oLine.FamilyCharacteristic = oLine.FamilyCharacteristic.results;
            this._fnSetFamilyImportantCounter(
              oLine,
              oFamilyCharacteristic,
              oVH.Family[oLine.FamilyId],
              sYes,
              sNo
            ); // Set Family Characteristic Important counter and boolean
            const aEquipMeasure = aMeasuringPoints.filter(
              (oMeasuringPoint) => oMeasuringPoint.EquipmentId === oLine.EquipmentId
            );
            oLine.bMeasuringVisible = aEquipMeasure.length > 0;
            oLine.HasMeasuringDocument =
              aEquipMeasure.find((oEquip) => oEquip.HasMeasuringDocument === true) !== undefined;
            oLine.MeasuringPointsIds = this._fnCreateStringWithBreakLine(
              aEquipMeasure,
              "MeasuringPointId"
            );
          }
          return oEquipment;
        } catch (oError) {
          MessageBox.error(oError.message);
        }
      },
      _fnCreateStringWithBreakLine: function (aData, sProp) {
        let sResult = "";
        aData.forEach((obj, index) => {
          if (obj[sProp]) {
            sResult += obj[sProp];
            if (index < aData.length - 1) {
              sResult += "\n";
            }
          }
        });
        return sResult;
      },
      /*
       * Called from _buildEquipmentModel to set description on modified info from property
       */
      _fnSetPropertyDescription: function (
        oLine,
        oLineMod,
        oDDICValue,
        oVH,
        aBooleanField,
        oLocationDescription,
        aDateField,
        sYes,
        sNo
      ) {
        oLine.ModifiedProperty.push(oLineMod.FieldI18n); //Save was property was changed
        if (oDDICValue[oLineMod.FieldI18n]) {
          //Manage only properties with value list (from DDIC)
          oLineMod.ValueOldDesc =
            oLineMod.ValueOld === ""
              ? ""
              : oDDICValue[oLineMod.FieldI18n][oLineMod.ValueOld].ValueDesc;
          oLineMod.ValueNewDesc =
            oLineMod.ValueNew === ""
              ? ""
              : oDDICValue[oLineMod.FieldI18n][oLineMod.ValueNew].ValueDesc;
        } else if (
          oLineMod.FieldI18n === "DomainId" ||
          oLineMod.FieldI18n === "FunctionId" ||
          oLineMod.FieldI18n === "FamilyId"
        ) {
          // Manage description from VH (Family Function, Domain)
        let sLink = oLineMod.FieldI18n.split("Id").shift();
          oLineMod.ValueOldDesc =
            oLineMod.ValueOld === "" ? "" : oVH[sLink][oLineMod.ValueOld].Desc;
          oLineMod.ValueNewDesc =
            oLineMod.ValueNew === "" ? "" : oVH[sLink][oLineMod.ValueNew].Desc;
        } else if (aBooleanField.indexOf(oLineMod.FieldI18n) !== -1) {
          // Manage boolean field
          oLineMod.ValueOldDesc = oLineMod.ValueOld === "X" ? sYes : sNo;
          oLineMod.ValueNewDesc = oLineMod.ValueNew === "X" ? sYes : sNo;
        } else if (oLineMod.FieldI18n === "LocationId") {
          // Manage Location Description
          oLineMod.ValueOldDesc =
            oLineMod.ValueOld === "" ? "" : oLocationDescription[oLineMod.ValueOld].LocationName;
          oLineMod.ValueNewDesc =
            oLineMod.ValueNew === "" ? "" : oLocationDescription[oLineMod.ValueNew].LocationName;
        } else if (aDateField.indexOf(oLineMod.FieldI18n) !== -1) {
          //Manage date field
          oLineMod.ValueOldDesc = this._fnFormatDate(oLineMod.ValueOld);
          oLineMod.ValueNewDesc = this._fnFormatDate(oLineMod.ValueNew);
        } else {
          // Free field
          oLineMod.ValueOldDesc = oLineMod.ValueOld;
          oLineMod.ValueNewDesc = oLineMod.ValueNew;
        }
      },
      /*
       * Called from _buildEquipmentModel to set description on modified info from characteristic
       */
      _fnSetCharactisticDescription: function (oLineMod, oFamilyCharacteristic) {
        if (oFamilyCharacteristic.ValueList[oLineMod.FieldId]) {
          //Manage Chararacteristic with value list
          let oValueList = oFamilyCharacteristic.ValueList[oLineMod.FieldId];
          oLineMod.ValueOldDesc = oValueList[oLineMod.ValueOld]
            ? oValueList[oLineMod.ValueOld].CharactValueDescription
            : oLineMod.ValueOld;
          oLineMod.ValueNewDesc = oValueList[oLineMod.ValueNew]
            ? oValueList[oLineMod.ValueNew].CharactValueDescription
            : oLineMod.ValueNew;
        } else if (
          oFamilyCharacteristic.Characteristic[oLineMod.FieldId] &&
          oFamilyCharacteristic.Characteristic[oLineMod.FieldId].CharactDataType === "DATE"
        ) {
          //Manage date characteristic
          oLineMod.ValueOldDesc = this._fnFormatDate(oLineMod.ValueOld);
          oLineMod.ValueNewDesc = this._fnFormatDate(oLineMod.ValueNew);
        } else if (
          oFamilyCharacteristic.Characteristic[oLineMod.FieldId] &&
          oFamilyCharacteristic.Characteristic[oLineMod.FieldId].CharactDataType === "NUM"
        ) {
          //Manage date characteristic
          oLineMod.ValueOldDesc = oLineMod.ValueOld;
          oLineMod.ValueNewDesc = oLineMod.ValueNew;
          oLineMod.CharactUnit = oFamilyCharacteristic.Characteristic[oLineMod.FieldId].CharactUnit;
        } else {
          // Free field characteristic
          oLineMod.ValueOldDesc = oLineMod.ValueOld;
          oLineMod.ValueNewDesc = oLineMod.ValueNew;
        }
      },
      _fnFormatDate: function (sDate) {
        if (sDate === "00000000") return "";
        return this._oFormatDate.format(
          new Date(sDate.slice(0, 4), sDate.slice(4, 6) - 1, sDate.slice(6, 8))
        );
      },
      /*
       * Set descriptions and characteristics descriptions for familyon equipement
       */
      _fnSetFamilyCharactisticDescription: function (oCharact, oInfo) {
        let oCharacteristics = oInfo.Characteristic;
        oCharact.ValueToDisplay = "";
        switch (oCharact.CharactDataType) {
          case "CHAR":
            oCharact.ValueToDisplay =
              oCharact.CharactValueDescription === ""
                ? oCharact.CharactValueChar
                : oCharact.CharactValueDescription;
            break;
          case "NUM":
            oCharact.ValueToDisplay = parseFloat(oCharact.CharactValueNumDecFrom).toFixed(
              oCharacteristics[oCharact.CharactId].CharactDecimal
            );
            if (oCharacteristics[oCharact.CharactId].CharactInterval) {
              if (parseFloat(oCharact.CharactValueNumDecTo > 0)) {
                let valTo = parseFloat(oCharact.CharactValueNumDecTo).toFixed(
                  oCharacteristics[oCharact.CharactId].CharactDecimal
                );
                oCharact.ValueToDisplay += " - " + valTo;
              }
            }
            if (oCharact.CharactUnit !== "") {
              oCharact.ValueToDisplay += " " + oCharact.CharactUnit;
            }
            break;
          case "DATE":
            oCharact.ValueToDisplay = this._oFormatDate.format(
              new Date(oCharact.CharactValueDateFrom)
            );
            if (oCharacteristics[oCharact.CharactId].CharactInterval) {
              if (oCharact.CharactValueDateTo) {
                valTo = this._oFormatDate.format(new Date(oCharact.CharactValueDateTo));
                oCharact.ValueToDisplay += " - " + valTo;
              }
            }
            if (oCharact.CharactUnit !== "") {
              oCharact.ValueToDisplay += " " + oCharact.CharactUnit;
            }
            break;
        }
      },
      /*
       * Called from _buildEquipmentModel to set counter and boolean for missing Amdec
       */
      _fnSetAmdecCounter: function (oLine, sYes, sNo) {
        let aAmdecProp = [
            "AmdecStateId",
            "AmdecDisrepairId",
            "AmdecAccessibilityId",
            "AmdecReliabilityId",
            "AmdecCriticityId",
            "AmdecDetectabilityId",
            "AmdecFunctionningId",
          ],
          iTot = 0,
          iCount = 0;
        for (let idx in aAmdecProp) {
          let sVal = oLine[aAmdecProp[idx]];
          iTot++;
          if (sVal !== "") {
            iCount++;
          }
        }
        oLine.AmdecCounter = iCount + "/" + iTot;
        oLine.IsAmdecComplete = iTot === iCount;
        oLine.IsAmdecCompleteDesc = oLine.IsAmdecComplete ? sYes : sNo;
        oLine.AmdecSorter = iCount;
      },
      /*
       * Called from _buildEquipmentModel to set counter and boolean for missing important Family Characteristic
       */
      _fnSetFamilyImportantCounter: function (oLine, oInfo, oFamily, sYes, sNo) {
        let iCount = 0,
          iTot = 0,
          aChecked = [],
          oClass = oInfo.Class;
        if (!oFamily || oFamily.ClassId === "") {
          oLine.FamilyCharactImportantCounter = "-";
          oLine.IsFamilyCharactImportantComplete = true;
          oLine.IsFamilyCharactImportantCompleteDesc = "";
          oLine.FamilyCharactImportantSorter = 10;
          return;
        } else {
          iTot = oClass[oFamily.ClassId]._iImportant;
        }
        for (let idx in oLine.FamilyCharacteristic) {
          let oCharact = oLine.FamilyCharacteristic[idx];
          this._fnSetFamilyCharactisticDescription(oCharact, oInfo, sYes, sNo);
          if (oCharact.CharactImportant && aChecked.indexOf(oCharact.CharactId) === -1) {
            aChecked.push(oCharact.CharactId);
            iCount++;
          }
        }
        oLine.FamilyCharactImportantCounter = iCount + "/" + iTot;
        oLine.IsFamilyCharactImportantComplete = iTot === iCount;
        oLine.IsFamilyCharactImportantCompleteDesc = oLine.IsFamilyCharactImportantComplete
          ? sYes
          : sNo;
        oLine.FamilyCharactImportantSorter = iTot === 0 ? 1 : iCount / iTot;
      },
      /*
       * Method is called to update status for 1 object
       */
      _ApplyStatus: function (oEvent, sNewStatus, sEquipmentId, sLocationId, bToDelete) {
        let sObjectName = sEquipmentId === "" ? "Location" : "Equipement";
        let oParameters = {
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
            this._MessageError(
              "oError" + sObjectName + "Status",
              this.fnGetResourceBundle("DialogErrorStatusChange")
            );
          }.bind(this),
        };
        let payload = {
          Scope: "PEC",
          EquipmentId: sEquipmentId,
          LocationId: sLocationId,
          UserStatusId: sNewStatus,
          ToDelete: bToDelete,
        };
        this.fnShowBusyIndicator(null, 0);
        this.getOwnerComponent().getModel().create("/UserStatusSet", payload, oParameters);
      },
      /*
       * Method is called to update status for 1 location
       */
      _ApplyLocationStatus: function (oEvent, sNewStatus) {
        let oObject = oEvent.getSource().getParent().getParent().getRowBindingContext().getObject(),
          sLocationId = oObject.LocationId,
          bToDelete = oObject.SitePecInProgress;
        if (sNewStatus !== "E0008") {
          bToDelete = false;
        }
        this._ApplyStatus(oEvent, sNewStatus, "", sLocationId, bToDelete);
      },
      /*
       * Method is called to update status for 1 equipment
       */
      _ApplyEquipmentStatus: function (oEvent, sNewStatus) {
        let sEquipmentId = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getRowBindingContext()
          .getObject().EquipmentId;
        this._ApplyStatus(oEvent, sNewStatus, sEquipmentId, "", false);
      },
      /*
       * Method is called to update status for a list of Object
       */
      _ApplyMassStatus: function (oEvent, sNewStatus, bIsEquipments) {
        // Initialize Id for mass call
        let sId = oEvent.getSource().getId().split("-").pop(),
          sObjectName = bIsEquipments ? "Equipment" : "Location",
          sTableName = bIsEquipments ? "EquipmentTable" : "LocationHierarchyTreeTable";
        // Set parameters for singles calls
        let oSingleParameters = {
          async: false,
          groupId: sId,
        };
        //Set parameters for mass cal
        let oMassParameters = {
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
            this._MessageError(
              "oErrorMass" + sObjectName,
              this.fnGetResourceBundle("DialogErrorStatusChange")
            );
          }.bind(this),
        };
        // Set deferred group for mass call
        let oModel = this.getOwnerComponent().getModel();
        oModel.setDeferredGroups([sId]);
        // Get rows
        let oObjectTable = this.byId(sTableName);
        const oSelectAllLocModel = this.getView().getModel("oSelectAllLocationsModel");
        let bSelectAllLoc = oSelectAllLocModel.getProperty("/bSelectAll"),
          aIndexSelected;
        if (bSelectAllLoc && sTableName == "LocationHierarchyTreeTable") {
          aIndexSelected = oSelectAllLocModel.getProperty("/aSelectedIndices");
        } else {
          // Get indices selected
          aIndexSelected = oObjectTable.getSelectedIndices();
        }
        //Initialize the call by Indices selected
        let oObjectSelected;
        for (let iInd in aIndexSelected) {
          if (bSelectAllLoc) {
            const aSelectedLoc = oSelectAllLocModel.getProperty("/aSelectedLocations");
            oObjectSelected = aSelectedLoc[iInd];
          } else {
            oObjectSelected = oObjectTable.getContextByIndex(aIndexSelected[iInd]).getObject();
          }
          let payload = {
            Scope: "PEC",
            EquipmentId: bIsEquipments ? oObjectSelected.EquipmentId : "",
            LocationId: bIsEquipments ? "" : oObjectSelected.LocationId,
            UserStatusId: sNewStatus,
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
      },
      /*
       * Method is called to update status for a list of location
       */
      _ApplyLocationMassStatus: function (oEvent, sNewStatus) {
        this._ApplyMassStatus(oEvent, sNewStatus, false);
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
          case "Emphasized": // Take over in progress or Return to takeover Status to apply
            if (oEvent.getSource().getIcon() === "sap-icon://complete") {
              return "E0008"; // Take over in progress
            }
        }
        return "";
      },
      /*
       * Set Columns to Excel File
       */
      _setExcelColumns: function (oExcel, aColSize, oColumnProperties) {
        let iHeaderStyle = oExcel.generateNewStyle({
            font: "Calibri 12 B",
            fill: "#F2F2F2",
          }),
          iSheetProperties = 0,
          iRow = 0;
        // Set first sheet with properties
        for (let idx in oColumnProperties) {
          let oCol = oColumnProperties[idx];
          oExcel.addCell(
            iSheetProperties,
            oCol.colIndex,
            iRow,
            this.formatter.setPropertyDescription.call(this, oCol.i18n),
            iHeaderStyle,
            aColSize["Sheet" + iSheetProperties]
          );
        }
      },
      /*
       * Generate file to save
       */
      _generateExcel: function (oExcel) {
        let dDate = new Date(),
          iMonth = parseInt(dDate.getMonth(), 10) + 1,
          sFileName =
            dDate.getFullYear() +
            "-" +
            iMonth +
            "-" +
            dDate.getDate() +
            "_" +
            dDate.getHours() +
            ":" +
            dDate.getMinutes() +
            ":" +
            dDate.getSeconds() +
            ".xlsx";
        oExcel.generate(sFileName);
      },
      /*
       * Set Rows to Excel File
       */
      _setExcelRows: function (oExcel, aData, aColSize, oColumnProperties) {
        let iDefaultStyle = oExcel.generateNewStyle({
            align: "L T W", //Left Top Wrap
          }),
          iGreenStyle = oExcel.generateNewStyle({
            font: "Calibri 12 " + "#00B050" + " B",
            align: "L T W", //Left Top Wrap
          }),
          iOrangeStyle = oExcel.generateNewStyle({
            font: "Calibri 12 " + "#E9730C" + " B",
            align: "L T W", //Left Top Wrap
          }),
          iModifiedStyle = oExcel.generateNewStyle({
            font: "Calibri 12 B",
            fill: "#C6E0B4",
            align: "L T W", //Left Top Wrap
          }),
          iFirstRow = 1, // Start To 1 because Row 0 is Header
          iRow = iFirstRow;
        for (let iEquip in aData) {
          let oEquipment = aData[iEquip];
          for (let sProp in oEquipment) {
            let oProprerty = oEquipment[sProp];
            let oColProperty = oColumnProperties[sProp];
            if (oColProperty) {
              //Property is customize to export excel
              let iStyle = iDefaultStyle;
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
      /*
       * Fill missing important characteristic
       */
      _missingImportantCharact: function (oObject) {
        let aImportantFilled = [],
          aImportantMissing = [],
          oVH = this.fnGetModel("mVH").getData(),
          oFamilyCharacteristic = this.fnGetModel("mFamilyCharacteristic").getData();
        for (let i1 in oObject.FamilyCharacteristic) {
          aImportantFilled.push(oObject.FamilyCharacteristic[i1].CharactId);
        }
        let sFamily = oVH.Family[oObject.FamilyId];
        if (sFamily) {
          let oClass = oFamilyCharacteristic.Class[sFamily.ClassId];
          for (let i2 in oClass) {
            let oCharact = oClass[i2];
            if (oCharact.CharactImportant && aImportantFilled.indexOf(i2) === -1) {
              aImportantMissing.push(oCharact);
            }
          }
        }
        return aImportantMissing;
      },
      /*
       * Fill other properties to display in popover
       */
      _otherProperties: function (oObject) {
        let aFieldToCheck = [
            "BrandId",
            "Critical",
            "InstallYear",
            "Manufref",
            "PecDeepAnalysisNeededDesc",
            "PecQuoteDesc",
            "PecTrainingReqDesc",
            "Qrcode",
            "SerialNumber",
            "WarrantyEndDateText",
          ],
          aOtherProperties = [];
        for (let iProp in aFieldToCheck) {
          let sProp = aFieldToCheck[iProp];
          aOtherProperties.push({
            label: this.fnGetResourceBundle("LabelProperty" + sProp),
            valueToDisplay: oObject[sProp],
          });
        }
        return aOtherProperties;
      },
      _loadFragment: function (sDialogName) {
        let oView = this.getView();
        return Fragment.load({
          id: oView.getId(),
          name: FRAGMENT_PATH + sDialogName,
          controller: this,
        }).then(
          function (oDialog) {
            oView.addDependent(oDialog);
            this._setStyleClassForPopup(oDialog);
            return oDialog;
          }.bind(this)
        );
      },
      /*
       * Fill anomaly popover
       */
      onOpenAnomalyFragment: function (oEvent) {
        let idThisPopover = "AnomalyPopover",
          oObjectView = oEvent.getSource(),
          oObject =
            oObjectView === ""
              ? {}
              : oEvent.getSource().getParent().getRowBindingContext().getObject(),
          oView = this.getView(),
          sFragmentName = "com.vesi.zfac4_valtoker.view.fragment.Detail.Anomaly",
          aFieldToCheck = [
            "AnomalyName",
            "Risk",
            "Recommendation",
            "Priority",
            "LongText",
            "Quotation",
            "QuotationType",
          ],
          oToolbar,
          oLabelText,
          oValueText,
          oPanel,
          aAnomalies;
        if (!this[idThisPopover]) {
          this[idThisPopover] = Fragment.load({
            id: oView.getId(),
            name: sFragmentName,
            controller: this,
          }).then(function (oPopover) {
            return oPopover;
          });
        }
        this[idThisPopover].then(
          function (oPopover) {
            this.getView().byId("VBoxAnomalyFragment").destroyItems();
            this.fnShowBusyIndicator(null, 0);
            this.getOwnerComponent()
              .getModel()
              .read(`/EquipmentSet('${oObject.EquipmentId}')`, {
                urlParameters: {
                  $expand: "Anomaly",
                },
                success: function (oAnomalyData, response) {
                  aAnomalies = oAnomalyData.Anomaly.results;
                  for (let i = 0; i < aAnomalies.length; i++) {
                    oPanel = new Panel({
                      width: "100%",
                    });
                    oToolbar = new OverflowToolbar();
                    let oTitle = new Title({
                      text: `${this.fnGetResourceBundle("TitleAnomaly")} - ${
                        aAnomalies[i].AnomalyId
                      }`,
                    });
                    for (let iProp in aFieldToCheck) {
                      let sProp = aFieldToCheck[iProp];
                      oLabelText = new Text({
                        text: this.fnGetResourceBundle("LabelProperty" + sProp),
                      });
                      oValueText = new Text({
                        text: formatter.fnSetCustomAnomaliesPopoverValue(
                          sProp,
                          aAnomalies[i][sProp],
                          this,
                          aAnomalies[i]
                        ),
                      });
                      let oVBox = new VBox();
                      let oMainVBox = new VBox({
                        alignItems: "Start",
                      });
                      let oContentHBox = new HBox();
                      let oLabelHBox = new HBox({
                        width: "13rem",
                      });
                      oLabelHBox.addItem(oLabelText);
                      oContentHBox.addItem(oLabelHBox);
                      oContentHBox.addItem(oValueText);
                      oMainVBox.addItem(oContentHBox);
                      oVBox.addItem(oMainVBox);
                      oPanel.addContent(oVBox);
                    }
                    oToolbar.insertContent(oTitle);
                    oPanel.setHeaderToolbar(oToolbar);
                    this.getView().byId("VBoxAnomalyFragment").addItem(oPanel);
                    this.fnHideBusyIndicator();
                    oPopover.openBy(oObjectView);
                  }
                }.bind(this),
                error: function (oError) {
                  MessageBox.error(oError);
                  this.fnHideBusyIndicator();
                }.bind(this),
              });
          }.bind(this)
        );
      },
      onAnomalyPhotoIconPress: function (oEvent) {
        let oObjectView = oEvent.getSource(),
          oObject =
            oObjectView === ""
              ? {}
              : oEvent.getSource().getParent().getRowBindingContext().getObject(),
          aURL = [],
          aTempURL = [],
          pictureCounter = 0;
        const oAnomalyModel = this.getView().getModel("oEquipmentAnomalyModel");
        oAnomalyModel.setProperty("/aURL", aURL);
        this.getOwnerComponent()
          .getModel()
          .read(`/EquipmentSet('${oObject.EquipmentId}')`, {
            urlParameters: {
              $expand: "Anomaly",
            },
            success: function (oAnomalyData, response) {
              let aAnomalies = oAnomalyData.Anomaly.results;
              aAnomalies.forEach((anomaly) => {
                let aFilters = [];
                aFilters.push(
                  new Filter("ObjectId", FilterOperator.EQ, `0000${anomaly.AnomalyId}`)
                );
                this.getOwnerComponent()
                  .getModel()
                  .read("/AnomalyPhotosSet", {
                    filters: aFilters,
                    success: function (oData) {
                      oAnomalyModel.setProperty("/aAnomalyPhotoAttachments", []);
                      let aCurrentAnomalyPhotoAttachments = oAnomalyModel.getProperty(
                        "/aAnomalyPhotoAttachments"
                      );
                      if (oData.results.length >= 1) {
                        pictureCounter = pictureCounter + 1;
                        if (aCurrentAnomalyPhotoAttachments.length > 1) {
                          aCurrentAnomalyPhotoAttachments.concat(oData.results);
                        } else {
                          oAnomalyModel.setProperty("/aAnomalyPhotoAttachments", oData.results);
                        }
                        let aAnomalyPhotoAttachmentIds = oAnomalyModel.getProperty(
                          "/aAnomalyPhotoAttachments"
                        );
                        aAnomalyPhotoAttachmentIds.forEach((attachmentId) => {
                          let sURL = `/sap/opu/odata/sap/ZSRC4_PEC_SRV/AnomalyPhotoSet('${attachmentId.AttachmentID}')/$value`;
                          jQuery.ajax({
                            url: sURL,
                            cache: false,
                            xhr: function () {
                              let xhr = new XMLHttpRequest();
                              xhr.responseType = "blob";
                              return xhr;
                            },
                            success: function (data) {
                              jQuery.sap.addUrlWhitelist("blob");
                              aTempURL = [];
                              aTempURL.push({
                                url: URL.createObjectURL(data),
                              });
                              let aCurrentURL = oAnomalyModel.getProperty("/aURL");
                              if (aCurrentURL.length > 0) {
                                aURL = aTempURL.concat(aCurrentURL);
                                oAnomalyModel.setProperty("/aURL", aURL);
                              } else {
                                oAnomalyModel.setProperty("/aURL", aTempURL);
                              }
                              this.fnHideBusyIndicator();
                            }.bind(this),
                            error: function (oErr) {
                              MessageBox.error(oErr);
                              this.fnHideBusyIndicator();
                            }.bind(this),
                          });
                        });
                      } else {
                        if (pictureCounter == 0) {
                          this.onAnomalyPictureDialogCancel();
                          MessageBox.information("L'anomalie n'a pas de photo.");
                        }
                      }
                      this.fnHideBusyIndicator();
                    }.bind(this),
                    error: function (oError) {
                      this.fnHideBusyIndicator();
                      MessageBox.error(oError);
                    }.bind(this),
                  });
              });
            }.bind(this),
            error: function (oError) {
              MessageBox.error(oError);
              this.fnHideBusyIndicator();
            }.bind(this),
          });
        // create dialog lazily
        if (!this.byId("idAnomalyPicturesCarouselDialog")) {
          // load asynchronous XML fragment
          let oPromise = this._loadFragment("AnomalyPicturesCarousel");
          oPromise.then(
            function (oDialog) {
              oDialog.open();
              this.fnShowBusyIndicator(null, 0);
            }.bind(this)
          );
        } else {
          this.byId("idAnomalyPicturesCarouselDialog").open();
          this.fnShowBusyIndicator(null, 0);
        }
      },
      onAnomalyPictureDialogCancel: function () {
        this.byId("idAnomalyPicturesCarouselDialog").close();
      },
      _getObjectLinkedDatas: function (bSubEquipment, oEquipment, oEvent) {
        let oObjectView = oEvent.getSource(),
          idFrag = "LinkedObject",
          idThisPopover = "_" + idFrag + "Popover",
          oView = this.getView(),
          sFragmentName = "com.vesi.zfac4_valtoker.view.fragment.Detail." + idFrag,
          fnError = function (oError) {
            this.fnHideBusyIndicator();
            this.fnSetJSONModel(
              {
                IsSub: false,
                List: [],
              },
              "mLinkedObject"
            );
            this._oDataError(oError);
          },
          fnSuccess = function (oData) {
            this.fnHideBusyIndicator();
            let aResult;
            if (bSubEquipment) {
              aResult = oData.results;
            } else {
              aResult = [oData];
            }
            let oLocationDescription = this.fnGetModel("mLocationDescription").getData();
            for (let iLine in aResult) {
              let oLine = aResult[iLine];
              oLine.UserStatusDesc = this.formatter.setStatusDescription.call(
                this,
                oLine.UserStatusId
              );
              oLine.CompleteLocationName = oLocationDescription[oLine.LocationId].LocationName;
            }
            let oModel = {
              IsSub: bSubEquipment,
              List: aResult,
            };
            this.fnSetJSONModel(oModel, "mLinkedObject");
            //Display popover for datas
            if (!this[idThisPopover]) {
              this[idThisPopover] = Fragment.load({
                id: oView.getId(),
                name: sFragmentName,
                controller: this,
              }).then(function (oPopover) {
                oView.addDependent(oPopover);
                return oPopover;
              });
            }
            this[idThisPopover].then(function (oPopover) {
              oPopover.openBy(oObjectView);
            });
          };
        let oParam = {
          success: fnSuccess.bind(this),
          error: fnError.bind(this),
        };
        let sRequest;
        switch (bSubEquipment) {
          case true:
            sRequest = "/EquipmentSet",
              aFilters = [];
            aFilters.push(new Filter("SuperiorEquiId", FilterOperator.EQ, oEquipment.EquipmentId));
            oParam.filters = aFilters;
            break;
          case false:
            sRequest = this.getOwnerComponent().getModel().createKey("/EquipmentSet", {
              EquipmentId: oEquipment.SuperiorEquiId,
            });
            break;
        }
        this.fnShowBusyIndicator(null, 0);
        this.getOwnerComponent().getModel().read(sRequest, oParam);
      },
      /*
       * fonction to dispay photo photo
       */
      _displayPhoto: function (oPhoto) {
        let oView = this.getView();
        this.fnSetJSONModel(oPhoto, "mPhoto");
        if (!this._PhotoDialog) {
          this._PhotoDialog = Fragment.load({
            id: oView.getId(),
            name: "com.vesi.zfac4_valtoker.view.fragment.Detail.PhotoDialog",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }
        this._PhotoDialog.then(function (oDialog) {
          oDialog.open();
        });
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
        let oContext = oEvent.getSource().getBindingContext("mLocationHierarchy");
        this._sSelectedLocationId = oContext.getProperty("LocationId");
        this._sSelectedLocationType = oContext.getProperty("LoomaTypeId");
        this._bindEquipmentTable(this._sSelectedLocationId, this._sSelectedLocationType);
      },
      /*
       * Method is called when press on Modified Info icone
       */
      onDisplayModifiedInfoPopoverPress: function (oEvent) {
        let oIcon = oEvent.getSource(),
          oView = this.getView(),
          sModifiedInfo = oEvent
            .getSource()
            .getParent()
            .getParent()
            .getRowBindingContext()
            .getObject();
        this.fnSetJSONModel(sModifiedInfo, "mModifiedInfo");
        if (!this._ModPopover) {
          this._ModPopover = Fragment.load({
            id: oView.getId(),
            name: "com.vesi.zfac4_valtoker.view.fragment.Detail.ModifiedInfo",
            controller: this,
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
        let sUserStatusId = this._fnSetLocationUserStatusId(oEvent);
        this._ApplyLocationStatus(oEvent, sUserStatusId);
      },
      /*
       * Method is called when press on equipment single button
       */
      onApplyEquipmentStatus: function (oEvent) {
        let sUserStatusId = this._fnSetEquipmentUserStatusId(oEvent);
        this._ApplyEquipmentStatus(oEvent, sUserStatusId);
      },
      /*
       * Method is called when press on object
       */
      onApplyMassStatus: function (oEvent, sTableName, sObjectName, sFunctionName, sUserStatusId) {
        if (this.byId(sTableName).getSelectedIndices().length > 0) {
          let sStatusText = oEvent.getSource().getText(),
            sMassDialog = "_MassDialog" + sObjectName + sUserStatusId;
          this._oEvent = oEvent;
          this._sUserStatusId = sUserStatusId;
          if (!this[sMassDialog]) {
            this[sMassDialog] = new sap.m.Dialog({
              type: sap.m.DialogType.Message,
              title: this.fnGetResourceBundle("DialogMass" + sObjectName + "Title"),
              content: new sap.m.Text({
                text: this.fnGetResourceBundle("DialogMass" + sObjectName + "Message", [
                  sStatusText,
                ]),
              }),
              beginButton: new sap.m.Button({
                type: sap.m.ButtonType.Emphasized,
                text: this.fnGetResourceBundle("yes"),
                press: function () {
                  this[sFunctionName](this._oEvent, this._sUserStatusId);
                  this[sMassDialog].close();
                }.bind(this),
              }),
              endButton: new sap.m.Button({
                text: this.fnGetResourceBundle("no"),
                press: function () {
                  this[sMassDialog].close();
                }.bind(this),
              }),
            });
          }
          this[sMassDialog].open();
        }
      },
      /*
       * Method is called when press on Location hierarchy mass button
       */
      onApplyLocationMassStatus: function (oEvent) {
        let sUserStatusId = this._fnSetLocationUserStatusId(oEvent);
        this.onApplyMassStatus(
          oEvent,
          "LocationHierarchyTreeTable",
          "Location",
          "_ApplyLocationMassStatus",
          sUserStatusId
        );
      },
      /*
       * Method is called when press on equipment mass button
       */
      onApplyEquipmentMassStatus: function (oEvent) {
        let sUserStatusId = this._fnSetEquipmentUserStatusId(oEvent);
        this.onApplyMassStatus(
          oEvent,
          "EquipmentTable",
          "Equipment",
          "_ApplyEquipmentMassStatus",
          sUserStatusId
        );
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
        let oDetailPageModel = this.fnGetModel("mDetailPage"),
          aSelectedIndices = oEvent.getSource().getSelectedIndices(),
          oTreeTable = this.byId("EquipmentTable");
        if (oEvent.getSource().getSelectedIndices().length > 0) {
          oDetailPageModel.getData().bEquipmentSelected = true;
          oDetailPageModel.getData().bEquipmentSelectedDeletable = true;
          for (let iSel in aSelectedIndices) {
            let oObject = oTreeTable.getContextByIndex(aSelectedIndices[iSel]).getObject();
            if (!oObject.Deletable) {
              oDetailPageModel.getData().bEquipmentSelectedDeletable = false;
              break;
            }
          }
        } else {
          oDetailPageModel.getData().bEquipmentSelected = false;
          oDetailPageModel.getData().bEquipmentSelectedDeletable = false;
        }
        oDetailPageModel.refresh(true);
      },
      /*
       * Callback function called to get node sublocations
       */
      getSelectedLocationData: function (aSiteLocation) {
        let aNestedLocations = this.fnGetModel("oSelectAllLocationsModel").getProperty(
          "/aNestedLocations"
        );
        aSiteLocation.forEach((location) => {
          if (location.children.length > 0 && location.children) {
            aNestedLocations.push(location.children);
            this.getSelectedLocationData(location.children);
          }
        });
      },
      /*
       * Function to add locations to sublocations array
       */
      getSelectedLocationAndSubLocationData: function (aSiteLocation) {
        let aNestedLocations = this.fnGetModel("oSelectAllLocationsModel").getProperty(
          "/aNestedLocations"
        );
        aSiteLocation.forEach((location) => {
          aNestedLocations.push(location);
        });
      },
      /*
       * Function to get all locations and sublocations
       */
      getAllLocationsAndSublocationsData: function (aNestedLocationsArray) {
        let aLocations = [];
        aNestedLocationsArray.forEach((location) => {
          if (location.length >= 1) {
            location.forEach((subLocation) => {
              aLocations.push(subLocation);
            });
          } else {
            aLocations.push(location);
          }
        });
        return aLocations;
      },
      /*
       * Function to get all locations and sublocations indices
       */
      getLocationAndSublocationIndices: function (aLocations) {
        let aSelectedIndices = [];
        aLocations.map((location, index) => aSelectedIndices.push(index));
        return aSelectedIndices;
      },
      /*
       * Event fire on Selection change on Location hierarchy Tree Table
       */
      onSelectionChangeLocationTable: function (oEvent) {
        const bSelectAll = oEvent.getParameter("selectAll");
        const oSelectAllLocModel = this.fnGetModel("oSelectAllLocationsModel");
        oSelectAllLocModel.setProperty("/aNestedLocations", []);
        let aNestedLocations = oSelectAllLocModel.getProperty("/aNestedLocations"),
          aLocations,
          aSelectedIndices = [];
        if (bSelectAll) {
          const aSiteLocation = this.fnGetModel("mLocationHierarchy").getData().nodeRoot.children;
          this.getSelectedLocationData(aSiteLocation);
          this.getSelectedLocationAndSubLocationData(aSiteLocation);
          aLocations = this.getAllLocationsAndSublocationsData(aNestedLocations);
          aSelectedIndices = this.getLocationAndSublocationIndices(aLocations);
          oSelectAllLocModel.setProperty("/aSelectedLocations", aLocations);
          oSelectAllLocModel.setProperty("/aSelectedIndices", aSelectedIndices);
          oSelectAllLocModel.setProperty("/bSelectAll", bSelectAll);
        } else {
          aSelectedIndices = oEvent.getSource().getSelectedIndices();
          oSelectAllLocModel.setProperty("/bSelectAll", bSelectAll);
        }
        const oDetailPageModel = this.fnGetModel("mDetailPage"),
          oTreeTable = this.byId("LocationHierarchyTreeTable");
        if (aSelectedIndices.length > 0) {
          oDetailPageModel.getData().bLocationSelected = true;
          oDetailPageModel.getData().bLocationSelectedDeletable = true;
          for (let iSel in aSelectedIndices) {
            let oObject = oTreeTable.getContextByIndex(aSelectedIndices[iSel]).getObject();
            if (!oObject.Deletable) {
              oDetailPageModel.getData().bLocationSelectedDeletable = false;
              break;
            }
          }
        } else {
          oDetailPageModel.getData().bLocationSelected = false;
          oDetailPageModel.getData().bLocationSelectedDeletable = false;
        }
        oDetailPageModel.refresh(true);
      },
      /*
       * Event fire on press on icon Photo
       */
      onPhotoDownload: function (oEvent) {
        let oObject = oEvent.getSource().getParent().getRowBindingContext().getObject(),
          oPhoto = {
            Title: this.fnGetResourceBundle("EquipmentTableIconTooltipPhotoId"),
            PhotoId: oObject.PhotoId,
            EntitySet: "PhotoSet",
            EquipmentName: oObject.EquipmentName,
          };
        this._displayPhoto(oPhoto);
      },
      /*
       * Event fire on press on icon Nameplate
       */
      onNameplateDownload: function (oEvent) {
        let oObject = oEvent.getSource().getParent().getRowBindingContext().getObject(),
          oNameplate = {
            Title: this.fnGetResourceBundle("EquipmentTableIconTooltipNameplateId"),
            PhotoId: oObject.NameplateId,
            EntitySet: "NameplateSet",
            EquipmentName: oObject.EquipmentName,
          };
        this._displayPhoto(oNameplate);
      },
      /*
       * Fire when press on comment icon
       */
      onDisplayComment: function (oEvent) {
        let oIcon = oEvent.getSource(),
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
        this.fnSetJSONModel(
          {
            Comment: oObject.Comments,
            CommentCols: iCols,
            CommentRows: iRows,
          },
          "mLongTexts"
        );
        if (!this._ComPopover) {
          this._ComPopover = Fragment.load({
            id: oView.getId(),
            name: "com.vesi.zfac4_valtoker.view.fragment.Detail.Comment",
            controller: this,
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
       * Fire when press on Amdec / Family / Others properties
       */
      onDisplayDetailEquipment: function (oEvent) {
        let oAmdec = {
            Amdec1: [
              "AmdecStateId",
              "AmdecDisrepairId",
              "AmdecAccessibilityId",
              "AmdecFunctionningId",
            ],
            Amdec2: ["AmdecCriticityId", "AmdecDetectabilityId", "AmdecReliabilityId"],
          },
          oObjectView = oEvent.getSource(),
          idFrag = oObjectView.getId().split("Object").pop().split("-").shift(),
          idThisPopover = "_" + idFrag + "Popover",
          oView = this.getView(),
          oObject =
            oObjectView === ""
              ? {}
              : oEvent.getSource().getParent().getRowBindingContext().getObject(),
          sFragmentName = "com.vesi.zfac4_valtoker.view.fragment.Detail." + idFrag,
          oModel = {
            Amdec1: [],
            Amdec2: [],
            AmdecComment1: "",
            AmdecComment2: "",
            FamilyCharact: [],
            DisplayMissingCharact: false,
            MissingImportantCharact: [],
            OtherProperties: [],
          };
        //AMDEC
        if (idFrag === "Amdec") {
          oModel.AmdecComment1 = oObject.AmdecTechnicalScoreComment;
          oModel.AmdecComment2 = oObject.AmdecSeverityScoreComment;
          for (let iAmdec in oAmdec) {
            let aAmdec = oAmdec[iAmdec];
            for (let iProp in aAmdec) {
              let sPropId = aAmdec[iProp],
                sPropDesc = sPropId.split("Id").shift() + "Desc",
                sI18n = "ModifiedInfoLbl" + sPropId,
                sPropIdValue = oObject[sPropId],
                sPropDescValue = oObject[sPropDesc];
              oModel[iAmdec].push({
                id: sPropIdValue,
                icon: sPropIdValue === "" ? "sap-icon://alert" : "",
                i18n: this.fnGetResourceBundle(sI18n),
                state: sPropIdValue === "" ? "Warning" : "Success",
                text: sPropIdValue === "" ? "" : sPropIdValue + " - " + sPropDescValue,
              });
            }
          }
        } else if (idFrag === "FamilyCharact") {
          oModel.FamilyCharact = oObject.FamilyCharacteristic;
          oModel.MissingImportantCharact = this._missingImportantCharact(oObject);
          if (oModel.MissingImportantCharact.length > 0) {
            oModel.DisplayMissingCharact = true;
          }
        } else if (idFrag === "OtherProperties") {
          oModel.OtherProperties = this._otherProperties(oObject);
        }
        this.fnSetJSONModel(oModel, "mDisplayPopover");
        if (!this[idThisPopover]) {
          this[idThisPopover] = Fragment.load({
            id: oView.getId(),
            name: sFragmentName,
            controller: this,
          }).then(function (oPopover) {
            oView.addDependent(oPopover);
            return oPopover;
          });
        }
        this[idThisPopover].then(function (oPopover) {
          oPopover.openBy(oObjectView);
        });
      },
      /*
       * Event fire for excel export
       */
      onExportXLS: function (oEvent) {
        if (!this.fnGetModel("mEquipment")) {
          return;
        }
        let oExcel = new Excel("Calibri 12", [
            {
              name: "Tab",
              bFreezePane: true,
              iCol: 0,
              iRow: 2,
            },
          ]),
          oData = this.fnGetModel("mEquipment").getData(),
          aColSize = {
            Sheet0: [], //Sheet 1
          },
          sRootPath = sap.ui.require.toUrl("com/vesi/zfac4_valtoker"),
          oColumnProperties = new JSONModel();
        if (!oData.list || (oData.list && oData.list.length === 0)) {
          return;
        }
        oColumnProperties.loadData(
          sRootPath + "/model/Config/Detail/ExcelExportedProperties.json",
          null,
          false
        ); // Config for properties
        oColumnProperties = oColumnProperties.getData();
        this._setExcelColumns(oExcel, aColSize, oColumnProperties);
        this._setExcelRows(oExcel, oData.list, aColSize, oColumnProperties);
        //Because we use bold for the font we have to had 1 to the colsize
        for (let i in aColSize.Sheet0) {
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
       * Event fire when press on button Synchronise with FSM
       */
      onSynchroniseWithFSM: function () {
        if (!this._oSynchroniseDialog) {
          this._oSynchroniseDialog = new sap.m.Dialog({
            type: sap.m.DialogType.Message,
            title: this.fnGetResourceBundle("DialogSynchronizeTitle"),
            content: new sap.m.Text({
              text: this.fnGetResourceBundle("DialogSynchronizeMessage"),
            }),
            beginButton: new sap.m.Button({
              type: sap.m.ButtonType.Emphasized,
              text: this.fnGetResourceBundle("yes"),
              press: function () {
                this.fnGetModel().callFunction(
                  "/SynchronizeWithFSMFull", // function import name
                  {
                    method: "POST", // http method
                    urlParameters: {
                      SiteId: this._SiteId,
                    }, // function import parameters
                    success: function (oData, response) {
                      sap.m.MessageToast.show(
                        this.fnGetResourceBundle("ToastSuccessSynchronizeMessage")
                      );
                    }.bind(this), // callback function for success
                  }
                ); // callback function for error
                this._oSynchroniseDialog.close();
              }.bind(this),
            }),
            endButton: new sap.m.Button({
              press: function () {
                this._oSynchroniseDialog.close();
              }.bind(this),
            }),
          });
        }
        this._oSynchroniseDialog.open();
      },
      /*
       * Event fire when needed after a selection on multicombobox
       */
      onSelectionFinishedMCBVH: function () {
        this.fnGetModel("mVH").refresh(true);
      },
      /*
       * Event fire when press on icon for object linked
       */
      onLinkedObject: function (oEvent) {
        let bSubEquipment = oEvent.getSource().getSrc() === "sap-icon://org-chart",
          oEquipment = oEvent.getSource().getParent().getRowBindingContext().getObject();
        this._getObjectLinkedDatas(bSubEquipment, oEquipment, oEvent);
      },
      /*
       * Event fire chen click on legend
       */
      fnOnPressLegend: function (oEvent) {
        let oIcon = oEvent.getSource(),
          oView = this.getView();
        if (!this._LegendPopover) {
          this._LegendPopover = Fragment.load({
            id: oView.getId(),
            name: "com.vesi.zfac4_valtoker.view.fragment.Detail.Legend",
            controller: this,
          }).then(function (oPopover) {
            oView.addDependent(oPopover);
            return oPopover;
          });
        }
        this._LegendPopover.then(function (oPopover) {
          oPopover.openBy(oIcon);
        });
      },
      onPressAnomalyMeasuringDocuments: function (oEvent) {
        this._oButton = oEvent.getSource();
        this._oSelectedEquipment = oEvent
          .getSource()
          .getParent()
          .getRowBindingContext()
          .getObject();
        this._fnOpenMeasurePopover();
      },
      onAfterOpen: async function (oEvent) {
        try {
          const oEquipment = this._oSelectedEquipment;
          const aMeasuringPoints =
            this.fnGetModel("oEquipmentAnomalyModel").getProperty("/measuringPoints");
          const aMeasures = aMeasuringPoints.filter(
            (oMeasurePoint) => oMeasurePoint.EquipmentId === oEquipment.EquipmentId
          );
          const aGetMeasureDocumentPromises = [];
          aMeasures.forEach((oMeasure) =>
            aGetMeasureDocumentPromises.push(this._fnGetMeasureDocument(oMeasure.MeasuringPointId))
          );
          const aMeasureDocuments = await Promise.all(aGetMeasureDocumentPromises);
          this.fnGetModel("oMeasure").setProperty("/measureDocuments", aMeasureDocuments);
          const oMeasuresDocs = {};
          aMeasureDocuments.forEach((oMeasureDocument) => {
            oMeasuresDocs[Object.keys(oMeasureDocument)[0]] =
              oMeasureDocument[Object.keys(oMeasureDocument)[0]];
          });
          this._fnAddPage(oMeasuresDocs, aMeasures);
        } catch (e) {
          BusyIndicator.hide();
          MessageBox.error(e.message);
        }
      },
      onAfterClose: function (oEvent) {
        oEvent.getSource().destroyContent();
      },
      _fnCreateTableColumns: function () {
        return [
          this._fnAddColumn("{i18n>DocumentId}"),
          this._fnAddColumn("{i18n>MeasureDate}"),
          this._fnAddColumn("{i18n>MeasuredBy}"),
          this._fnAddColumn("{i18n>Value}"),
        ];
      },
      _fnCreateTable: function (oMeasurePoint, aItems) {
        const sId = oMeasurePoint.MeasuringPointId;
        const oTable = new sap.m.Table({
          id: `table${sId}`,
          columns: this._fnCreateTableColumns(),
          items: aItems,
          noData: new sap.m.ObjectStatus({
            text: this.fnGetResourceBundle("noDataMeasureDocs"),
            state: "Warning",
          }),
        });
        return oTable;
      },
      _fnCreateHeader: function (oMeasurePoint) {
        const {
          MeasuringPointId,
          MeasuringPointName,
          MeasuringPointPosition,
          ValueMin,
          ValueTarget,
          ValueMax,
          Unit,
        } = oMeasurePoint;
        return new sap.m.VBox({
          alignItems: "Center",
          items: [
            new sap.m.HBox({
              items: [
                new sap.m.Title({
                  text: `ID ${MeasuringPointId}-${MeasuringPointName}-${MeasuringPointPosition}`,
                  textAlign: "Center",
                }),
              ],
            }),
            new sap.m.Text({
              text: `{i18n>MinValue}.: ${ValueMin} ${Unit}`,
              visible: ValueMin !== "",
            }),
            new sap.m.Text({
              text: `{i18n>TheoreticalValue}.: ${ValueTarget} ${Unit}`,
              visible: ValueTarget !== "",
            }),
            new sap.m.Text({
              text: `{i18n>MaxValue}.: ${ValueMax} ${Unit}`,
              visible: ValueMax !== "",
            }),
          ],
        });
      },
      _getStatusByMeasureValue: function (MeasureValue, ValueMax, ValueMin) {
        let sStatus = "None";
        if (isNaN(ValueMax) && isNaN(ValueMin)) return sStatus;
        if (MeasureValue < ValueMax && MeasureValue > ValueMin) {
          sStatus = "None";
        } else {
          sStatus = "Warning";
        }
        return sStatus;
      },
      _fnAddPage(oMeasureDocs, aMeasuresPoints) {
        const oPopover = this.getView().byId("MeasuringDocPopover");
        oPopover.setBusy(true);
        aMeasuresPoints.sort((a, b) => b.MeasuringPointId - a.MeasuringPointId);
        aMeasuresPoints.forEach((oMeasurePoint) => {
          const aItems = [];
          oMeasureDocs[oMeasurePoint.MeasuringPointId].forEach((oMeasureDoc) => {
            let { MeasureValue } = oMeasureDoc;
            let { ValueMax, ValueMin } = oMeasurePoint;
            MeasureValue = parseFloat(MeasureValue?.replaceAll(",", "."));
            ValueMax = parseFloat(ValueMax?.replaceAll(",", "."));
            ValueMin = parseFloat(ValueMin?.replaceAll(",", "."));
            aItems.push(
              new sap.m.ColumnListItem({
                cells: [
                  new sap.m.Text({ text: oMeasureDoc.MeasuringDocumentId }),
                  new sap.m.Text({
                    text: formatter.formatDate(oMeasureDoc.MeasureDate),
                  }),
                  new sap.m.Text({ text: oMeasureDoc.MeasureResp }),
                  new sap.m.ObjectStatus({
                    text: `${oMeasureDoc.MeasureValue} ${oMeasurePoint.Unit}`,
                    state: this._getStatusByMeasureValue(MeasureValue, ValueMax, ValueMin),
                  }),
                ],
              })
            );
          });
          if (sap.ui.getCore().byId(`table${oMeasurePoint.MeasuringPointId}`)) return;
          const oHeader = this._fnCreateHeader(oMeasurePoint);
          oHeader.addStyleClass("sapUiSmallMargin");
          const oContent = new sap.m.VBox({
            items: [oHeader, this._fnCreateTable(oMeasurePoint, aItems)],
          });
          oPopover.addContent(oContent);
        });
        oPopover.setBusy(false);
      },
      _fnAddColumn: function (sText) {
        return new sap.m.Column({ header: new sap.m.Label({ text: sText }) });
      },
      _fnInitMeasureModel: function () {
        const oMeasure = new JSONModel({ measureDocuments: [] });
        this.fnSetJSONModel(oMeasure, "oMeasure");
      },
      _fnOpenMeasurePopover: async function () {
        const oView = this.getView();
        this._oMeasurePopover ??= await Fragment.load({
          id: oView.getId(),
          name: `${FRAGMENT_PATH}MeasuringDocuments`,
          controller: this,
        });
        oView.addDependent(this._oMeasurePopover);
        this._oMeasurePopover.openBy(this._oButton);
      },
      _fnGetMeasureDocument: function (sMeasurePointId) {
        const oModel = this.getOwnerComponent().getModel();
        const aFilters = [new Filter("MeasuringPointId", FilterOperator.EQ, sMeasurePointId)];
        return new Promise((res, rej) => {
          oModel.read("/MeasuringDocumentSet", {
            filters: aFilters,
            success: (oData) => {
              const oReturn = {};
              oReturn[sMeasurePointId] = oData.results;
              res(oReturn);
            },
            error: (oError) => {
              rej(oError);
            },
          });
        });
      },
      onPressGeneratePecReport: function () {
        const oCrossAppNavigator = new sap.ushell.Container.getService(
          "CrossApplicationNavigation"
        );
        const mParams = {
          siteId: this._SiteId,
        };
        const hash =
          (oCrossAppNavigator &&
            oCrossAppNavigator.hrefForExternal({
              target: {
                semanticObject: "ZRapportPriseCharge",
                action: "display",
              },
              params: mParams,
            })) ||
          "";
        oCrossAppNavigator.toExternal({
          target: {
            shellHash: hash,
          },
        });
      },
    });
  }
);

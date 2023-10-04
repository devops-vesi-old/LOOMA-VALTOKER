![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/logo_dev_team.png)

# Technical Documentation - Takeover Validation Cockpit

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)
[![Quality Gate Status](https://sonarqube.vinci-energies.net/api/project_badges/measure?project=vesi-codex-developments-c4hana-veff-zfac4_valtoker&metric=alert_status&token=sqb_6499814ffc6a1793370f8ddff7430e3d1f1201a5)](https://sonarqube.vinci-energies.net/dashboard?id=vesi-codex-developments-c4hana-veff-zfac4_valtoker)
| Designation | Name |
| ----------- | ---- |
| Reviewer | Nicolas BOUCAUD |
| Author | Adrien BRUNEL |

# Document history
| Version | Date | Modification |
| ------- | ---- | ------------ |
| 1.0 | 02/05/2022 | Initial Version

# Table of contents
1. [Technical Details and Application Overview](#chapter1)
2. [Location Hierarchy](#chapter2)
	1. [Expand/Collapse All](#subchapter21)
	2. [Synchronise with FSM](#subchapter22)
	3. [Mass and Single Actions](#subchapter23)
3. [Equipment](#chapter3)
	1. [Mass and Single Actions](#subchapter31)
	2. [More details](#subchapter32)
	2. [Export Excel](#subchapter33)
4. [Takeover Validation Cockpit Backend](#chapter4)
	1. [SEGW](#subchapter41)
	2. [Change user status](#subchapter42)
	3. [synchronize to FSM](#subchapter43)

## Technical Details and Application Overview <a name="chapter1"></a>
### Technical objects
| Technical obj | Name |
| ------------- | ---- |
| UI5 App | zfac4_valtoker |
| Component ID | com.vesi |
| Git Repo | https://gitlab1.vinci-energies.net/vesi/codex/developments/c4hana/veff/zfac4_valtoker.git |

This document provides the information on the technical description for the Takeover Validation Cockpit application for the LOOMA project. It gives information about the GitLab URL, UI5 component name, OData services used, and some of the important features of the application.

This application is used for viewing a list of Site to validate the takeover. After having selected one, a new page allows the validation/deletion of functionnal location (Site/Building/Floor/Room) and the validation/deletion/return to takeover of equipment.
This is a custom SAPUI5 application and can be accessed with Vinci Fiori Launchpad.
This app has been configured in the launchpad to the group name LOOMA with the tile name “Cockpit de prise en charge”.

When the user clicks on the Takeover Validation Cockpit tile, the page will be navigated to the Home page of the application. This application has been developed with the Table Report.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/HomePage.png)

The home page shows the list of site. To filter the results various filter options have been provided. All the filter input fields are configurable and based on the user preference, the same can be adjusted.
There are some filters that are pre-populated by default:
- Takeover in progress = Only Takeover in progress
- Active/Inactive = Only Active

Services behind filters :
| Filter Name | Service Name | Entity called |
| ----------- | ------------ | ------------- |
| Contract | ZSRC4_VH_SRV | ContractSet |
| Site | ZSRC4_VH_SRV | SiteSet |
| Type | ZSRC4_VH_SRV | CharacteristicValueListSet?$filter=CharactId eq 'YLO_SITE_TYPE' |
| Status | ZSRC4_VH_SRV | UserStatusSet?$filter=Object eq 'LoomaLocation' and IsValPecFilterable eq true |
Filters directly implemented in the front :
| Filter Name |
| ----------- |
| Active/Inactive |
| Takeover in progress |

Service for the site list :
| Filter Name | Service Name | Entity called |
| ----------- | ------------ | ------------- |
| Site | ZSRC4_PEC_SRV | SiteSet |

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/HomePage%20-%20Filter.png)

Table columns displayed are adjustable and can be personalized based on the user’s preference.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/HomePage%20-%20Site%20-%20Personnalization.png)

Columns in the result table provide column-based filtering of the data and there is option to sort some columns.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/HomePage%20-%20Site%20-%20Sorting.png)

When the user clicks on the navigation arrow at the end of each row, a page will be navigated to the details page for the clicked Site, where details of the Site can be displayed in a Semantic page.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage.png)

At the top of the semantic page site, site's informations are displayed in titleExpandedContent. The site details page has multiple icon tabs which can be used to show information like Address and Contact. By clicking on each tab, this information can be accessed.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Site%20Header.png)

The detail page shows the location hierarchy of the site. To filter the results (equipment numbers) various filter options have been provided. All the filter input fields are configurable and based on the user preference, the same can be adjusted.
There are some filters that are pre-populated by default:
- Status = "To delete" and "Takeover done"

Services behind filters :
| Filter Name | Service Name | Entity called |
| ----------- | ------------ | ------------- |
| Domain | ZSRC4_VH_SRV | FamilySet and model JSON build in controller |
| Function | ZSRC4_VH_SRV | FamilySet and model JSON build in controller |
| Family | ZSRC4_VH_SRV | FamilySet and model JSON build in controller |
| Status | ZSRC4_VH_SRV | UserStatusSet?$filter=Object eq 'LoomaEquipment' and IsValPecFilterable eq true |

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Filter.png)

In the filter part we have a special switch button filter to display equipment number :
- No = Display the number of equipment directly assign to the location and below (in the hierarchy)
- Yes = Display the number of equipment only directly assign to the location

Both informations depending of the switch button are in the response of the webservice
No (Screenshot) :
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Direct%20OFF.png)

Yes (Screenshot) :
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Direct%20ON.png)

## Location hierarchy <a name="chapter2"></a>
First part (TOP) of the semancticContent is a TreeTable to display Location Hierarchy
Service for the site list :
| Filter Name | Service Name | Entity called |
| ----------- | ------------ | ------------- |
| Site | ZSRC4_PEC_SRV | LocationHierarchySet?$expand=EquipmentNumber |

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy.png)

## Expand/Collapse All <a name="subchapter21"></a>
Two buttons are available to collapse or expand all hierarchy.
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20Expand-Collapse.png)

## Synchronise with FSM <a name="subchapter22"></a>
A message is displayed at the top of the location hierarchy to informe the user if there is at least 1 location note validated.

The button **Synchronise with FSM** start an asynchronous process to generate IDOC for all location and equipement in a complete validated hierarchy

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20Synchronise%20with%20FSMpng.png)

In location hierarchy and equipement table two indicator (Highlight and icons) are present to inform the user about what will or will not be sent to FSM.
| Status for FSM | Highlight and Icon status |
| -------------- | ------------------------- |
| Will be sent | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20FSM%20OK.png) |
| Will not be sent because a superior element is not validated | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20FSM%20KO.png) | 
| Will not be sent because not in the right status |  ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20FSM%20KO%20empty.png) |

To synchronise with FSM, we use the following function import :
- POST : /ZSRC4_PEC_SRV/SynchronizeWithFSMFull?$SiteId='9501%2F0000016'

## Mass and Single Actions <a name="subchapter23"></a>
Two actions can be done on location hierarchy both available for mass or single object and one single action is only available on site.
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20Actions.png)

| Action | Single Action Icon | Mass Action |
| ------ | ------------------ | ----------- |
| Validation | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Validation.png) | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Mass%20Validation.png)|
| Deletion | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Deletion.png) | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Mass%20Deletion.png) |
| Close Takover | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Close%20Takeover.png) | N/A |

Mass buttons are enabled when at least one object il selected.
Single buttons are hide when the object already have the status.
To delete mass action is disabled when at least one selected object cannot be deleted.
To delete single action is disabled when at least one sub-object is not deleted.


To assign the new status we use the following service :
- POST UserStatusSet with payload
### Payload example
```JSON
{
    "Scope":"PEC",
    "EquipmentId":"", 
    "LocationId":"9501/0000016/002/0012",
    "UserStatusId":"E0003",
    "ToDelete":false
}
```

## Equipment <a name="chapter3"></a>
Display the equipment list associated to a location just by clicking on the location name in the hierarchy.
The list of equipement is depending of the filters in the top of the page avec the switch button (directly assign to a location).
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Equipment%20List.png)

Table columns displayed are adjustable and can be personalized based on the user’s preference.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Equipment%20-%20Personnalization.png)

## Mass and Single Actions <a name="subchapter31"></a>
Tree actions can be done on location hierarchy and available for mass or single object.
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Equipment%20-%20Actions.png)

| Action | Single Action Icon | Mass Action |
| ------ | ------------------ | ----------- |
| Validation | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Validation.png) | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Mass%20Validation.png)|
| Deletion | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Deletion.png) | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Mass%20Deletion.png) |
| Back to takover| ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Back%20to%20takeover.png) | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Mass%20Back%20to%20takeover.png) |

Mass buttons are enabled when at least one object il selected.
Single buttons are hide when the object already have the status.
To delete mass action is disabled when at least one selected object cannot be deleted.
To delete single action is disabled when at least one sub-object is not deleted.

To assign the new status we use the following service :
- POST UserStatusSet with payload
### Payload example
```JSON
{
    "Scope":"PEC",
    "EquipmentId":"3000003774", 
    "LocationId":"",
    "UserStatusId":"E0005",
    "ToDelete":false
}
```

## More details <a name="subchapter32"></a>
Many informations are displayed by simple and easy to identify element
AMDEC :
| Status | Icon status |
| ------ | ------ |
| All AMDEC are filled  | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/OK.png) |
| There is missing AMDEC | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Missing.png) | 

AMDEC indicator is clickable to display more information :
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/More%20Information%20-%20AMDEC.png)

Important family characteristic :
| Status | Icon status |
| ------ | ------ |
| All Important family characteristic are filled  | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/OK.png) |
| There is missing Important family characteristic| ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Missing.png) | 

Family characteristic indicator is clickable to display more information :
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/More%20Information%20-%20Family%20Characteristics.png)

In the column **Other properties** the icon is clickable to display more information :
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/More%20Information%20-%20Other%20Properties.png)

The main photo of the equipment can be display by clicking on ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Photo.png). This icon is visible if a photo is available.

## Export Excel <a name="subchapter33"></a>
The export excel is done by custom code using thirdparty library (implemented in VESI common library named zaclib).
Only properties and current values are exported (no Family Characteristics are exported).

### function to export excel 
```javascript
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
		sRootPath = sap.ui.require.toUrl("com/vesi/zfac4_valtoker"),
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
```		

## Takeover Validation Cockpit Backend <a name="chapter4"></a>

Takeover Validation Cockpit application was linked to an OData services name **ZSRC4_PEC_SRV** and **ZSRC4_VH_SRV**

## SEGW <a name="subchapter41"></a>
**ZSRC4_PEC_SRV**
Multiple Entity type are used to handle validation needs.
| Name | ABAP Structure | Used in Takeover Validation Cockpit |
| ----- | ----- | ----- |
| Anomaly | ZSC4_PEC_ANOMALY |  |
| Attachment | ZSC4_PEC_ATTACHMENT |  |
| Contract | ZSC4_PEC_CONTRACT_WITH_SCOPE |  |
| ContractContact | ZSC4_PEC_CONTACT |  |
| ContractSynthesis |  |  |
| Equipment | ZSC4_PEC_EQUIPMENT_WITH_SCOPE | Yes | 
| EquipmentNumber | ZSC4_PEC_LOCATION_EQUIPMENT_NB | Yes (by expand only) |
| FamilyCharacteristic | ZSC4_PEC_CHARACTERISTICS | Yes (by expand only) |
| Location | ZSC4_PEC_LOCATION_WITH_SCOPE |  |
| LocationHierarchy | ZSC4_PEC_LOCATION_HIERARCHY | Yes |
| ModifiedInfo | ZTC4_PEC_CHANGES | Yes (by expand only) |
| Photo | ZSC4_PEC_ATTACHMENT | Yes (by $value) |
| Site | ZSC4_PEC_SITE | Yes |
| SiteContact | ZSC4_PEC_CONTACT | Yes (by expand only) |
| UserStatus | ZSC4_PEC_CHANGE_USER_STATUS | Yes (For POST) |
| VFContact | ZSC4_PEC_CONTACT |  |

**ZSRC4_VH_SRV**
Multiple Entity type are used to handle validation needs.
| Name | ABAP Structure | Used in Takeover Validation Cockpit |
| ----- | ----- | ----- |
| Brand | ZSC4_VH_BRAND |  |
| CharacteristicValueList | ZSC4_VH_CHARACTERISTIC_VAL | Yes (by expand only) |
| Contract | ZSC4_VH_CONTRACT_2 |  |
| DDICDomainValueList | ZSC4_VH_DDIC_DOMAIN_VAL | Yes |
| Department | ZSC4_VH_DEPARTMENT | Yes |
| Family | ZSC4_VH_FAMILY | Yes |
| FamilyCharacteristic | ZSC4_VH_CHARACTERISTIC | Yes |
| Site | ZSC4_VH_SITE_2 |  |
| UserStatus | ZSC4_VH_ESTAT | Yes |

## Change user status <a name="subchapter42"></a>
In the **Validation cockpit** application there is only one modification implemented : change user status.

In the application, all modification actions are in fact only one and the same action, the change of user status.
Among these actions we will dissociate user status with or without status number.
The application manages only one status without number, it's the status of the site "Takeover in progress".

For the cases of status with sequence number, the affixing of a new status automatically deletes the old status.
For the cases of status without a sequence number, the deletion must also be managed.

In order to manage these 2 cases it is possible to perform these actions by the same service (UserStatusSet entity) in POST call.

At the end there it two methods implemented in the class ZCLC4_PEC:
- To change user status for equipment (CHANGE_EQUIPMENT_USER_STATUS)
- To change user status for location (CHANGE_LOCATION_USER_STATUS)

In this method we use a generic method to change user status on an object named **CHANGE_USER_STATUS** using standard BAPI **STATUS_CHANGE_EXTERN**

### Implementation of **CHANGE_USER_STATUS**
```ABAP
    "New status can't be empty - No change to do
    CHECK iv_new_status IS NOT INITIAL.

    "Change status
    CALL FUNCTION 'STATUS_CHANGE_EXTERN'
      EXPORTING
        objnr               = iv_objnr
        user_status         = iv_new_status
        set_inact           = iv_to_delete
      EXCEPTIONS
        object_not_found    = 1
        status_inconsistent = 2
        status_not_allowed  = 3
        OTHERS              = 4.

    IF sy-subrc NE 0.
      CASE sy-subrc.
        WHEN 1.
          RAISE object_not_found.
        WHEN 2.
          RAISE status_inconsistent.
        WHEN 3.
          RAISE status_not_allowed.
        WHEN OTHERS.
          EXIT.
      ENDCASE.
    ENDIF.
```

### Specific rules for equipments
When SCOPE = **PEC** and new status = **Back to takeover** (E0008), automatically we changed a second time the status by **To Takeover** (E0002)

```ABAP
    "Apply specifics rules if needed
      CASE iv_scope.
        WHEN c_scope_pec.
          IF iv_new_status EQ c_equipment_estat_ret_takeover.
            change_user_status( EXPORTING  iv_scope            = space
                                           iv_objnr            = lv_objnr
                                           iv_new_status       = c_equipment_estat_to_takeover
                                EXCEPTIONS object_not_found    = 1
                                           status_inconsistent = 2
                                           status_not_allowed  = 3
                                           OTHERS              = 4 ).
          ENDIF.

        WHEN OTHERS.
          EXIT. "No specifics rules
```

## Synchronize to FSM <a name="subchapter43"></a>
The action **Synchronize to FSM** generate IDOCs for all objects (Location and Equipment) that are on completely validated/deleted "branch".

Starting from the site and going down, as soon as an object is not validated/deleted, it's not sent and its sub-elements are not processed.

**Class** : ZCLC4_PEC
**Method** : SYNCHRONIZE_SITE_TO_FSM
 

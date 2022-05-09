![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/logo_dev_team.png)

# Technical Documentation - Takeover Validation Cockpit

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

| Designation | Name |
| ------ | ------ |
| Reviewer | Nicolas BOUCAUD |
| Author | Adrien BRUNEL |

# Document history
| Version | Date | Modification |
| ------ | ------ | ------ |
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
	2. [Quotation Creation](#subchapter42)
	3. [Quotation Update](#subchapter43)
	4. [Attachments](#subchapter44)
	5. [Partner](#subchapter45)

## Technical Details and Application Overview <a name="chapter1"></a>
### Technical objects
| Technical obj | Name |
| ------ | ------ |
| UI5 App | zfioac4_valpec |
| Component ID | com.vesi |
| Git Repo | https://gitlab1.vinci-energies.net/vesi/codex/developments/c4hana/veff/zfioac4_valpec.git |

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
| ------ | ------ | ------ |
| Contract | ZSRC4_VH_SRV | ContractSet |
| Site | ZSRC4_VH_SRV | SiteSet |
| Type | ZSRC4_VH_SRV | CharacteristicValueListSet?$filter=CharactId eq 'YLO_SITE_TYPE' |
| Status | ZSRC4_VH_SRV | UserStatusSet?$filter=Object eq 'LoomaLocation' and IsValPecFilterable eq true |
Filters directly implemented in the front :
| Filter Name |
| ------ |
| Active/Inactive |
| Takeover in progress |

Service for the site list :
| Filter Name | Service Name | Entity called |
| ------ | ------ | ------ |
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
| ------ | ------ | ------ |
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
| ------ | ------ | ------ |
| Site | ZSRC4_PEC_SRV | LocationHierarchySet?$expand=EquipmentNumber |

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy.png)

## Expand/Collapse All <a name="subchapter21"></a>
Two buttons are available to collapse or expand all hierarchy.
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20Expand-Collapse.png)

## Synchronise with FSM <a name="subchapter22"></a>
A message is displayed at the top of the location hierarchy to informe the user if there is at least 1 location note validated.

The button "Synchronise with FSM" start an asynchronous process to generate IDOC for all location and equipement in a complete validated hierarchy

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20Synchronise%20with%20FSMpng.png)

In location hierarchy and equipement table two indicator (Highlight and icons) are present to inform the user about what will or will not be sent to FSM.
| Status for FSM | Highlight and Icon status |
| ------ | ------ |
| Will be sent | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20FSM%20OK.png) |
| Will not be sent because a superior element is not validated | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20FSM%20KO.png) | 
| Will not be sent because not in the right status |  ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20FSM%20KO%20empty.png) |

To synchronise with FSM, we use the following function import :
- POST : /ZSRC4_PEC_SRV/SynchronizeWithFSMFull?$SiteId='9501%2F0000016'

## Mass and Single Actions <a name="subchapter23"></a>
Two actions can be done on location hierarchy both available for mass or single object.
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/DetailPage%20-%20Location%20hierarchy%20-%20Actions.png)

Mass buttons are enabled when at least one object il selected.
Single buttons are hide when the object already have the status.

To assign the new status we use the following service :
- POST UserStatusSet with payload
### Payload example
```JSON
{
    "Scope":"PEC",
    "EquipmentId":"", 
    "LocationId":"9501/0000016/002/0012",
    "UserStatusId":"E0003"
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

Mass buttons are enabled when at least one object il selected.
Single buttons are hide when the object already have the status.

To assign the new status we use the following service :
- POST UserStatusSet with payload
### Payload example
```JSON
{
    "Scope":"PEC",
    "EquipmentId":"3000003774", 
    "LocationId":"",
    "UserStatusId":"E0005"
}
```

## More details <a name="subchapter32"></a>
Many informations are displayed by simple and easy to identify element
AMDEC :
| Status | Icon status |
| ------ | ------ |
| All AMDEC are filled  | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/OK.png) |
| There is missing AMDEC | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Missing.png) | 

Important family characteristic :
| Status | Icon status |
| ------ | ------ |
| All Important family characteristic are filled  | ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/OK.png) |
| There is missing Important family characteristic| ![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/TakeoverValidationCockpit/Missing.png) | 

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

## Quotation Creation <a name="subchapter42"></a>

When a user click on **Save** on the Quotation creation front page, we check on the backend if the quotation have a created flag or not. If we are in creation mode the methode **CREATE_QUOTATION** is call.
In this methode all informations given by the user on the front page was dispatched in various table who will feed the call function of the BAPI **BAPI_QUOTATION_CREATEFROMDATA2**.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/CallBapiCreat.PNG?csf=1&web=1&e=YrjRQJ)

If this BAPI succed to create a quotation, **lv_quotation_number** will be feeded and used to add a new row in the quotation table history **ztc4_histo_quote** with the method **CREATE_QUOTATION_HISTORY**. We also give the amount and the version number to the method.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/QuotHisto.PNG?csf=1&web=1&e=Oc5e5Y)

After the succes of the **BAPI_TRANSACTION_COMMIT**, we call the method **CREATE_QUOTATION_ZPRV** who will create an **ZPRV** doctype QUOTATION, like the creation of the previous Quotation.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/CreateZPRV.PNG?csf=1&web=1&e=AvVhy0)

## Quotation Update <a name="subchapter43"></a>

When a user click on **Save** on the Quotation update front page, we check on the backend if the quotation have a created flag or not. If we are in update mode the methode **UPDATE_QUOTATION** is call.
In this methode all informations given by the user on the front page was dispatched in various table who will feed the call function of the BAPI **BAPI_QUOTATION_CREATEFROMDATA2**, but this time with table'X' who flaged all data who will needed to be updated.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/CallBapiUpdt.PNG?csf=1&web=1&e=OHdCWi)

The partner table in bapi call was blank because we will update partners on an other BAPI (**BAPI_SALESORDER_CHANGE**) , call inside the Method **update_quotation_partners**. 

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/updtQuotPart.PNG?csf=1&web=1&e=yMFb8n)

If the update was a versioning, we use Method **create_quotation_history** for this time update the actual version raw with an other status and create a new one with new status and new version number. 

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/QuotHistoMeth.PNG?csf=1&web=1&e=uL20ng)

Like for the creation, after all this step, we will call the method **update_quotation_zprv** to do the same update but for **ZPRV** Doctype.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/UpdtZPRV.PNG?csf=1&web=1&e=dbHrF0)

## Attachment <a name="subchapter44"></a>

On update mode, user can add attachment, the methode **CREATE_STREAM** will be call. On this method, 3 call Module function are needed to save the attachment.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/AttachmentBack.PNG?csf=1&web=1&e=a0zHJd)

Module function **SCMS_XSTRING_TO_BINARY** will convert the xstring value of the attachment to binary. After that, Module function **ARCHIVOBJECT_CREATE_TABLE** will archive the binary attachment and give us the **archiv_doc_id** of this document. This id will be used with other informations in the Module function **ARCHIV_CONNECTION_INSERT** to create raw in relative table with all informations needed to retrieve our document later.

When we need to retrieve quotation attachments, we use the Method **GET_STREAM**. On this Method we use 2 Module function to retrieve the attachment.

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/AttachmentBackGet.PNG?csf=1&web=1&e=kiyIlu)

Module function **ARCHIVOBJECT_GET_TABLE** will return the attachment binary table, used in Module function **SCMS_BINARY_TO_XSTRING** to transform attachment in type needed (XSTRING) by the front in return entity.

## Partner <a name="subchapter45"></a>

On creation/update page, multiple partner are display. This partner list can be retrieve with a select on mutltiple table (**TPAER**,**TPAR**,**TPART**,**VBPA**).

![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/PartnerSelect.PNG?csf=1&web=1&e=IJaAFq)

With the table filled by this select, we can now do other select to retrieve other informations needed by the front on dispaly/update mode (Name,PhoneNumber,Email), but all partner don't have the same type of number from SAP. We have 5 type of number for a partner, regarding of witch type of partner : 

- **PERNR**
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/PERNR.PNG?csf=1&web=1&e=8Wb3lA)

- **KUNNR**
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/KUNNR.PNG?csf=1&web=1&e=QIvAFl)

- **LIFNR**
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/LIFNR.PNG?csf=1&web=1&e=R8KKyv)

- **PARNR**
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/PARNR.PNG?csf=1&web=1&e=VStNth)

- **VERNR**
![image](https://vincienergies.sharepoint.com/:i:/r/sites/ttc-erp/Shared%20Documents/50%20-%20Domain%20space/T02%20-%20Dev/999%20-%20Miscellaneous/Logo%20Dev%20Team/Quotation/VERNR.PNG?csf=1&web=1&e=Amzodk)

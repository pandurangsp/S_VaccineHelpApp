/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
'use strict';

/**
 * Example of Require.js boostrap javascript
 */

// The UserAgent is used to detect IE11. Only IE11 requires ES5.
(function () {

  function _ojIsIE11() {
    var nAgt = navigator.userAgent;
    return nAgt.indexOf('MSIE') !== -1 || !!nAgt.match(/Trident.*rv:11./);
  };
  var _ojNeedsES5 = _ojIsIE11();

  requirejs.config(
    {
      baseUrl: 'js',
      paths:
      /* DO NOT MODIFY
      ** All paths are dynamicaly generated from the path_mappings.json file.
      ** Add any new library dependencies in path_mappings json file
      */
      // injector:mainReleasePaths
      {
        'knockout': 'libs/knockout/knockout-3.5.1.debug',
        'jquery': 'libs/jquery/jquery-3.5.1',
        'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.1',
        'hammerjs': 'libs/hammer/hammer-2.0.8',
        'ojdnd': 'libs/dnd-polyfill/dnd-polyfill-1.0.2',
        'ojs': 'libs/oj/v10.1.0/debug' + (_ojNeedsES5 ? '_es5' : ''),
        'ojL10n': 'libs/oj/v10.1.0/ojL10n',
        'ojtranslations': 'libs/oj/v10.1.0/resources',
        'text': 'libs/require/text',
        'signals': 'libs/js-signals/signals',
        'customElements': 'libs/webcomponents/custom-elements.min',
        'proj4': 'libs/proj4js/dist/proj4-src',
        'css': 'libs/require-css/css',
        'touchr': 'libs/touchr/touchr',
        'persist': '@samplesjsloc@/persist/debug',
        'corejs': 'libs/corejs/shim',
        'chai': 'libs/chai/chai-4.2.0',
        'regenerator-runtime': 'libs/regenerator-runtime/runtime'
      }
      // endinjector

    }
  );
}());

require(['ojs/ojbootstrap', 'ojs/ojcontext', 'knockout', 'ojs/ojarraydataprovider', 'ojs/ojpagingdataproviderview',
  './getDistrictSessions', 'ojs/ojpagingcontrol', 'ojs/ojradioset', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojaccordion',
  'ojs/ojmessages', 'ojs/ojknockout', 'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojtable', 'ojs/ojprogress-circle', 'ojs/ojlistview',
  'ojs/ojnavigationlist', 'ojs/ojswitcher', 'ojs/ojselectsingle', 'ojs/ojtoolbar', 'ojs/ojprogress-bar', 'ojs/ojdialog'
],
  function (Bootstrap, Context, ko, ArrayDataProvider, PagingDataProviderView, getDistrictSessions) {
    Bootstrap.whenDocumentReady().then(
      function () {
        function init() {
          class viewModel {
            constructor() {
              this.pincode = ko.observable("");
              this.centers = ko.observableArray([]);
              this.isBusy = ko.observable(false);
              this.frmDate = new Date();
              this.weeksDatesColumns = [];
              this.prevDsbld = ko.observable(true);
              this.messages = ko.observableArray([]);
              this.messagesDataprovider = new ArrayDataProvider(this.messages);
              this.selectedView = ko.observable("d");
              this.views = [{ name: "Districts", id: "d" }, { name: "Pincode", id: "p" }, { name: "Bengaluru", id: "b" }];
              this.viewsADP = new ArrayDataProvider(this.views, { keyAttributes: 'id' });
              this.districtTblCols = ko.observableArray([]);
              this.districtCount = ko.observable(0);
              this.dstSessions = ko.observableArray([]);
              this.dstSessionsADP = new ArrayDataProvider(this.dstSessions);
              this.dstSessionsPDP = ko.observable(new PagingDataProviderView(new ArrayDataProvider(this.dstSessions())));
              this.procssdDistrcts = ko.observable(0);
              this.dstSessionProgress = ko.observable(0);

              this.states = ko.observableArray([]);
              this.statesADP = new ArrayDataProvider(this.states, { keyAttributes: 'value' })
              this.state = ko.observable("");
              this.isStateDsbld = ko.observable(false);

              this.availblty = ko.observableArray([{ "label": "All", value: "all" }, { "label": "Available", "value": "avl" }, { "label": "Not Available", "value": "na" }]);
              this.availbltyADP = new ArrayDataProvider(this.availblty, { keyAttributes: 'value' })
              this.availbltyVal = ko.observable("");
              this.isAvlDsbld = ko.observable(true)

              this.districts = ko.observableArray([]);
              this.districtsADP = new ArrayDataProvider(this.districts, { keyAttributes: 'value' })
              this.district = ko.observable();

              this.isTblBusy = ko.observable(false);
              this.dstProcessedCount = ko.observable(0);
              this.alarmInterval = null;

              this.all18Arr = ko.observableArray([]);
              this.unavlbl18Arr = ko.observableArray([]);
              this.all18PDP = ko.observable(new PagingDataProviderView(new ArrayDataProvider([])));

              this.all45Arr = ko.observableArray([]);
              this.unavlbl45Arr = ko.observableArray([]);
              this.all45PDP = ko.observable(new PagingDataProviderView(new ArrayDataProvider([])));

              this.vaccAgeLimit = ko.observable("18");
              this.vaccTblBusy = ko.observable(false);
              this.vaccTblPDP = ko.observable();

              this.refreshTbl = async () => {
                this.isTblBusy(false);
                let session = this.dstSessions()[0];
                console.log("SESSION OBJ ", session);
                let cols = [];

                for (let ssn of Object.keys(session)) {
                  if ((ssn !== "district") && (ssn !== 'sessions') && (ssn !== 'id')) {
                    cols.push({ "headerText": ssn, "field": ssn, "template": "avlbltySlot" })
                  }
                  else if (ssn == 'district') {
                    cols.push({ "headerText": ssn, "template": "district", "field": ssn, "style": "white-space:normal;word-wrap:break-word; text-align: left;vertical-align: middle;font-size:1em;" });
                  }
                }

                this.districtTblCols(cols);
                console.log("TBL COLS ARE ", this.districtTblCols());

                this.dstSessionsPDP(new PagingDataProviderView(new ArrayDataProvider(this.dstSessions, { keyAttributes: "id" })));
              };

              this.sessionTblCol = [{
                "headerText": "Available Capacity",
                "field": "available_capacity"
              },
              {
                "headerText": "Date",
                "field": "date"
              }]
              this.centersADP = new ArrayDataProvider(this.centers, { keyAttributes: 'center_id' });
              this.getDataHandler = null;
              this.adp = ArrayDataProvider;

              this.resetPinCodeData = (evt) => {
                this.vaccineSessions([]);
                this.vaccineSessionsPDP(new PagingDataProviderView(new ArrayDataProvider([])));
              }

              this.pincodeChangeLsnr = (evt) => {
                this.vaccineSessions([]);
                this.vaccineSessionsPDP(new PagingDataProviderView(new ArrayDataProvider(this.vaccineSessions())));
                this.frmDate = new Date();
                this.prevDsbld(true);
                this.stopInterval();
              }

              this.getStates = async () => {
                try {
                  await fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/states`)
                    .then(response => {
                      if (!response.ok) {
                        throw "error"
                      }
                      else {
                        return response.json()
                      }
                    })
                    .then(data => {
                      let allStates = data.states.map(state => {
                        return { 'value': state.state_id, 'label': state.state_name }
                      });
                      this.states(allStates);
                    })
                }
                catch (e) {
                  this.messages([]);
                  let errObj = {
                    severity: "error",
                    summary: "Error",
                    detail: "Could not get states",
                    timestamp: new Date().toLocaleString()
                  }
                  this.messages.push(errObj);
                }
              }

              this.getStates();

              this.getDistricts = async (state) => {
                console.log("STATE IS ", state);
                if (state) {
                  try {
                    await fetch("https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + state)
                      .then(response => {
                        if (!response.ok) {
                          throw "error"
                        }
                        else {
                          return response.json()
                        }
                      })
                      .then(data => {
                        let allDistricts = data.districts.map(district => {
                          return { 'value': district.district_id, 'label': district.district_name }
                        });
                        this.districts(allDistricts);
                        this.districtCount(allDistricts.length);
                      })
                  }
                  catch (e) {
                    this.messages([]);
                    let errObj = {
                      severity: "error",
                      summary: "Error",
                      detail: "Could not get districts",
                      timestamp: new Date().toLocaleString()
                    }
                    this.messages.push(errObj);
                  }
                }
              }

              this.blrTblInterval = null;

              this.initADPs = () => {
                this.all18Arr([]);
                this.all18PDP(new PagingDataProviderView(new ArrayDataProvider([])));

                this.all45Arr([]);
                this.all45PDP(new PagingDataProviderView(new ArrayDataProvider([])));
              }

              this.onTabChange = (evt) => {
                clearInterval(this.vaccDstTblInterval)
                if (this.blrTblInterval) {
                  clearInterval(this.blrTblInterval);
                }
                if (evt.detail.value == 'd') {
                  this.stopDstTblRefresh();
                  this.initADPs()
                  this.state("");
                  this.dstSessions([]);
                  this.dstSessionsPDP(new PagingDataProviderView(new ArrayDataProvider([])));
                  this.vaccAgeLimit("18");
                }
                if (evt.detail.value == 'b') {
                  this.stopBlRefresh();
                  this.blrTblBusy(true);
                  this.blrVaccType("18");
                  this.initADPs();
                  this.getBengaluruVaccines();
                }
              }

              this.processMsg = ko.observable("");

              this.onStateChange = async (evt) => {
                if (evt.detail.value) {
                  this.isTblBusy(true);
                  this.availbltyVal('');
                  this.isStateDsbld(true);
                  this.isAvlDsbld(true);
                  this.dstSessions([]);
                  this.districtCount(0);
                  this.dstSessionProgress(0);

                  await this.getDistricts(evt.detail.value);
                  console.log("DISTRICTS ARE ", this.districts());
                  this.processMsg("0 of " + this.districts().length + " districts processed");
                  if (this.districts().length > 0) {
                    this.dw = new Worker('./js/worker/getVaccinesByState.js');
                    this.dw.postMessage(this.districts());
                    this.dw.onmessage = async (event) => {
                      if (event.data.status == "error") {
                        this.messages([]);
                        let errObj = {
                          severity: "error",
                          summary: "Error",
                          detail: evt.data,
                          timestamp: new Date().toLocaleString()
                        }
                        this.messages.push(errObj);
                      }
                      else {
                        let sessionsWrkr = new Worker('./js/worker/getVaccinesByDistrict.js');
                        sessionsWrkr.postMessage(event.data);

                        sessionsWrkr.onmessage = (evt) => {
                          console.log("SESSIONS RECVD are ", evt.data.allDistricts)
                          this.processMsg(evt.data.dstProcessedCount + " of " + this.districts().length + " districts processed")

                          if ((!evt.data.error) && (evt.data.isComplete)) {
                            this.dstSessions(evt.data.allDistricts)
                            this.refreshTbl();
                          }
                        }
                      }
                    }
                  }
                }
              }

              this.backupSessions = ko.observableArray([]);

              this.onAvlbltyChange = (evt) => {

                this.dstSessions(this.backupSessions());
                console.log("AVAILABILITY ", evt.detail.value);
                this.isAvlDsbld(true);
                this.isStateDsbld(true);
                if (evt.detail.value == 'avl') {
                  let sessions = this.dstSessions().filter(sessn => sessn.available > 0)
                  this.dstSessions(sessions);
                  this.isAvlDsbld(false);
                  this.isStateDsbld(false);
                }
                else if (evt.detail.value == 'na') {
                  let sessions = this.dstSessions().filter(sessn => sessn.available == 0)
                  this.dstSessions(sessions);
                  this.isAvlDsbld(false);
                  this.isStateDsbld(false);
                }
                else if (evt.detail.value == 'all') {
                  this.dstSessions(this.backupSessions());
                  this.isAvlDsbld(false);
                  this.isStateDsbld(false);
                }
                this.dstSessionsPDP(new PagingDataProviderView(new ArrayDataProvider(this.dstSessions)));
              }

              this.populateWeeksDates = (frmDt) => {
                this.weeksDatesColumns = [];
                let date = new Date(frmDt);
                this.weeksDatesColumns.push({ "headerText": "Address", "field": "address", "template": "addressRenderer", "sortable": "disabled", "style": "white-space:normal;word-wrap:break-word; text-align: center;vertical-align: middle;width:20%;" })
                let dt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', year: 'numeric', month: '2-digit' }).format(date);
                this.weeksDatesColumns.push({ headerText: dt.replace(/\//ig, '-'), field: dt.replace(/\//ig, '-'), "template": "valRenderer", "sortable": "disabled" });
                for (let i = 0; i <= 5; i++) {
                  date.setDate(date.getDate() + 1);
                  let dt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', year: 'numeric', month: '2-digit' }).format(date);
                  this.weeksDatesColumns.push({ headerText: dt.replace(/\//ig, '-'), field: dt.replace(/\//ig, '-'), "template": "valRenderer", "sortable": "disabled" });
                }
              }

              this.stopInterval = () => {
                console.log("CLEARING INTERVALS");
                if (this.getDataHandler) {
                  clearInterval(this.getDataHandler);
                }
                if (this.alarmInterval) {
                  clearInterval(this.alarmInterval);
                }
                this.centers([]);
                this.isBusy(false);
              }

              this.vaccineSessions = ko.observableArray([]);
              this.vaccineSessionsPDP = ko.observable(new PagingDataProviderView(new ArrayDataProvider(this.vaccineSessions())));

              this.getVaccineDetails = () => {
                try {
                  if (this.pincode() && this.pincode().length > 0) {
                    this.isBusy(true)
                    this.centers([]);
                    //
                    var w = new Worker('./js/worker/getVaccineSessions.js');
                    let dt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', year: 'numeric', month: '2-digit' }).format(this.frmDate);
                    this.getDataHandler = setInterval(() => { //this.isBusy(true); 
                      w.postMessage({ 'pincode': this.pincode(), 'date': dt.replace(/\//ig, '-'), "template": "valRenderer", "sortable": "disabled" });
                    }, 10000);

                    w.onmessage = (event) => {
                      if (event.data == "error") {
                        this.stopInterval();
                        this.messages([]);
                        let errObj = {
                          severity: "error",
                          summary: "Error",
                          detail: "Could not get data",
                          timestamp: new Date().toLocaleString()
                        }
                        this.messages.push(errObj);
                      }
                      else {

                        this.vaccineSessions([]);
                        let isVaccPresent = false;
                        let centers = event.data.centers.map(center => {
                          let sessions = {};
                          center.sessions.map(session => {
                            if (session.available_capacity > 0) {
                              let obj = {};

                              obj["address"] = center.name + "-" + center.address;
                              if ((session.min_age_limit == 18) && (session.available_capacity_dose1 > 0)) {
                                isVaccPresent = true
                              }
                              obj[session.date] = session.available_capacity + "-" + session.min_age_limit + "-" + session.vaccine + "-" + session.available_capacity_dose1 + "-" + session.available_capacity_dose2;
                              sessions = { ...sessions, ...obj };
                            }
                            //columns.push({ "headerText": session.date, "field": session.date, "template": "valRenderer", "sortable": "disabled" })

                          });

                          center.columns = this.weeksDatesColumns;
                          center.sessions = Object.keys(sessions).length > 0 ? [sessions] : [];
                          if (center.sessions.length > 0) {
                            this.vaccineSessions.push(center.sessions[0]);
                          }
                          return center;
                        })
                        console.log("CENTERS ARE ", centers);

                        this.vaccineSessionsPDP(new PagingDataProviderView(new ArrayDataProvider(this.vaccineSessions())));
                        if (centers.length > 0) {
                          this.centers(centers);
                        }
                        else {
                          this.stopInterval();
                          this.messages([]);
                          let errObj = {
                            severity: "info",
                            summary: "Information",
                            detail: "No sessions available for the selected date " + this.frmDate + ". Showing previous week's data",
                            timestamp: new Date().toLocaleString()
                          }
                          this.messages.push(errObj);
                          this.getPrevWeekData();
                        }
                        this.isBusy(false);
                      }
                    }
                  }
                }
                catch (e) {
                  console.log(e);
                  this.stopInterval();
                  this.messages([]);
                  let errObj = {
                    severity: "error",
                    summary: "Error",
                    detail: e,
                    timestamp: new Date().toLocaleString()
                  }
                  this.messages.push(errObj);
                }
              }

              this.getNextWeekData = () => {
                console.log("GETTING NEXT WEEEK DETAILS")
                this.stopInterval();
                this.frmDate.setDate(this.frmDate.getDate() + 7);
                this.populateWeeksDates(this.frmDate);
                this.prevDsbld(false);
                this.getVaccineDetails();
              }

              this.getPrevWeekData = () => {
                this.stopInterval();
                if (!this.frmDate.getDate() - 7 < new Date().getDate()) {
                  console.log("GETTING PREV WEEEK DETAILS")
                  this.frmDate.setDate(this.frmDate.getDate() - 7);
                  this.populateWeeksDates(this.frmDate);
                  if (this.frmDate.getDate() == new Date().getDate()) {
                    this.prevDsbld(true);
                  }
                  this.getVaccineDetails();
                }
              }

              this.populateWeeksDates(this.frmDate);

              this.formatVaccineDetails = async (vaccineDtl) => {
                let vaccines = Object.keys(vaccineDtl);
                let rows = [];
                await new Promise((resolve) => {
                  vaccines.map(vaccine => {
                    let ages = Object.keys(vaccineDtl[vaccine]);
                    ages.map(age => {
                      let obj = {};
                      obj["name"] = vaccine;
                      obj["age"] = age;
                      obj["avlbl"] = vaccineDtl[vaccine][age];
                      console.log("ADDING ROW ", obj);
                      rows.push(obj);
                    })
                  })
                  resolve(rows)
                });
                return new ArrayDataProvider(rows);
              }

              this.currentSessions = ko.observableArray([]);
              this.currentSessionsADP = new ArrayDataProvider(this.currentSessions);


              this.currentDistrictID = ko.observable("");

              this.openSessionPopup = (evt, context, data) => {
                let districtID = context.row.id;
                this.currentDistrictID(districtID);
                console.log("ROW is ", context.row);
                this.getDistrictData();
              }

              this.getDistrictData = () => {
                getDistrictSessions(this.currentDistrictID()).then(data => {
                  console.log("DISTRICT SESSIONS ", data);
                  if (data["18-d1"] > 0) {
                    var audio = new Audio('./media/Alarm07.wav');
                    audio.play();
                  }
                  this.all18Arr(data['18']);
                  this.all45Arr(data['45']);
                  this.unavlbl18Arr(data['unavlbl18']);
                  this.unavlbl45Arr(data['unavlbl45']);
                  this.populateVaccTblData(this.vaccAgeLimit());
                }).then(() => {
                  document.getElementById('sessionPopup').open()
                })
              }

              this.blrTblData = ko.observable(new PagingDataProviderView(new ArrayDataProvider([])));
              this.blrVaccType = ko.observable("");
              this.blrTblBusy = ko.observable(false);
              this.refreshRate = ko.observable(null);

              this.refreshRates = [
                { value: 10000, label: "10 Seconds" },
                { value: 15000, label: "15 Seconds" },
                { value: 20000, label: "20 Seconds" },
                { value: 25000, label: "25 Seconds" },
              ];
              this.refreshRatesADP = new ArrayDataProvider(this.refreshRates, { keyAttributes: "value" });

              this.changeRefreshRate = (evt) => {
                if (evt.detail.value > 0) {
                  console.log("CHANGING REFRESH RATE")
                  this.refreshRate(evt.detail.value);
                  clearInterval(this.blrTblInterval);
                  this.blrTblInterval = setInterval(() => this.getBengaluruVaccines(), this.refreshRate());
                }
              }

              this.refreshRateDst = ko.observable(-1);
              this.vaccDstTblInterval = null;
              this.changeRefreshRateDstTbl = (evt) => {
                if (evt.detail.value > 0) {
                  console.log("CHANGING REFRESH RATE")
                  this.refreshRateDst(evt.detail.value);
                  clearInterval(this.blrTblInterval);
                  this.vaccDstTblInterval = setInterval(() => this.getDistrictData(), this.refreshRateDst());
                }
              }

              this.stopBlRefresh = () => {
                this.refreshRate(-1);
                clearInterval(this.blrTblInterval);
              }

              this.stopDstTblRefresh = () => {
                this.refreshRateDst(-1);
                this.vaccAgeLimit("18");
                clearInterval(this.vaccDstTblInterval);
              }

              this.filterBlrVacc = ko.observable();

              this.filterByAddress = (evt) => {
                let val = evt.detail.value;
                if (val.length > 0) {
                  let rows = this.vaccTblPDP().dataProvider.data.filter(row => row.address.toLowerCase().indexOf(val.toLowerCase()) > -1);
                  this.vaccTblPDP(new PagingDataProviderView(new ArrayDataProvider(rows)))
                }
                else {
                  this.populateVaccTblData(this.blrVaccType());
                }
              }


              this.filterDstVacc = ko.observable();
              this.filterByAddressDst = (evt) => {
                
                let val = evt.detail.value;
                if (val.length > 0) {
                  let rows = this.vaccTblPDP().dataProvider.data.filter(row => row.address.toLowerCase().indexOf(val.toLowerCase()) > -1);
                  this.vaccTblPDP(new PagingDataProviderView(new ArrayDataProvider(rows)))
                }
                else {
                  this.populateVaccTblData(this.vaccAgeLimit());
                }
              }

              this.populateVaccTblData = (type) => {
                console.log("TYPE IS ", type)
                switch (type) {
                  case '18': this.vaccTblPDP(new PagingDataProviderView(new ArrayDataProvider(this.all18Arr())));
                    break;

                  case '45': this.vaccTblPDP(new PagingDataProviderView(new ArrayDataProvider(this.all45Arr())));
                    break;

                  case 'un18': this.vaccTblPDP(new PagingDataProviderView(new ArrayDataProvider(this.unavlbl18Arr())));
                    break;

                  case 'un45': this.vaccTblPDP(new PagingDataProviderView(new ArrayDataProvider(this.unavlbl45Arr())));
                    break;
                }
              }

              this.changeBlrTblData = (evt) => {
                this.blrTblBusy(true);
                let type = evt.detail.value;
                this.populateVaccTblData(type);
                this.blrTblBusy(false);
              }

              this.changeVaccTblData = (evt) => {
                this.vaccTblBusy(true);
                let type = evt.detail.value;
                this.populateVaccTblData(type);
                this.vaccTblBusy(false);
              }

              this.getBengaluruVaccines = () => {
                this.blrTblBusy(true);
                getDistrictSessions(294).then(data => {
                  console.log("DATA IS ", data);
                  this.all18Arr(data['18']);
                  this.all45Arr(data['45']);
                  this.unavlbl18Arr(data['unavlbl18']);
                  this.unavlbl45Arr(data['unavlbl45']);
                  if (data["18-d1"] > 0) {
                    var audio = new Audio('./media/Alarm07.wav');
                    audio.play();
                  }
                  this.blrTblBusy(false);
                }).then(() => {
                  this.populateVaccTblData(this.blrVaccType());
                }).catch(e => {
                  clearInterval(this.blrTblInterval)
                  this.blrTblData(new PagingDataProviderView(new ArrayDataProvider([])));
                  this.blrTblBusy(false);
                  console.log(e);
                  this.stopInterval();
                  this.messages([]);
                  let errObj = {
                    severity: "error",
                    summary: "Error",
                    detail: e,
                    timestamp: new Date().toLocaleString()
                  }
                  this.messages.push(errObj);
                })
              }
            }
          }

          ko.applyBindings(new viewModel())
        }

        // If running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready
        // event before executing any code that might interact with Cordova APIs or plugins.
        if (document.body.classList.contains('oj-hybrid')) {
          document.addEventListener('deviceready', init);
        } else {
          init();
        }
        // release the application bootstrap busy state
        Context.getPageContext().getBusyContext().applicationBootstrapComplete();
      });
  }
);

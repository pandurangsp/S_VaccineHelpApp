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

require(['ojs/ojbootstrap', 'ojs/ojcontext', 'knockout', 'ojs/ojarraydataprovider', 'ojs/ojmessages',
  'ojs/ojknockout', 'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojtable', 'ojs/ojprogress-circle',
  'ojs/ojnavigationlist', 'ojs/ojswitcher', 'ojs/ojselectsingle', 'ojs/ojtoolbar', 'ojs/ojprogress-bar'],
  function (Bootstrap, Context, ko, ArrayDataProvider) {
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
              this.views = [{ name: "Pincode", id: "p" }, { name: "Districts", id: "d" }];
              this.viewsADP = new ArrayDataProvider(this.views, { keyAttributes: 'id' });
              this.districtTblCols = ko.observableArray([]);
              this.districtCount = ko.observable(0);
              this.dstSessions = ko.observableArray([]);
              this.dstSessionsADP = new ArrayDataProvider(this.dstSessions, { keyAttributes: "session_id" });
              this.procssdDistrcts = ko.observable(0);
              this.dstSessionProgress = ko.observable(0);

              this.states = ko.observableArray([]);
              this.statesADP = new ArrayDataProvider(this.states, { keyAttributes: 'value' })
              this.state = ko.observable("");
              this.isStateDsbld = ko.observable(false);

              this.availblty = ko.observableArray([{ "label": "All", value: "all" }, { "label": "Available", "value": "avl" }]);
              this.availbltyADP = new ArrayDataProvider(this.availblty, { keyAttributes: 'value' })
              this.availbltyVal = ko.observable("");
              this.isAvlDsbld = ko.observable(true)

              this.districts = ko.observableArray([]);
              this.districtsADP = new ArrayDataProvider(this.districts, { keyAttributes: 'value' })
              this.district = ko.observable();

              ko.computed(() => {
                console.log("DISTRICT COUNT ", this.districtCount());
                if (this.districtCount() > 0) {
                  let progress = (this.procssdDistrcts() / this.districtCount()) * 100;
                  this.dstSessionProgress(Math.round(progress));

                  console.log("Progress ", this.dstSessionProgress());

                  if ((this.dstSessionProgress() == 100) && (this.dstSessions().length > 0)) {
                    let session = this.dstSessions()[0];
                    let cols = Object.keys(session).map(ssn => {
                      return { "headerText": ssn, "field": ssn }
                    });
                    this.districtTblCols(cols);
                    this.isStateDsbld(false);
                    this.isAvlDsbld(false);
                  }
                }
                else {
                  this.dstSessionProgress(0);
                }

              });

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

              this.pincodeChangeLsnr = (evt) => {
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

              this.getDitrictInterval = null

              this.onTabChange = (evt) => {
                if (evt.detail.value == 'd') {
                  this.state("");
                }
                else {
                  clearInterval(this.getDitrictInterval);
                }
              }

              this.onStateChange = async (evt) => {
                if (evt.detail.value) {
                  this.availbltyVal('');
                  this.isStateDsbld(true);
                  this.isAvlDsbld(true);
                  this.dstSessions([]);
                  this.districtCount(0);
                  this.dstSessionProgress(0);

                  await this.getDistricts(evt.detail.value);
                  console.log("DISTRICTS ARE ", this.districts());
                  if (this.districts().length > 0) {
                    this.dw = new Worker('./js/worker/getVaccinesByState.js');
                    this.dw.postMessage(this.districts());

                    this.dw.onmessage = (event) => {
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
                        this.dstSessions(event.data.sessions.data);
                        this.backupSessions(event.data.sessions.data);
                        console.log("SESSIONS ", this.dstSessions());
                        this.procssdDistrcts(event.data.districts);
                      }
                    }
                  }
                }
              }

              this.backupSessions = ko.observableArray([]);


              this.onAvlbltyChange = (evt) => {
                console.log("AVAILABILITY ", evt.detail.value);
                this.isAvlDsbld(true);
                this.isStateDsbld(true);
                if (evt.detail.value == 'avl') {
                  let sessions = this.dstSessions().filter(sessn => sessn.available > 0)
                  this.dstSessions(sessions);
                  this.isAvlDsbld(false);
                  this.isStateDsbld(false);
                }
                else if (evt.detail.value == 'all'){
                  this.dstSessions(this.backupSessions());
                  this.isAvlDsbld(false);
                  this.isStateDsbld(false);
                }
              }

              this.populateWeeksDates = (frmDt) => {
                this.weeksDatesColumns = [];
                let date = new Date(frmDt);
                this.weeksDatesColumns.push({ "headerText": "Address", "field": "address", "template": "addressRenderer", "sortable": "disabled", "style": "white-space:normal;word-wrap:break-word; text-align: center;vertical-align: middle;width:10%;" })
                let dt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: '2-digit' }).format(date);
                this.weeksDatesColumns.push({ headerText: dt.replace(/\//ig, '-'), field: dt.replace(/\//ig, '-'), "template": "valRenderer", "sortable": "disabled" });
                for (let i = 0; i <= 5; i++) {
                  date.setDate(date.getDate() + 1);
                  let dt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: '2-digit' }).format(date);
                  this.weeksDatesColumns.push({ headerText: dt.replace(/\//ig, '-'), field: dt.replace(/\//ig, '-'), "template": "valRenderer", "sortable": "disabled" });
                }
              }

              this.stopInterval = () => {
                if (this.getDataHandler) {
                  console.log("CLEARING INTERVALS");
                  clearInterval(this.getDataHandler);
                }
                this.centers([]);
                this.isBusy(false);
              }


              this.getVaccineDetails = () => {
                try {
                  if (this.pincode() && this.pincode().length > 0) {
                    this.isBusy(true)
                    this.centers([]);
                    //
                    var w = new Worker('./js/worker/getVaccineSessions.js');
                    let dt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: '2-digit' }).format(this.frmDate);
                    this.getDataHandler = setInterval(() => { //this.isBusy(true); 
                      w.postMessage({ 'pincode': this.pincode(), 'date': dt.replace(/\//ig, '-'), "template": "valRenderer", "sortable": "disabled" });
                    }, 3000);

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
                        let centers = event.data.centers.map(center => {
                          let sessions = {};
                          center.sessions.map(session => {
                            let obj = {};
                            obj["address"] = center.name + "-" + center.address;
                            obj[session.date] = session.available_capacity + "-" + session.min_age_limit + "-" + session.vaccine;

                            sessions = { ...sessions, ...obj };
                            //columns.push({ "headerText": session.date, "field": session.date, "template": "valRenderer", "sortable": "disabled" })

                          });

                          center.columns = this.weeksDatesColumns;
                          center.sessions = [sessions];

                          return center;
                        })
                        console.log("CENTERS ARE ", centers);
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
                console.log("GETTING PREV WEEEK DETAILS")
                this.stopInterval();
                if (!this.frmDate.getDate() - 7 < new Date().getDate()) {
                  this.frmDate.setDate(this.frmDate.getDate() - 7);
                  this.populateWeeksDates(this.frmDate);
                  if (this.frmDate.getDate() == new Date().getDate()) {
                    this.prevDsbld(true);
                  }
                  this.getVaccineDetails();
                }
              }

              this.populateWeeksDates(this.frmDate);

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

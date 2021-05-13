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
  'ojs/ojknockout', 'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojtable', 'ojs/ojprogress-circle'],
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
              this.prevDsbld = ko.observable(false);
              this.messages = ko.observableArray([]);
              this.messagesDataprovider = new ArrayDataProvider(this.messages);

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

              this.stopInterval = () => {
                console.log("INTERVAL ", this.getDataHandler);
                if (this.getDataHandler) {
                  console.log("CLEARING INTERVALS");
                  clearInterval(this.getDataHandler);
                }
                this.centers([]);
                this.isBusy(false);
              }


              this.getVaccineDetails = () => {
                try {
                  this.isBusy(true)
                  this.centers([]);
                  var w = new Worker('./js/worker/getVaccineSessions.js');
                  let dt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: '2-digit' }).format(this.frmDate);
                  this.getDataHandler = setInterval(() => { //this.isBusy(true); 
                    w.postMessage({ 'pincode': this.pincode(), 'date': dt.replace(/\//ig, '-') });
                  }, 3000);

                  w.onmessage = (event) => {
                    console.log("EVENT DATA ", event, event.data);
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
                        let columns = [];
                        columns.push({ "headerText": "Address", "field": "address", "template": "addressRenderer","sortable":"disabled" })
                        center.sessions.map(session => {
                          let obj = {};
                          obj["address"] = center.name + "-" + center.address;
                          obj[session.date] = session.available_capacity + "-" + session.min_age_limit + "-" + session.vaccine;

                          sessions = { ...sessions, ...obj };
                          columns.push({ "headerText": session.date, "field": session.date, "template": "valRenderer","sortable":"disabled" })

                        });

                        center.columns = columns;
                        center.sessions = [sessions];
                        return center;
                      })

                      this.centers(centers);
                      this.isBusy(false);
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
                this.stopInterval();
                this.frmDate.setDate(this.frmDate.getDate() + 7);
                this.prevDsbld(false);
                this.getVaccineDetails();
              }

              this.getPrevWeekData = () => {
                this.stopInterval();
                this.frmDate.setDate(this.frmDate.getDate() - 7);
                if (this.frmDate.getDate() == new Date().getDate()) {
                  this.prevDsbld(true);
                }
                this.getVaccineDetails();
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

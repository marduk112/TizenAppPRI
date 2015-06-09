/*global tizen, console*/
(function () {
    'use strict';
    var systeminfo = {

        systeminfo: null,

        lowThreshold: 0.04,

        listenBatteryLowState: function () {
            var self = this;
            try {
                this.systeminfo.addPropertyValueChangeListener(
                    'BATTERY',
                    function change(battery) {
                        if (!battery.isCharging) {
                            try {
                                tizen.application.getCurrentApplication()
                                    .exit();
                            } catch (err) {
                                console.error('Error: ', err.message);
                            }
                        }
                    },
                    {
                        lowThreshold: self.lowThreshold
                    },
                    function onerror(err) {
                        console.error(err.message);
                    }
                );
            } catch (err) {
                console.error('Error: ', err.message);
            }
        },

        checkBatteryLowState: function () {
            var self = this;
            try {
                this.systeminfo.getPropertyValue(
                    'BATTERY',
                    function (battery) {
                        if (battery.level < self.lowThreshold &&
                            !battery.isCharging) {
                            try {
                                tizen.application.getCurrentApplication()
                                    .exit();
                            } catch (e) {
                                console.error('Error: ', e.message);
                            }
                        }
                    },
                    null
                );
            } catch (e) {
                console.error('Error: ', e.message);
            }
        },

        init: function () {
            if (typeof tizen === 'object' &&
                    typeof tizen.systeminfo === 'object') {
                this.systeminfo = tizen.systeminfo;
                this.checkBatteryLowState();
                this.listenBatteryLowState();
            }
            else {
                console.warn('tizen.systeminfo is not available.');
            }
        }
    };

    systeminfo.init();

} ());

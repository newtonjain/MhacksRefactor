cordova.define("code-push.AcquisitionManager", function(require, exports, module) { /// <reference path="../definitions/harness.d.ts" />
var AcquisitionStatus = (function () {
    function AcquisitionStatus() {
    }
    AcquisitionStatus.DeploymentSucceeded = "DeploymentSucceeded";
    AcquisitionStatus.DeploymentFailed = "DeploymentFailed";
    return AcquisitionStatus;
})();
exports.AcquisitionStatus = AcquisitionStatus;
var AcquisitionManager = (function () {
    function AcquisitionManager(httpRequester, configuration) {
        this._httpRequester = httpRequester;
        this._serverUrl = configuration.serverUrl;
        if (this._serverUrl.slice(-1) !== "/") {
            this._serverUrl += "/";
        }
        this._deploymentKey = configuration.deploymentKey;
        this._ignoreAppVersion = configuration.ignoreAppVersion;
    }
    AcquisitionManager.prototype.queryUpdateWithCurrentPackage = function (currentPackage, callback) {
        var _this = this;
        if (!currentPackage || !currentPackage.appVersion) {
            throw new Error("Calling common acquisition SDK with incorrect package"); // Unexpected; indicates error in our implementation
        }
        var updateRequest = {
            deploymentKey: this._deploymentKey,
            appVersion: currentPackage.appVersion,
            packageHash: currentPackage.packageHash,
            isCompanion: this._ignoreAppVersion,
            label: currentPackage.label
        };
        var requestUrl = this._serverUrl + "updateCheck?" + queryStringify(updateRequest);
        this._httpRequester.request(0 /* GET */, requestUrl, function (error, response) {
            if (error) {
                callback(error, null);
                return;
            }
            if (response.statusCode !== 200) {
                callback(new Error(response.statusCode + ": " + response.body), null);
                return;
            }
            try {
                var responseObject = JSON.parse(response.body);
                var updateInfo = responseObject.updateInfo;
            }
            catch (error) {
                callback(error, null);
                return;
            }
            if (!updateInfo) {
                callback(error, null);
                return;
            }
            else if (updateInfo.updateAppVersion) {
                callback(null, { updateAppVersion: true, appVersion: updateInfo.appVersion });
                return;
            }
            else if (!updateInfo.isAvailable) {
                callback(null, null);
                return;
            }
            var remotePackage = {
                deploymentKey: _this._deploymentKey,
                description: updateInfo.description,
                label: updateInfo.label,
                appVersion: updateInfo.appVersion,
                isMandatory: updateInfo.isMandatory,
                packageHash: updateInfo.packageHash,
                packageSize: updateInfo.packageSize,
                downloadUrl: updateInfo.downloadURL
            };
            callback(null, remotePackage);
        });
    };
    AcquisitionManager.prototype.reportStatus = function (status, message, callback) {
        var url = this._serverUrl + "reportStatus";
        var body;
        switch (status) {
            case AcquisitionStatus.DeploymentSucceeded:
            case AcquisitionStatus.DeploymentFailed:
                url += "/deploy";
                body = JSON.stringify({ deploymentKey: this._deploymentKey, status: status, message: message });
                break;
            default:
                if (callback) {
                    callback(new Error("Unrecognized status."), null);
                }
                return;
        }
        this._httpRequester.request(2 /* POST */, url, body, function (error, response) {
            if (callback) {
                if (error) {
                    callback(error, null);
                    return;
                }
                if (response.statusCode !== 200) {
                    callback(new Error(response.statusCode + ": " + response.body), null);
                    return;
                }
                callback(null, null);
            }
        });
    };
    return AcquisitionManager;
})();
exports.AcquisitionManager = AcquisitionManager;
function queryStringify(object) {
    var queryString = "";
    var isFirst = true;
    for (var property in object) {
        if (object.hasOwnProperty(property)) {
            var value = object[property];
            if (!isFirst) {
                queryString += "&";
            }
            queryString += encodeURIComponent(property) + "=";
            if (value !== null && typeof value !== "undefined") {
                queryString += encodeURIComponent(value);
            }
            isFirst = false;
        }
    }
    return queryString;
}

});

var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var until = webdriver.until;
var username = process.env.SauceLabUsername;
var accessKey = process.env.SauceLabAccessKey;
var octopusUrl = process.env.OctopusUrl;
var octopusPassword = process.env.OctopusPassword;
var testIdFilename = process.env.TestIdFilename;
var tests = require("./common-driver.js");

jasmine.getEnv().defaultTimeoutInterval = 100000;

describe('Environment collapser', function() {
    var driver = null;

    beforeEach(function(done) {
        driver = tests.setupDriver(username, accessKey, process.env.ExtensionDownloadUrl, octopusUrl, octopusPassword, testIdFilename, done);
    });

    afterEach(function(done) {
        tests.setTestStatus(driver, done);
    });


    it('should show only the environment selected', function(done) {
        driver.findElement(By.css("a[href='#/environments']")).click();
        driver.wait(until.elementIsNotVisible(driver.findElement(By.css("span.spin-static"))), 1000)
            .then(tests.failIfFalse(done, "Environments didn't load in time"));
        driver.isElementPresent(By.css("select#envrionment-chooser"))
            .then(tests.failIfFalse(done, "Environment chooser could not be found"));
        var dropdown = driver.findElement(By.css("select#envrionment-chooser"));
        dropdown.click();
        dropdown.sendKeys("QA");
        dropdown.click();
        driver.findElement(By.css("[octopygmy-id='zoctopygmy-development-grouping']"))
            .isDisplayed()
            .then(tests.failIfTrue(done, "Environment chooser did not hide other environments"));
        driver.findElement(By.css("[octopygmy-id='zoctopygmy-qa-grouping']"))
            .isDisplayed()
            .then(tests.failIfFalse(done, "Environment chooser should NOT have hidden the selected environment"))
            .then(done);
    });
});
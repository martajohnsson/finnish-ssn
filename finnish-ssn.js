/**
 * Project: finnish-ssn
 * Purpose: Validate and generate Finnish SSN's according to https://fi.wikipedia.org/wiki/Henkil%C3%B6tunnus
 * Author:  Ville Komulainen
 */
//! https://github.com/vkomulai/finnish-ssn | Version: 1.0.1
(function(global) {
  "use strict"

  var february = "02",
      centuryMap = {"A": 2000, "-": 1900, "+": 1800},
      daysInMonthMap = {
        "01": 31,
        "02": 28,
        "03": 31,
        "04": 30,
        "05": 31,
        "06": 30,
        "07": 31,
        "08": 31,
        "09": 30,
        "10": 31,
        "11": 30,
        "12": 31
      },
      checksumTable = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
                       "A", "B", "C", "D", "E", "F", "H", "J", "K", "L",
                       "M", "N", "P", "R", "S", "T", "U", "V", "W", "X", "Y"]
  var FEMALE = "female",
      MALE = "male",
      MIN_AGE = 1,
      MAX_AGE = 200,
      SSN_REGEX = /^[0-3][\d][0-1][0-9][0-9]{2}[+\-A][\d]{3}[\dA-Z]$/

  /**
   * Parse parameter given SSN string into Object representation.
   * @param ssn - {String} SSN to parse
   * @returns {Object} {valid: true|false, sex: String, ageInYears: Number, dateOfBirth: Date}
   */
  function parse(ssn) {
    var parseFailedObj = {
      valid: false,
      sex: null,
      ageInYears: null,
      dateOfBirth: null
    }
    //  Sanity and format check, which allows to make safe assumptions on the format.
    if (!SSN_REGEX.test(ssn)) {
      return parseFailedObj
    }

    var dayOfMonth = parseInt(ssn.substring(0, 2), 10),
        month = ssn.substring(2, 4),
        centuryId = ssn.charAt(6),
        year = parseInt(ssn.substring(4, 6), 10) + centuryMap[centuryId],
        rollingId = ssn.substring(7, 10),
        checksum = ssn.substring(10, 11),
        sex =  parseInt(rollingId, 10) % 2 ? "male" : "female",
        daysInMonth = daysInMonthMap[month]

    if (month === february && isLeapYear(year)) {
      daysInMonth++
    }

    if (!daysInMonthMap.hasOwnProperty(month) || dayOfMonth > daysInMonth) {
      return parseFailedObj
    }

    var checksumBase = parseInt(ssn.substring(0, 6) + rollingId, 10)

    return {
      valid: (checksum === checksumTable[checksumBase % 31]),
      sex: sex,
      ageInYears: new Date().getFullYear() - year,
      dateOfBirth: new Date(year, parseInt(month, 10) - 1, dayOfMonth, 0, 0, 0, 0)
    }
  }

  /**
   * Validates parameter given SSN. Returns true if SSN is valid, otherwise false.
   * @param ssn - {String} For example '010190-123A'
   * @returns {boolean}
   */
  function validate(ssn) {
    return parse(ssn).valid
  }

  /**
   * Creates a valid SSN using the given age (Integer). Creates randomly male and female SSN'n.
   * In case an invalid age is given, throws exception.
   *
   * @param age as Integer. Min valid age is 1, max valid age is 200
   * @returns {String} - valid ssn.
   */
  function createWithAge(age) {
    if (age < MIN_AGE || age > MAX_AGE) {
      throw "Given age (" + age + ") is not between sensible age range of " + MIN_AGE + " and " + MAX_AGE
    }
    var today = new Date(),
        year =  today.getFullYear() - age,
        month =  "01",  //  For simplicity
        dayOfMonth = "01",//  For simplicity
        centurySign,
        checksumBase,
        checksum,
        rollingId = 100 + Math.floor((Math.random() * 799))  //  No need for padding when rollingId >= 100

    for(var centuryChar in centuryMap) {
      if(centuryMap[centuryChar] === Math.floor(year / 100) * 100) {
        centurySign = centuryChar
      }
    }

    year = (today.getFullYear() - age) % 100
    if (year % 100 < 10) {
      year = "0" + year
    }
    checksumBase = parseInt(dayOfMonth +
                    month +
                    year +
                    rollingId, 10)
    checksum = checksumTable[checksumBase % 31]

    return dayOfMonth +
           month  +
           year +
           centurySign +
           rollingId +
           checksum
  }

  function isLeapYear(year) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)
  }

  global.validate = validate
  global.parse = parse
  global.createWithAge = createWithAge
  global.FEMALE = FEMALE
  global.MALE = MALE

}((typeof exports === 'undefined') ? (FinnishSSN = {}) : exports))

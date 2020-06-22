const csvParser = require('csv-parser')
const fs = require('fs')


/**
 * Return a boolean function that returns all records in the given county or state.
 * @param countyName
 * @param stateName
 * @returns {function(*): boolean|boolean}
 */
function getStateCountyFilter(stateName, countyName="") {
    return function countyFilter(dataItem){
        return (dataItem.state==stateName &&
            (countyName == "" || dataItem.county == countyName))
    }
}

/**
 * Functional operation to build up an array of entries.
 * @param array
 * @returns {function(*=): *}
 */
function accumulatorForArray(array) {
    return function withAdded(elt= null){
        if (elt !== undefined) {
            array.push(elt)
        }
        return array
    }
}

function addNMHealthRegion(elt) {
    if (elt.county == "Bernalillo" ||
    elt.county == "Sandoval" ||
    elt.county == "Valencia" ||
    elt.county == "Torrance") {
        elt.region = "Albuquerque"
    } else if (elt.county == "Santa Fe") {
        elt.region =  "Capitol"
    } else if (elt.county == "McKinley" ||
    elt.county == "San Juan" ||
    elt.county == "Cibola" ) {
        elt.region =  "NW"
    } else if (elt.county == "Lincoln" ||
    elt.county == "De Baca" ||
    elt.county == "Chaves" ||
    elt.county == "Eddy" ||
    elt.county == "Lea" ||
    elt.county == "Roosevelt" ||
    elt.county == "Curry" ||
    elt.county == "Quay" ) {
        elt.region = "SE"
    } else if (
        elt.county == "Catrol" ||
        elt.county == "Grant" ||
        elt.county == "Hidalgo" ||
        elt.county == "Luna" ||
        elt.county == "Dona Ana" ||
        elt.county == "Otero" ||
        elt.county == "Socorro" ||
        elt.county == "Sierra"
    ) {
        elt.region = "SW"
    } else {
        elt.region = "NE"
    }
    return elt
}

/**
 *
 * @param recordList
 */
function addByDateAndRegion(recordList) {
    function hashKey(record) {
        return record.date+":"+record.state+":"+record.region
    }
    let chosenKeys = new Set()
    let countByKeys = new Map()
    let deathByKeys = new Map()
    function collect(previous, newElt){
        let hk = hashKey(newElt)
        let oldCount = countByKeys.has(hk) ? countByKeys.get(hk) : 0
        let oldDeaths = deathByKeys.has(hk) ? deathByKeys.get(hk) : 0
        countByKeys.set(hk, parseInt(oldCount)+parseInt(newElt.cases))
        deathByKeys.set(hk, parseInt(oldDeaths)+parseInt(newElt.deaths))
        previous.push(newElt)
        return previous
    }
    let tempList = recordList.filter(elt => {return elt !== null}).reduce(
        collect, []
    )
    return tempList.filter(
       elt =>  ! chosenKeys.has(hashKey(elt))
    ).map(
        elt => {
            return {
                date: elt.date,
                state: elt.state,
                cases: countByKeys.get(hashKey(elt)),
                deaths: deathByKeys.get(hashKey(elt)),
                region: elt.region
            }
        }
    )
}

/**
 * Pick up records filtered by the filter, transformed as specified, merged according
 * to the mergeFn, and call the final call at the end.
 * @param fileName
 * @param filter
 * @param transform
 * @param mergeFn
 * @param callOnEnd
 * @returns {*}
 */
function rawRecords (fileName, filter, transform, mergeFn) {
    let idx = 0
    return new Promise(function waitAndSave(resolve, reject) {
        fs.createReadStream(fileName)
            .pipe(csvParser())
            .on('data', function spitRecord(data) {
                if (filter(data)) {
                    mergeFn(transform(data))
                }
            })
            .on('end', () => {
                return resolve(mergeFn())
            })
    })
}

module.exports = {rawRecords, accumulatorForArray, getStateCountyFilter, addNMHealthRegion, addByDateAndRegion}
